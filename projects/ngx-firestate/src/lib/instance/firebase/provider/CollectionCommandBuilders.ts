import { QueryState } from "./QueryState";
import { resolvePathVariables } from "./PathResolver";
import { map, switchMap, take } from "rxjs/operators";
import { chunkify } from "./chunkify";

export function CollectionCommandUpdate<T>(
  q: QueryState,
  id: string,
  obj: T,
  isMerged?: boolean
): Promise<any> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
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
  q: QueryState,
  objs: {
    id: string;
  }[],
  isMerged?: boolean
): Promise<any> {
  const uid = q.uid;
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
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
  q: QueryState,
  obj: T
): Promise<firebase.firestore.DocumentReference> {
  const uid = q.uid;
  q.setCreatedProps(obj, uid);
  q.setUpdatedProps(obj, uid);
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
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
  q: QueryState,
  objs: {}[]
): Promise<void> {
  const uid = q.uid;
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
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
  q: QueryState,
  id: string
): Promise<void> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
      switchMap(collection => collection.doc(id).delete())
    )
    .pipe(take(1))
    .toPromise();
}

export function CollectionCommandDeleteIds(
  q: QueryState,
  ids: string[]
): Promise<any> {
  return resolvePathVariables(
    q.appState$,
    q.pathTemplate,
    q.overridenState
  )
    .pipe(
      map(collectionPath => {
        return q.app.firestore().collection(collectionPath);
      }),
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
