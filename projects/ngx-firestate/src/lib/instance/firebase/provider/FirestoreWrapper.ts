import { CollectionQueryBuilder } from "./Collection$Builder";
import { DocumentQueryBuilder } from "./Document$Builder";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { LogLevel } from "../interfaces/LogLevel";
import { QueryState } from "./QueryState";
import * as firebase from "firebase/app";

export class FirestoreWrapper<
  EnumPathTemplatesCollections,
  EnumPathTemplatesDocuments
> {
  constructor(
    private app: firebase.app.App,
    private rootState: FirebaseClientStateManager
  ) {}

  public FromCollection(
    collectionPathTemplate: EnumPathTemplatesCollections,
    logLevel?: LogLevel
  ): CollectionQueryBuilder {
    const queryState = new QueryState(
      this.rootState,
      (collectionPathTemplate as any) as string,
      this.app,
      logLevel
    );
    return new CollectionQueryBuilder(queryState);
  }

  public FromDocument(
    documentPathTemplate: EnumPathTemplatesDocuments,
    logLevel?: LogLevel
  ): DocumentQueryBuilder {
    const queryState = new QueryState(
      this.rootState,
      (documentPathTemplate as any) as string,
      this.app,
      logLevel
    );
    return new DocumentQueryBuilder(queryState);
  }
}
