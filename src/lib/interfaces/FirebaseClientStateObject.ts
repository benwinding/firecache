import firebase from "firebase/app";
export interface FirebaseClientStateObject {
  uid?: string;
  user?: firebase.User;
}
