import { QueryState } from "../QueryState";
import { FirebaseClientStateObject } from "../../interfaces";
import { RunAfterDoc } from "../RunAfters";
import { observableToPromise } from "../../utils";

export async function DocumentCommandUpdate(
  q: QueryState<FirebaseClientStateObject>,
  obj: {},
  isMerged: boolean
): Promise<any> {
  q.logger.logDEBUG(">> start, DocumentCommandUpdate()", { q, obj, isMerged });
  const doc = await observableToPromise(q.refDocument());
  q.setUpdatedProps(obj, q.uid);
  const parsed = q.parseBeforeUpload(obj);
  const result = await doc.set(parsed, { merge: isMerged });
  await RunAfterDoc(q, "edited", doc);
  return result;
}
