import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { FirebaseClientStateObject } from './FirebaseClientStateObject';

export class FirebaseClientState {
  // Base data
  private root = new BehaviorSubject<FirebaseClientStateObject>(null);
  private HasBeenInitialized = new BehaviorSubject<boolean>(null);

  constructor() {
    this.Initialize();
  }

  Initialize() {}

  async TryInitUser() {
  }

  get $all(): Observable<FirebaseClientStateObject> {
    return this.root;
  }

  private get $HasDefinitelyInitialized() {
    return this.HasBeenInitialized.pipe(filter(i => !!i));
  }

  get $user(): Observable<firebase.auth.UserCredential> {
    return combineLatest([this.root, this.$HasDefinitelyInitialized]).pipe(
      map(vals => vals[0]),
      map(rootstate => (!rootstate ? null : rootstate.user)),
      distinctUntilChanged()
    );
  }

  InitializationDone() {
    this.HasBeenInitialized.next(true);
  }

  get current_uid(): string {
    const currentRoot = this.root.getValue();
    if (!currentRoot) {
      throw new Error("Not logged in yet, couldn't get user");
    }
    return currentRoot.uid;
  }

  public PatchRootState(newStateObj: FirebaseClientStateObject) {
    console.log('updating root state');
    const currentState = this.root.value;
    const newState = {
      ...currentState,
      ...newStateObj
    };
    this.root.next(newState);
  }

  ClearState() {
    this.root.next(null);
  }
}
