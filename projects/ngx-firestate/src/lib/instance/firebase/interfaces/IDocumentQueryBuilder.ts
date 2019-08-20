import { Observable } from 'rxjs';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';

export interface IDocumentQueryBuilder {
  OverrideProjectState(overridenState: FirebaseClientStateObject);
  GetDoc<T>(): Observable<T>;
  Update(obj: {}): Promise<void>;
}
