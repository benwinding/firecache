import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

export function collection2Observable(collection: firebase.firestore.Query) {
  const observable: Observable<
    firebase.firestore.QuerySnapshot
  > = Observable.create((observer: any) => collection.onSnapshot(observer));
  return observable;
}

export function document2Observable(doc: firebase.firestore.DocumentReference) {
  const observable: Observable<
    firebase.firestore.DocumentSnapshot
  > = Observable.create((observer: any) => doc.onSnapshot(observer));
  return observable;
}

// tslint:disable-next-line: class-name
export interface FirebaseConfigObject {
  projectId: string;
  [key: string]: string;
}

export function GetApp(firebaseConfig: FirebaseConfigObject): firebase.app.App {
  try {
    console.log('firebase.helpers: GetApp()...');
    const appName = firebaseConfig.projectId;
    const f = firebase;
    if (AppExists(appName)) {
      return f.app(appName);
    }
    f.initializeApp(firebaseConfig, appName);
    const app = f.app(appName);
    return app;
  } catch (error) {
    console.error('firebase.helpers: GetApp()...', error);
  }
}

export function AppExists(appName: string): boolean {
  const f = firebase;
  try {
    const exists = !!f.app(appName);
    return exists;
  } catch (error) {
    return false;
  }
}
