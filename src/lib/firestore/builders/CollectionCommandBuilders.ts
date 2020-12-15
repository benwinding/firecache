import { QueryState } from "../QueryState";
import { chunkify, makeRandomId, observableToPromise } from "../../utils";
import { FirebaseClientStateObject } from "../../interfaces";
import { RunAfterCollection } from "../RunAfters";

export async function CollectionCommandUpdate<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string,
  obj: T,
  isMerged?: boolean
): Promise<any> {
  q.logger.logDEBUG(">> start, CollectionCommandUpdate()", {
    q,
    id,
    obj,
    isMerged,
  });
  const collection = await observableToPromise(q.refCollection());
  q.setUpdatedProps(obj, q.uid);
  const parsed = q.parseBeforeUpload(obj);
  await Promise.all([
    collection.doc(id).set(parsed, { merge: isMerged }),
    RunAfterCollection(q, "edited", [id], collection),
  ]);
  q.logger.logINFO(">> end, CollectionCommandUpdate");
}

export async function CollectionCommandUpdateMany(
  q: QueryState<FirebaseClientStateObject>,
  objs: {
    id: string;
  }[],
  isMerged?: boolean
): Promise<any> {
  const uid = q.uid;
  const ids = objs.map((o) => o.id);
  q.logger.logDEBUG(">> start, CollectionCommandUpdateMany()", {
    uid,
    ids,
    q,
    isMerged,
    objs,
  });
  const collection = await observableToPromise(q.refCollection());
  const db = q.app.firestore();
  await BatchIt500(db, objs, (obj, batch) => {
    const docRef = collection.doc(obj.id);
    q.setUpdatedProps(obj, uid);
    const parsed = q.parseBeforeUpload(obj);
    batch.set(docRef, parsed, { merge: isMerged });
  });
  await RunAfterCollection(q, "edited some", ids, collection);
  q.logger.logINFO(">> end, CollectionCommandUpdateMany");
}

export async function CollectionCommandAdd<T>(
  q: QueryState<FirebaseClientStateObject>,
  obj: T
): Promise<firebase.firestore.DocumentReference> {
  const uid = q.uid;
  q.logger.logDEBUG(">> start, CollectionCommandAdd()", { uid, q, obj });
  q.setUpdatedProps(obj, uid);
  q.setCreatedProps(obj, uid);
  const parsed = q.parseBeforeUpload(obj);
  const collection = await observableToPromise(q.refCollection());
  try {
    const result = await collection.add(parsed);
    await RunAfterCollection(q, "added", [result.id], collection);
    return result;
  } catch (error) {
    q.logger.logERROR("error in Update()", error, {
      parsed,
      collection,
    });
    throw new Error(error);
  }
}

export async function CollectionCommandAddMany(
  q: QueryState<FirebaseClientStateObject>,
  objs: {}[]
): Promise<void> {
  const uid = q.uid;
  q.logger.logDEBUG(">> start, CollectionCommandAddMany()", { uid, q, objs });
  const collection = await observableToPromise(q.refCollection());
  const db = q.app.firestore();
  const idsAdded: string[] = [];
  await BatchIt500(db, objs, (obj, batch) => {
    q.setCreatedProps(obj, uid);
    q.setUpdatedProps(obj, uid);
    const parsed = q.parseBeforeUpload(obj);
    const newId = makeRandomId(db);
    const docRef = collection.doc(newId);
    batch.set(docRef, parsed, { merge: true });
    idsAdded.push(newId);
  });
  await RunAfterCollection(q, "added some", idsAdded, collection);
  q.logger.logDEBUG(">> end, CollectionCommandAddMany()");
}

export async function CollectionCommandDeleteId(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Promise<void> {
  q.logger.logDEBUG(">> start, CollectionCommandDeleteId()", { q, id });
  const collection = await observableToPromise(q.refCollection());
  await collection.doc(id).delete();
  await RunAfterCollection(q, "removed", [id], collection);
  q.logger.logDEBUG(">> end, CollectionCommandDeleteId()");
}

export async function CollectionCommandDeleteIds(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Promise<void> {
  q.logger.logDEBUG(">> start, CollectionCommandDeleteIds()", { q, ids });
  const collection = await observableToPromise(q.refCollection());
  const db = q.app.firestore();
  await BatchIt500(db, ids, (id, batch) => {
    const docRef = collection.doc(id);
    batch.delete(docRef);
  });
  await RunAfterCollection(q, "removed some", ids, collection);
  q.logger.logDEBUG(">> end, CollectionCommandDeleteIds()");
}

async function BatchIt500(
  db: firebase.firestore.Firestore,
  objs: any[],
  fnEach: (obj: any, batch: firebase.firestore.WriteBatch) => void
) {
  const objs500Groups = chunkify(objs, 500);
  return Promise.all(
    objs500Groups.map(async (objs500) => {
      const batch = db.batch();
      objs500.map((obj) => {
        fnEach(obj, batch);
      });
      return batch.commit();
    })
  );
}
