let safeApp;

async function authoriseAndConnect() {
  let appInfo = {
    name: 'Hello SAFE Network',
    id: 'net.maidsafe.tutorials.web-app',
    version: '1.0.0',
    vendor: 'MaidSafe.net Ltd.'
  };
  safeApp = await window.safe.initialiseApp(appInfo);
  console.log('Authorising SAFE application...');
  const authReqUri = await safeApp.auth.genAuthUri();
  const authUri = await window.safe.authorise(authReqUri);
  console.log('SAFE application authorised by user');
  await safeApp.auth.loginFromUri(authUri);
  console.log("Application connected to the network");
};

let md;
async function createMutableData() {
  console.log("Creating MutableData with initial dataset...");
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
  authoriseAndConnect,
  createMutableData,
  getItems,
  insertItem,
  updateItem,
  deleteItems
};
