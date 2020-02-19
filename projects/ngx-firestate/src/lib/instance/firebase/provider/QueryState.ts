import { LevelLogger } from "./LevelLogger";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { map, take } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { LogLevel } from "../interfaces/LogLevel";
import { resolvePathVariables } from "./PathResolver";
import { Observable } from "rxjs";

export class QueryState<
  TState extends FirebaseClientStateObject
> {
  public overridenState: FirebaseClientStateObject;
  public logger: LevelLogger;

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    public pathTemplate: string,
    public app: firebase.app.App,
    public logLevel: LogLevel
  ) {
    this.logger = new LevelLogger(this.logLevel);
  }

  public get uid(): string {
    return this.appState$.current_uid;
  }

  public OverrideAppState(overridenState: TState) {
    this.overridenState = overridenState;
    return this;
  }

  public setUpdatedProps(obj, updatedUid) {
    obj["updated_by"] = updatedUid;
    obj["updated_at"] = new Date();
  }
  public setCreatedProps(obj, updatedUid) {
    obj["created_by"] = updatedUid;
    obj["created_at"] = new Date();
  }

  public ref(): Observable<firebase.firestore.CollectionReference> {
    return resolvePathVariables(
      this.appState$,
      this.pathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => {
          return this.app.firestore().collection(collectionPath);
        })
      )
      .pipe(take(1));
  }
}
