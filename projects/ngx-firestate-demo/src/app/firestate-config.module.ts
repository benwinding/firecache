import { InjectionToken, Injectable, Inject, NgModule } from '@angular/core';
import { FirestoreWrapper, FirebaseClient, FirebaseClientStateObject } from 'projects/ngx-firestate/src/public-api';
import { environment } from '../environments/environment';

export enum DocumentPaths {
  Doc1 = '/users'
}
export enum CollectionPaths {
  Doc1 = '/hosts',
  Doc2 = "/accounts"
}
export interface MyState extends FirebaseClientStateObject {

}
const App1 = new InjectionToken<FirebaseClient<CollectionPaths, DocumentPaths, MyState>>('App1');
const firebaseConfig1 = environment.firebaseConfig;

@Injectable()
export class FirestateFacade {
  public fire: FirestoreWrapper<CollectionPaths, DocumentPaths, MyState>

  constructor(
    @Inject(App1) public app1: FirebaseClient<CollectionPaths, DocumentPaths, MyState>,
  ) {
    this.fire = this.app1.db;
  }
}

@NgModule({
  providers: [
    {
      provide: App1,
      useValue: new FirebaseClient<CollectionPaths, DocumentPaths, MyState>(firebaseConfig1)
    },
    FirestateFacade
  ]
})
export class FireStateConfigModule {
  
}
