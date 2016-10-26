/* global btoa, safeAuth, safeCipherOpts, safeStructuredData, safeDataId */

// this is only file directly interacting with SAFE

import { APP_ID, APP_NAME, APP_VERSION } from './config.js'

if (process.env.NODE_ENV !== 'production') {
  require('safe-js/dist/polyfill')
}

const INDEX_FILE_NAME = btoa(`${APP_ID}+index`)

// global access state
let ACCESS_TOKEN
let SYMETRIC_CYPHER_HANDLE
let INDEX_HANDLE
let FILE_INDEX = {}

function _refreshCypherHandle(){
  return safeCipherOpts.getHandle(ACCESS_TOKEN,
          window.safeCipherOpts.getEncryptionTypes().SYMMETRIC)
    .then(res => {
      SYMETRIC_CYPHER_HANDLE = res.handleId || res.__parsedResponseBody__.handleId
      return SYMETRIC_CYPHER_HANDLE
    }
  )
}

export function authorise () {
  if (ACCESS_TOKEN) return Promise.resolve(ACCESS_TOKEN)

  return safeAuth.authorise({
    'name': APP_NAME,
    'id': APP_ID,
    'version': APP_VERSION,
    'vendor': 'MaidSafe Ltd.',
    'permissions': ['LOW_LEVEL_API']
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
      return _refreshCypherHandle().then(() => ACCESS_TOKEN)
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

export function refreshFileIndex () {
  return safeDataId.getStructuredDataHandle(ACCESS_TOKEN, INDEX_FILE_NAME, 500)
    .then(extractHandle) 
    .then(dataHandle => {
      return safeStructuredData.getHandle(ACCESS_TOKEN, dataHandle)
        // or create!
        .catch((e) => {
          console.error(e)
          return safeStructuredData.create(
              ACCESS_TOKEN, INDEX_FILE_NAME, 500,
              new Buffer(JSON.stringify({})).toString('base64'),
              SYMETRIC_CYPHER_HANDLE)
            .then(extractHandle)
            .then(handle => safeStructuredData.put(ACCESS_TOKEN, handle)
              // don't forget to clean up that handle
              .then(() => safeStructuredData.dropHandle(handle))
            // and return a read handle
            .then(() => safeStructuredData.getHandle(ACCESS_TOKEN, dataHandle)))
        })
        .then(extractHandle)
        // then clean up the dataHandle
        .then(sdHandle => safeDataId.dropHandle(dataHandle).then(() => sdHandle))
        .then(sdHandle => {
          INDEX_HANDLE = sdHandle
          return sdHandle
        })
    }).then(sdHandle => 
      // try to read
      safeStructuredData.readData(ACCESS_TOKEN, sdHandle)
        .then(payload => {
          FILE_INDEX = JSON.parse(atob(payload))
        })
    ).then(() => FILE_INDEX)
}





