import { Observable, combineLatest, BehaviorSubject, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { IQueryState } from "../interfaces/IQueryState";

function blank$(overridenState: FirebaseClientStateObject) {
  return new BehaviorSubject(overridenState);
}

// RESOLVES: projectId, accountId, userId, hostId
export function resolvePathVariables(q: IQueryState): Observable<string> {
  const $rootState = q.appState$.$all;
  const pathTemplate = q.pathTemplate;
  const inputOverridenState = q.overridenState;

  $rootState.subscribe(state => {
  });

  q.logger.logINFO("resolvePathVariables() query state", { q });

  if (!pathTemplate) {
    console.error("pathTemplate was not found: ", {
      pathTemplate
    });
    throw new Error("pathTemplate was not found: " + pathTemplate);
  }
  const overridenState = inputOverridenState || {};
  const $rootStateOverriden = $rootState.pipe(
    map(rootState => {
      console.log("state updated", { rootState });
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
        rootStateDeclarations = object2constStatements(rootState);
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

function object2constStatements(rootState: {}) {
  const constStatements = Object.keys(rootState || {})
    .filter(k => typeof rootState[k] !== "object")
    .map(k => {
      const value = rootState[k];
      return `var ${k} = "${value}";`;
    })
    .reduce((prev, cur) => {
      return prev + cur;
    }, "");
  return constStatements;
}
