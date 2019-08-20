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
