import { merge, Observable, partition } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { documentSnap2Observable } from "../../utils";
import { QueryState } from "../QueryState";
import { FirebaseClientStateObject } from "../../interfaces";

export function DocumentQueryGetDoc<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  q.logger.logDEBUG(">> start, DocumentQueryGetDoc()", { q });
  return q.refDocument().pipe(
    take(1),
    switchMap((doc) => doc.get()),
    switchMap((doc) => q.doc2Data<T>(doc)),
    tap((data) => {
      q.logCosts.LogReads(1)();
      q.logger.logINFO(">> end, data", { data });
    })
  );
}

export function DocumentQueryGetDocSnap<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  q.logger.logDEBUG(">> start, DocumentQueryGetDocSnap()", { q });
  const $collection = q.refDocument();
  const [$collectionResolved, $collectionNull] = partition(
    $collection,
    (c) => !!c
  );
  const $resultNull = $collectionNull.pipe(
    map(() => ({} as T)),
    tap((data) => q.logger.logINFO(">> null document path"))
  );
  const $resultResolved = $collectionResolved.pipe(
    switchMap((doc) => documentSnap2Observable(doc)),
    switchMap((doc) => q.doc2Data<T>(doc))
  );
  const $result = merge($resultNull, $resultResolved).pipe(
    tap((data) => {
      q.logCosts.LogReads(1)();
      q.logger.logINFO(">> end, data", { data });
    })
  );
  return $result;
}
