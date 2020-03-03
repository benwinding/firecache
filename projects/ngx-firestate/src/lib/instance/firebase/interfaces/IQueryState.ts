import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { SubCollectionState } from "../provider/PathResolver";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { LevelLogger } from '../provider/LevelLogger';

export interface IQueryState {
  appState$: FirebaseClientStateManager<FirebaseClientStateObject>,
  pathTemplate: string,
  overridenState: FirebaseClientStateObject,
  subcollectionState: SubCollectionState,
  logger: LevelLogger,
}
