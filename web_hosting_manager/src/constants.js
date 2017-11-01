import path from 'path';
import pkg from '../package.json';

const CONSTANTS = {
  ENV: {
    DEV: 'development',
    TEST: 'test',
    PROD: 'production',
  },
  TYPE_TAG: {
    DNS: 15001,
    WWW: 15002,
  },
  APP_INFO: {
    data: {
      id: pkg.identifier,
      scope: null,
      name: pkg.productName,
      vendor: pkg.author.name,
    },
    opt: {
      own_container: false,
    },
    permissions: {
      _public: [
        'Read',
        'Insert',
        'Update',
        'Delete',
      ],
      _publicNames: [
        'Read',
        'Insert',
        'Update',
        'Delete',
      ],
    },
  },
  ACCESS_CONTAINERS: {
    PUBLIC: '_public',
    PUBLIC_NAMES: '_publicNames',
  },
  ERROR_CODE: {
    ENCODE_DECODE_ERROR: -1,
    SYMMETRIC_DECIPHER_FAILURE: -3,
    ACCESS_DENIED: -100,
    DATA_EXISTS: -104,
    NO_SUCH_ENTRY: -106,
    ENTRY_EXISTS: -107,
    TOO_MANY_ENTRIES: -108,
    NO_SUCH_KEY: -109,
    LOW_BALANCE: -113,
    INVALID_SIGN_KEY_HANDLE: -1011,
    EMPTY_DIR: -1029,
  },
  APP_ERR_CODE: {
    INVALID_PUBLIC_NAME: -10001,
    INVALID_AUTH_RESP: -10002,
    INVALID_SHARED_MD_RESP: -10003,
    APP_NOT_INITIALISED: -10004,
    INVALID_SERVICE_PATH: -10005,
    INVALID_SERVICE_META: -10006,
    INVALID_SERVICE_NAME: -10007,
    ENTRY_VALUE_NOT_EMPTY: -10008,
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  NETWORK_STATE: {
    INIT: 'Init',
    CONNECTED: 'Connected',
    UNKNOWN: 'Unknown',
    DISCONNECTED: 'Disconnected',
  },
  FILE_OPEN_MODE: {
    OPEN_MODE_READ: 4,
  },
  FILE_READ: {
    FROM_START: 0,
    TILL_END: 0,
  },
  MOCK_RES_URI: 'safe-mock-response',
  MD_META_KEY: '_metadata',
  MD_EMAIL_PREFIX: '@email',
  DOWNLOAD_CHUNK_SIZE: 1000000,
  UPLOAD_CHUNK_SIZE: 1000000,
  ASAR_LIB_PATH: path.resolve(__dirname, '../..', 'app.asar.unpacked/node_modules/@maidsafe/safe-node-app/src/native'),
  DEV_LIB_PATH: path.resolve(__dirname, '..', 'node_modules/@maidsafe/safe-node-app/src/native'),
  DEV_TEMPLATE_PATH: path.resolve(__dirname, '..', 'src/template'),
  ASAR_TEMPLATE_PATH: path.resolve(__dirname, '../..', 'app.asar.unpacked/src/template'),
  UI: {
    POPUP_TYPES: {
      LOADING: 'LOADING',
      ERROR: 'ERROR',
      AUTH_REQ: 'AUTH_REQ',
    },
    TOOLTIPS: {
      DELETE_SERVICE: 'Delete service',
      REMAP_SERVICE: 'Remap service',
      DELETE_FILE: 'Delete file',
      DELETE_FOLDER: 'Delete folder',
      UPLOAD: 'Upload files or folders',
      BACK: 'Go back',
      HOME: 'Go home',
      ADD_PUBLIC_NAME: 'Add public name',
      ADD_WEBSITE: 'Add website',
    },
    COMMON_STATE: {
      error: '',
      processing: false,
      processDesc: '',
    },
    NEW_WEBSITE_OPTIONS: {
      TEMPLATE: 'TEMPLATE',
      FROM_SCRATCH: 'FROM_SCRATCH',
      CHOOSE_EXISTING: 'CHOOSE_EXISTING',
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
      DOWNLOADING_FILE: 'Downloading file',
      REMAPPING_SERVICE: 'Remapping service',
      UPLOADING_TEMPLATE: 'Uploading template',
    },
    ERROR_MSG: {
      LOW_BALANCE: 'Network operation is not possible as there is insufficient account balance',
      NO_SUCH_ENTRY: 'Data not found',
      ENTRY_EXISTS: 'Data already exists',
      NO_SUCH_KEY: 'Unable to fetch data',
      INVALID_PUBLIC_NAME: 'Public ID must contain only lowercase alphanumeric characters. Should contain a min of 3 characters and a max of 62 characters',
      INVALID_SERVICE_NAME: 'Service name must contain only lowercase alphanumeric characters. Should contain a min of 3 characters and a max of 62 characters',
    },
  },
};

export default CONSTANTS;
