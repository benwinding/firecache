import { resolvePathVariables } from "./PathResolver";
import { tap, map, switchMap, catchError } from "rxjs/operators";
import { collection2Observable, document2Observable } from "./firebase-helpers";
import { of, Observable, combineLatest } from "rxjs";
import { QueryFn } from "../interfaces/ICollectionQueryBuilder";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';

export function CollectionQueryGetAllDocs<T>(
  q: QueryState<FirebaseClientStateObject>,
  whereQuery?: QueryFn
): Observable<T[]> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  ).pipe(
    tap(collectionPath =>
      q.logger.logINFO("GetAllDocs() path", { collectionPath })
    ),
    map(collectionPath => {
      return q.app.firestore().collection(collectionPath);
    }),
    tap(collection =>
      q.logger.logINFO("GetAllDocs() collection", {
        path: collection.path
      })
    ),
    map(collection => {
      if (whereQuery) {
        q.logger.logINFO("GetAllDocs() whereQuery", { whereQuery });
        return whereQuery(collection);
      }
      return collection;
    }),
    switchMap(collection =>
      collection2Observable(collection).pipe(
        catchError(error => {
          q.logger.logERROR(
            "GetAllDocs: error in switchMap(collection => ...",
            error
          );
          return of({ docs: [] as any });
        })
      )
    ),
    tap(docSnap =>
      q.logger.logINFO("GetAllDocs() after snapshotChanges...", {
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
    tap(data => q.logger.logINFO("GetAllDocs() collection", { data }))
  );
}

export function CollectionQueryGetId<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Observable<T> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  ).pipe(
    map(collectionPath => {
      return q.app.firestore().collection(collectionPath);
    }),
    tap(collection =>
      q.logger.logINFO("GetId() collection", { path: collection.path })
    ),
    map(collection => collection.doc(id)),
    switchMap(doc => document2Observable(doc)),
    tap(docSnap =>
      q.logger.logINFO("GetId() after fetching...", {
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
    tap(data => q.logger.logINFO("GetAllDocs() data...", { data }))
  );
}

export function CollectionQueryGetManyIds<T>(q: QueryState<FirebaseClientStateObject>, ids: string[]): Observable<T[]> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  ).pipe(
    map(collectionPath => {
      return q.app.firestore().collection(collectionPath);
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
