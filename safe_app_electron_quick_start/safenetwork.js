const app = require('electron').remote.app;

const customExecPath = [process.execPath, "--no-sandbox", app.getAppPath()];

async function sendAuthRequest() {
}

async function uponAuthResponse(resAuthUri) {
}

async function getItems() {
  return [];
};

async function insertItem(key, value) {
};

async function updateItem(key, value, version) {
};

async function deleteItems(items) {
};

module.exports = {
  sendAuthRequest,
  uponAuthResponse,
  getItems,
  insertItem,
  updateItem,
  deleteItems
};
