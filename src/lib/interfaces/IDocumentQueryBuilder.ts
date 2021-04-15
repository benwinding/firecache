import { Observable } from "rxjs";
import { FirebaseClientStateObject } from "./FirebaseClientStateObject";
import { ActionFunction } from "./Actions";

export interface IDocumentQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> {
  // Meta
  OnFinishedHook(
    callback: ActionFunction<Colls, Docs>
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  OverrideAppState(
    overridenState: TState
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  // Enable/Disable Flags
  EnableResolveDocRefs(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableFixAllDates(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableUpdateFields(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableIdInclusion(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableRemoveUndefinedValues(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableResolveDocRefs(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableFixAllDates(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableUpdateFields(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableIdInclusion(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableRemoveUndefinedValues(): IDocumentQueryBuilder<TState, Colls, Docs>;
  // Promise-based
  promise: {
    GetDoc<T>(): Promise<T>;
  };
  // Queries
  GetDoc<T>(): Observable<T>;
  GetDocSnap<T>(): Observable<T>;
  Update(obj: {}, isMerged?: boolean): Promise<void>;
  // Native sdk access
  ref(): Observable<firebase.firestore.DocumentReference>;
}
