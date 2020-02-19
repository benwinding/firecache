import { Observable } from "rxjs";
import { IDocumentQueryBuilder } from "../interfaces/IDocumentQueryBuilder";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { QueryState } from "./QueryState";
import { DocumentQueryGetDoc } from './DocumentQueryBuilders';
import { DocumentCommandUpdate } from './DocumentCommandBuilders';

export class DocumentQueryBuilder<
TState extends FirebaseClientStateObject
> implements IDocumentQueryBuilder {
  constructor(private queryState: QueryState<TState>) {}

  GetDoc<T>(): Observable<T> {
    return DocumentQueryGetDoc<T>(this.queryState);
  }
  Update(obj: {}): Promise<void> {
    return DocumentCommandUpdate(this.queryState, obj);
  }
  OverrideAppState(overridenState: TState) {
    this.queryState.OverrideAppState(overridenState);
    return this;
  }
}
