import { FirebaseWrapper } from "./firebase/FirebaseWrapper";
import { FirebaseClientStateManager } from "./FirebaseClientStateManager";
import { FirestoreWrapper } from "./firestore/FirestoreWrapper";
import { FirebaseConfigObject } from "./utils";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { FirebaseClientStateObject } from "./interfaces";
import { LevelLogger } from "./utils";
import { FireStateOptions } from "./interfaces/FireStateOptions";

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

  constructor(
    firebaseConfigOrApp: FirebaseConfigObject | firebase.app.App,
    private options?: FireStateOptions
  ) {
    this.options = options || {};
    this.logger = new LevelLogger("FirebaseClient", this.options.logLevel);
    this.logger.logINFO("instance created...");
    this.clientState = new FirebaseClientStateManager<TState>(this.options);
    this.firebaseWrapper = new FirebaseWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments,
      TState
    >(firebaseConfigOrApp, this.clientState, this.options);
    this.appSDK = this.firebaseWrapper.app;
  }

  ReInitialize(firebaseConfig: FirebaseConfigObject) {
    this.firebaseWrapper.reInitialize(firebaseConfig);
  }

  public PatchRootState(rootState: TState) {
    this.logger.logINFO("updating state from Client", {
      rootState
    });
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
    return this.firebaseWrapper.GetAuthUser$();
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
