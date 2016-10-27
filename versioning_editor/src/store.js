/* global btoa, safeAuth, safeNFS safeCipherOpts, safeStructuredData, safeDataId */

// this is only file directly interacting with SAFE

import { APP_ID, APP_NAME, APP_VERSION } from './config.js'

if (process.env.NODE_ENV !== 'production') {
  require('safe-js/dist/polyfill')
}

// global access state
let ACCESS_TOKEN
let SYMETRIC_CYPHER_HANDLE
let INDEX_HANDLE
let FILE_INDEX
let USER_PREFIX

function _createRandomUserPrefix() {
  let randomString = ''
  for (var i = 0; i < 10; i++) {
    // and ten random ascii chars
    randomString += String.fromCharCode(Math.floor(Math.random(100)))
  }
  return btoa(`${APP_ID}@${APP_VERSION}#${(new Date()).getTime()}-${randomString}`)
}

function _refreshCypherHandle () {
  return safeCipherOpts.getHandle(ACCESS_TOKEN,
          window.safeCipherOpts.getEncryptionTypes().SYMMETRIC)
    .then(res => {
      SYMETRIC_CYPHER_HANDLE = res.handleId || res.__parsedResponseBody__.handleId
      return SYMETRIC_CYPHER_HANDLE
    }
  )
}

function _refreshConfig() {
  // reading the config from NFS or create it if not yet existing.
  const FILE_NAME = 'app_config.json'
  return safeNFS.createFile(ACCESS_TOKEN,
        // try to create instead then
        FILE_NAME,
        `{"user_prefix": "${_createRandomUserPrefix()}" }`)
    .catch(err => err.errorCode === -505 ? '' : console.error(err)) // ignore file already exists
    .then(safeNFS.getFile(ACCESS_TOKEN, FILE_NAME)
      .then(resp => resp.json ? resp.json() : resp.body().then(JSON.parse))
      .then(config => {
        USER_PREFIX = config.user_prefix
      })  
    )
}

export function authorise () {
  if (ACCESS_TOKEN) return Promise.resolve(ACCESS_TOKEN)

  return safeAuth.authorise({
    'name': APP_NAME,
    'id': APP_ID,
    'version': APP_VERSION,
    'vendor': 'MaidSafe Ltd.',
    'permissions': ['LOW_LEVEL_API', 'SAFE_DRIVE_ACCESS']
  },
      APP_ID)
    .then(res => res.__parsedResponseBody__ || res) // legacy style fallback
    .then(auth => auth.token === APP_ID ? safeAuth.getAuthToken(APP_ID) : auth.token)
    .then(token => {
      if (!token) {
        alert("Authentication failed")
        throw Error("Authentication Failed")
      }
      ACCESS_TOKEN = token
      // then fetch a fresh cypherHandle
      return Promise.all([
          _refreshCypherHandle(),
          _refreshConfig()
        ]).then(() => ACCESS_TOKEN)
    }
  )
}

// legacy style fallback
const extractHandle = (res) => res.handleId || res.__parsedResponseBody__.handleId


function _putFileIndex () {
  return safeStructuredData.updateData(ACCESS_TOKEN,
    INDEX_HANDLE,
    new Buffer(JSON.stringify(FILE_INDEX)).toString('base64'),
    SYMETRIC_CYPHER_HANDLE)
}

export function saveFile(filename, data) {
  let payload = new Buffer(JSON.stringify({
    ts: (new Date()).getTime(),
    content: data
  })).toString('base64')

  if (FILE_INDEX[filename]) {
    // this was an edit, add new version
    console.log("existing")
  } else {
    // file is being created for the first time
    return safeStructuredData.create(ACCESS_TOKEN,
        // trying to come up with a name that is super unlikely to clash ever.
        btoa(`${USER_PREFIX}:${filename}`),
        // 501 => we want this versioned
        501, payload, SYMETRIC_CYPHER_HANDLE)
      .then(extractHandle)
      // save the structure
      .then(handle => safeStructuredData.put(ACCESS_TOKEN, handle)
        // fetch a permanent reference
        .then(() => safeStructuredData.getDataIdHandle(ACCESS_TOKEN, handle))
        // add the reference to the file index
        .then((dataHandleId) => {
          FILE_INDEX[filename] = dataHandleId
          return _putFileIndex()
        })
      )
  }
}

export function getFileIndex () {
  if (FILE_INDEX) return Promise.resolved(FILE_INDEX)
  const INDEX_FILE_NAME = btoa(`${USER_PREFIX}#index`)

  return safeDataId.getStructuredDataHandle(ACCESS_TOKEN, INDEX_FILE_NAME, 500)
    .then(extractHandle)
    .then(handle => safeStructuredData.getHandle(ACCESS_TOKEN, handle)
      .then(extractHandle)
      // drop data Handle
      // .then(sdHandle => safeDataId.dropHandle(handle).then(() => sdHandle))
      .then(sdHandle => {
        // store the handle for future reference
        INDEX_HANDLE = sdHandle
        // let's try to read
        return safeStructuredData.readData(ACCESS_TOKEN, sdHandle, '')
          .then(resp => resp.json ? resp.json() : resp.body())
      },            
      (e) => {
        console.error(e)
        FILE_INDEX = {}
        return safeStructuredData.create(ACCESS_TOKEN, INDEX_FILE_NAME, 500,
            new Buffer(JSON.stringify({})).toString('base64'), SYMETRIC_CYPHER_HANDLE)
          .then(extractHandle)
          .then(handle => safeStructuredData.put(ACCESS_TOKEN, handle)
            // don't forget to clean up that handle
            .then(() => safeStructuredData.dropHandle(handle)))
          // and return empty data as payload
          .then(() => { return {} })
      }))
    .then(payload => {
      // store payload for future reference
      FILE_INDEX = payload
      return FILE_INDEX
    })
}





