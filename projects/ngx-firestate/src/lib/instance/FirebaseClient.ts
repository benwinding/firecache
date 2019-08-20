import { FirebaseWrapper } from './firebase/FirebaseWrapper';
import { FirebaseClientState } from './FirebaseClientState';
import { FirestoreWrapper } from './firebase/provider/FirestoreWrapper';

export class FirebaseClient<EnumDocType> {
  private firebaseWrapper: FirebaseWrapper<EnumDocType>;
  private clientState = new FirebaseClientState();

  constructor(
    firebaseConfig: {},
  ) {
    this.InitFirebase(firebaseConfig);
  }

  get db(): FirestoreWrapper<EnumDocType> {
    return this.firebaseWrapper.provider;
  }

  private InitFirebase(firebaseConfig: {}): void {
    console.log('firebase.provider: InitFirebase()...');
    try {
      this.firebaseWrapper = new FirebaseWrapper<EnumDocType>(
        'default',
        firebaseConfig,
        this.clientState
      );
    } catch (error) {
      console.error('firebase.provider: InitAllProjects()', error);
    }
  }

  public login(email: string, pass: string) {
    return this.firebaseWrapper.login(email, pass);
  }

  public logout() {
    return this.firebaseWrapper.logout();
  }
}
