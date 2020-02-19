import { Observable, combineLatest, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";

function blank$(overridenState: FirebaseClientStateObject) {
  return new BehaviorSubject(overridenState);
}

// RESOLVES: projectId, accountId, userId, hostId
export function resolvePathVariables(
  appState: FirebaseClientStateManager<FirebaseClientStateObject>,
  pathTemplate: string,
  inputOverridenState?: FirebaseClientStateObject
): Observable<string> {
  if (!pathTemplate) {
    console.error("pathTemplate was not found: ", {
      pathTemplate
    });
    throw new Error("pathTemplate was not found: " + pathTemplate);
  }
  let $rootState: Observable<FirebaseClientStateObject>;
  if (inputOverridenState) {
    // Default variables are assigned blank observables
    $rootState = blank$(inputOverridenState);
  }
  if (!inputOverridenState) {
    $rootState = appState.$all;
  }

  return combineLatest([$rootState]).pipe(
    map(([rootState]) => {
      const evalTemplate = "`" + pathTemplate + "`";
      let rootStateDeclarations: string;
      let pathResolved: string;
      console.log("resolvePathVariables() :: appState.$all.pipe()", {
        rootState,
        evalTemplate
      });
      try {
        rootStateDeclarations = object2constStatements(rootState);
        // tslint:disable-next-line: no-eval
        pathResolved = eval(rootStateDeclarations + ";" + evalTemplate);
        return pathResolved;
      } catch (error) {
        console.error(
          `Error trying to resolve path template, error while executing: eval("${evalTemplate}"): `,
          {
            rootState,
            pathTemplate,
            evalString: evalTemplate
          },
          error
        );
      }
    })
  );
}

function object2constStatements(rootState: {}) {
  const constStatements = Object.keys(rootState || {})
    .filter(k => typeof rootState[k] === "string")
    .map(k => {
      const value = rootState[k];
      return `var ${k} = "${value}";`;
    })
    .reduce((prev, cur) => {
      return prev + cur;
    }, "");
  return constStatements;
}
