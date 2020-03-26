import { Observable } from "rxjs";
import { IDocumentQueryBuilder } from "../interfaces/IDocumentQueryBuilder";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { QueryState } from "./QueryState";
import {
  DocumentQueryGetDoc,
  DocumentQueryGetDocSnap
} from "./DocumentQueryBuilders";
import { DocumentCommandUpdate } from "./DocumentCommandBuilders";
import { ActionFunction } from "../interfaces/Actions";

export class DocumentQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> implements IDocumentQueryBuilder<TState, Colls, Docs> {
  constructor(private queryState: QueryState<TState>) {}

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
  DisableUpdateFields(): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.queryState.disableUpdateFields();
    return this;
  }
  DisableIdInclusion(): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.queryState.disableIdInclusion();
    return this;
  }
  FixAllDates(recursively?: boolean): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.queryState.enableFixAllDates(recursively);
    return this;
  }
  ref(): Observable<firebase.firestore.DocumentReference> {
    return this.queryState.refDocument();
  }
}
