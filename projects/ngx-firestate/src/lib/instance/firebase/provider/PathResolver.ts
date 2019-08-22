import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';
import { FirebaseClientStateManager } from '../../FirebaseClientStateManager';

function blank$(overridenState: FirebaseClientStateObject) {
  return new BehaviorSubject(overridenState);
}

// RESOLVES: projectId, accountId, userId, hostId
export function resolvePathVariables(
  appState: FirebaseClientStateManager,
  pathTemplate: string,
  inputOverridenState?: FirebaseClientStateObject
): Observable<string> {
  if (!pathTemplate) {
    console.error('pathTemplate was not found: ', {
      pathTemplate
    });
    throw new Error('pathTemplate was not found: ' + pathTemplate);
  }

  const overridenState = inputOverridenState || {} as any;
  // Default variables are assigned blank observables
  let $rootState: Observable<FirebaseClientStateObject> = blank$(overridenState);
  // Check if variables exist in path, then add the Observable to resolve them.
  const hasAnyVariablesInPath = pathTemplate.includes('${');
  if (hasAnyVariablesInPath && !overridenState) {
    $rootState = appState.$all.pipe(
      filter(a => !!a),
      distinctUntilChanged()
    );
  }

  return combineLatest([$rootState]).pipe(
    map(([rootState]) => {
      const evalTemplate = '`' + pathTemplate + '`';
      let rootStateDeclarations: string;
      let pathResolved: string;
      try {
        rootStateDeclarations = object2constStatements(rootState);
        // tslint:disable-next-line: no-eval
        pathResolved = eval(rootStateDeclarations + ';' + evalTemplate);
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
  const constStatements = Object.keys(rootState)
    .filter(k => typeof rootState[k] === 'string')
    .map(k => {
      const value = rootState[k];
      return `var ${k} = "${value}";`;
    })
    .reduce((prev, cur) => {
      return prev + cur;
    }, '');
  return constStatements;
}
