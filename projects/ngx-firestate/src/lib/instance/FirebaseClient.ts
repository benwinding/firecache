import { FirebaseWrapper } from "./firebase/FirebaseWrapper";
import { FirebaseClientStateManager } from "./FirebaseClientStateManager";
import { FirestoreWrapper } from "./firebase/provider/FirestoreWrapper";
import { FirebaseConfigObject } from "./firebase/provider/firebase-helpers";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FirebaseClientStateObject } from "./FirebaseClientStateObject";
import { LevelLogger } from './firebase/provider/LevelLogger';

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
  private clientState: FirebaseClientStateManager<TState>;
  public appSDK: firebase.app.App;
  private logger: LevelLogger;

  constructor(firebaseConfig: FirebaseConfigObject, logLevel: number) {
    this.logger = new LevelLogger('FirebaseClient', logLevel);
    this.logger.logINFO("instance created...");
    this.clientState = new FirebaseClientStateManager<TState>(logLevel)
    this.firebaseWrapper = new FirebaseWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments,
      TState
    >(firebaseConfig, this.clientState);
    this.appSDK = this.firebaseWrapper.app;
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

  public $IsFinishedInitialization(): Observable<boolean> {
    return this.clientState.$HasDefinitelyInitialized();
  }

  public $CurrentUser(): Observable<firebase.User> {
    return this.clientState.$user;
  }

  public $GetRootState(): Observable<TState> {
    return this.clientState.$all;
  }

  public async login(email: string, pass: string) {
    try {
      const userRecord = await this.firebaseWrapper.login(email, pass);
      return userRecord;
    } catch (error) {
      throw new Error(error);
    }
  }

  public logout() {
    return this.firebaseWrapper.logout();
  }
}
