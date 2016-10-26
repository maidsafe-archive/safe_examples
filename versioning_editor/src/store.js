/* global btoa, safeAuth, safeStructuredData, safeDataId */

// this is only file directly interacting with SAFE

import { APP_ID, APP_NAME, APP_VERSION } from './config.js'

if (process.env.NODE_ENV !== 'production') {
  require('safe-js/dist/polyfill')
}

// global access token
let ACCESS_TOKEN

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
    .then(res => res.__parsedResponseBody__ || res)
    .then(auth => auth.token === APP_ID ? safeAuth.getAuthToken(APP_ID) : auth.token)
    .then(token => {
      if (!token) {
        alert("Authentication failed")
        throw Error("Authentication Failed")
      }
      ACCESS_TOKEN = token
      return ACCESS_TOKEN
    }
  )
}