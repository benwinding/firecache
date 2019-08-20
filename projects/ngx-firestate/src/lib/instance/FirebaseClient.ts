import { FirebaseWrapper } from './firebase/FirebaseWrapper';
import { FirebaseClientState } from './FirebaseClientState';
import { FirestoreWrapper } from './firebase/provider/FirestoreWrapper';
import { FirebaseConfigObject } from './firebase/provider/firebase-helpers';

export class FirebaseClient<EnumDocType> {
  private firebaseWrapper: FirebaseWrapper<EnumDocType>;
  private clientState = new FirebaseClientState();

  constructor(
    firebaseConfig: FirebaseConfigObject,
  ) {
    this.InitFirebase(firebaseConfig);
  }

  get db(): FirestoreWrapper<EnumDocType> {
    return this.firebaseWrapper.provider;
  }

  private InitFirebase(firebaseConfig: FirebaseConfigObject): void {
    console.log('FirebaseClient.ts: InitFirebase()...');
    try {
      this.firebaseWrapper = new FirebaseWrapper<EnumDocType>(
        firebaseConfig,
        this.clientState
      );
    } catch (error) {
      console.error('FirebaseClient.ts: InitFirebase()', error);
    }
  }

  public login(email: string, pass: string) {
    return this.firebaseWrapper.login(email, pass);
  }

  public logout() {
    return this.firebaseWrapper.logout();
  }
}
