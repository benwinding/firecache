# firecache

<!-- [START badges] -->

![Build and Publish](https://github.com/benwinding/firecache/workflows/Build%20and%20Publish/badge.svg)
[![Code Coverage](coverage/badge-lines.svg)](./coverage/coverage-summary.json)
[![NPM Version](https://img.shields.io/npm/v/firecache.svg)](https://www.npmjs.com/package/firecache)
[![License](https://img.shields.io/npm/l/firecache.svg)](https://github.com/benwinding/firecache/blob/master/LICENSE)
[![Downloads/week](https://img.shields.io/npm/dm/firecache.svg)](https://www.npmjs.com/package/firecache)
[![Github Issues](https://img.shields.io/github/issues/benwinding/firecache.svg)](https://github.com/benwinding/firecache)

<!-- [END badges] -->

A client-side state-management system for firebase.

```
Enum + State = Observable
```

# Description

This library allows you to specify paths as typescript enums to different documents/collections in firestore.

You can use path variables to create dynamic paths, which are based on the state of the library.

Below Shows how paths are resolved from _Enums_ to _Observables_.

![diagram](https://i.imgur.com/S1AA7U7.png)

# Links

- [Documentation](https://benwinding.github.io/firecache/)
