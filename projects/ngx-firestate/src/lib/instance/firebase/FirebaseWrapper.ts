import { FirestoreWrapper } from './provider/FirestoreWrapper';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { FirebaseClientState } from '../FirebaseClientState';
import { GetApp, FirebaseConfigObject } from './provider/firebase-helpers';

export class FirebaseWrapper<EnumDocType> {
  public app: firebase.app.App;
  public provider: FirestoreWrapper<EnumDocType>;

  constructor(
    firebaseConfig: FirebaseConfigObject,
    private clientState: FirebaseClientState
  ) {
    this.app = GetApp(firebaseConfig);
    this.provider = new FirestoreWrapper<EnumDocType>(
      this.app,
      this.clientState
    );
  }

  async login(email: string, password: string): Promise<firebase.User> {
    console.log('🌟 auth.Login() logging in...');
    try {
      const authUser = await this.app
        .auth()
        .signInWithEmailAndPassword(email, password);
      console.log('🌟 auth.Login() user successfully logged in', {
        user: authUser
      });
      this.clientState.PatchRootState({ user: authUser });
      return authUser.user;
    } catch (e) {
      console.log('🌟 auth.Login() invalid credentials...', {
        email,
        password
      });
      throw new Error('🌟 auth.Login() invalid credentials...');
    }
  }

  logout() {
    return this.app.auth().signOut();
  }
}
