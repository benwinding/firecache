import { Observable, BehaviorSubject } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import {
  collectionSnap2Observable,
  convertObservableToBehaviorSubject,
} from "../../utils";
import {
  QueryFn,
  LimitFetcher,
  FirebaseClientStateObject,
  DocWithId,
} from "../../interfaces";
import { QueryState } from "../QueryState";

export function MakeFetcher<T extends DocWithId>(
  q: QueryState<FirebaseClientStateObject>,
  limitTo: number,
  queryFn: QueryFn,
  watchFirst: number = 10,
): LimitFetcher<T> {
  const $nextId = new BehaviorSubject<string>(null);
  const querySafe: QueryFn = !!queryFn ? queryFn : (c) => c;

  const $changes = GetChangesAfterFirst<T>(q, querySafe, watchFirst);
  const $changesBehavior = convertObservableToBehaviorSubject($changes, []);

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
      $nextId.next(res.nextId);
      return res.docs;
    },
    hasNext: () => $nextId.pipe(map((id) => !!id)),
  };
  return fetcher;
}

async function FetchLimited<T>(
  q: QueryState<FirebaseClientStateObject>,
  limitTo: number,
  queryFn: QueryFn,
  startAtId?: string
): Promise<{ docs: T[]; nextId: string | undefined }> {
  const getDocsBase = await q.refCollection().pipe(take(1)).toPromise();

  const isStartAfter = !!startAtId;
  const limitToPlus1 = limitTo + 1;
  let limitQuery: QueryFn;
  if (isStartAfter) {
    console.log("FetchLimited get", { path: getDocsBase.path });
    const startAtDoc = await getDocsBase.doc(startAtId).get();
    limitQuery = (c) => queryFn(c).limit(limitToPlus1).startAt(startAtDoc);
  } else {
    limitQuery = (c) => queryFn(c).limit(limitToPlus1);
  }
  const result = await limitQuery(getDocsBase).get();
  const docData = result.docs;
  const hasMore = docData.length === limitToPlus1;
  const lastId = hasMore ? docData.pop().id : undefined;
  const docs = result.docs.map((d) => q.TransformDocData<T>(d));
  // console.log('FetchLimited get', { collectionPath, lastId, lastDoc, docs });
  return { docs, nextId: lastId };
}

function GetChangesAfterFirst<T>(
  q: QueryState<FirebaseClientStateObject>,
  queryFn: QueryFn,
  watchDocsCount: number
): Observable<ParsedDocData<T>[]> {
  let isFirst = true;
  const changes$ = q.refCollection().pipe(
    switchMap((c) => {
      const query = queryFn(c).limit(watchDocsCount);
      return collectionSnap2Observable(query);
    }),
    map((snap) => (isFirst ? [] : snap.docChanges())),
    tap(() => {
      if (isFirst) {
        isFirst = false;
      }
    }),
    map((changes) =>
      changes.map((change) => {
        const doc = change.doc;
        const transformed: T = doc.exists ? q.TransformDocData(doc) : null;
        const data: ParsedDocData<T> = {
          changeType: change.type,
          data: transformed,
          id: doc.id,
        };
        return data;
      })
    )
  );
  return changes$;
}

interface ParsedDocData<T> {
  changeType: firebase.firestore.DocumentChangeType;
  data: T;
  id: string;
}
