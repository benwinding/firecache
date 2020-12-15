import { QueryState } from "./QueryState";
import {
  FirebaseClientStateObject,
  ActionType,
  ActionFunctionArguments
} from "../interfaces";

type RefColl = firebase.firestore.CollectionReference;
type RefDoc = firebase.firestore.DocumentReference;

export function RunAfterDoc(
  q: QueryState<FirebaseClientStateObject>,
  action: ActionType,
  ref: RefDoc
) {
  const docPath = ref.path;
  const docId = ref.id;
  return runAfters(q, action, docPath, [docId], "DOC");
}

export async function RunAfterCollection(
  q: QueryState<FirebaseClientStateObject>,
  action: ActionType,
  ids: string[],
  ref: RefColl
) {
  const collectionPath = ref.path;
  return runAfters(q, action, collectionPath, ids);
}

async function runAfters(
  q: QueryState<FirebaseClientStateObject>,
  actionType: ActionType,
  collectionPath: string,
  ids: string[],
  type?: "DOC"
): Promise<any> {
  const isDoc = type === "DOC";
  const callbacks = q.getRunAfters();
  const u = await q.user();
  const idsSafe = ids || [];
  try {
    const actionArg = {
      user_id: u.uid,
      user_email: u.email,
      resource_type: isDoc ? "Document" : "Collection",
      resource_path_template: q.pathTemplate,
      resource_path_resolved: collectionPath,
      action: actionType,
      resource_ids: idsSafe
    } as ActionFunctionArguments<any, any>;
    q.logger.logDEBUG("runAfters", {
      actionArg,
      q,
      action: actionType,
      collectionPath,
      ids,
      type
    });
    await Promise.all(
      callbacks.map(async cb => {
        return cb(actionArg);
      })
    );
  } catch (error) {
    console.error("runAfter", error);
  }
}
