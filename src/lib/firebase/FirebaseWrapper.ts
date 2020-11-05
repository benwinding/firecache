import { FirestoreWrapper } from "../firestore/FirestoreWrapper";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import {
  GetApp,
  FirebaseConfigObject,
  MakeAuthstateObservable
} from "../utils";
import { take } from "rxjs/operators";
import { FirebaseClientStateObject } from "../interfaces";
import { LevelLogger } from "../utils";
import { FireStateOptions } from "../interfaces";
import { Observable } from 'rxjs';

export class FirebaseWrapper<
  EnumPathTemplatesCollections,
  EnumPathTemplatesDocuments,
  TState extends FirebaseClientStateObject
> {
  public app: firebase.app.App;
  public provider: FirestoreWrapper<
    EnumPathTemplatesCollections,
    EnumPathTemplatesDocuments,
    TState
  >;
  private logger: LevelLogger;

  constructor(
    firebaseConfig: FirebaseConfigObject,
    private clientState: FirebaseClientStateManager<TState>,
    private options: FireStateOptions
  ) {
    this.logger = new LevelLogger("FirebaseWrapper", options.logLevel);
    this.app = GetApp(firebaseConfig);
    this.provider = new FirestoreWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments,
      TState
    >(this.app, this.clientState, this.options);
    this.initFirebaseFromCache().catch(e => console.error(e));
  }

  private async initFirebaseFromCache() {
    this.logger.logINFO("initFirebase()...");
    try {
      await this.initUserFromBrowser();
    } catch (error) {
      console.warn(error);
    }
    this.clientState.InitializationDone();
  }

  private async initUserFromBrowser() {
    this.logger.logINFO("initUserFromBrowser() starting");
    const authState$ = MakeAuthstateObservable(this.app.auth());
    const user = await authState$.pipe(take(1)).toPromise();
    if (!user) {
      this.logger.logINFO("initUserFromBrowser() could not log user in...", {
        user
      });
      throw new Error("User is not previously logged in");
    }
    this.logger.logINFO("initUserFromBrowser() user logged in from cache!", {
      user
    });
    this.clientState.PatchRootState({ user: user } as TState);
  }

  async login(email: string, password: string): Promise<firebase.User> {
    this.logger.logINFO("logging in...");
    try {
      const authUser = await this.app
        .auth()
        .signInWithEmailAndPassword(email, password);
      this.logger.logINFO("user successfully logged in", {
        user: authUser
      });
      const authState$ = MakeAuthstateObservable(this.app.auth());
      const user = await authState$.pipe(take(1)).toPromise();
      this.clientState.PatchRootState({ user: user } as TState);
      return authUser.user;
    } catch (e) {
      this.logger.logINFO("Login() invalid credentials...", {
        email,
        password
      });
      throw new Error("invalid credentials...");
    }
  }

  logout() {
    this.logger.logINFO("logging user out...");
    this.clientState.ClearState();
    return this.app.auth().signOut();
  }

  reInitialize(firebaseConfig: FirebaseConfigObject) {
    this.app = GetApp(firebaseConfig);
    this.provider = new FirestoreWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments,
      TState
    >(this.app, this.clientState, this.options);
  }

  GetAuthUser$(): Observable<firebase.User> {
    const authState$ = MakeAuthstateObservable(this.app.auth());
    return authState$;
  }
}
