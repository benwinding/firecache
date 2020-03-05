import { ActionType, ActionFunctionArguments } from "../interfaces/Actions";
import { QueryState } from "./QueryState";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";

type RefColl = firebase.firestore.CollectionReference;
type RefDoc = firebase.firestore.DocumentReference;

export function RunAfterDoc(
  q: QueryState<FirebaseClientStateObject>,
  action: ActionType
): (ref: RefDoc) => void {
  return (ref: RefDoc) => {
    const docPath = ref.path;
    const docId = ref.id;
    runAfters(q, action, docPath, [docId], 'DOC');
  };
}

export function RunAfterCollection(
  q: QueryState<FirebaseClientStateObject>,
  action: ActionType,
  ids?: string[]
): (ref: RefColl) => void {
  return (ref: RefColl) => {
    const collectionPath = ref.path;
    runAfters(q, action, collectionPath, ids);
  };
}

async function runAfters(
  q: QueryState<FirebaseClientStateObject>,
  action: ActionType,
  collectionPath: string,
  ids: string[],
  type?: 'DOC'
): Promise<any> {
  const isDoc = type === 'DOC';
  const callbacks = q.getRunAfters();
  const u = await q.user();
  try {
    const actionArg = {
      user_id: u.uid,
      user_email: u.email,
      resource_type: isDoc ? 'Document' : 'Collection',
      resource_path_template: q.pathTemplate,
      resource_path_resolved: collectionPath,
      action: action,
      resource_ids: ids
    } as ActionFunctionArguments<any, any>;
    await Promise.all(
      callbacks.map(async cb => {
        return cb(actionArg);
      })
    );
  } catch (error) {
    console.error("runAfter", error);
  }
}
