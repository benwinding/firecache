import { CollectionQueryBuilder } from './CollectionQueryBuilder';
import { DocumentQueryBuilder } from './DocumentQueryBuilder';
import { FirebaseClientStateManager } from '../../FirebaseClientStateManager';
import { LogLevel } from '../interfaces/LogLevel';

export class FirestoreWrapper<T> {
  constructor(
    private app: firebase.app.App,
    private rootState: FirebaseClientStateManager
  ) {}

  public FromCollection(
    collectionPathTemplate: T,
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
    documentPathTemplate: T,
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
