import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { FirebaseClientStateManager } from "../../FirebaseClientStateManager";
import { LevelLogger } from '../provider/LevelLogger';

export interface IQueryState {
  appState$: FirebaseClientStateManager<FirebaseClientStateObject>,
  pathTemplate: string,
  overridenState: FirebaseClientStateObject,
  logger: LevelLogger,
}
