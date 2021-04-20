# FAQ

## Why did you make this?

Most document database have a front-end client, *mongodb, firestore*...etc. The problem with these clients is that they rely on strings to specify parts of the database, e.g. `/users` or `/settings/my/complicated/path`. Strings just don't scale that well, especially when you have many different collections and documents that all are related to different parts of the application.

One solution (arguably smarter) is to create an API endpoint that hides this complexity and centralises the strings. However we found that redeploying both the application and the API endpoint was tedious and frustrating. So I went full client-side and created this library.

It uses enums to resolves paths before fetching from firestore. This gives the benefit of:

- Strict type-checking of Path Variables
- Ability to see all references in application of a specific firestore path
- Centralise all paths in enum abstractions
- Allow for doubly dynamic paths! (path state and firestore state changes)