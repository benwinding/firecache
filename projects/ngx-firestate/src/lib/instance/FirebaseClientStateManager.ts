import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { FirebaseClientStateObject } from "./FirebaseClientStateObject";
import { LevelLogger } from "./firebase/provider/LevelLogger";

export class FirebaseClientStateManager<
  TState extends FirebaseClientStateObject
> {
  // Base data
  private _root = new BehaviorSubject<TState>(null);
  private _hasBeenInitialized = new BehaviorSubject<boolean>(null);

  private logger = new LevelLogger("state-manager", this.logLevel);

  constructor(private logLevel: number) {}

  public InitializationDone() {
    this.logger.logINFO("client state has finished initializing");
    this._hasBeenInitialized.next(true);
  }

  public $HasDefinitelyInitialized(): Observable<boolean> {
    return this._hasBeenInitialized.pipe(filter(i => !!i));
  }

  get $all(): Observable<TState> {
    return combineLatest([this._root, this.$HasDefinitelyInitialized()]).pipe(
      map(([root]) => root)
    );
  }

  get $user(): Observable<firebase.User> {
    return combineLatest([this._root, this.$HasDefinitelyInitialized()]).pipe(
      map(([root]) => root),
      map(rootstate => (!rootstate ? null : rootstate.user))
    );
  }

  get current_uid(): string {
    const currentRoot = this._root.getValue();
    if (!currentRoot || !currentRoot.user) {
      this.logger.logINFO("no current user", { currentRoot });
      throw new Error("Not logged in yet, couldnt get user");
    }
    return currentRoot.user.uid;
  }

  public PatchRootState(addedStateObj: TState | FirebaseClientStateObject) {
    const currentState = this._root.value;
    const newState = {
      ...getSafeObj(currentState),
      ...getSafeObj(addedStateObj)
    } as TState;
    this.logger.logINFO("state patched", {
      newState
    });
    this._root.next(newState);
  }

  ClearState() {
    this._root.next(null);
  }
}

function getSafeObj(input: any): {} {
  if (!!input && typeof input === "object") {
    return input;
  }
  return {};
}
