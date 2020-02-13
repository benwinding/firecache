import { Observable } from "rxjs";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

export type QueryFn = (
  ref: firebase.firestore.CollectionReference
) => firebase.firestore.CollectionReference;

export interface ICollectionQueryBuilder {
  OverrideAppState(overridenState: FirebaseClientStateObject): ICollectionQueryBuilder;
  GetAllDocs<T>(whereQuery?: QueryFn): Observable<T[]>;
  GetManyIds<T>(ids: string[]): Observable<T[]>;
  UpdateMany(
    objs: {
      id: string;
    }[],
    isMerged?: boolean
  ): Promise<any>;
  Update<T>(id: string, obj: T, isMerged?: boolean): Promise<void>;
  Add<T>(obj: T): Promise<firebase.firestore.DocumentReference>;
  AddMany(objs: {}[]): Promise<void>;
  DeleteId(id: string): Promise<void>;
  DeleteIds(ids: string[]): Promise<void>;
  ref(): Observable<firebase.firestore.CollectionReference>;
}
