import { LevelLogger, getWithoutUndefined, parseAllDatesDoc } from "../utils";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import { map, take, tap } from "rxjs/operators";
import {
  FirebaseClientStateObject,
  IQueryState,
  ActionFunction,
  FireStateOptions,
  LogLevel
} from "../interfaces";
import { Observable } from "rxjs";
import { ResolvePathVariables } from "../utils";

interface SubCollectionState {
  id: string;
  subcollection: string;
}

type FirebaseDocData = firebase.firestore.DocumentData;
type FirebaseDocRef = firebase.firestore.DocumentReference;
type FirebaseCollectionRef = firebase.firestore.CollectionReference;

export class QueryState<TState extends FirebaseClientStateObject>
  implements IQueryState {
  public overridenState: FirebaseClientStateObject;
  public logger: LevelLogger;

  private subcollectionState: SubCollectionState;
  private callbacks: ActionFunction<any, any>[] = [];
  private _disableIdInclusion: boolean;
  private _disableUpdateFields: boolean;
  private _disableFixAllDates: boolean;
  private _enableFixAllDates: boolean;
  private _enableRemoveUndefinedValues: boolean;

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    private _pathTemplate: string,
    public app: firebase.app.App,
    private options: FireStateOptions,
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

  public parseBeforeUpload(obj: any): any {
    if (this._enableRemoveUndefinedValues) {
      return getWithoutUndefined(obj);
    }
    return obj;
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

  public enableRemoveUndefinedValues() {
    this._enableRemoveUndefinedValues = true;
  }
  public enableFixAllDates() {
    this._enableFixAllDates = true;
  }
  public disableFixAllDates() {
    this._disableFixAllDates = true;
  }

  private getDocData<T>(doc: FirebaseDocData): T {
    const dataSafe = doc.data() || {};
    const shouldFixDates =
      (this.options.convertTimestamps || this._enableFixAllDates) &&
      !this._disableFixAllDates;
    if (shouldFixDates) {
      parseAllDatesDoc(dataSafe);
    }
    return dataSafe;
  }

  doc2Data<T>(doc: FirebaseDocData): T {
    const dataSafe = this.getDocData<T>(doc);
    if (!this._disableIdInclusion) {
      dataSafe["id"] = doc.id;
    }
    return dataSafe;
  }

  docArray2Data<T>(docs: FirebaseDocData[]): T[] {
    return docs.map(doc => this.doc2Data<T>(doc)) as T[];
  }

  public refCollection(): Observable<FirebaseCollectionRef> {
    return ResolvePathVariables(this).pipe(
      tap(collectionPath =>
        this.logger.logINFO("refCollection() resolved document path", {
          collectionPath
        })
      ),
      map(collectionPath => !!collectionPath ? this.app.firestore().collection(collectionPath) : null),
      tap(collection =>
        this.logger.logINFO("refCollection() resolved collection", {
          collection
        })
      ),
      map(c => c as FirebaseCollectionRef)
    );
  }

  public refDocument(): Observable<FirebaseDocRef> {
    return ResolvePathVariables(this).pipe(
      tap(documentPath =>
        this.logger.logINFO("refDocument() resolved document path", {
          documentPath
        })
      ),
      map(documentPath => !!documentPath ? this.app.firestore().doc(documentPath) : null),
      tap(doc =>
        this.logger.logINFO("refDocument() resolved document", {
          doc
        })
      ),
      map(c => c as FirebaseDocRef)
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
