# SAFE Web App Tutorial

In this tutorial we will create a SAFE Web application which uses the Web API to interact with the SAFE Authenticator, and to connect with the SAFE Network.

In this tutorial we use the [SAFE Web App quick start](https://github.com/maidsafe/safe_examples/tree/master/safe_web_app_quick_start) boilerplate, which is single page webapp compiled via [Node.js](https://nodejs.org).

The boilerplate implements a simple single page application using [Vue.js](https://vuejs.org) for rendering the UI components and the data. The application implements a trip planner, showing the list of trips planned by the user, allowing him/her to add or remove trips from the list. In this tutorial we will be adding the implementation to store (and retrieve) the list of planned trips in the SAFE Network.

<a name="Pre-requisites"></a>
## Pre-requisites

First you need to make sure you have the following tools installed to be able to work with this tutorial:
- [Git](https://git-scm.com/) to be able to clone the boilerplate code
- [Node.js](https://nodejs.org/en/download) v8.11.1 (which comes with [npm](http://npmjs.com/) v5.6.0) to be able to run the application since it's a Node.js application.
- If you are using Ubuntu as OS, `libpng-dev` might be needed. Please install it with [Synaptic Package Mgr.](https://help.ubuntu.com/community/SynapticHowto), or with `apt` from a shell console: `$ sudo apt-get install libpng-dev`.

## Install a SAFE Browser

Since this is a SAFE webapp, we first need to have an instance of the SAFE Browser installed to be able to load our application.

You can find the links to download the SAFE Browser package from [MaidSafe's website](https://maidsafe.net), or directly from the [SAFE Browser GitHub releases repository](https://github.com/maidsafe/safe_browser/releases). It's recommended to always use the latest available version.

Note that there are packages for each of the supported platforms, i.e. Linux, Windows and OSX. Also note there are two type of packages for each of the supported platforms:
- `safe-browser-<version>-<platform>.zip`: SAFE Browser package built to use the live SAFE Network
- `safe-browser-mock-<version>-<platform>.zip`: SAFE Browser package built to use the mock routing. This will create a local temporary file and you won't need to connect to the live network.

In this tutorial we will be using the SAFE Browser package that is built to work with the mock network. So please go ahead and download the one corresponding for your platform, and unzip the package in your PC. Before we launch it let's go ahead and set the `NODE_ENV` environment variable set to `dev` to have our browser to effectively use the native libraries for mock routing:
```bash
$ export NODE_ENV=dev
```

If you are using Windows you can set it with the following command instead:
```bash
$ set NODE_ENV=dev
```

You can now launch the browser (make sure you launch it from the same console where you just set the NODE_ENV variable), please create an account from the Authenticator. You can enter any string when you are requested for the “Invitation token”.

After you finished creating your account, please keep the browser open and logged in your account before proceeding with next steps.

## Create basic skeleton

We first clone the boilerplate repo using `git` onto a local folder named `safe_examples`:
```bash
$ git clone https://github.com/maidsafe/safe_examples safe_examples
```

And then install its dependencies:
```bash
$ cd safe_examples/safe_web_app_quick_start
$ npm install
```

At this point we have a Node.js application ready to be launched, let's run it:
```bash
$ npm start
```
This will create a web server to serve the webapp, and you can load it with your SAFE Browser by loading `localhost://p:5000` on a new tab (if you are using our Peruse browser then load `http://localhost:5000` instead).

You should see a “Hello SAFE Network!” message in our app’s page and an empty list of trips. We are now ready to start creating the code to be able to store the planned trips into the SAFE Network.

## Authorise application and connect to the SAFE Network
A SAFE application needs to get an authorisation from the user before being able to connect to the network, this is achieved by sending an authorisation request to the Authenticator.

We first need to generate a `SAFEApp` instance by calling the `safeApp.initialise` function of the DOM API, providing information about the application (this information is displayed to the user when requesting the authorisation):
```js
let appInfo = {
  // User-facing name of our app. It will be shown
  // in the Authenticator user's interface.
  name: 'Hello SAFE Network',
  // This is a unique ID of our app
  id: 'net.maidsafe.tutorials.web-app',
  version: '0.1.0',
  vendor: 'MaidSafe.net Ltd.'
};
let safeAppHandle = await window.safeApp.initialise(appInfo);
```

Here we provide some basic information about the application, which will eventually help the user and the Authenticator to identify the application that is requesting permissions.

We are using `await` to call the `safeApp.initialise` function since it's asynchronous (as are most of the functions exposed by the Web API). You can also use JavaScript `Promises` if you prefer.

Once the `SAFEApp` instance is initialised and we received a handle for it, we can use it to generate the authorisation request and send it to the Authenticator:
```js
const authUri = await window.safeApp.authorise(safeAppHandle, {});
```
Note that we are passing an empty object as the second argument to the `safeApp.authorise` function, this object can contain a list of permissions to access different containers, but for the sake of simplicity we are not doing it here with this application.

We can now use the authorisation URI we received from the Authenticator to connect to the SAFE Network. In order to do this we simply call the `safeApp.connectAuthorised` API function:
```js
await window.safeApp.connectAuthorised(safeAppHandle, authUri);
```

This function will decode the authorisation URI and create a connection with the SAFE Network using the credentials obtained from it.

Let’s make all the code for these steps to be the body of the function called `authoriseAndConnect` in the `src/safenetwork.js` file, it should now look like this:
```js=1
let safeAppHandle;

async function authoriseAndConnect() {
  let appInfo = {
    name: 'Hello SAFE Network',
    id: 'net.maidsafe.tutorials.web-app',
    version: '0.1.0',
    vendor: 'MaidSafe.net Ltd.'
  };
  safeAppHandle = await window.safeApp.initialise(appInfo);
  console.log('Authorising SAFE application...');
  const authUri = await window.safeApp.authorise(safeAppHandle, {});
  await window.safeApp.connectAuthorised(safeAppHandle, authUri);
  console.log("Application connected to the network");
};
```

As you can see, we declare the `safeAppHandle` variable outside the function since we will be using this same `SAFEApp` instance to access the API from other functions.

The `authoriseAndConnect` function is invoked when the application’s page is loaded, this is part of the code we inherited with the boilerplate. You can look at the code in `src/App.vue` if you are interested in it.

We can now refresh our application page to verify that now it's able to send the authorisation request to the Authenticator, and connect to the network once it received the authorisation. Make sure you log in using the Authenticator ([see the pre-requisites section](#Pre-requisites)) before refreshing the application page:

You should have had the Authenticator to show a pop-up with the authorisation request, with the information of our web application, which you can can authorise so the application can connect to the network.

## Create a public MutableData
One of the native data types of the SAFE Network is the `MutableData`. A MutableData is a key-value store which can be created at either a specific address on the network, or just at a random address, and it can be publicly available (a public MutableData) or otherwise have all its content encrypted (private MutableData). It also has a type associated to it (type tag) which is a number that can be chosen at the moment of creating the MutableData.

We are not going to go into the other aspects of the MutableData here, we will just create MutableData in the network to store the data of our application. Please refer to the [Discovery page](/discover) to learn more about the MutableData type as well as the other types of data available in the SAFE Network.

In this tutorial we are going to create a public MutableData at a random address. Each piece of data stored on the network has its own unique 256 bits address in the network (you can read more about XOR addresses of the SAFE Network in the [MaidSafe's blog](https://blog.maidsafe.net/2016/05/27/structuring-networks-with-xor)), we will request the API to generate a random address for our new public MutableData:
```js
const typeTag = 15000;
const mdHandle = await window.safeMutableData.newRandomPublic(safeAppHandle, typeTag);
```

The type tag we are choosing is just a random number here, although you must know there is a range of reserved numbers for the type tags, any MutableData stored with any of this reserved type tags will have a special treatment by the network.

At this point we have a MutableData object which was not committed to the network yet, so we can now request the API to send the corresponding request to the SAFE Network to store it:
```js
const initialData = {
  "random_key_1": JSON.stringify({
      text: 'Scotland to try Scotch whisky',
      made: false
    }),
  "random_key_2": JSON.stringify({
      text: 'Patagonia before I\'m too old',
      made: false
    })
};
await window.safeMutableData.quickSetup(mdHandle, initialData);
```

We use the `safeMutableData.quickSetup` function which allows us to (optionally) provide an initial set of key-value entries that the MutableData shall be populated with when storing it on the network.

As you can see the key-value pairs we are storing as the initial set of data contain a "random" key, and a serialised object as the value. The application will use the key to identify each of the trips (e.g. when it needs to remove any of them), and it will also generate a random key for new trips added to the list. The value is expected to contain the information about the trip itself, we are storing the description of the trip (called `text`) and a boolean value (called `made`) which indicates if the trip has been made by the user. Since the entry's value in a MutableData needs to be a string of bytes, we serialise with `JSON.stringify` before storing it.

Let's put all the code for these steps inside the `createMutableData` function in the `src/safenetwork.js` file:
```js
let mdHandle;

async function createMutableData() {
  const typeTag = 15000;
  mdHandle = await window.safeMutableData.newRandomPublic(safeAppHandle, typeTag);

  const initialData = {
    "random_key_1": JSON.stringify({
        text: 'Scotland to try Scotch whisky',
        made: false
      }),
    "random_key_2": JSON.stringify({
        text: 'Patagonia before I\'m too old',
        made: false
      })
  };
  await window.safeMutableData.quickSetup(mdHandle, initialData);
};
```
Here we are declaring the `mdHandle` variable outside the function so we can then access the same MutableData from other functions.

If we refresh the application page again now, it should successfully connect to the network after an authorisation was given, and it will create a random MutableData with some initial data, although we won't see it on the UI yet, so let's now add the code to retrieve the values from the MutableData to render it in the UI.

## Read the MutableData entries
We now have our MutableData stored on the network with a initial set of key-value entries, thus we can now retrieve them using the `mdHandle` variable we kept. Let’s create the body for `getItems` function in our `src/safenetwork.js` file:
```js
async function getItems() {
  const entriesHandle = await window.safeMutableData.getEntries(mdHandle);
  let items = [];
  await window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => {
    if (value.buf.length == 0) return;
    const parsedValue = JSON.parse(value.buf);
    items.push({ key: key, value: parsedValue, version: value.version });
  });
  return items;
};
```

Note we are expecting the value of the entry to be a serialised JSON object, since that’s how we stored them when we called the `quickSetup` function before, so we need to de-serialise it with `JSON.parse` before returning it.

We can now refresh our application page again and we should be able to see the list of trips we initially stored on the SAFE Network.

## Add more entries to our MutableData
It's time now to allow the user to add new items to the list by entering them in the form on the UI.

The MutableData's key-value entries can be mutated by creating a mutation transaction object where we set all the mutation actions we want to apply to the entries:
```js
const mutationHandle = await window.safeMutableData.newMutation(safeAppHandle);
```

We can set three different type of mutation actions on the mutation transaction: insert, update, or remove. Let's go ahead and add an "insert" action to add the new entry:
```js
await window.safeMutableDataMutation.insert(mutationHandle, key, JSON.stringify(value));
```

Note we are expecting the value argument to be a JSON object, so we serialise it with `JSON.stringify` before adding it to the mutation transaction.

Now we just need to apply this mutation transaction to our MutableData by calling the `safeMutableData.applyEntriesMutation
` function, let’s put all this code into the body of the `insertItem` function in the `src/safenetwork.js` file:
```js
async function insertItem(key, value) {
  const mutationHandle = await window.safeMutableData.newMutation(safeAppHandle);
  await window.safeMutableDataMutation.insert(mutationHandle, key, JSON.stringify(value));
  await window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle);
}
```

Let’s now refresh our application page and try to add a new trip to the list, the application will insert it in the MutableData and the list will be automatically refreshed on the UI afterwards.

Note that since we are creating a MutableData at a random location each time the application loads, any new items/trips the user inserts won't be displayed after refreshing the application page. This can obviously be changed by storing the MutableData at a custom location that can be found each time the application loads. We are leaving this out of the scope of this tutorial for the sake of simplicity.

## Update and remove entries
As we saw above, to update or remove entries we just need to create a mutation transaction, with "update" and/or "remove" actions, and apply the mutations to the MutableData. Let's fill up the body of the `updateItem` and `removeItems` functions in the `src/safenetwork.js` file to respectively perform these mutations on our MutableData:
```js
async function updateItem(key, value, version) {
  const mutationHandle = await window.safeMutableData.newMutation(safeAppHandle);
  await window.safeMutableDataMutation.update(mutationHandle, key, JSON.stringify(value), version + 1);
  await window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle);
};

async function removeItems(items) {
  const mutationHandle = await window.safeMutableData.newMutation(safeAppHandle);
  items.forEach(async (item) => {
    await window.safeMutableDataMutation.remove(mutationHandle, item.key, item.version + 1);
  });
  await window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle);
};
```

Note that there is a versioning involved in such mutations, as opposed to "insert" mutations which don't have any. Each entry in a MutableData has a numeric version associated to it. When you insert a new entry it's inserted with version `0`, and every time a mutation is performed you need to specify the subsequent version the entry is being bumped to. This is used by the network to ensure that only one mutation is applied when simultaneous mutations requests were received for the same version of an entry, making sure the state change of such an entry is effectively what the originator of a request was intending to do.

The `removeItems` is invoked when the user selects some of the trips from the list and then clicks on "remove trips already made". As you can see we receive a list of items to be removed and we are able to add a "remove" action for each of them into the mutation transactin before we actually send the mutation request to the network when invoking `applyEntriesMutation`. This is to reduce the network traffic needed to perform several mutations on a single MutableData.

Also bear in mind that when you remove and entry it is never deleted from the MutableData, but its value is just cleared, so you cannot insert a new entry with same key but update it. This is the reason that in our implementation of the `getItems` function we filter the deleted entries with the following condition when iterating thru them:
```js
if (value.buf.length == 0) return;
```

Note that the boilerplate code doesn't have the implementation in the UI to be able to update trips, but we jut added the implementation for updating the items on the MutableData entries, so go ahead and try to add the UI components to allow the user to do this ;)
