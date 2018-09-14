const safeNodeApp = require('@maidsafe/safe-node-app');
const app = require('electron').remote.app;

const customExecPath = [process.execPath, app.getAppPath()];
let safeApp;

async function sendAuthRequest() {
  console.log('Authorising SAFE application...');
  const appInfo = {
    // User-facing name of our app. It will be shown
    // in the Authenticator user's interface.
    name: 'Hello SAFE Network',
    // This is a unique ID of our app
    id: 'net.maidsafe.tutorials.desktop-app',
    version: '0.1.0',
    vendor: 'MaidSafe.net Ltd.',
    bundle: 'com.github.electron',
    customExecPath
  };

  const opts = {
    forceUseMock: true
  };

  safeApp = await safeNodeApp.initialiseApp(appInfo, null, opts);
  const authUri = await safeApp.auth.genAuthUri({});
  await safeApp.auth.openUri(authUri);
}

let md;

async function uponAuthResponse(resAuthUri) {
  console.log("Authorisation response received");

  await safeApp.auth.loginFromUri(resAuthUri);
  console.log("Application connected to the network");

  const typeTag = 15000;
  md = await safeApp.mutableData.newRandomPublic(typeTag);
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
  await md.quickSetup(initialData);
}

async function getItems() {
  const entries = await md.getEntries();
  let entriesList = await entries.listEntries();
  let items = [];
  entriesList.forEach((entry) => {
    const value = entry.value;
    if (value.buf.length == 0) return;
    const parsedValue = JSON.parse(value.buf);
    items.push({ key: entry.key, value: parsedValue, version: value.version });
  });
  return items;
};

async function insertItem(key, value) {
  const mutations = await safeApp.mutableData.newMutation();
  await mutations.insert(key, JSON.stringify(value));
  await md.applyEntriesMutation(mutations);
};

async function updateItem(key, value, version) {
  const mutations = await safeApp.mutableData.newMutation();
  await mutations.update(key, JSON.stringify(value), version + 1);
  await md.applyEntriesMutation(mutations);
};

async function deleteItems(items) {
  const mutations = await safeApp.mutableData.newMutation();
  items.forEach(async (item) => {
    await mutations.delete(item.key, item.version + 1);
  });
  await md.applyEntriesMutation(mutations);
};

module.exports = {
  sendAuthRequest,
  uponAuthResponse,
  getItems,
  insertItem,
  updateItem,
  deleteItems
};
