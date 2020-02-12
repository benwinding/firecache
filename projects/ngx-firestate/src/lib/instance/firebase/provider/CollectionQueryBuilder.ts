// tslint:disable: no-string-literal
import { Observable, combineLatest, of } from "rxjs";
import { map, switchMap, take, tap, catchError } from "rxjs/operators";
import * as firebase from "firebase/app";
import {
  ICollectionQueryBuilder,
  QueryFn
} from "../interfaces/ICollectionQueryBuilder";
import { resolvePathVariables } from "./PathResolver";
import { collection2Observable, document2Observable } from "./firebase-helpers";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { LogLevel } from "../interfaces/LogLevel";
import { LevelLogger } from "./LevelLogger";
import { chunkify } from './chunkify';

export class CollectionQueryBuilder implements ICollectionQueryBuilder {
  private overridenState: FirebaseClientStateObject;
  private logger: LevelLogger;

  constructor(
    private appState$: FirebaseClientStateManager,
    private collectionPathTemplate: string,
    private app: firebase.app.App,
    private logLevel: LogLevel
  ) {
    this.logger = new LevelLogger(this.logLevel);
  }

  private get uid(): string {
    return this.appState$.current_uid;
  }

  OverrideAppState(overridenState: FirebaseClientStateObject) {
    this.overridenState = overridenState;
    return this;
  }

  GetAllDocs<T>(whereQuery?: QueryFn): Observable<T[]> {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    ).pipe(
      tap(collectionPath =>
        this.logger.logINFO("GetAllDocs() path", { collectionPath })
      ),
      map(collectionPath => {
        return this.app.firestore().collection(collectionPath);
      }),
      tap(collection =>
        this.logger.logINFO("GetAllDocs() collection", {
          path: collection.path
        })
      ),
      map(collection => {
        if (whereQuery) {
          this.logger.logINFO("GetAllDocs() whereQuery", { whereQuery });
          return whereQuery(collection);
        }
        return collection;
      }),
      switchMap(collection =>
        collection2Observable(collection).pipe(
          catchError(error => {
            this.logger.logERROR(
              "GetAllDocs: error in switchMap(collection => ...",
              error
            );
            return of({ docs: [] as any });
          })
        )
      ),
      tap(docSnap =>
        this.logger.logINFO("GetAllDocs() after snapshotChanges...", {
          "docSnap?": docSnap
        })
      ),
      map(docChanges => docChanges.docs),
      map(docs =>
        docs.map(doc => {
          const data = doc.data() || {};
          return ({
            ...data,
            id: doc.id
          } as any) as T;
        })
      ),
      tap(data => this.logger.logINFO("GetAllDocs() collection", { data }))
    );
  }
  GetId<T>(id: string): Observable<T> {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    ).pipe(
      map(collectionPath => {
        return this.app.firestore().collection(collectionPath);
      }),
      tap(collection =>
        this.logger.logINFO("GetId() collection", { path: collection.path })
      ),
      map(collection => collection.doc(id)),
      switchMap(doc => document2Observable(doc)),
      tap(docSnap =>
        this.logger.logINFO("GetId() after fetching...", {
          "pathExists?": docSnap.exists
        })
      ),
      map(snap => {
        const data = snap.data() || {};
        return ({
          ...data,
          id: snap.id
        } as any) as T;
      }),
      tap(data => this.logger.logINFO("GetAllDocs() data...", { data }))
    );
  }
  GetManyIds<T>(ids: string[]): Observable<T[]> {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    ).pipe(
      map(collectionPath => {
        return this.app.firestore().collection(collectionPath);
      }),
      switchMap(collection =>
        combineLatest(ids.map(id => document2Observable(collection.doc(id))))
      ),
      map(docSnaps =>
        docSnaps.map(snap => {
          const data = snap.data() || {};
          return ({
            ...data,
            id: snap.id
          } as any) as T;
        })
      )
    );
  }
  UpdateMany(
    objs: {
      id: string;
    }[],
    isMerged?: boolean
  ) {
    const uid = this.uid;
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(collection => {
          const db = this.app.firestore();
          const objs500Groups = chunkify(objs, 500);
          return Promise.all(
            objs500Groups.map(async objs500 => {
              const batch = db.batch();
              objs500.map(obj => {
                this.setUpdatedProps(obj, uid);
                const docRef = collection.doc(obj.id);
                batch.set(docRef, obj, { merge: isMerged });
              });
              return batch.commit();
            })
          );
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  Update<T>(id: string, obj: T, merge?: true): Promise<void> {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(collection => {
          obj["updated_by"] = this.uid;
          obj["updated_at"] = new Date();
          return collection.doc(id).set(obj, { merge });
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  Add<T>(obj: T): Promise<firebase.firestore.DocumentReference> {
    const uid = this.uid;
    this.setCreatedProps(obj, uid);
    this.setUpdatedProps(obj, uid);
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(async collection => {
          try {
            const result = await collection.add(obj);
            return result;
          } catch (error) {
            this.logger.logERROR('error in Update()', error, { obj, collection });
            throw new Error(error);
          }
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  AddMany(objs: {}[]) {
    const uid = this.uid;
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(async collection => {
          const db = this.app.firestore();
          const objs500Groups = chunkify(objs, 500);
          await Promise.all(
            objs500Groups.map(async objs500 => {
              const batch = db.batch();
              objs500.map(obj => {
                this.setCreatedProps(obj, uid);
                this.setUpdatedProps(obj, uid);
                const newId = db.doc('').id;
                const docRef = collection.doc(newId);
                batch.set(docRef, obj, { merge: true });
              });
              return batch.commit();
            })
          );
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  DeleteId(id: string) {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(collection => collection.doc(id).delete())
      )
      .pipe(take(1))
      .toPromise();
  }
  DeleteIds(ids: string[]) {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        }),
        switchMap(collection => {
          const db = this.app.firestore();

          const batch = db.batch();

          ids.map(id => {
            const docRef = collection.doc(id);
            batch.delete(docRef);
          });
          return batch.commit();
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  private setUpdatedProps(obj, updatedUid) {
    obj['updated_by'] = updatedUid;
    obj['updated_at'] = new Date();
  }
  private setCreatedProps(obj, updatedUid) {
    obj['created_by'] = updatedUid;
    obj['created_at'] = new Date();
  }
  ref() {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        })
      )
      .pipe(take(1));
  }
}
