import { LevelLogger } from "./LevelLogger";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { map, take, tap } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { LogLevel } from "../interfaces/LogLevel";
import { resolvePathVariables, SubCollectionState } from "./PathResolver";
import { Observable } from "rxjs";
import { IQueryState } from "../interfaces/IQueryState";

export class QueryState<TState extends FirebaseClientStateObject>
  implements IQueryState {
  inputOverridenState: FirebaseClientStateObject;
  subcollection: SubCollectionState;

  public overridenState: FirebaseClientStateObject;
  public logger: LevelLogger;

  public subcollectionState: SubCollectionState;

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    public pathTemplate: string,
    public app: firebase.app.App,
    public logLevel: LogLevel
  ) {
    this.logger = new LevelLogger("Query", this.logLevel);
  }

  public get uid(): string {
    return this.appState$.current_uid;
  }

  public OverrideAppState(overridenState: TState) {
    this.overridenState = overridenState;
    return this;
  }
  public SetSubCollection(id: string, subcollection: string) {
    this.subcollectionState = {
      id: id,
      subcollection: subcollection
    };
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
    return resolvePathVariables(this)
      .pipe(
        map(collectionPath => this.app.firestore().collection(collectionPath)),
        map(c => c as firebase.firestore.CollectionReference)
      )
      .pipe(take(1));
  }
  public refDocument(): Observable<firebase.firestore.DocumentReference> {
    return resolvePathVariables(this)
      .pipe(
        map(collectionPath => this.app.firestore().doc(collectionPath)),
        map(c => c as firebase.firestore.DocumentReference)
      )
      .pipe(take(1));
  }
}
