import pkg from '../package.json';
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
        'Delete',
        'ManagePermissions'
      ],
      _publicNames: [
        'Read',
        'Insert',
        'Update',
        'Delete',
        'ManagePermissions'
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
    SYMMETRIC_DECIPHER_FAILURE: -3,
    NO_SUCH_ENTRY: -106,
    ENTRY_EXISTS: -107
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024
};
export default CONSTANTS;
