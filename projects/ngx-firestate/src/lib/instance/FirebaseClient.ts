import { FirebaseWrapper } from './firebase/FirebaseWrapper';
import { FirebaseClientStateManager } from './FirebaseClientStateManager';
import { FirestoreWrapper } from './firebase/provider/FirestoreWrapper';
import { FirebaseConfigObject } from './firebase/provider/firebase-helpers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class FirebaseClient<EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
  private firebaseWrapper: FirebaseWrapper<EnumPathTemplatesCollections, EnumPathTemplatesDocuments>;
  private clientState = new FirebaseClientStateManager();

  constructor(
    firebaseConfig: FirebaseConfigObject,
  ) {
    this.firebaseWrapper = new FirebaseWrapper<EnumPathTemplatesCollections, EnumPathTemplatesDocuments>(
      firebaseConfig,
      this.clientState
    );
  }

  ReInitialize(firebaseConfig: FirebaseConfigObject) {
    this.firebaseWrapper.reInitialize(firebaseConfig);
  }

  get db(): FirestoreWrapper<EnumPathTemplatesCollections, EnumPathTemplatesDocuments> {
    return this.firebaseWrapper.provider;
  }

  public $IsLoggedIn(): Observable<boolean> {
    return this.clientState.$user.pipe(map(u => !!u));
  }

  public $CurrentUser(): Observable<firebase.User> {
    return this.clientState.$user;
  }

  public async login(email: string, pass: string) {
    try {
      await this.firebaseWrapper.login(email, pass);
    } catch (error) {
      throw new Error(error);
    }
  }

  public logout() {
    return this.firebaseWrapper.logout();
  }
}
