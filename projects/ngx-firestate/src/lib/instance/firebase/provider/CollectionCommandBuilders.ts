import { QueryState } from "./QueryState";
import { switchMap, take, tap } from "rxjs/operators";
import { chunkify } from "./chunkify";
import { FirebaseClientStateObject } from "../../FirebaseClientStateObject";
import { RunAfterCollection } from "./RunAfters";

export function CollectionCommandUpdate<T>(
  q: QueryState<FirebaseClientStateObject>,
  id: string,
  obj: T,
  isMerged?: boolean
): Promise<any> {
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "edited", [id])),
      switchMap(collection => {
        obj["updated_by"] = q.uid;
        obj["updated_at"] = new Date();
        return collection.doc(id).set(obj, { merge: isMerged });
      })
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
              q.setUpdatedProps(obj, uid);
              const docRef = collection.doc(obj.id);
              batch.set(docRef, obj, { merge: isMerged });
            });
            return batch.commit();
          })
        );
      })
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandAdd<T>(
  q: QueryState<FirebaseClientStateObject>,
  obj: T
): Promise<firebase.firestore.DocumentReference> {
  const uid = q.uid;
  q.setCreatedProps(obj, uid);
  q.setUpdatedProps(obj, uid);
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "added")),
      switchMap(async collection => {
        try {
          const result = await collection.add(obj);
          return result;
        } catch (error) {
          q.logger.logERROR("error in Update()", error, {
            obj,
            collection
          });
          throw new Error(error);
        }
      })
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandAddMany(
  q: QueryState<FirebaseClientStateObject>,
  objs: {}[]
): Promise<void> {
  const uid = q.uid;
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
              const newId = db.doc("").id;
              const docRef = collection.doc(newId);
              batch.set(docRef, obj, { merge: true });
            });
            return batch.commit();
          })
        );
      })
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandDeleteId(
  q: QueryState<FirebaseClientStateObject>,
  id: string
): Promise<void> {
  return q
    .refCollection()
    .pipe(
      tap(RunAfterCollection(q, "removed", [id])),
      switchMap(collection => collection.doc(id).delete())
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandDeleteIds(
  q: QueryState<FirebaseClientStateObject>,
  ids: string[]
): Promise<any> {
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
      })
    )
    .pipe(take(1))
    .toPromise();
}