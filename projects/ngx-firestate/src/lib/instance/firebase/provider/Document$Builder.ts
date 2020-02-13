import { Observable } from "rxjs";
import { IDocumentQueryBuilder } from "../interfaces/IDocumentQueryBuilder";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { QueryState } from "./QueryState";
import { DocumentQueryGetDoc } from './DocumentQueryBuilders';
import { DocumentCommandUpdate } from './DocumentCommandBuilders';

export class DocumentQueryBuilder implements IDocumentQueryBuilder {
  constructor(private queryState: QueryState) {}

  GetDoc<T>(): Observable<T> {
    return DocumentQueryGetDoc<T>(this.queryState);
  }
  Update(obj: {}): Promise<void> {
    return DocumentCommandUpdate(this.queryState, obj);
  }
  OverrideAppState(overridenState: FirebaseClientStateObject) {
    this.queryState.OverrideAppState(overridenState);
    return this;
  }
}
