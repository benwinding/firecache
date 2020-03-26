import { Observable } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { documentSnap2Observable } from "../../utils";
import { QueryState } from "../QueryState";
import { FirebaseClientStateObject } from "../../interfaces";

export function DocumentQueryGetDoc<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  q.logger.logDEBUG('>> start, DocumentQueryGetDoc()', {q});
  return q.refDocument().pipe(
    take(1),
    switchMap(doc => doc.get()),
    map(doc => q.doc2Data<T>(doc)),
    tap(data =>
      q.logger.logINFO(">> end, data", { data })
    )
  );
}

export function DocumentQueryGetDocSnap<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  q.logger.logDEBUG('>> start, DocumentQueryGetDocSnap()', {q});
  return q.refDocument().pipe(
    switchMap(doc => documentSnap2Observable(doc)),
    map(doc => q.doc2Data<T>(doc)),
    tap(data =>
      q.logger.logINFO(">> end, data", { data })
    )
  );
}
