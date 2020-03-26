import { switchMap, take, tap } from "rxjs/operators";
import { QueryState } from "../QueryState";
import { FirebaseClientStateObject } from "../../interfaces";
import { RunAfterDoc } from '../RunAfters';

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
        const parsed = q.parseBeforeUpload(obj);
        return doc.set(parsed, { merge: isMerged });
      }),
      tap(data =>
        q.logger.logINFO(">> end, data", { data })
      )
    )
    .pipe(take(1))
    .toPromise();
}
