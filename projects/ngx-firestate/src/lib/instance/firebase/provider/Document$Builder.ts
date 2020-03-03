import { Observable } from "rxjs";
import { IDocumentQueryBuilder } from "../interfaces/IDocumentQueryBuilder";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { QueryState } from "./QueryState";
import { DocumentQueryGetDoc } from "./DocumentQueryBuilders";
import { DocumentCommandUpdate } from "./DocumentCommandBuilders";
import { ActionFunction } from "../interfaces/Actions";

export class DocumentQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> implements IDocumentQueryBuilder<TState, Colls, Docs> {
  private callbacks: ActionFunction<Colls, Docs>[] = [];

  constructor(private queryState: QueryState<TState>) {}

  GetDoc<T>(): Observable<T> {
    return DocumentQueryGetDoc<T>(this.queryState);
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
  AfterActionCall(
    callback: ActionFunction<Colls, Docs>
  ): IDocumentQueryBuilder<TState, Colls, Docs> {
    this.callbacks.push(callback);
    return this;
  }
  ref(): Observable<firebase.firestore.DocumentReference> {
    return this.queryState.refDocument();
  }
}
