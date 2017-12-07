import CommentModel from './models/CommentModel';
import Constants from './constants';

const {
  ERROR_MSG,
  ERROR_CODE,
  PERMISSIONS,
  PUBLIC_NAMES_CONTAINER,
  MD_META_KEY,
  MAX_COMMENT_VERSION_CHAR,
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
    this.signKey = undefined;
    this.nwStateCb = (newState) => {
      nwStateCb(newState);
    };
  }

  getCommentId(cmtID, cmtVersion) {
    let version = cmtVersion.toString();
    while (version.length < MAX_COMMENT_VERSION_CHAR) {
      version = `0${version}`;
    }
    return `${cmtID}-${version}`;
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
        const publicNames = await window.safeMutableData.getKeys(publicNamesContainerHandle);
        // Decrypt the keys to get the actual Public ID
        for (const publicName of publicNames) {
          try {
            const decryptedKey = await window.safeMutableData.decrypt(publicNamesContainerHandle, publicName);
            decryptedPublicNames.push(String.fromCharCode.apply(null, new Uint8Array(decryptedKey)));
          } catch (e) {
            console.warn(e);
          }
        }
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
        const permSet = [PERMISSIONS.INSERT];
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
        // newPublic function only creates a handle in the local memory.
        const mdHandle = await window.safeMutableData.newPublic(appHandle, hashedName, TYPE_TAG);
        // The network operation is performed only when we call getEntries for validating that the MutableData exists
        const entriesHandle = await window.safeMutableData.getEntries(mdHandle);
        window.safeMutableDataEntries.free(entriesHandle);
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
          await this.setup();
        } else {
          await this.createMutableDataHandle();
        }
        // set an application signkey
        const pubSignKeyHandle = await window.safeCrypto.getAppPubSignKey(this.app);
        const rawPubKey = await window.safeCryptoPubSignKey.getRaw(pubSignKeyHandle);
        this.signKey = rawPubKey.buffer.toString('hex');
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

  postComment(comment) {
    return new Promise(async (resolve, reject) => {
      try {
        const newComment = {
          name: comment.name,
          message: comment.messages[comment.version - 1],
          id: this.getCommentId(comment.id, comment.version),
          signKey: this.signKey,
        };
        const entriesHandle = await window.safeMutableData.getEntries(this.mData);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        await window.safeMutableDataMutation.insert(mutationHandle, newComment.id, JSON.stringify(newComment));
        await window.safeMutableData.applyEntriesMutation(this.mData, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this.comments = await this.listComments();
        resolve(this.comments);
      } catch (err) {
        reject(err);
      }
    });
  }

  listComments() {
    return new Promise(async (resolve) => {
      try {
        const cmts = [];
        const entriesHandle = await window.safeMutableData.getEntries(this.mData);
        await window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => {
          if (value.buf.length === 0 || key.toString() === MD_META_KEY) {
            return;
          }
          const jsonObj = JSON.parse(value.buf.toString());
          cmts.push(jsonObj);
        });
        const groupedCmts = {};
        for (const cmt of cmts) {
          const id = cmt.id.split('-').slice(0, -1).join('-');
          const isEditable = (this.signKey === cmt.signKey);
          if (!groupedCmts[id]) {
            groupedCmts[id] = new CommentModel(cmt.name, [], 0, isEditable, id);
          }
          groupedCmts[id].addMessage(cmt.message);
        }
        // convert cmtsObj to array
        this.comments = Object.keys(groupedCmts).map((cmtID) => groupedCmts[cmtID]);
        resolve(this.comments);
      } catch (err) {
        console.warn('list comments: ', err);
        resolve(this.comments);
      }
    });
  }

  deleteComment(comment) {
    const deleteEntry = async (id) => {
      const entriesHandle = await window.safeMutableData.getEntries(this.mData);
      const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
      const data = await window.safeMutableData.get(this.mData, id);
      await window.safeMutableDataMutation.remove(mutationHandle, id, data.version + 1);
      await window.safeMutableData.applyEntriesMutation(this.mData, mutationHandle);
      window.safeMutableDataMutation.free(mutationHandle);
      window.safeMutableDataEntries.free(entriesHandle);
    };
    return new Promise(async (resolve, reject) => {
      try {
        const deleteIDs = [];
        for (let i = 1; i <= comment.version; i += 1) {
          deleteIDs.push(this.getCommentId(comment.id, i));
        }
        const deleteQ = [];
        for (const id of deleteIDs) {
          deleteQ.push(deleteEntry(id));
        }
        await Promise.all(deleteQ);
        this.comments = await this.listComments();
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
