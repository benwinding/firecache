// tslint:disable: no-string-literal
import { Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { resolvePathVariables } from './PathResolver';
import { document2Observable } from './firebase-helpers';
import { IDocumentQueryBuilder } from '../interfaces/IDocumentQueryBuilder';
import { FirebaseClientStateObject } from '../../FirebaseClientStateObject';
import { FirebaseClientStateManager } from '../../FirebaseClientStateManager';

export class DocumentQueryBuilder implements IDocumentQueryBuilder {
  private overridenState: FirebaseClientStateObject;

  constructor(
    private appState$: FirebaseClientStateManager,
    private documentPathTemplate: string,
    private app: firebase.app.App,
    private loggingEnabled: boolean
  ) {}
  private get uid(): string {
    return this.appState$.current_uid;
  }
  OverrideProjectState(
    overridenState: FirebaseClientStateObject
  ): IDocumentQueryBuilder {
    this.overridenState = overridenState;
    return this;
  }
  GetDoc<T>(): Observable<T> {
    return resolvePathVariables(
      this.appState$,
      this.documentPathTemplate,
      this.overridenState
    ).pipe(
      tap(documentPath =>
        this.log('GetDoc() about to get path', { documentPath })
      ),
      map(documentPath => {
        return this.app.firestore().doc(documentPath);
      }),
      switchMap(doc => document2Observable(doc)),
      map(snap => {
        const data = snap.data() || {};
        return ({
          ...data,
          id: snap.id
        } as any) as T;
      })
    );
  }
  Update(obj: {}): Promise<void> {
    return resolvePathVariables(
      this.appState$,
      this.documentPathTemplate,
      this.overridenState
    )
      .pipe(
        map(documentPath => {
          return this.app.firestore().doc(documentPath);
        }),
        switchMap(doc => {
          obj['updated_by'] = this.uid;
          obj['updated_at'] = new Date();
          return doc.set(obj);
        })
      )
      .pipe(take(1))
      .toPromise();
  }
  private log(msg, obj) {
    if (this.loggingEnabled) {
      console.log('🔥 firestore.provider: ' + msg, obj);
    }
  }
}
