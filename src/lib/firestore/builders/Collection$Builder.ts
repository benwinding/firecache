import { Observable } from "rxjs";
import { observableToPromise } from '../../utils';
import {
  ICollectionQueryBuilder,
  QueryFn,
  FirebaseClientStateObject,
  DocWithId,
  ActionFunction,
  LimitFetcher
} from "../../interfaces";
import { QueryState } from "../QueryState";
import {
  CollectionCommandAdd,
  CollectionCommandAddMany,
  CollectionCommandDeleteId,
  CollectionCommandDeleteIds,
  CollectionCommandUpdate,
  CollectionCommandUpdateMany
} from "./CollectionCommandBuilders";
import {
  CollectionQueryGetId,
  CollectionQueryGetIdSnap,
  CollectionQueryGetAllDocs,
  CollectionQueryGetAllDocsSnap,
  CollectionQueryGetManyIds,
  CollectionQueryGetManyIdsSnap
} from "./CollectionQueryBuilders";
import { MakeFetcher } from "./PageLimitFetcher";
import firebase from "firebase/compat/app";

export class CollectionQueryBuilder<
  TState extends FirebaseClientStateObject,
  Colls,
  Docs
> implements ICollectionQueryBuilder<TState, Colls, Docs> {
  constructor(private queryState: QueryState<TState>) { }

  promise = {
    GetId: async <T>(id: string): Promise<T> => {
      return observableToPromise(this.GetId<T>(id));
    },
    GetManyIds: async <T>(ids: string[]): Promise<T[]> => {
      return observableToPromise(this.GetManyIds<T>(ids));
    },
    GetAllDocs: async <T>(whereQuery?: QueryFn): Promise<T[]> => {
      return observableToPromise(this.GetAllDocs<T>(whereQuery));
    },
    ref: async (): Promise<firebase.firestore.CollectionReference> => {
      return observableToPromise(this.ref());
    }
  }

  MakePageFetcher<T extends DocWithId>(pageSize: number, whereQuery: QueryFn): LimitFetcher<T> {
    return MakeFetcher<T>(this.queryState, pageSize, whereQuery);
  }

  GetId<T>(id: string): Observable<T> {
    return CollectionQueryGetId<T>(this.queryState, id);
  }
  GetAllDocs<T>(whereQuery?: QueryFn): Observable<T[]> {
    return CollectionQueryGetAllDocs<T>(this.queryState, whereQuery);
  }
  GetManyIds<T>(ids: string[]): Observable<T[]> {
    return CollectionQueryGetManyIds<T>(this.queryState, ids);
  }
  GetIdSnap<T>(id: string): Observable<T> {
    return CollectionQueryGetIdSnap<T>(this.queryState, id);
  }
  GetAllDocsSnap<T>(whereQuery?: QueryFn): Observable<T[]> {
    return CollectionQueryGetAllDocsSnap<T>(this.queryState, whereQuery);
  }
  GetManyIdsSnap<T>(ids: string[]): Observable<T[]> {
    return CollectionQueryGetManyIdsSnap<T>(this.queryState, ids);
  }
  UpdateMany(objs: DocWithId[], isMerged?: boolean) {
    return CollectionCommandUpdateMany(this.queryState, objs, isMerged);
  }
  Update<T>(id: string, obj: T, merge?: true): Promise<void> {
    return CollectionCommandUpdate(this.queryState, id, obj, merge);
  }
  Add<T>(obj: T): Promise<firebase.firestore.DocumentReference> {
    return CollectionCommandAdd<T>(this.queryState, obj);
  }
  AddMany(objs: {}[]) {
    return CollectionCommandAddMany(this.queryState, objs);
  }
  DeleteId(id: string) {
    return CollectionCommandDeleteId(this.queryState, id);
  }
  DeleteIds(ids: string[]) {
    return CollectionCommandDeleteIds(this.queryState, ids);
  }
  FromSubCollection(
    id: string,
    subcollection: string
  ): ICollectionQueryBuilder<TState, Colls, Docs> {
    this.queryState.addSubCollection(id, subcollection);
    return this;
  }
  OnFinishedHook(
    callback: ActionFunction<Colls, Docs>
  ): ICollectionQueryBuilder<TState, Colls, Docs> {
    this.queryState.addRunAfter(callback);
    return this;
  }
  OverrideAppState(
    overridenState: TState
  ): ICollectionQueryBuilder<TState, Colls, Docs> {
    this.queryState.OverrideAppState(overridenState);
    return this;
  }
  ref(): Observable<firebase.firestore.CollectionReference> {
    return this.queryState.refCollection();
  }

  EnableResolveDocRefs() {
    this.queryState.enableResolveDocRefs();
    return this;
  }
  EnableFixAllDates() {
    this.queryState.enableFixAllDates();
    return this;
  }
  EnableUpdateFields() {
    this.queryState.enableUpdateFields();
    return this;
  }
  EnableIdInclusion() {
    this.queryState.enableIdInclusion();
    return this;
  }
  EnableRemoveUndefinedValues() {
    this.queryState.enableRemoveUndefinedValues();
    return this;
  }
  DisableResolveDocRefs() {
    this.queryState.disableResolveDocRefs();
    return this;
  }
  DisableFixAllDates() {
    this.queryState.disableFixAllDates();
    return this;
  }
  DisableUpdateFields() {
    this.queryState.disableUpdateFields();
    return this;
  }
  DisableIdInclusion() {
    this.queryState.disableIdInclusion();
    return this;
  }
  DisableRemoveUndefinedValues() {
    this.queryState.disableRemoveUndefinedValues();
    return this;
  }
}
