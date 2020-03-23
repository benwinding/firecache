import { switchMap, take, tap } from "rxjs/operators";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { RunAfterDoc } from './RunAfters';

export function DocumentCommandUpdate(
  q: QueryState<FirebaseClientStateObject>,
  obj: {},
  isMerged: boolean
): Promise<any> {
  q.logger.logDEBUG('>> start, DocumentCommandUpdate()', {q,  obj, isMerged});
  return q.refDocument()
    .pipe(
      tap(RunAfterDoc(q, "edited")),
      switchMap(doc => {
        q.setUpdatedProps(obj, q.uid);
        return doc.set(obj, { merge: isMerged });
      }),
      tap(data =>
        q.logger.logINFO(">> end, data", { data })
      )
    )
    .pipe(take(1))
    .toPromise();
}
