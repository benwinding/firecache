import { Observable } from "rxjs";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { ActionFunction } from "./Actions";

export interface IDocumentQueryBuilder<TState extends FirebaseClientStateObject, Colls, Docs> {
  AfterActionCall(
    callback: ActionFunction<Colls, Docs>
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  OverrideAppState(
    overridenState: TState
  ): IDocumentQueryBuilder<TState, Colls, Docs>;
  GetDoc<T>(): Observable<T>;
  Update(obj: {}, isMerged?: boolean): Promise<void>;
  ref(): Observable<firebase.firestore.DocumentReference>;
}
