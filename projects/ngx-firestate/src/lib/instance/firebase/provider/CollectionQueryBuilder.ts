// tslint:disable: no-string-literal
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take, tap, catchError } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { ICollectionQueryBuilder } from '../interfaces/ICollectionQueryBuilder';
import { resolvePathVariables } from './PathResolver';
import { QueryObj } from '../interfaces/QueryObj';
import { collection2Observable, document2Observable } from './firebase-helpers';
import { FirebaseClientState } from '../../FirebaseClientState';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';

export class CollectionQueryBuilder implements ICollectionQueryBuilder {
  private overridenState: FirebaseClientStateObject;

  constructor(
    private appState$: FirebaseClientState,
    private collectionPathTemplate: string,
    private app: firebase.app.App,
    private loggingEnabled: boolean
  ) {}

  private get uid(): string {
    return this.appState$.current_uid;
  }

  OverrideAppState(overridenState: FirebaseClientStateObject) {
    this.overridenState = overridenState;
    return this;
  }

  GetAllDocs<T>(whereQuery?: QueryObj): Observable<T[]> {
    return resolvePathVariables(
      this.appState$,
      this.collectionPathTemplate,
      this.overridenState
    ).pipe(
      map(collectionPath => {
        return this.app.firestore().collection(collectionPath);
      }),
      tap(collection =>
        this.log('GetAllDocs() collection', { path: collection.path })
      ),
      map(collection => {
        if (whereQuery) {
          this.log('GetAllDocs() whereQuery', { whereQuery });
          return collection.where(
            whereQuery.fieldPath,
            whereQuery.opStr,
            whereQuery.value
          );
        }
        return collection;
      }),
      switchMap(collection =>
        collection2Observable(collection).pipe(
          catchError(error => {
            console.error('GetAllDocs: error in switchMap(collection => ...', {
              error
            });
            return of({ docs: [] as any });
          })
        )
      ),
      tap(docSnap =>
        this.log('GetAllDocs() after snapshotChanges...', {
          'docSnap?': docSnap
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
      tap(data => this.log('GetAllDocs() collection', { data }))
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
        this.log('GetId() collection', { path: collection.path })
      ),
      map(collection => collection.doc(id)),
      switchMap(doc => document2Observable(doc)),
      tap(docSnap =>
        this.log('GetId() after fetching...', {
          'pathExists?': docSnap.exists
        })
      ),
      map(snap => {
        const data = snap.data() || {};
        return ({
          ...data,
          id: snap.id
        } as any) as T;
      }),
      tap(data => this.log('GetAllDocs() data...', { data }))
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
    }[]
  ): Promise<void> {
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
          objs.map(obj => {
            const docRef = collection.doc(obj.id);
            obj['updated_by'] = this.uid;
            obj['updated_at'] = new Date();
            batch.set(docRef, obj, { merge: true });
          });
          return batch.commit();
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
          obj['updated_by'] = this.uid;
          obj['updated_at'] = new Date();
          return collection.doc(id).set(obj, { merge });
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  Add<T>(obj: T): Promise<firebase.firestore.DocumentReference> {
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
          obj['created_by'] = this.uid;
          obj['created_at'] = new Date();
          obj['updated_by'] = this.uid;
          obj['updated_at'] = new Date();
          return collection.add(obj);
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  AddMany(objs: {}[]) {
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
          objs.map(obj => {
            const docRef = collection.doc();
            obj['created_by'] = this.uid;
            obj['created_at'] = new Date();
            obj['updated_by'] = this.uid;
            obj['updated_at'] = new Date();
            batch.set(docRef, obj, { merge: true });
          });
          return batch.commit();
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
  private log(msg, obj) {
    if (this.loggingEnabled) {
      console.log('🔥 firestore.provider: ' + msg, obj);
    }
  }
}
