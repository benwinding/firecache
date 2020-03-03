import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { SubCollectionState } from "../provider/PathResolver";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";

export interface IQueryState {
  appState$: FirebaseClientStateManager<FirebaseClientStateObject>,
  pathTemplate: string,
  inputOverridenState: FirebaseClientStateObject,
  subcollection: SubCollectionState
}
