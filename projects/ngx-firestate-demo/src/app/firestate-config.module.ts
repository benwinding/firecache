import { InjectionToken, Injectable, Inject, NgModule } from '@angular/core';
import { FirebaseClient } from 'projects/ngx-firestate/src/public-api';
import { environment } from '../environments/environment';

export enum DocPaths1 {
  Doc1 = '/users'
}
const App1 = new InjectionToken<FirebaseClient<DocPaths1>>('App1');
const firebaseConfig1 = environment.firebaseConfig;

export enum DocPaths2 {
  UsersCollection = '/users'
}
const App2 = new InjectionToken<FirebaseClient<DocPaths2>>('App2');
const firebaseConfig2 = environment.firebaseConfig2;

export enum DocPaths3 {
  Doc3 = '/3ascasc/ascsss/acsccc',
  Doc33 = '/3ascasc/ascsss/acsccc'
}
const App3 = new InjectionToken<FirebaseClient<DocPaths3>>('App3');
const firebaseConfig3 = environment.firebaseConfig;

@Injectable()
export class FirestateFacade {
  constructor(
    @Inject(App1) public app1: FirebaseClient<DocPaths1>,
    @Inject(App2) public app2: FirebaseClient<DocPaths2>,
    @Inject(App3) public app3: FirebaseClient<DocPaths3>
  ) {}
}

@NgModule({
  providers: [
    {
      provide: App1,
      useValue: new FirebaseClient<DocPaths1>(firebaseConfig1)
    },
    {
      provide: App2,
      useValue: new FirebaseClient<DocPaths2>(firebaseConfig2)
    },
    {
      provide: App3,
      useValue: new FirebaseClient<DocPaths3>(firebaseConfig3)
    },
    FirestateFacade
  ]
})
export class FireStateConfigModule {}
