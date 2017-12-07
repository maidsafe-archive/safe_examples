export default {
  ANONYMOUS: 'Anonymous',
  DEFAULT_ID: 'comments',
  PUBLIC_NAMES_CONTAINER: '_publicNames',
  NET_STATE: {
    INIT: 'Init',
    DISCONNECTED: 'Disconnected',
    CONNECTED: 'Connected',
    UNKNOWN: 'Unknown',
  },
  ERROR_MSG: {
    APP_NOT_INITIALISED: 'App is not yet initialised',
    PUBLIC_ID_DOES_NOT_MATCH: 'Public Id does not match. Can not set current user as admin',
    TOPIC_PARAM_MISSING: 'Topic parameter is missing',
  },
  ERROR_CODE: {
    REQUESTED_DATA_NOT_FOUND: -103,
    VERSION_MISMATCH: -111,
    ENTRY_EXISTS: -107,
  },
  PERMISSIONS: {
    READ: 'Read',
    INSERT: 'Insert',
    UPDATE: 'Update',
  },
  MD_META_KEY: '_metadata',
  DEFAULT_LOADING_MSG: 'Please wait...',
  MAX_COMMENT_VERSION_CHAR: 5,
};
