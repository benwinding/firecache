import { Observable } from 'rxjs';
import { QueryObj } from './QueryObj';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';

export interface ICollectionQueryBuilder {
  OverrideAppState(overridenState: FirebaseClientStateObject);
  GetAllDocs<T>(whereQuery?: QueryObj): Observable<T[]>;
  GetManyIds<T>(ids: string[]): Observable<T[]>;
  UpdateMany(
    objs: {
      id: string;
    }[]
  ): Promise<void>;
  Update<T>(id: string, obj: T): Promise<void>;
  Add<T>(obj: T): Promise<firebase.firestore.DocumentReference>;
  AddMany(objs: {}[]): Promise<void>;
  DeleteId(id: string): Promise<void>;
  DeleteIds(ids: string[]): Promise<void>;
  ref(): Observable<firebase.firestore.CollectionReference>;
}
