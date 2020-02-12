import * as firebase from 'firebase/app';
import { Observable, ReplaySubject, Observer, throwError } from 'rxjs';

export function collection2Observable(
  collection: firebase.firestore.Query
): Observable<firebase.firestore.QuerySnapshot> {
  const onError = (err: Error) => {
    return throwError(err);
  };

  const observable: Observable<
    firebase.firestore.QuerySnapshot
  > = Observable.create((observer: any) =>
    collection.onSnapshot(observer, onError)
  );
  return observable;
}

export function document2Observable(
  doc: firebase.firestore.DocumentReference
): Observable<firebase.firestore.DocumentSnapshot> {
  const onError = (err: Error) => {
    console.error('document2Observable', { doc }, err);
    return throwError(err);
  };

  const observable: Observable<
    firebase.firestore.DocumentSnapshot
  > = Observable.create((observer: any) => doc.onSnapshot(observer, onError));
  return observable;
}

// tslint:disable-next-line: class-name
export interface FirebaseConfigObject {
  projectId: string;
  [key: string]: string;
}

export function GetApp(firebaseConfig: FirebaseConfigObject): firebase.app.App {
  try {
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

export function MakeAuthstateObservable(
  auth: firebase.auth.Auth
): Observable<firebase.User> {
  const authState = Observable.create((observer: Observer<firebase.User>) => {
    auth.onAuthStateChanged(
      (user?: firebase.User) => observer.next(user),
      (error: firebase.auth.Error) => observer.error(error),
      () => observer.complete()
    );
  });
  return authState;
}
