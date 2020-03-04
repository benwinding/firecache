import { Observable } from "rxjs";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { ActionFunction } from "./Actions";

export type QueryFn = (
  ref: firebase.firestore.CollectionReference
) => firebase.firestore.Query;

export interface ICollectionQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> {
  // Meta
  OnFinishedHook(
    callback: ActionFunction<Colls, Docs>
  ): ICollectionQueryBuilder<TState, Colls, Docs>;
  OverrideAppState(
    overridenState: TState
  ): ICollectionQueryBuilder<TState, Colls, Docs>;
  DisableUpdateFields(): ICollectionQueryBuilder<TState, Colls, Docs>;
  DisableIdInclusion(): ICollectionQueryBuilder<TState, Colls, Docs>;
  FromSubCollection<T>(
    id: string,
    subcollection: string
  ): ICollectionQueryBuilder<TState, Colls, Docs>;

  // Queries
  //   get once
  GetId<T>(id: string): Observable<T>;
  GetManyIds<T>(ids: string[]): Observable<T[]>;
  GetAllDocs<T>(whereQuery?: QueryFn): Observable<T[]>;
  //   recieve snapshot updates
  GetIdSnap<T>(id: string): Observable<T>;
  GetAllDocsSnap<T>(whereQuery?: QueryFn): Observable<T[]>;
  GetManyIdsSnap<T>(ids: string[]): Observable<T[]>;

  // Commands
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

  // Get Underlying firestore API
  ref(): Observable<firebase.firestore.CollectionReference>;
}
