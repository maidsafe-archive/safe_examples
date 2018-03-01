import CONST from './constants';
import * as utils from './utils';

const DOT = '.';

let hostName = window.location.hostname;
if (hostName.split(DOT).length === 1) {
  hostName = `www.${hostName}`;
}

// Authorisation model
const APP = {
  info: {
    id: 'net.maidsafe.example.webrtc',
    name: 'WebRTC example',
    vendor: 'MaidSafe.net Ltd',
  },
  opts: {},
  containers: {
    _publicNames: [
      CONST.PERMISSIONS.READ,
      CONST.PERMISSIONS.INSERT,
    ],
  },
};

const ERROR_MSG = {
  ENTRY_NOT_FOUND: 'Core error: Routing client error -> Requested entry not found',
  SYMMETRIC_DECIPHER_FAILURE: 'Core error: Symmetric decryption failed',
};

const keySeparator = '-';

export default class SafeApi {
  constructor(nwStateCb) {
    this.app = null;
    this.keys = {};
    this.remoteKeys = {};
    this.pubNameCntr = null;
    this.serviceCntr = null;
    this.channelMD = null;
    this.remoteChannelMD = null;
    this.selectedPubName = null;
    this.nwStateCb = (newState) => {
      nwStateCb(newState);
    };
  }

  // set origin keys
  _setKeys(keys) {
    utils.putLog('set origin keys');
    if (keys) {
      utils.putLog('set origin keys as agrument', keys);
      this.keys = keys;
      return Promise.resolve(true);
    }

    return new Promise(async (resolve, reject) => {
      if (!this.channelMD) {
        return reject(new Error('Channel MD not set'));
      }
      try {
        const pubEncKeyStr = await window.safeMutableData.get(this.channelMD, CONST.CRYPTO_KEYS.PUB_ENC_KEY);
        const secEncKeyStr = await window.safeMutableData.get(this.channelMD, CONST.CRYPTO_KEYS.SEC_ENC_KEY);
        const decSecEncKey = await window.safeMutableData.decrypt(this.channelMD, secEncKeyStr.buf);

        this.keys[CONST.CRYPTO_KEYS.PUB_ENC_KEY] = await window.safeCrypto.pubEncKeyFromRaw(this.app, pubEncKeyStr.buf);
        this.keys[CONST.CRYPTO_KEYS.SEC_ENC_KEY] = await window.safeCrypto.secEncKeyFromRaw(this.app, decSecEncKey);

        utils.putLog('set origin keys from channel container', this.keys);

        resolve(true);
      } catch (err) {
        utils.putLog('set origin keys error', err);
        reject(err);
      }
    });
  }

  // set remote keys
  _setRemoteKeys() {
    utils.putLog('set remote keys');
    return new Promise(async (resolve, reject) => {
      if (!this.remoteChannelMD) {
        return reject(new Error('Channel MD not set'));
      }
      try {
        const pubEncKeyStr = await window.safeMutableData.get(this.remoteChannelMD, CONST.CRYPTO_KEYS.PUB_ENC_KEY);

        this.remoteKeys[CONST.CRYPTO_KEYS.PUB_ENC_KEY] = await window.safeCrypto.pubEncKeyFromRaw(this.app, pubEncKeyStr.buf);
        utils.putLog('set remote keys from remote channel', this.remoteKeys);
        resolve(true);
      } catch (err) {
        utils.putLog('set remote keys error', err);
        reject(err);
      }
    });
  }

  // create channel
  _createChannel() {
    utils.putLog('Create channel');
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.serviceCntr) {
          return reject(new Error('service container handle is empty'));
        }

        this.channelMD = await window.safeMutableData.newRandomPrivate(this.app, CONST.TYPE_TAG.CHANNEL);
        const keysHandle = {};

        utils.putLog('Generate Encvryption key pairs');
        utils.putLog('Generate Encvryption key pairs');

        const encKeyPairHandle = await window.safeCrypto.generateEncKeyPair(this.app);

        // public encryption key
        const pubEncKey = await window.safeCryptoEncKeyPair.getPubEncKey(encKeyPairHandle);
        keysHandle[CONST.CRYPTO_KEYS.PUB_ENC_KEY] = pubEncKey;
        const pubEncKeyRaw = await window.safeCryptoPubEncKey.getRaw(pubEncKey);
        const pubEncKeyArr = utils.bufToArr(pubEncKeyRaw.buffer);

        // secret encryption key
        const secEncKey = await window.safeCryptoEncKeyPair.getSecEncKey(encKeyPairHandle);
        keysHandle[CONST.CRYPTO_KEYS.SEC_ENC_KEY] = secEncKey;
        const secEncKeyRaw = await window.safeCryptoSecEncKey.getRaw(secEncKey);
        const encSecEncKey = await window.safeMutableData.encryptValue(this.channelMD, secEncKeyRaw.buffer);
        const secEncKeyArr = utils.bufToArr(encSecEncKey);

        const entries = {};
        entries[CONST.CRYPTO_KEYS.PUB_ENC_KEY] = pubEncKeyArr;
        entries[CONST.CRYPTO_KEYS.SEC_ENC_KEY] = secEncKeyArr;
        await window.safeMutableData.quickSetup(this.channelMD, entries, 'WebRTC Channel', `WebRTC channel for ${hostName}`);

        // create a new permission set
        const permSet = [CONST.PERMISSIONS.READ, CONST.PERMISSIONS.INSERT];
        await window.safeMutableData.setUserPermissions(this.channelMD, null, permSet, 1);

        const channelSerialData = await window.safeMutableData.serialise(this.channelMD);
        const entriesHandle = await window.safeMutableData.getEntries(this.serviceCntr);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);
        const encryptedKey = await window.safeMutableData.encryptKey(this.serviceCntr, CONST.MD_KEY);
        await window.safeMutableDataMutation.insert(mutationHandle, encryptedKey, channelSerialData);
        await window.safeMutableData.applyEntriesMutation(this.serviceCntr, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        this._setKeys(keysHandle);
        resolve(true);
      } catch (err) {
        utils.putLog('Create channel error', err);
        reject(err);
      }
    });
  }

  _getPublicNamesCntr() {
    utils.putLog('Get public names container');
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.app) {
          return reject(new Error('Unauthorised'));
        }
        const hasAccess = await window.safeApp.canAccessContainer(this.app, '_publicNames', APP.containers._publicNames);
        if (!hasAccess) {
          return reject(new Error('No publicNames container access found'));
        }
        this.pubNameCntr = await window.safeApp.getContainer(this.app, '_publicNames');
        resolve(true);
      } catch (err) {
        utils.putLog('Get public names container error', err);
        reject(err);
      }
    });
  }

  _getSelectedPublicName() {
    utils.putLog('Select public name');
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.app) {
          return reject(new Error('Unauthorised'));
        }
        const ownCntr = await window.safeApp.getOwnContainer(this.app);
        this.selectedPubName = await window.safeMutableData.get(ownCntr, CONST.SELECTED_PUB_NAME_KEY);
        resolve(true);
      } catch (err) {
        // FIXME: change from error message to code
        // if (err.code !== CONST.ERR_CODE.NO_SUCH_ENTRY) {
        if (err.message !== ERROR_MSG.ENTRY_NOT_FOUND) {
          utils.putLog('Select public name error', err);
          reject(err);
        }
        resolve(true);
      }
    });
  }

  _checkServiceContainerAccess(mdHandle) {
    utils.putLog('Check service container access');
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.serviceCntr) {
          return reject(new Error('service container handle is empty'));
        }

        const appSignKey = await window.safeCrypto.getAppPubSignKey(this.app);
        const result = await window.safeMutableData.getUserPermissions(mdHandle, appSignKey);

        resolve(true);
      } catch (err) {
        // FIXME: change from error message to code
        // if (err.code !== -1011) {
        if (err.message !== 'Core error: Routing client error -> Key does not exists') {
          utils.putLog('Check service container access error', err);
          return reject(err);
        }

        utils.putLog('Send service container auth request');

        const serviceCntrInfo = await window.safeMutableData.getNameAndTag(this.serviceCntr);
        await window.safeApp.authoriseShareMd(this.app, [
          {
            type_tag: serviceCntrInfo.type_tag,
            name: serviceCntrInfo.name.buffer,
            perms: [CONST.PERMISSIONS.INSERT]
          }
        ]);
        resolve(true);
      }
    });
  }

  _getDataKey(initiater, state, id) {
    utils.putLog('Get data key');
    let dataKey = null;
    if (!state) {
      dataKey = `${initiater}${keySeparator}${CONST.CONN_STATE.SEND_INVITE}${keySeparator}${id}`;
    } else if (state === CONST.CONN_STATE.SEND_INVITE || state === CONST.CONN_STATE.CALLING) {
      dataKey = `${initiater}${keySeparator}${state}${keySeparator}${id}`;
    } else {
      dataKey = `${initiater}${keySeparator}${CONST.CONN_STATE.SEND_INVITE}${keySeparator}${id}`;
      if (state === CONST.CONN_STATE.CONNECTED) {
        dataKey = `${initiater}${keySeparator}${CONST.CONN_STATE.CALLING}${keySeparator}${id}`;
      }
    }
    utils.putLog('Get data key success', dataKey);
    return dataKey;
  }

  _isCaller(connInfo) {
    return (connInfo.data.persona === CONST.USER_POSITION.CALLER);
  }

  _encryptData(data) {
    utils.putLog('Encrypt data');
    return new Promise(async (resolve, reject) => {
      try {
        const encryptedData = await window.safeCryptoPubEncKey.encryptSealed(this.remoteKeys[CONST.CRYPTO_KEYS.PUB_ENC_KEY], data);
        resolve(utils.bufToArr(encryptedData));
      } catch(err) {
        utils.putLog('Encrypt data error', err);
        reject(err);
      }
    });
  }

  _decryptData(cipher) {
    utils.putLog('Decrypt data');
    return new Promise(async (resolve, reject) => {
      try {
        const rawPubEncKey = await window.safeCryptoPubEncKey.getRaw(this.keys[CONST.CRYPTO_KEYS.PUB_ENC_KEY]);
        const rawSecEncKey = await window.safeCryptoSecEncKey.getRaw(this.keys[CONST.CRYPTO_KEYS.SEC_ENC_KEY]);
        const encKeyPairHandle = await window.safeCrypto.generateEncKeyPairFromRaw(this.app, rawPubEncKey.buffer, rawSecEncKey.buffer);
        const decryptedData = await window.safeCryptoEncKeyPair.decryptSealed(
          encKeyPairHandle,
          utils.arrToBuf(cipher));
        resolve(utils.parseConnInfo(decryptedData.toString()));
      } catch(err) {
        utils.putLog('Decrypt data error', err);
        reject(err);
      }
    });
  }

  authorise() {
    utils.putLog('Authorise app');
    return new Promise(async (resolve, reject) => {
      try {
        this.app = await window.safeApp.initialise(APP.info, this.nwStateCb);
        const uri = await window.safeApp.authorise(this.app, APP.containers, APP.opts);
        await window.safeApp.connectAuthorised(this.app, uri);
        await this._getPublicNamesCntr();
        resolve(true);
      } catch (err) {
        utils.putLog('Authorise app error', err);
        reject(err);
      }
    });
  }

  getPublicNames(publicName) {
    utils.putLog('Get public names', publicName);
    const decryptKey = (key) => {
      return new Promise(async (resolve, reject) => {
        try {
          const deckey = await window.safeMutableData.decrypt(this.pubNameCntr, key);
          resolve(utils.uint8ToStr(deckey));
        } catch (err) {
          // FIXME: change from error message to code
          if (err.message === ERROR_MSG.SYMMETRIC_DECIPHER_FAILURE) {
            return resolve('');
          }
          utils.putLog('Get public names - decrypt keys error', err);
          reject(err);
        }
      });
    };

    return new Promise(async (resolve, reject) => {
      try {
        if (!this.pubNameCntr) {
          return reject(new Error('_publicnames container handle not set'));
        }
        const publicNames = [];
        const entriesHandle = await window.safeMutableData.getEntries(this.pubNameCntr);
        await window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {
          publicNames.push(k);
        });
        const encPubNamesQ = [];
        for (const i in publicNames) {
          encPubNamesQ.push(decryptKey(publicNames[i]));
        }
        const decPubNames = await Promise.all(encPubNamesQ);
        resolve(decPubNames.filter(k => !!k));
      } catch (err) {
        utils.putLog('Get public names error', err);
        reject(err);
      }
    });
  }

  setupPublicName(pubName) {
    utils.putLog('Setup public name', pubName);
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.app) {
          return reject(new Error('Unauthorised'));
        }

        if (!this.pubNameCntr) {
          return reject(new Error('_publicNames container handle is empty'));
        }

        // get service container
        const encPublicName = await window.safeMutableData.encryptKey(this.pubNameCntr, pubName);
        const encServiceCntr = await window.safeMutableData.get(this.pubNameCntr, encPublicName);
        const decServiceCntr = await window.safeMutableData.decrypt(this.pubNameCntr, encServiceCntr.buf);
        this.serviceCntr = await window.safeMutableData.newPublic(this.app, decServiceCntr, CONST.TYPE_TAG.DNS);

        // check for access
        await this._checkServiceContainerAccess(this.serviceCntr);

        try {
          // search for webrtc channel
          const encChannelKey = await window.safeMutableData.encryptKey(this.serviceCntr, CONST.MD_KEY);
          const channelSerial = await window.safeMutableData.get(this.serviceCntr, encChannelKey);
          this.channelMD = await window.safeMutableData.fromSerial(this.app, channelSerial.buf);
          await this._setKeys(null);
        } catch (e) {

          // if (e.code !== CONST.ERR_CODE.NO_SUCH_ENTRY) {
          if (e.message !== ERROR_MSG.ENTRY_NOT_FOUND) {
            utils.putLog('setup public name - search channel error', e);
            throw e;
          }
          utils.putLog('setup public name - create new channel');
          await this._createChannel();
        }
        resolve(true);
      } catch (err) {
        utils.putLog('Setup public name error', err);
        reject(err);
      }
    });
  }

  fetchInvites() {
    utils.putLog('Fetch invites');
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.channelMD) {
          return reject(new Error('channel handle is empty'));
        }
        const whiteListKeys = [
          CONST.CRYPTO_KEYS.PUB_ENC_KEY,
          CONST.CRYPTO_KEYS.SEC_ENC_KEY,
          CONST.CRYPTO_KEYS.PUB_ENC_KEY,
          CONST.CRYPTO_KEYS.SEC_ENC_KEY,
          CONST.MD_META_KEY
        ];
        const invites = [];
        const entriesHandle = await window.safeMutableData.getEntries(this.channelMD);
        await window.safeMutableDataEntries.forEach(entriesHandle, (k, v) => {
          const keyStr = k.toString();
          if (!whiteListKeys.includes(keyStr)) {
            const dataArr = keyStr.split(keySeparator);
            if (dataArr.length == 3 && dataArr[1] === CONST.CONN_STATE.SEND_INVITE && v.buf.length !== 0) {
              invites.push({
                publicId: dataArr[0],
                uid: dataArr[2]
              });
            }
          }
        });
        utils.putLog('Fetch invites success', invites);
        resolve(invites);
      } catch (err) {
        utils.putLog('Fetch invites error', err);
        reject(err);
      }
    });
  }

  connect(friendID) {
    utils.putLog('Connect with friendID', friendID);
    return new Promise(async (resolve, reject) => {
      try {
        if (!friendID) {
          return reject(new Error('Friend ID was empty'));
        }
        const pubNameSha = await window.safeCrypto.sha3Hash(this.app, friendID);
        const fdPubNameCntr = await window.safeMutableData.newPublic(this.app, pubNameSha, CONST.TYPE_TAG.DNS);

        const encChannelKey = await window.safeMutableData.encryptKey(fdPubNameCntr, CONST.MD_KEY);
        const fdChannelSerial = await window.safeMutableData.get(fdPubNameCntr, encChannelKey);
        this.remoteChannelMD = await window.safeMutableData.fromSerial(this.app, fdChannelSerial.buf);
        await this._setRemoteKeys();
        resolve(true);
      } catch (err) {
        utils.putLog('Connect with friendID error', err);
        reject(err);
      }
    });
  }

  putConnInfo(connInfo) {
    utils.putLog('Put connection info');
    return new Promise(async (resolve, reject) => {
      try {
        const isCaller = this._isCaller(connInfo);
        const channelMD = isCaller ? this.remoteChannelMD : this.channelMD;

        if (!channelMD) {
          return reject(new Error('channel not set'));
        }

        const entriesHandle = await window.safeMutableData.getEntries(channelMD);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);

        const data = utils.stringifyConnInfo(connInfo.data);
        const encData = await this._encryptData(data);
        const dataKey = this._getDataKey(connInfo.data.initiater, connInfo.state, connInfo.uid);

        const connInfoStr = utils.stringifyConnInfo({
          state: connInfo.state,
          uid: connInfo.uid,
          data: encData
        });

        // insert if it is caller
        if (isCaller) {
          utils.putLog('Insert data', dataKey);
          await window.safeMutableDataMutation.insert(mutationHandle, dataKey, connInfoStr);
          utils.putLog('Inserted data', dataKey);
        } else {
          utils.putLog('Update data', dataKey);
          const connStr = await window.safeMutableData.get(channelMD, dataKey);
          await window.safeMutableDataMutation.update(mutationHandle, dataKey, connInfoStr, connStr.version + 1);
          utils.putLog('Updated data', dataKey);
        }

        await window.safeMutableData.applyEntriesMutation(channelMD, mutationHandle);
        utils.putLog('put confirmed', dataKey);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        resolve(true);
      } catch (err) {
        utils.putLog('Put connection info error', err);
        reject(err);
      }
    });
  }

  fetchConnInfo(connInfo, nextState) {
    utils.putLog('Fetch connection info', connInfo);
    const isCaller = this._isCaller(connInfo);
    return new Promise(async (resolve, reject) => {
      try {
        const channelMD = isCaller ? this.remoteChannelMD : this.channelMD;
        if (!channelMD) {
          return reject(new Error('channel not set'));
        }

        const dataKey = this._getDataKey(connInfo.data.initiater, nextState || connInfo.state, connInfo.uid);
        const connStr = await window.safeMutableData.get(channelMD, dataKey);
        const parsedConnInfo = utils.parseConnInfo(connStr.buf.toString());

        if (isCaller && parsedConnInfo.state && (parsedConnInfo.state === CONST.CONN_STATE.SEND_INVITE || parsedConnInfo.state === CONST.CONN_STATE.CALLING)) {
          return resolve(utils.stringifyConnInfo(connInfo));
        }

        if (!isCaller && parsedConnInfo.state && (parsedConnInfo.state === CONST.CONN_STATE.INVITE_ACCEPTED || parsedConnInfo.state === CONST.CONN_STATE.CONNECTED)) {
          return resolve(utils.stringifyConnInfo(connInfo));
        }

        const decryptedData = await this._decryptData(parsedConnInfo.data)

        resolve(utils.stringifyConnInfo({
          state: parsedConnInfo.state,
          uid: parsedConnInfo.uid,
          data: decryptedData
        }));
      } catch (err) {
        // FIXME: change from error message to code
        if (err.message !== ERROR_MSG.ENTRY_NOT_FOUND) {
          return reject(err);
        }

        if (!isCaller && connInfo.state && (connInfo.state === CONST.CONN_STATE.INVITE_ACCEPTED)) {
          return resolve(JSON.stringify(connInfo));
        }

        return reject(err);
      }
    });
  }

  deleteInvite(connInfo) {
    utils.putLog('Delete invite', connInfo);
    return new Promise(async (resolve, reject) => {
      try {
        const isCaller = this._isCaller(connInfo);
        if (isCaller) {
          return reject(new Error('Restricted access'));
        }
        if (!this.channelMD) {
          return reject(new Error('channel handle not set'));
        }
        const entriesHandle = await window.safeMutableData.getEntries(this.channelMD);
        const mutationHandle = await window.safeMutableDataEntries.mutate(entriesHandle);

        const dataKey = this._getDataKey(connInfo.data.initiater, CONST.CONN_STATE.SEND_INVITE, connInfo.uid);
        const connStr = await window.safeMutableData.get(this.channelMD, dataKey);
        await window.safeMutableDataMutation.remove(mutationHandle, dataKey, connStr.version + 1);

        await window.safeMutableData.applyEntriesMutation(this.channelMD, mutationHandle);
        window.safeMutableDataMutation.free(mutationHandle);
        window.safeMutableDataEntries.free(entriesHandle);
        resolve(true);
      } catch (err) {
        utils.putLog('Delete invite error', connInfo)
        reject(err);
      }
    });
  }

  sendInvite(connInfo) {
    utils.putLog('Send invite', connInfo);
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.remoteChannelMD) {
          return reject(new Error('remote channel not set'));
        }
        await this.putConnInfo(connInfo);
        resolve(true);
      } catch (err) {
        utils.putLog('Send invite error', connInfo)
        reject(err);
      }
    });
  }

  acceptInvite(connInfo) {
    utils.putLog('Accept invite', connInfo)
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.channelMD) {
          return reject(new Error('channel handle is empty'));
        }
        await this.putConnInfo(connInfo);
        resolve(true);
      } catch (err) {
        utils.putLog('Accept invite error', err);
        reject(err);
      }
    });
  }

  calling(connInfo) {
    utils.putLog('Calling', connInfo);
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.remoteChannelMD) {
          return reject(new Error('channel handle is empty'));
        }
        await this.putConnInfo(connInfo);
        resolve(true);
      } catch (err) {
        utils.putLog('Calling error', err);
        reject(err);
      }
    });
  }

  connected(connInfo) {
    utils.putLog('Connected', connInfo);
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.channelMD) {
          return reject(new Error('channel handle is empty'));
        }
        await this.putConnInfo(connInfo);
        await this.deleteInvite(connInfo);
        resolve(true);
      } catch (err) {
        utils.putLog('Connected error', err);
        reject(err);
      }
    });
  }
}
