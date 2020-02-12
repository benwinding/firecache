import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { FirebaseClientStateObject } from './FirebaseClientStateObject';

export class FirebaseClientStateManager {
  // Base data
  private _root = new BehaviorSubject<FirebaseClientStateObject>(null);
  private _hasBeenInitialized = new BehaviorSubject<boolean>(null);

  constructor() {}

  public InitializationDone() {
    this.log('client state has finished initializing');
    this._hasBeenInitialized.next(true);
  }

  private get $HasDefinitelyInitialized() {
    return this._hasBeenInitialized.pipe(filter(i => !!i));
  }

  get $all(): Observable<FirebaseClientStateObject> {
    return combineLatest([this._root, this.$HasDefinitelyInitialized]).pipe(
      map(([root]) => root)
    );
  }

  get $user(): Observable<firebase.User> {
    return combineLatest([this._root, this.$HasDefinitelyInitialized]).pipe(
      map(([root]) => root),
      map(rootstate => (!rootstate ? null : rootstate.user))
    );
  }

  get current_uid(): string {
    const currentRoot = this._root.getValue();
    if (!currentRoot) {
      this.log('no current user', { currentRoot });
      throw new Error('Not logged in yet, couldnt get user');
    }
    return currentRoot.uid;
  }

  public PatchRootState(newStateObj: FirebaseClientStateObject) {
    const currentState = this._root.value;
    this.log('updating client state', { currentState, newStateObj });
    const newState = {
      ...currentState,
      ...newStateObj
    };
    this._root.next(newState);
  }

  ClearState() {
    this._root.next(null);
  }

  private log(msg, obj?) {
    if (obj) {
      return console.log('🔥(FirebaseClientStateManager) ', msg, obj);
    }
    return console.log('🔥(FirebaseClientStateManager) ', msg);
  }
}
