import { FirebaseClientStateObject } from "../interfaces";
import { FirebaseClientStateManager } from "../FirebaseClientStateManager";
import { LevelLogger } from '../utils';

export interface IQueryState {
  appState$: FirebaseClientStateManager<FirebaseClientStateObject>,
  pathTemplate: string,
  overridenState: FirebaseClientStateObject,
  logger: LevelLogger,
}
