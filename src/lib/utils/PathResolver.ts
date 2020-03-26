import { Observable, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { IQueryState, FirebaseClientStateObject } from "../interfaces";
import { Object2constStatements } from './Object2constStatements';

// RESOLVES: projectId, accountId, userId, hostId
export function ResolvePathVariables(q: IQueryState): Observable<string> {
  const $rootState = q.appState$.$all;
  const pathTemplate = q.pathTemplate;
  const inputOverridenState = q.overridenState;

  q.logger.logINFO("ResolvePathVariables() query state", { q });

  if (!pathTemplate) {
    console.error("pathTemplate was not found: ", {
      pathTemplate
    });
    throw new Error("pathTemplate was not found: " + pathTemplate);
  }
  const overridenState = inputOverridenState || {};
  const $rootStateOverriden = $rootState.pipe(
    map(rootState => {
      return {
        ...rootState,
        ...overridenState
      } as FirebaseClientStateObject;
    })
  );

  const stopSignal$ = new Subject();

  return $rootStateOverriden.pipe(
    map(rootState => {
      const evalTemplate = "`" + pathTemplate + "`";
      let rootStateDeclarations: string;
      let pathResolved: string;
      try {
        rootStateDeclarations = Object2constStatements(rootState);
        // tslint:disable-next-line: no-eval
        pathResolved = eval(rootStateDeclarations + ";" + evalTemplate);
        return pathResolved;
      } catch (error) {
        console.warn(
          `Error trying to resolve path template, error while executing: eval("${evalTemplate}"): `,
          {
            rootState,
            pathTemplate,
            evalTemplate,
            rootStateDeclarations
          },
          error
        );
        stopSignal$.next();
      }
    }),
    takeUntil(stopSignal$)
  );
}
