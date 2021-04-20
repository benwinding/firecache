## Get Started

First we need to initialize the firecache client. This happens once when the app loads.

```js
import { FirebaseClient } from 'firecache';

const FIREBASECONFIG = {...} // Your firebase config
const options = {}           // Any firecache global options
const fire = new FirebaseClient(FIREBASECONFIG, options);
```

OR you can initialize the `FirebaseClient` using a firebase instance, like so:

``` js
const firebaseApp = firebase.app() // Firebase initialized somewhere else...
const fire = new FirebaseClient(firebaseApp, options);
```

Then all commands come off of that `fire` client.
