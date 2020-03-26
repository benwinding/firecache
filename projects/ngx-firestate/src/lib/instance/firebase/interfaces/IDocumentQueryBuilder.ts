import { Observable } from "rxjs";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { ActionFunction } from "./Actions";

export interface IDocumentQueryBuilder<TState extends FirebaseClientStateObject, Colls, Docs> {
  // Meta
  OnFinishedHook(
    callback: ActionFunction<Colls, Docs>
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  OverrideAppState(
    overridenState: TState
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableUpdateFields(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableIdInclusion(): IDocumentQueryBuilder<TState, Colls, Docs>;
  DisableFixAllDates(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableFixAllDates(): IDocumentQueryBuilder<TState, Colls, Docs>;
  EnableRemoveUndefinedValues(): IDocumentQueryBuilder<TState, Colls, Docs>;
  // Queries
  GetDoc<T>(): Observable<T>;
  GetDocSnap<T>(): Observable<T>;
  Update(obj: {}, isMerged?: boolean): Promise<void>;
  // Native sdk access
  ref(): Observable<firebase.firestore.DocumentReference>;
}
