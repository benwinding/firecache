import { Observable } from 'rxjs';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';

export interface IDocumentQueryBuilder {
  OverrideAppState(overridenState: FirebaseClientStateObject): IDocumentQueryBuilder;
  GetDoc<T>(): Observable<T>;
  Update(obj: {}): Promise<void>;
}
