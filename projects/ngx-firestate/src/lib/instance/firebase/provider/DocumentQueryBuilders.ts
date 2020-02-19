import { Observable } from "rxjs";
import { resolvePathVariables } from "./PathResolver";
import { tap, map, switchMap } from "rxjs/operators";
import { document2Observable } from "./firebase-helpers";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

export function DocumentQueryGetDoc<T>(
  q: QueryState<FirebaseClientStateObject>
): Observable<T> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  ).pipe(
    tap(documentPath =>
      q.logger.logINFO("GetDoc() about to get path", { documentPath })
    ),
    map(documentPath => {
      return q.app.firestore().doc(documentPath);
    }),
    switchMap(doc => document2Observable(doc)),
    map(snap => {
      const data = snap.data() || {};
      return ({
        ...data,
        id: snap.id
      } as any) as T;
    })
  );
}
