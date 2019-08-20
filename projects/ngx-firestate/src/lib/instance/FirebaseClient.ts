import { FirebaseWrapper } from './firebase/FirebaseWrapper';
import { FirebaseClientState } from './FirebaseClientState';
import { FirestoreWrapper } from './firebase/provider/FirestoreWrapper';
import { FirebaseConfigObject } from './firebase/provider/firebase-helpers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  public $IsLoggedIn(): Observable<boolean> {
    return this.clientState.$user.pipe(map(u => !!u));
  }

  public $CurrentUser(): Observable<firebase.auth.UserCredential> {
    return this.clientState.$user;
  }

  public login(email: string, pass: string) {
    return this.firebaseWrapper.login(email, pass);
  }

  public logout() {
    return this.firebaseWrapper.logout();
  }
}
