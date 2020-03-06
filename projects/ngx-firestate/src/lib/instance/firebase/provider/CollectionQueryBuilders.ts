import { tap, map, switchMap, catchError, take } from "rxjs/operators";
import {
  collectionSnap2Observable,
  documentSnap2Observable
} from "./firebase-helpers";
import { of, Observable, combineLatest } from "rxjs";
import { QueryFn } from "../interfaces/ICollectionQueryBuilder";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

export function CollectionQueryGetAllDocsSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  whereQuery?: QueryFn
): Observable<T[]> {
  return q.refCollection().pipe(
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
      collectionSnap2Observable(collection).pipe(
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
    map(docs => docs.map(doc => q.doc2Data<T>(doc)) as T[]),
    tap(data => q.logger.logINFO("GetAllDocs() collection", { data }))
  );
}

export function CollectionQueryGetAllDocs<T>(
  q: QueryState<FirebaseClientStateObject>,
  whereQuery?: QueryFn
): Observable<T[]> {
  return q.refCollection().pipe(
    take(1),
    tap(collection =>
      q.logger.logINFO("GetAllDocsForce() collection", {
        path: collection.path
      })
    ),
    map(collection => {
      if (whereQuery) {
        q.logger.logINFO("GetAllDocsForce() whereQuery", { whereQuery });
        return whereQuery(collection);
      }
      return collection;
    }),
    switchMap(async collection => {
      try {
        const res = await collection.get();
        return res.docs;
      } catch (error) {
        q.logger.logERROR(
          "GetAllDocsForce: error in switchMap(collection => ...",
          error
        );
        return [];
      }
    }),
    tap(docSnap =>
      q.logger.logINFO("GetAllDocsForce() after snapshotChanges...", {
        "docSnap?": docSnap
      })
    ),
    map(docs => q.docArray2Data<T>(docs)),
    tap(data => q.logger.logINFO("GetAllDocsForce() collection", { data }))
  );
}

export function CollectionQueryGetId<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Observable<T> {
  return q.refCollection().pipe(
    take(1),
    tap(collection =>
      q.logger.logINFO("GetId() collection", { path: collection.path })
    ),
    map(collection => collection.doc(id)),
    switchMap(doc => doc.get()),
    tap(docSnap =>
      q.logger.logINFO("GetId() after fetching...", {
        "pathExists?": docSnap.exists
      })
    ),
    map(doc => q.doc2Data<T>(doc)),
    tap(data => q.logger.logINFO("GetAllDocs() data...", { data }))
  );
}

export function CollectionQueryGetIdSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Observable<T> {
  return q.refCollection().pipe(
    tap(collection =>
      q.logger.logINFO("GetId() collection", { path: collection.path })
    ),
    map(collection => collection.doc(id)),
    switchMap(doc => documentSnap2Observable(doc)),
    tap(docSnap =>
      q.logger.logINFO("GetId() after fetching...", {
        "pathExists?": docSnap.exists
      })
    ),
    map(doc => q.doc2Data<T>(doc)),
    tap(data => q.logger.logINFO("GetAllDocs() data...", { data }))
  );
}

export function CollectionQueryGetManyIds<T>(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Observable<T[]> {
  return q.refCollection().pipe(
    take(1),
    switchMap(collection =>
      combineLatest(ids.map(id => collection.doc(id).get()))
    ),
    map(docs => q.docArray2Data<T>(docs))
  );
}

export function CollectionQueryGetManyIdsSnap<T>(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Observable<T[]> {
  return q.refCollection().pipe(
    switchMap(collection =>
      combineLatest(ids.map(id => documentSnap2Observable(collection.doc(id))))
    ),
    map(docs => q.docArray2Data<T>(docs)),
    tap(data => q.logger.logINFO("GetAllDocs() data...", { data }))
  );
}
