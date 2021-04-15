import * as _ from "lodash";
import { ParsedDocRef } from "./docref-parser";

export async function ResolveDocRefsToData(
  db: firebase.firestore.Firestore,
  dataSafe: any,
  parsedRefs: ParsedDocRef[]
) {
  if (!parsedRefs || !Array.isArray(parsedRefs)) {
    return;
  }
  await Promise.all(parsedRefs.map((ref) => ProcessRef(db, ref, dataSafe)));
}

async function ProcessRef(
  db: firebase.firestore.Firestore,
  parsedRef: ParsedDocRef,
  dataSafe: any
) {
  const refDoc = await db.doc(parsedRef.docRefPath).get();
  const refDocData = refDoc.exists ? refDoc.data() : {};
  _.set(dataSafe, parsedRef.fieldDotsPath, refDocData);
}
