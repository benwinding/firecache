import {
  LevelLogger,
  getWithoutUndefined,
  parseAllDatesDoc,
  ResolveDocRefsToData,
} from "../utils";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import { map, take, tap } from "rxjs/operators";
import {
  FirebaseClientStateObject,
  IQueryState,
  ActionFunction,
  FireStateOptions,
  LogLevel,
} from "../interfaces";
import { Observable } from "rxjs";
import { ResolvePathVariables } from "../utils";
import {
  IFirestoreLogger,
  MakeFirestoreLogger,
} from "../utils/firestore-logger";
import { parseDocGetAllRefs } from "../utils/docref-parser";

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
  public logCosts: IFirestoreLogger;

  private subcollectionState: SubCollectionState[] = [];
  private callbacks: ActionFunction<any, any>[] = [];

  private _disableIdInclusion: boolean;
  private _disableUpdateFields: boolean;
  private _disableFixAllDates: boolean;
  private _disableRemoveUndefinedValues: boolean;
  private _disableResolveDocRefs: boolean;

  private _enableIdInclusion: boolean;
  private _enableUpdateFields: boolean;
  private _enableFixAllDates: boolean;
  private _enableRemoveUndefinedValues: boolean;
  private _enableResolveDocRefs: boolean;

  constructor(
    public appState$: FirebaseClientStateManager<TState>,
    private _pathTemplate: string,
    public app: firebase.app.App,
    private options: FireStateOptions,
    public logLevel: LogLevel
  ) {
    this.logger = new LevelLogger("Query", this.logLevel);
    this.logCosts = MakeFirestoreLogger(this.options);
    if (this.options.removeAllUndefined) {
      this.enableRemoveUndefinedValues();
    }
    if (this.options.convertTimestamps) {
      this.enableFixAllDates();
    }
    if (this.options.resolveDocRefs) {
      this.enableResolveDocRefs();
    }
  }

  public get pathTemplate(): string {
    if (this.subcollectionState.length) {
      const allSubs = this.subcollectionState.reduce(
        (acc, cur) => `${acc}/${cur.id}/${cur.subcollection}`,
        this._pathTemplate
      );
      return allSubs;
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

  public addSubCollection(id: string, subcollection: string) {
    this.subcollectionState.push({
      id: id,
      subcollection: subcollection,
    });
  }

  public parseBeforeUpload(obj: any): any {
    const shouldParseUndefined =
      this._enableRemoveUndefinedValues && !this._disableRemoveUndefinedValues;
    if (shouldParseUndefined) {
      return getWithoutUndefined(obj);
    }
    return obj;
  }

  public setUpdatedProps(obj: any, updatedUid: string) {
    const shouldSetFields =
      this._enableUpdateFields && !this._disableUpdateFields;
    if (!shouldSetFields) {
      return;
    }
    obj["updated_by"] = updatedUid;
    obj["updated_at"] = new Date();
  }

  public setCreatedProps(obj: any, updatedUid: string) {
    const shouldSetFields =
      this._enableUpdateFields && !this._disableUpdateFields;
    if (!shouldSetFields) {
      return;
    }
    obj["created_by"] = updatedUid;
    obj["created_at"] = new Date();
  }

  public enableIdInclusion = () => (this._enableResolveDocRefs = true);
  public enableUpdateFields = () => (this._enableUpdateFields = true);
  public enableFixAllDates = () => (this._enableFixAllDates = true);
  public enableResolveDocRefs = () => (this._enableResolveDocRefs = true);
  public enableRemoveUndefinedValues = () =>
    (this._enableRemoveUndefinedValues = true);

  public disableIdInclusion = () => (this._disableIdInclusion = true);
  public disableUpdateFields = () => (this._disableUpdateFields = true);
  public disableFixAllDates = () => (this._disableFixAllDates = true);
  public disableResolveDocRefs = () => (this._disableResolveDocRefs = true);
  public disableRemoveUndefinedValues = () =>
    (this._disableRemoveUndefinedValues = true);

  public async TransformDocData<T>(doc: FirebaseDocData): Promise<T> {
    return this.doc2Data<T>(doc);
  }

  private async getDocData<T>(doc: FirebaseDocData): Promise<T> {
    const dataSafe = doc.data() || {};
    const shouldFixDates = this._enableFixAllDates && !this._disableFixAllDates;
    if (shouldFixDates) {
      parseAllDatesDoc(dataSafe);
    }
    const shouldGetDocRefs =
      this._enableResolveDocRefs && !this._disableResolveDocRefs;
    if (shouldGetDocRefs) {
      const docRefs = parseDocGetAllRefs(dataSafe);
      await ResolveDocRefsToData(this.app.firestore(), dataSafe, docRefs);
    }
    return dataSafe;
  }

  doc2Data<T>(doc: FirebaseDocData): Promise<T> {
    const dataSafe = this.getDocData<T>(doc);
    const shouldSetIdField =
      this._enableIdInclusion && !this._disableIdInclusion;
    if (shouldSetIdField) {
      dataSafe["id"] = doc.id;
    }
    return dataSafe;
  }

  docArray2Data<T>(docs: FirebaseDocData[]): Promise<T[]> {
    const promises = docs.map((doc) => this.doc2Data<T>(doc));
    return Promise.all(promises);
  }

  public refCollection(): Observable<FirebaseCollectionRef> {
    return ResolvePathVariables(this).pipe(
      tap((collectionPath) =>
        this.logger.logINFO("refCollection() resolved document path", {
          collectionPath,
        })
      ),
      map((collectionPath) =>
        !!collectionPath
          ? this.app.firestore().collection(collectionPath)
          : null
      ),
      tap((collection) =>
        this.logger.logINFO("refCollection() resolved collection", {
          collection,
        })
      ),
      map((c) => c as FirebaseCollectionRef)
    );
  }

  public refDocument(): Observable<FirebaseDocRef> {
    return ResolvePathVariables(this).pipe(
      tap((documentPath) =>
        this.logger.logINFO("refDocument() resolved document path", {
          documentPath,
        })
      ),
      map((documentPath) => {
        if (documentPath) {
          return this.app.firestore().doc(documentPath);
        }
        throw new Error("No document path could not be resolved!!");
      }),
      tap((doc) =>
        this.logger.logINFO("refDocument() resolved document", {
          doc,
        })
      ),
      map((c) => c as FirebaseDocRef)
    );
  }

  public addRunAfter(callback: ActionFunction<any, any>): void {
    this.callbacks.push(callback);
  }
  public getRunAfters(): ActionFunction<any, any>[] {
    return this.callbacks;
  }
  public MakeLogger(contextTitle: string) {
    return new LevelLogger(contextTitle, this.logLevel);
  }
}
