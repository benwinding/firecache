# Client Api

The `FirebaseClient` has the following API.

## Login/Logout

When logging in/out, use the methods on the client:

``` js
fire.login(email, pass);
fire.logout();
```

## Type-Checked State

You might also want to have specific state in your application. There's 3 types of state in `firecache`:

- Collection Paths (typescript Enum)
- Document Paths (typescript Enum)
- Root State Object (typescript Type/Interface)

Here's an example of how to initialize `firecache` with type-checked state.

``` js
enum CollectionPaths = {
  Users = 'users'
}

enum DocumentPaths = {
  CurrentUser = 'users/${userId}'
}

interface RootStateObject {
  userId: string;
}

const fire = new FirebaseClient<CollectionPaths, DocumnentPaths, RootStateObject>(FIREBASECONFIG, options);
```

Now the client can automatically resolve `userId` because it's part of the `RootStateObject`.

## Patching State

Changing state in the `FirebaseClient` is easy.

``` js
fire.PatchRootState({userId: '12345'}) // This is typechecked too
```

## Observable State Hooks

There's a few observable hooks that can be helpful.

``` typescript
// If there's a logged in user or not
fire.$IsLoggedIn(): Observable<boolean>;

// After the firecache has been initialized
fire.$IsFinishedInitialization(): Observable<boolean>;

// The current user (firebase auth user)
fire.$CurrentUser(): Observable<firebase.User>;

// The current state of firecache
fire.$GetRootState(): Observable<RootStateObject>;
```
