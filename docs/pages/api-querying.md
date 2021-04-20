# Query Api

Firecache has queries for both documents and collections. To begin a query, refer to the `.db` property on the `FirebaseClient`

## Specify Path

Collections and Documents use a similar API.

``` js
// Must use CollectionPath enum
fire.db.FromCollection(CollectionPaths.Users)   // Type checked!
// Must use DocumentPath enum
fire.db.FromDocument(DocumentPaths.CurrentUser) // Type checked!
```

## Apply Types

You can also apply types to the queries.

``` js
interface User {
  name: string;
}

fire.db.FromCollection<User>(CollectionPaths.Users)   // User[] (array)
fire.db.FromDocument<User>(DocumentPaths.CurrentUser) // User   (object)
```

# FromCollection

## `GetAllDocs()`

- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocs<User>()

// Promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .GetAllDocs<User>()
```

## `GetAllDocsSnap()`

- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`
- Watches for changes in firestore

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocsSnap()
```

