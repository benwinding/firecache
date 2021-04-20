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

- Gets collection of documents
- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocs<User>()

// With a "collection query"
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocs<User>(c => c.where('age', '==', 30))

// Promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .GetAllDocs<User>()
```

## `GetAllDocsSnap()`

- Gets collection of documents
- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`
- Watches for changes in firestore

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocsSnap<User>()

// With a "collection query"
fire.db.FromCollection(CollectionPaths.Users)
  .GetAllDocsSnap<User>(c => c.orderBy('age', 'asc'))
```

## `GetManyIds()`

- Gets collection of documents, from given ids
- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`

``` js
const ids = ['12345', '12346'];
fire.db.FromCollection(CollectionPaths.Users)
  .GetManyIds<User>(ids)

// Promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .GetManyIds<User>(ids)
```

## `GetManyIdsSnap()`

- Gets collection of documents, from given ids
- Returns an observable array
- Watches for changes in path state, e.g: `${userId}`
- Watches for changes in firestore

``` js
const ids = ['12345', '12346'];
fire.db.FromCollection(CollectionPaths.Users)
  .GetManyIds<User>(ids)

// Promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .GetManyIds<User>(ids)
```

## `GetId()`

- Gets single document
- Returns an observable object
- Watches for changes in path state, e.g: `${userId}`

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetId<User>()
// promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .GetId<User>()
```

## `GetIdSnap()`

- Gets single document
- Returns an observable object
- Watches for changes in path state, e.g: `${userId}`
- Watches for changes in firestore

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .GetIdSnap<User>()
```

## `Add()`

- Adds document to collection
- Returns promise with firestore `DocumentReference`

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .Add<User>(user) 
```

## `AddMany()`

- Adds array of documents to collection
- Uses firestore.batch() internally for performance 
- Returns promise

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .AddMany<User>(users) 
```

## `Update()`

- Updates document in collection
- Returns promise

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .Update<User>(id, user, true); // true means to merge into existing documents  
```

## `UpdateMany()`

- Updates array of documents in collection (objects must have id field in them)
- Uses firestore.batch() internally for performance 
- Returns promise

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .UpdateMany<User>(users, true); // true means to merge into existing documents  
```

## `DeleteId()`

- Deletes a document by id in a collection

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .DeleteId<User>(idToDelete);
```

## `DeleteIds()`

- Deletes an array of documents by ids in a collection

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .DeleteIds<User>(idsToDelete);
```

## `ref()`

This is an escape hatch to get out of the FirebaseClient api and back to the firebase SDK objects.

- Returns observable of the firestore `DocumentReference`.
- Watches for changes in path state, e.g: `${userId}`

``` js
fire.db.FromCollection(CollectionPaths.Users)
  .ref()

// Promise version
fire.db.FromCollection(CollectionPaths.Users)
  .promise
  .ref()
```

# FromDocument
