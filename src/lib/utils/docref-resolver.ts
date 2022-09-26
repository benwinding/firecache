import * as _ from "lodash";
import { ParsedDocRef } from "./docref-parser";
import firebase from "firebase/compat/app";

export async function ResolveDocRefsToData(
  db: firebase.firestore.Firestore,
  dataSafe: any,
  parsedRefs: ParsedDocRef[],
  shouldIncludeId: boolean
) {
  if (!parsedRefs || !Array.isArray(parsedRefs)) {
    return;
  }
  await Promise.all(parsedRefs.map((ref) => ProcessRef(db, ref, dataSafe, shouldIncludeId)));
}

async function ProcessRef(
  db: firebase.firestore.Firestore,
  parsedRef: ParsedDocRef,
  dataSafe: any,
  shouldIncludeId: boolean
) {
  const refDoc = await db.doc(parsedRef.docRefPath).get();
  const refDocData = refDoc.exists ? refDoc.data() : {};
  if (shouldIncludeId) {
    refDocData['id'] = refDoc.id;
  }
  _.set(dataSafe, parsedRef.fieldDotsPath, refDocData);
}
