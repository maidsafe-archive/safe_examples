import pkg from './package.json';
const CONSTANTS = {
  TAG_TYPE: {
    DNS: 15001,
    WWW: 15002
  },
  KEY_TAR: {
    SERVICE: 'WEB_HOST_MANAGER',
    ACCOUNT: 'SAFE_USER'
  },
  APP_INFO: {
    data: {
      id: pkg.identifier,
      scope: null,
      name: pkg.name,
      vendor: pkg.author.name
    },
    opt: {
      own_container: false
    },
    permissions: {
      _public: [
        'Read',
        'Insert',
        'Update',
        'Delete'
      ],
      _publicNames: [
        'Read',
        'Insert',
        'Update',
        'Delete'
      ]
    }
  },
  ACCESS_CONTAINERS: {
    PUBLIC: '_public',
    PUBLIC_NAMES: '_publicNames'
  },
  AUTH_RES_TYPE: {
    CONTAINERS: 'containers',
    REVOKED: 'revoked'
  },
  ERROR_CODE: {
    ENCODE_DECODE_ERROR: -1,
    SYMMETRIC_DECIPHER_FAILURE: -3,
    ACCESS_DENIED: -100,
    NO_SUCH_ENTRY: -106,
    ENTRY_EXISTS: -107
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  NETWORK_STATE: {
    INIT: 'Init',
    CONNECTED: 'Connected',
    UNKNOWN: 'Unknown',
    DISCONNECTED: 'Disconnected'
  }
};
export default CONSTANTS;
