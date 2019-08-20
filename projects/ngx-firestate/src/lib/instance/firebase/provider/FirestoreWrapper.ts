import { CollectionQueryBuilder } from './CollectionQueryBuilder';
import { DocumentQueryBuilder } from './DocumentQueryBuilder';
import { FirebaseClientState } from '../../FirebaseClientState';

export class FirestoreWrapper<T> {
  constructor(
    private app: firebase.app.App,
    private rootState: FirebaseClientState
  ) {}

  public FromCollection(
    collectionPathTemplate: T,
    logging?: 'LOGGING'
  ): CollectionQueryBuilder {
    return new CollectionQueryBuilder(
      this.rootState,
      (collectionPathTemplate as any) as string,
      this.app,
      logging === 'LOGGING'
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
