import { switchMap, take, tap } from "rxjs/operators";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { RunAfterDoc } from './RunAfters';

export function DocumentCommandUpdate(
  q: QueryState<FirebaseClientStateObject>,
  obj: {},
  isMerged: boolean
): Promise<any> {
  return q.refDocument()
    .pipe(
      tap(RunAfterDoc(q, "edited")),
      switchMap(doc => {
        obj["updated_by"] = q.uid;
        obj["updated_at"] = new Date();
        return doc.set(obj, { merge: isMerged });
      })
    )
    .pipe(take(1))
    .toPromise();
}
