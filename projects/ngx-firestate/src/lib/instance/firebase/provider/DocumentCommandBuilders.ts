import { resolvePathVariables } from './PathResolver';
import { map, switchMap, take } from 'rxjs/operators';
import { QueryState } from './QueryState';

export function DocumentCommandUpdate(q: QueryState, obj: {}): Promise<any> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(documentPath => {
        return q.app.firestore().doc(documentPath);
      }),
      switchMap(doc => {
        obj["updated_by"] = q.uid;
        obj["updated_at"] = new Date();
        return doc.set(obj);
      })
    )
    .pipe(take(1))
    .toPromise();

}