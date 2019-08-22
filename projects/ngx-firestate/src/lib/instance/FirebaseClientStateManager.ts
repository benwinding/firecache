import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { FirebaseClientStateObject } from './FirebaseClientStateObject';

export class FirebaseClientStateManager {
  // Base data
  private root = new BehaviorSubject<FirebaseClientStateObject>(null);
  private HasBeenInitialized = new BehaviorSubject<boolean>(null);

  constructor() {}

  public InitializationDone() {
    this.log('client state has finished initializing');
    this.HasBeenInitialized.next(true);
  }

  private get $HasDefinitelyInitialized() {
    return this.HasBeenInitialized.pipe(filter(i => !!i));
  }

  get $all(): Observable<FirebaseClientStateObject> {
    return combineLatest([this.root, this.$HasDefinitelyInitialized]).pipe(
      map(([root]) => root)
    );
  }

  get $user(): Observable<firebase.User> {
    return combineLatest([this.root, this.$HasDefinitelyInitialized]).pipe(
      map(([root]) => root),
      map(rootstate => (!rootstate ? null : rootstate.user)),
      distinctUntilChanged()
    );
  }

  get current_uid(): string {
    const currentRoot = this.root.getValue();
    if (!currentRoot) {
      this.log('no current user', { currentRoot });
      throw new Error('Not logged in yet, couldnt get user');
    }
    return currentRoot.uid;
  }

  public PatchRootState(newStateObj: FirebaseClientStateObject) {
    const currentState = this.root.value;
    this.log('updating client state', { currentState, newStateObj });
    const newState = {
      ...currentState,
      ...newStateObj
    };
    this.root.next(newState);
  }

  ClearState() {
    this.root.next(null);
  }

  private log(msg, obj?) {
    if (obj) {
      return console.log('🔥(FirebaseClientStateManager) ', msg, obj);
    }
    return console.log('🔥(FirebaseClientStateManager) ', msg);
  }
}
