import { FirebaseWrapper } from "./firebase/FirebaseWrapper";
import { FirebaseClientStateManager } from "./FirebaseClientStateManager";
import { FirestoreWrapper } from "./firebase/provider/FirestoreWrapper";
import { FirebaseConfigObject } from "./firebase/provider/firebase-helpers";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FirebaseClientStateObject } from "./FirebaseClientStateObject";

export class FirebaseClient<
  EnumPathTemplatesCollections,
  EnumPathTemplatesDocuments,
  TState extends FirebaseClientStateObject
> {
  private firebaseWrapper: FirebaseWrapper<
    EnumPathTemplatesCollections,
    EnumPathTemplatesDocuments,
    TState
  >;
  private clientState = new FirebaseClientStateManager<TState>();

  constructor(firebaseConfig: FirebaseConfigObject) {
    this.firebaseWrapper = new FirebaseWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments,
      TState
    >(firebaseConfig, this.clientState);
  }

  ReInitialize(firebaseConfig: FirebaseConfigObject) {
    this.firebaseWrapper.reInitialize(firebaseConfig);
  }

  public PatchRootState(rootState: TState) {
    this.clientState.PatchRootState(rootState);
  }

  get db(): FirestoreWrapper<
    EnumPathTemplatesCollections,
    EnumPathTemplatesDocuments,
    TState
  > {
    return this.firebaseWrapper.provider;
  }

  public $IsLoggedIn(): Observable<boolean> {
    return this.clientState.$user.pipe(map(u => !!u));
  }

  public $CurrentUser(): Observable<firebase.User> {
    return this.clientState.$user;
  }

  public $GetRootState(): Observable<TState> {
    return this.clientState.$all;
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
