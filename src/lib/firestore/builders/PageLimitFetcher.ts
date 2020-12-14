import { Observable, BehaviorSubject } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { collectionSnap2Observable, parseAllDatesDoc } from "../../utils";
import {
  QueryFn,
  LimitFetcher,
  FirebaseClientStateObject,
} from "../../interfaces";
import { QueryState } from "../QueryState";

export function MakeFetcher<T>(
  q: QueryState<FirebaseClientStateObject>,
  limitTo: number,
  queryFn?: QueryFn
): LimitFetcher<T> {
  const $nextId = new BehaviorSubject<string>(null);
  const querySafe: QueryFn = !!queryFn ? queryFn : (c) => c;
  const fetcher: LimitFetcher<T> = {
    $newlyAdded: WatchForAdded<T>(q, querySafe),
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
  const docSnap = await limitQuery(getDocsBase).get();
  const docData = docSnap.docs;
  const hasMore = docData.length === limitToPlus1;
  const lastId = hasMore ? docData.pop().id : undefined;
  const docs = docSnap.docs.map((d) => q.TransformDocData<T>(d));
  // console.log('FetchLimited get', { collectionPath, lastId, lastDoc, docs });
  return { docs, nextId: lastId };
}

function WatchForAdded<T>(
  q: QueryState<FirebaseClientStateObject>,
  queryFn: QueryFn
): Observable<T[]> {
  let isFirst = true;
  const newItems = q.refCollection().pipe(
    switchMap((c) => {
      const query = queryFn(c).limit(1);
      return collectionSnap2Observable(query);
    }),
    map((snap) => (isFirst ? [] : snap.docChanges())),
    tap(() => {
      isFirst ? (isFirst = false) : null;
    }),
    map((changes) => changes.filter((a) => a.type === "added")),
    map((data) =>
      data.map((d) => ({
        ...(d.doc.data() as T),
        id: d.doc.id,
      }))
    ),
    tap((items) => items.map(parseAllDatesDoc))
  );
  return newItems;
}
