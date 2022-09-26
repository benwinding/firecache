import firebase from "firebase/compat/app";
export interface FirebaseClientStateObject {
  uid?: string;
  user?: firebase.User;
}
