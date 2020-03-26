import { CollectionQueryBuilder, DocumentQueryBuilder } from "./builders";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import { LogLevel, FireStateOptions, FirebaseClientStateObject } from "../interfaces";
import { QueryState } from "./QueryState";
import * as firebase from "firebase/app";

export class FirestoreWrapper<
  EnumPathTemplatesCollections,
  EnumPathTemplatesDocuments,
  TState extends FirebaseClientStateObject
> {
  constructor(
    private app: firebase.app.App,
    private rootState: FirebaseClientStateManager<TState>,
    private options: FireStateOptions
  ) {}

  public FromCollection(
    collectionPathTemplate: EnumPathTemplatesCollections,
    logLevel?: LogLevel
  ): CollectionQueryBuilder<TState, EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
    const queryState = new QueryState(
      this.rootState,
      (collectionPathTemplate as any) as string,
      this.app,
      this.options,
      logLevel
    );
    return new CollectionQueryBuilder(queryState);
  }

  public FromDocument(
    documentPathTemplate: EnumPathTemplatesDocuments,
    logLevel?: LogLevel
  ): DocumentQueryBuilder<TState, EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
    const queryState = new QueryState(
      this.rootState,
      (documentPathTemplate as any) as string,
      this.app,
      this.options,
      logLevel
    );
    return new DocumentQueryBuilder(queryState);
  }

  public UNSAFEFromCollection(
    collectionPathTemplate: string,
    logLevel?: LogLevel
  ): CollectionQueryBuilder<TState, EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
    const queryState = new QueryState(
      this.rootState,
      (collectionPathTemplate as any) as string,
      this.app,
      this.options,
      logLevel
    );
    return new CollectionQueryBuilder(queryState);
  }

  public GetRandomDocId(): string {
    return this.app.firestore().collection('collections').doc().id;
  }
}
