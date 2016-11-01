/* global btoa, safeAuth, safeStructuredData, safeDataId */

// this is only file directly interacting with SAFE

if (process.env.NODE_ENV !== 'production') {
  require('safe-js/dist/polyfill')
}

export const APP_ID = 'example.signaling.v1'

// global access token
let ACCESS_TOKEN

export function authorise () {
  if (ACCESS_TOKEN) return Promise.resolve(ACCESS_TOKEN)

  return safeAuth.authorise({
    'name': 'SAFE Signaling Demo',
    'id': APP_ID,
    'version': '0.7',
    'vendor': 'MaidSafe Ltd.',
    'permissions': ['LOW_LEVEL_API']
  },
      APP_ID)
    .then(res => res.__parsedResponseBody__ || res)
    .then(auth => auth.token === APP_ID ? safeAuth.getAuthToken(window.location.host) : auth.token)
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

export function readData (item) {
  if (!ACCESS_TOKEN) throw Error('Not authorised before!')
  // we prefix everything with the app-id
  const address = btoa(`${APP_ID}-${item}`)
  // acquire handle
  console.log('reading', address)
  return safeDataId.getStructuredDataHandle(ACCESS_TOKEN, address, 500)
    .then(res => res.__parsedResponseBody__ || res)
    .then(resp => {
      const dataHandleId = resp.handleId
      console.log(`${address}: acquired dataHandle ${dataHandleId}`)
      return safeStructuredData.getHandle(ACCESS_TOKEN, dataHandleId)
        .then(res => res.__parsedResponseBody__ || res)
        .then((resp) => {
          const handleId = resp.handleId
          console.log(`${address}: acquired handle ${handleId}`)
          // read handle
          return safeDataId.dropHandle(ACCESS_TOKEN, dataHandleId).then(
            r => safeStructuredData.readData(ACCESS_TOKEN, handleId)
              .then((payload) => {
                console.log(`${address}: read data: ${payload}`)
                // close handle
                safeStructuredData.dropHandle(ACCESS_TOKEN, handleId)
                // return read data
                return JSON.parse(payload)
              })
            )
        }
      )
    }
  )
}

export function publishData (name, payload) {
  if (!ACCESS_TOKEN) throw Error('Not authorised before!')
  // we prefix everything with the app-id
  const address = btoa(`${APP_ID}-${name}`)
  const data = new Buffer(JSON.stringify(payload)).toString('base64')
  console.log('putting', address)
  return safeStructuredData.create(ACCESS_TOKEN, address, 500, data)
    .then(res => res.__parsedResponseBody__ || res)
    .then(res => {
      const handleId = res.handleId
      // post data creates the actual structure
      return safeStructuredData.put(ACCESS_TOKEN, handleId)
        // drop the handle
        // .then(p => safeStructuredData.dropHandle(handleId))
    })
}
