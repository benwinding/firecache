import { QueryState } from "../QueryState";
import { switchMap, take, tap } from "rxjs/operators";
import { chunkify } from "../../utils";
import { FirebaseClientStateObject } from "../../interfaces";
import { RunAfterCollection } from "../RunAfters";

export function CollectionCommandUpdate<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string,
  obj: T,
  isMerged?: boolean
): Promise<any> {
  q.logger.logDEBUG(">> start, CollectionCommandUpdate()", {
    q,
    id,
    obj,
    isMerged
  });
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "edited", [id])),
      switchMap(collection => {
        q.setUpdatedProps(obj, q.uid);
        const parsed = q.parseBeforeUpload(obj);
        return collection.doc(id).set(parsed, { merge: isMerged });
      }),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandUpdateMany(
  q: QueryState<FirebaseClientStateObject>,
  objs: {
    id: string;
  }[],
  isMerged?: boolean
): Promise<any> {
  const uid = q.uid;
  const ids = objs.map(o => o.id);
  q.logger.logDEBUG(">> start, CollectionCommandUpdateMany()", {
    uid,
    ids,
    q,
    isMerged,
    objs
  });
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "edited some", ids)),
      switchMap(collection => {
        const db = q.app.firestore();
        const objs500Groups = chunkify(objs, 500);
        return Promise.all(
          objs500Groups.map(async objs500 => {
            const batch = db.batch();
            objs500.map(obj => {
              const docRef = collection.doc(obj.id);
              q.setUpdatedProps(obj, uid);
              const parsed = q.parseBeforeUpload(obj);
              batch.set(docRef, parsed, { merge: isMerged });
            });
            return batch.commit();
          })
        );
      }),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandAdd<T>(
  q: QueryState<FirebaseClientStateObject>,
  obj: T
): Promise<firebase.firestore.DocumentReference> {
  const uid = q.uid;
  q.logger.logDEBUG(">> start, CollectionCommandAdd()", { uid, q, obj });
  q.setUpdatedProps(obj, uid);
  q.setCreatedProps(obj, uid);
  const parsed = q.parseBeforeUpload(obj);
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "added")),
      switchMap(async collection => {
        try {
          const result = await collection.add(parsed);
          return result;
        } catch (error) {
          q.logger.logERROR("error in Update()", error, {
            parsed,
            collection
          });
          throw new Error(error);
        }
      }),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandAddMany(
  q: QueryState<FirebaseClientStateObject>,
  objs: {}[]
): Promise<void> {
  const uid = q.uid;
  q.logger.logDEBUG(">> start, CollectionCommandAddMany()", { uid, q, objs });
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "added some")),
      switchMap(async collection => {
        const db = q.app.firestore();
        const objs500Groups = chunkify(objs, 500);
        await Promise.all(
          objs500Groups.map(async objs500 => {
            const batch = db.batch();
            objs500.map(obj => {
              q.setCreatedProps(obj, uid);
              q.setUpdatedProps(obj, uid);
              const parsed = q.parseBeforeUpload(obj);
              const newId = db.doc("randid").id;
              const docRef = collection.doc(newId);
              batch.set(docRef, parsed, { merge: true });
            });
            return batch.commit();
          })
        );
      }),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandDeleteId(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Promise<void> {
  q.logger.logDEBUG(">> start, CollectionCommandDeleteId()", { q, id });
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "removed", [id])),
      switchMap(collection => collection.doc(id).delete()),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandDeleteIds(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Promise<any> {
  q.logger.logDEBUG(">> start, CollectionCommandDeleteIds()", { q, ids });
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "removed some", ids)),
      switchMap(collection => {
        const db = q.app.firestore();

        const batch = db.batch();

        ids.map(id => {
          const docRef = collection.doc(id);
          batch.delete(docRef);
        });
        return batch.commit();
      }),
      tap(data => q.logger.logINFO(">> end, data", { data }))
    )
    .pipe(take(1))
    .toPromise();
}
