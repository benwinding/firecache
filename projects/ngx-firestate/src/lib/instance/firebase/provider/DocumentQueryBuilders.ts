import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { documentSnap2Observable } from "./firebase-helpers";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

export function DocumentQueryGetDoc<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  return q.refDocument().pipe(
    switchMap(doc => doc.get()),
    map(doc => q.doc2Data<T>(doc))
  );
}

export function DocumentQueryGetDocSnap<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  return q.refDocument().pipe(
    switchMap(doc => documentSnap2Observable(doc)),
    map(doc => q.doc2Data<T>(doc))
  );
}
