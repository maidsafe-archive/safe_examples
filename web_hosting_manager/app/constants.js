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
      name: pkg.productName,
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
    ENTRY_EXISTS: -107,
    TOO_MANY_ENTRIES: -108,
      NO_SUCH_KEY: -109,
    LOW_BALANCE: -113,
    INVALID_SIGN_KEY_HANDLE: -1011,
    EMPTY_DIR: -1029
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  NETWORK_STATE: {
    INIT: 'Init',
    CONNECTED: 'Connected',
    UNKNOWN: 'Unknown',
    DISCONNECTED: 'Disconnected'
  },
  FILE_OPEN_MODE: {
    OPEN_MODE_READ: 4
  },
  FILE_READ: {
    FROM_START: 0,
    TILL_END: 0
  },
  MD_META_KEY: '_metadata',
  UI: {
    POPUP_TYPES: {
      LOADING: 'LOADING',
      ERROR: 'ERROR',
      AUTH_REQ: 'AUTH_REQ'
    },
    COMMON_STATE: {
      error: null,
      processing: false,
      processDesc: null
    },
    NEW_WEBSITE_OPTIONS: {
      TEMPLATE: 'TEMPLATE',
      FROM_SCRATCH: 'FROM_SCRATCH',
      CHOOSE_EXISTING: 'CHOOSE_EXISTING'
    },
    DEFAULT_SERVICE_CONTAINER_PREFIX: 'root-',
    MSG: {
      CREATING_PUBLIC_NAMES: 'Creating public name',
      FETCH_SERVICE_CONTAINERS: 'Fetching service containers',
      CHECK_PUB_ACCESS: 'Checking public name access',
      CHECK_SERVICE_EXISTS: 'Checking service exists',
      SERVICE_EXISTS: 'Service already exists',
      DELETING_SERVICE: 'Deleting service',
      FETCHING_SERVICE: 'Fetching service',
      MD_AUTH_WAITING: 'Waiting for Mutable Data authorisation',
      GETTING_CONT_INFO: 'Getting container information',
      PUBLISHING_WEB: 'Publishing website',
      DELETING_FILES: 'Deleting file or folder',
      DOWNLOADING_FILE: 'Downloading file'
    },
    ERROR_MSG: {
      LOW_BALANCE: 'Network operation is not possible as there is insufficient account balance',
      NO_SUCH_ENTRY: 'Data not found',
      ENTRY_EXISTS: 'Data already exists',
      NO_SUCH_KEY: 'Unable to fetch data'
    }
  }
};
export default CONSTANTS;
