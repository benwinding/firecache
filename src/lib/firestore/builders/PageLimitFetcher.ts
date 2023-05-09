import { Observable, BehaviorSubject, Subject } from "rxjs";
import { map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { collectionSnap2Observable } from "../../utils";
import {
  QueryFn,
  LimitFetcher,
  FirebaseClientStateObject,
  DocWithId,
} from "../../interfaces";
import { QueryState } from "../QueryState";
import firebase from "firebase/app";

/* 

This implementation creates a "Fetcher" abstraction. 
Which can be paginated and includes realtime updates

*/

type FirebaseCollectionRef = firebase.firestore.CollectionReference;
type FirebaseDocData = firebase.firestore.DocumentData;

export function MakeFetcher<T extends DocWithId>(
  q: QueryState<FirebaseClientStateObject>,
  limitTo: number,
  queryFn: QueryFn
): LimitFetcher<T> {
  const $nextId = new BehaviorSubject<string>(null);
  const querySafe: QueryFn = !!queryFn ? queryFn : (c) => c;

  const $destroyed = new Subject();
  const $changesBehavior = new BehaviorSubject<ParsedDocData<T>[]>([]);

  function GetChangesBy(
    changeType: firebase.firestore.DocumentChangeType
  ): Observable<T[]> {
    return $changesBehavior.pipe(
      map((arr) => arr.filter((item) => item.changeType === changeType)),
      map((arr) => arr.map((a) => a.data))
    );
  }

  const fetcher: LimitFetcher<T> = {
    $realtimeAdded: GetChangesBy("added"),
    $realtimeModified: GetChangesBy("modified"),
    $realtimeRemoved: GetChangesBy("removed"),
    fetchNext: async () => {
      const nextId = $nextId.getValue();
      const res = await FetchLimited<T>(q, limitTo, querySafe, nextId);
      GetChangesAfterFirst<T>(q, res.limitQuery)
        .pipe(takeUntil($destroyed))
        .subscribe((docs) => {
          $changesBehavior.next(docs);
        });
      $nextId.next(res.nextId);
      return res.docs;
    },
    destroy: () => $destroyed.next(null),
    hasNext: () => $nextId.pipe(map((id) => !!id)),
  };
  return fetcher;
}

async function FetchLimited<T>(
  q: QueryState<FirebaseClientStateObject>,
  limitTo: number,
  queryFn: QueryFn,
  startAtId?: string
): Promise<{ docs: T[]; nextId: string | undefined; limitQuery: QueryFn }> {
  const getDocsBase = await q.refCollection().pipe(take(1)).toPromise();

  const limitToPlus1 = limitTo + 1;
  const limitQuery = await GetLimitQuery(
    getDocsBase,
    queryFn,
    limitToPlus1,
    startAtId
  );
  const result = await limitQuery(getDocsBase).get();
  const docData = result.docs;
  const hasMore = docData.length === limitToPlus1;
  let lastId: string;
  if (hasMore) {
    const lastItemRemoved = docData.pop();
    lastId = lastItemRemoved.id;
  }
  const docs = await q.docArray2Data<T>(docData);
  // console.log('FetchLimited get', { collectionPath, lastId, lastDoc, docs });
  return { docs, nextId: lastId, limitQuery };
}

async function GetLimitQuery(
  getDocsBase: FirebaseCollectionRef,
  queryFn: QueryFn,
  limitToPlus1: number,
  startAtId: string | undefined
) {
  const isStartAfter = !!startAtId;
  let limitQuery: QueryFn;
  if (isStartAfter) {
    console.log("FetchLimited get", { path: getDocsBase.path });
    const startAtDoc = await getDocsBase.doc(startAtId).get();
    limitQuery = (c) => queryFn(c).limit(limitToPlus1).startAt(startAtDoc);
  } else {
    limitQuery = (c) => queryFn(c).limit(limitToPlus1);
  }
  return limitQuery;
}

/* 

Firestore only returns the first new items, based on the query limit()
If limit(2) then there will only be 2 new items in snapshot changes no more.

*/

function GetChangesAfterFirst<T>(
  q: QueryState<FirebaseClientStateObject>,
  limitQuery: QueryFn
): Observable<ParsedDocData<T>[]> {
  let isFirst = true;

  const ProcessDocChange = async (change: FirebaseDocData) => {
    const doc = change.doc;
    const transformed: T = doc.exists ? await q.TransformDocData(doc) : null;
    const data: ParsedDocData<T> = {
      changeType: change.type,
      data: transformed,
      id: doc.id,
    };
    return data;
  };

  const changes$ = q.refCollection().pipe(
    switchMap((c) => {
      const query = limitQuery(c);
      return collectionSnap2Observable(query);
    }),
    map((snap) => (isFirst ? [] : snap.docChanges())),
    tap(() => {
      if (isFirst) {
        isFirst = false;
      }
    }),
    switchMap((changes) =>
      Promise.all(changes.map((change) => ProcessDocChange(change)))
    )
  );
  return changes$;
}

interface ParsedDocData<T> {
  changeType: firebase.firestore.DocumentChangeType;
  data: T;
  id: string;
}
