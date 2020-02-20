import { LevelLogger } from "./LevelLogger";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { map, take, tap } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { LogLevel } from "../interfaces/LogLevel";
import { resolvePathVariables } from "./PathResolver";
import { Observable } from "rxjs";

export class QueryState<TState extends FirebaseClientStateObject> {
  public overridenState: FirebaseClientStateObject;
  public logger: LevelLogger;

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    public pathTemplate: string,
    public app: firebase.app.App,
    public logLevel: LogLevel
  ) {
    this.logger = new LevelLogger('Query', this.logLevel);
  }

  public get uid(): string {
    return this.appState$.current_uid;
  }

  public OverrideAppState(overridenState: TState) {
    this.overridenState = overridenState;
    return this;
  }

  public setUpdatedProps(obj: any, updatedUid: string) {
    obj["updated_by"] = updatedUid;
    obj["updated_at"] = new Date();
  }
  public setCreatedProps(obj: any, updatedUid: string) {
    obj["created_by"] = updatedUid;
    obj["created_at"] = new Date();
  }

  public refCollection(): Observable<firebase.firestore.CollectionReference> {
    return resolvePathVariables(
      this.appState$,
      this.pathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => this.app.firestore().collection(collectionPath)),
        map(c => c as firebase.firestore.CollectionReference)
      )
      .pipe(take(1));
  }
  public refDocument(): Observable<firebase.firestore.DocumentReference> {
    return resolvePathVariables(
      this.appState$,
      this.pathTemplate,
      this.overridenState
    )
      .pipe(
        map(collectionPath => this.app.firestore().doc(collectionPath)),
        map(c => c as firebase.firestore.DocumentReference)
      )
      .pipe(take(1));
  }
}
