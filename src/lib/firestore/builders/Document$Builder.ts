import { Observable } from "rxjs";
import {
  FirebaseClientStateObject,
  IDocumentQueryBuilder,
  ActionFunction,
} from "../../interfaces";
import { QueryState } from "../QueryState";
import {
  DocumentQueryGetDoc,
  DocumentQueryGetDocSnap,
} from "./DocumentQueryBuilders";
import { DocumentCommandUpdate } from "./DocumentCommandBuilders";
import { observableToPromise } from "../../utils";
import firebase from "firebase/app";

export class DocumentQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> implements IDocumentQueryBuilder<TState, Colls, Docs> {
  constructor(private queryState: QueryState<TState>) { }

  promise = {
    GetDoc: async <T>(): Promise<T> => {
      return observableToPromise(this.GetDoc<T>());
    },
  };
  GetDoc<T>(): Observable<T> {
    return DocumentQueryGetDoc<T>(this.queryState);
  }
  GetDocSnap<T>(): Observable<T> {
    return DocumentQueryGetDocSnap<T>(this.queryState);
  }
  Update(obj: {}, isMerged?: boolean): Promise<void> {
    return DocumentCommandUpdate(this.queryState, obj, !!isMerged);
  }
  OverrideAppState(
    overridenState: TState
  ): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.queryState.OverrideAppState(overridenState);
    return this;
  }
  OnFinishedHook(
    callback: ActionFunction<Colls, Docs>
  ): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.queryState.addRunAfter(callback);
    return this;
  }
  EnableResolveDocRefs() {
    this.queryState.enableResolveDocRefs();
    return this;
  }
  EnableFixAllDates() {
    this.queryState.enableFixAllDates();
    return this;
  }
  EnableUpdateFields() {
    this.queryState.enableUpdateFields();
    return this;
  }
  EnableIdInclusion() {
    this.queryState.enableIdInclusion();
    return this;
  }
  EnableRemoveUndefinedValues() {
    this.queryState.enableRemoveUndefinedValues();
    return this;
  }
  DisableResolveDocRefs() {
    this.queryState.disableResolveDocRefs();
    return this;
  }
  DisableFixAllDates() {
    this.queryState.disableFixAllDates();
    return this;
  }
  DisableUpdateFields() {
    this.queryState.disableUpdateFields();
    return this;
  }
  DisableIdInclusion() {
    this.queryState.disableIdInclusion();
    return this;
  }
  DisableRemoveUndefinedValues() {
    this.queryState.disableRemoveUndefinedValues();
    return this;
  }

  ref(): Observable<firebase.firestore.DocumentReference> {
    return this.queryState.refDocument();
  }
}
