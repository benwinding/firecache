import { FirestoreWrapper } from "./provider/FirestoreWrapper";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import {
  GetApp,
  FirebaseConfigObject,
  MakeAuthstateObservable
} from "./provider/firebase-helpers";
import { take } from "rxjs/operators";

export class FirebaseWrapper<
  EnumPathTemplatesCollections,
  EnumPathTemplatesDocuments
> {
  public app: firebase.app.App;
  public provider: FirestoreWrapper<
    EnumPathTemplatesCollections,
    EnumPathTemplatesDocuments
  >;

  constructor(
    firebaseConfig: FirebaseConfigObject,
    private clientState: FirebaseClientStateManager
  ) {
    this.app = GetApp(firebaseConfig);
    this.provider = new FirestoreWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments
    >(this.app, this.clientState);
    this.initFirebaseFromCache().catch(e => console.error(e));
  }

  private async initFirebaseFromCache() {
    this.log("initFirebase()...");
    try {
      await this.initUserFromBrowser();
    } catch (error) {
      this.log("user could not be initialized from cache");
    }
    this.clientState.InitializationDone();
  }

  private async initUserFromBrowser() {
    this.log("initUserFromBrowser() starting");
    const authState$ = MakeAuthstateObservable(this.app.auth());
    const user = await authState$.pipe(take(1)).toPromise();
    if (!user) {
      throw new Error("User is not previously logged in");
    }
    this.log("initUserFromBrowser() done", { user });
    this.clientState.PatchRootState({ user });
  }

  async login(email: string, password: string): Promise<firebase.User> {
    this.log("logging in...");
    try {
      const authUser = await this.app
        .auth()
        .signInWithEmailAndPassword(email, password);
      this.log("user successfully logged in", {
        user: authUser
      });
      const authState$ = MakeAuthstateObservable(this.app.auth());
      const user = await authState$.pipe(take(1)).toPromise();
      this.clientState.PatchRootState({ user });
      return authUser.user;
    } catch (e) {
      this.log("Login() invalid credentials...", {
        email,
        password
      });
      throw new Error("invalid credentials...");
    }
  }

  logout() {
    this.log("logging user out...");
    this.clientState.ClearState();
    return this.app.auth().signOut();
  }

  reInitialize(firebaseConfig: FirebaseConfigObject) {
    this.app = GetApp(firebaseConfig);
    this.provider = new FirestoreWrapper<
      EnumPathTemplatesCollections,
      EnumPathTemplatesDocuments
    >(this.app, this.clientState);
  }

  private log(msg, obj?) {
    if (obj) {
      return console.log("🌟(FirebaseWrapper) ", msg, obj);
    }
    return console.log("🌟(FirebaseWrapper) ", msg);
  }
}
