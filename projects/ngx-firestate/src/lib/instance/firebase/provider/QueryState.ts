import { LevelLogger } from "./LevelLogger";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { map, take, tap } from "rxjs/operators";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { LogLevel } from "../interfaces/LogLevel";
import { resolvePathVariables } from "./PathResolver";
import { Observable } from "rxjs";
import { IQueryState } from "../interfaces/IQueryState";
import { ActionFunction } from "../interfaces/Actions";

interface SubCollectionState {
  id: string;
  subcollection: string;
}

export class QueryState<TState extends FirebaseClientStateObject>
  implements IQueryState {
  public overridenState: FirebaseClientStateObject;
  public logger: LevelLogger;
  
  private subcollectionState: SubCollectionState;
  private callbacks: ActionFunction<any, any>[] = [];

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    private _pathTemplate: string,
    public app: firebase.app.App,
    public logLevel: LogLevel
  ) {
    this.logger = new LevelLogger("Query", this.logLevel);
  }

  public get pathTemplate(): string {
    if (this.subcollectionState) {
      return `${this._pathTemplate}/${this.subcollectionState.id}/${this.subcollectionState.subcollection}`;
    }
    return this._pathTemplate;
  }

  public get uid(): string {
    return this.appState$.current_uid;
  }

  public async user() {
    return this.appState$.$user.pipe(take(1)).toPromise();
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
        tap(collectionPath =>
          this.logger.logINFO("refCollection() resolved document path", {
            collectionPath
          })
        ),
        map(collectionPath => this.app.firestore().collection(collectionPath)),
        map(c => c as firebase.firestore.CollectionReference)
      )
      .pipe(take(1));
  }

  public refDocument(): Observable<firebase.firestore.DocumentReference> {
    return resolvePathVariables(this)
      .pipe(
        tap(documentPath =>
          this.logger.logINFO("refDocument() resolved document path", {
            documentPath
          })
        ),
        map(collectionPath => this.app.firestore().doc(collectionPath)),
        map(c => c as firebase.firestore.DocumentReference)
      )
      .pipe(take(1));
  }

  public addRunAfter(callback: ActionFunction<any, any>): void {
    this.callbacks.push(callback);
  }
  public getRunAfters(): ActionFunction<any, any>[] {
    return this.callbacks;
  }
}
