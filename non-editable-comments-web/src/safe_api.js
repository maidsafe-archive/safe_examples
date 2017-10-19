import CommentModel from './models/CommentModel';
import Constants from './constants';

const {
  ERROR_MSG,
  ERROR_CODE,
  PERMISSIONS,
  PUBLIC_NAMES_CONTAINER,
} = Constants;

// Unique TYPE_TAG for refering the MutableData. Number can be anything above the reserved rage (0-15000)
const TYPE_TAG = 15001;
// Constant value for the `.` Delimitter
const DOT = '.';

let hostName = window.location.hostname;
if (hostName.split(DOT).length === 1) {
  hostName = `www.${hostName}`;
}

// Authorisation model
const APP = {
  info: {
    id: `${hostName}-comment-plugin`,
    name: `${hostName}-comment-plugin`,
    vendor: 'MaidSafe.net Ltd',
  },
  opts: {},
  containers: {
    _publicNames: [PERMISSIONS.READ],
  },
};

/**
 * SafeApi handles the SAFE Network related requests for managing the comments for a topic.
 * Exposes function for the store/UI to save/retrieve comment list against a topic.
 * Also exposes other utility functions for getting Public ID list and also to validate the user is admin
 */
export default class SafeApi {

  /**
   * @constructor
   * @param {any} topic
   * @param {any} nwStateCb
   */
  constructor(topic, nwStateCb) {
    this.topic = topic;
    this.comments = [];
    this.app = undefined;
    this.mData = undefined;
    this.MD_NAME = `${hostName}-${this.topic}`;
    this.nwStateCb = (newState) => {
      nwStateCb(newState);
    };
  }

  /**
  * Fetches the public Ids associated to the user.
  */
  getPublicNames() {
    return new Promise(async (resolve, reject) => {
      const decryptedPublicNames = [];
      try {
        if (!this.app) {
          return reject(new Error(ERROR_MSG.APP_NOT_INITIALISED_ERROR));
        }
        // Get public names container handle
        const publicNamesContainerHandle = await window.safeApp.getContainer(this.app, PUBLIC_NAMES_CONTAINER);
        // Get handle for the keys for the public names container
        const keysHandle = await window.safeMutableData.getKeys(publicNamesContainerHandle);
        const keysLen = await window.safeMutableDataKeys.len(keysHandle);
        // If there is no Public ID return empty list
        if (keysLen === 0) {
          return resolve([]);
        }
        const publicNames = [];
        // get all keys from the conatiner.
        await window.safeMutableDataKeys.forEach(keysHandle, (key) => {
          publicNames.push(key);
        });
        window.safeMutableDataKeys.free(keysHandle);
        // Decrypt the keys to get the actual Public ID
        for (const publicName of publicNames) {
          try {
            const decryptedValue = await window.safeMutableData.decrypt(publicNamesContainerHandle, publicName);
            decryptedPublicNames.push(String.fromCharCode.apply(null, new Uint8Array(decryptedValue)));
          } catch (e) {
            console.warn(e);
          }
        }
        window.safeMutableData.free(publicNamesContainerHandle);
      } catch (err) {
        return reject(err);
      }
      // resolve with the decrypted public names
      return resolve(decryptedPublicNames);
    });
  }

  /**
  * Set up the MutableData with Insert permission for Everyone.
  * Create a Public Mutable Data with a deterministic name. (Hash(location.hostname + topic))
  * Apply the permission set for the MutableData
  */
  setup() {
    return new Promise(async (resolve, reject) => {
      try {
        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        await window.safeApp.connectAuthorised(this.app, uri);
        const isOwner = await this.isOwner();
        if (!isOwner) {
          throw new Error(ERROR_MSG.PUBLIC_ID_DOES_NOT_MATCH);
        }
        const hashedName = await window.safeCrypto.sha3Hash(this.app, this.MD_NAME);
        this.mData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);
        await window.safeMutableData.quickSetup(
          this.mData,
          {},
          `${this.MD_NAME} - Comment Plugin`,
          `Comments for the hosting ${this.MD_NAME} is saved in this MutableData`,
        );
        // create a new permission set
        const permSet = await window.safeMutableData.newPermissionSet(this.app);
        // allowing the user to perform the Insert operation
        await window.safeMutableDataPermissionsSet.setAllow(permSet, PERMISSIONS.INSERT);
        // setting the handle as null, anyone can perform the Insert operation
        await window.safeMutableData.setUserPermissions(this.mData, null, permSet, 1);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Create the MutableData for the MD_NAME
  */
  createMutableDataHandle() {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialising the app using the App info which requests for _publicNames container
        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        // Authorise the app and connect to the network using uri
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        await window.safeApp.connectAuthorised(this.app, uri);
        // Compute the MutableData name
        const hashedName = await window.safeCrypto.sha3Hash(this.app, this.MD_NAME);
        // Create the handle for the MutableData
        this.mData = await window.safeMutableData.newPublic(this.app, hashedName, TYPE_TAG);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Invoked to check whether the MuatbleData is set up.
  * Creates a unregistered client to try fetching the MutableData and get its entries.
  */
  isMDInitialised() {
    return new Promise(async (resolve, reject) => {
      try {
        const appHandle = await window.safeApp.initialise(APP.info, this.nwStateCb);
        // Connect as unregistered client
        await window.safeApp.connect(appHandle);
        const hashedName = await window.safeCrypto.sha3Hash(appHandle, this.MD_NAME);
        const mdHandle = await window.safeMutableData.newPublic(appHandle, hashedName, TYPE_TAG);
        // newPublic function only creates a handle in the local memmory.
        // The network operation is performed only when we call getEntries fo validating that the MutableData exists
        const entriesHandle = await window.safeMutableData.getEntries(mdHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        window.safeMutableData.free(mdHandle);
        await window.safeApp.free(appHandle);
        resolve(true);
      } catch (err) {
        if (err.code === ERROR_CODE.REQUESTED_DATA_NOT_FOUND) {
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  }

  /**
  * Invoked to authorise the user.
  * Sets up the comments MutableData if it is not already initialised.
  */
  authorise() {
    return new Promise(async (resolve, reject) => {
      try {
        const isInitialised = await this.isMDInitialised();
        if (!isInitialised) {
          // Create the MutableData if the current user is the owner 
          await this.setup();
        } else {
          await this.createMutableDataHandle();
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * Check whether the user is Owner/Admin.
  * Fetch the own container and validate that the key IsAdmin is preset and value is set to true
  */
  isOwner() {
    return new Promise(async (resolve) => {
      try {
        const publicNames = await this.getPublicNames();
        const currPublicID = hostName.split(DOT).slice(1).join(DOT);
        resolve(publicNames.indexOf(currPublicID) > -1);
      } catch (err) {
        resolve(false);
      }
    });
  }

  /**
  * Post comment for the topic
  * @param {CommentModel} commentModel
  */
  postComment(commentModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const updatedList = this.comments.slice(0);
        const entriesHandle = await window.safeMutableData.getEntries(this.mData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        updatedList.unshift(commentModel);
        await window.safeMutableDataMutation.insert(mutationHandle, commentModel.id, JSON.stringify(commentModel));
        // Without calling applyEntriesMutation the changes wont we saved in the network
        await window.safeMutableData.applyEntriesMutation(this.mData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.comments = updatedList;
        resolve(this.comments);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
  * List all comments for the topic
  */
  listComments() {
    return new Promise(async (resolve) => {
      try {
        const entriesHandle = await window.safeMutableData.getEntries(this.mData);
        const len = await window.safeMutableDataEntries.len(entriesHandle);
        this.comments = [];
        if (len === 0) {
          return resolve(this.comments);
        }
        await window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => {
          if (value.buf.length === 0) {
            return;
          }
          const jsonObj = JSON.parse(value.buf.toString());
          this.comments.push(new CommentModel(jsonObj.name, jsonObj.message, jsonObj.date, jsonObj.id));
        });
        resolve(this.comments);
      } catch (err) {
        console.warn('list comments: ', err);
        resolve(this.comments);
      }
    });
  }

  /**
  * Delete comment for the topic
  * @param {any} commentModel
  */
  deleteComment(commentModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const entriesHandle = await window.safeMutableData.getEntries(this.mData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        const data = await window.safeMutableData.get(this.mData, commentModel.id);
        await window.safeMutableDataMutation.remove(mutationHandle, commentModel.id, data.version + 1);
        await window.safeMutableData.applyEntriesMutation(this.mData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.comments.splice(this.comments.indexOf(commentModel), 1);
        resolve(this.comments);
      } catch (err) {
        reject(err);
      }
    });
  }

  reconnect() {
    return window.safeApp.reconnect(this.app);
  }
}
