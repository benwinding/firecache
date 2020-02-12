import { CollectionQueryBuilder } from './CollectionQueryBuilder';
import { DocumentQueryBuilder } from './DocumentQueryBuilder';
import { FirebaseClientStateManager } from '../../FirebaseClientStateManager';
import { LogLevel } from '../interfaces/LogLevel';

export class FirestoreWrapper<EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
  constructor(
    private app: firebase.app.App,
    private rootState: FirebaseClientStateManager
  ) {}

  public FromCollection(
    collectionPathTemplate: EnumPathTemplatesCollections,
    logLevel?: LogLevel
  ): CollectionQueryBuilder {
    return new CollectionQueryBuilder(
      this.rootState,
      (collectionPathTemplate as any) as string,
      this.app,
      logLevel
    );
  }

  public FromDocument(
    documentPathTemplate: EnumPathTemplatesDocuments,
    logging?: 'LOGGING'
  ): DocumentQueryBuilder {
    return new DocumentQueryBuilder(
      this.rootState,
      (documentPathTemplate as any) as string,
      this.app,
      logging === 'LOGGING'
    );
  }
}
