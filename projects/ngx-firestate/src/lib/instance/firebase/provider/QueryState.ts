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
  private _disableIdInclusion: boolean;
  private _disableUpdateFields: boolean;

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
    if (this._disableUpdateFields) {
      return;
    }
    obj["updated_by"] = updatedUid;
    obj["updated_at"] = new Date();
  }

  public setCreatedProps(obj: any, updatedUid: string) {
    if (this._disableUpdateFields) {
      return;
    }
    obj["created_by"] = updatedUid;
    obj["created_at"] = new Date();
  }

  doc2Data<T>(doc: firebase.firestore.DocumentData): T {
    const dataSafe = doc.data() || {};
    if (this._disableIdInclusion) {
      return dataSafe;
    }
    const data = ({
      ...dataSafe,
      id: doc.id
    } as any) as T;
    return data;
  }

  docArray2Data<T>(docs: firebase.firestore.DocumentData[]): T[] {
    return docs.map(doc => this.doc2Data<T>(doc)) as T[];
  }

  public refCollection(): Observable<firebase.firestore.CollectionReference> {
    return resolvePathVariables(this).pipe(
      tap(collectionPath =>
        this.logger.logINFO("refCollection() resolved document path", {
          collectionPath
        })
      ),
      map(collectionPath => this.app.firestore().collection(collectionPath)),
      tap(collection =>
        this.logger.logINFO("refCollection() resolved collection", {
          collection
        })
      ),
      map(c => c as firebase.firestore.CollectionReference)
    );
  }

  public refDocument(): Observable<firebase.firestore.DocumentReference> {
    return resolvePathVariables(this).pipe(
      tap(documentPath =>
        this.logger.logINFO("refDocument() resolved document path", {
          documentPath
        })
      ),
      map(documentPath => this.app.firestore().doc(documentPath)),
      tap(doc =>
        this.logger.logINFO("refDocument() resolved document", {
          doc
        })
      ),
      map(c => c as firebase.firestore.DocumentReference)
    );
  }

  public addRunAfter(callback: ActionFunction<any, any>): void {
    this.callbacks.push(callback);
  }
  public getRunAfters(): ActionFunction<any, any>[] {
    return this.callbacks;
  }
  public disableIdInclusion(): void {
    this._disableIdInclusion = true;
  }
  public disableUpdateFields(): void {
    this._disableUpdateFields = true;
  }
  public MakeLogger(contextTitle: string) {
    return new LevelLogger(contextTitle, this.logLevel);
  }
}
