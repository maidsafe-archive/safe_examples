export default {
  UI: {
    DEFAULT_LOADING_DESC: 'Please wait...',
    CONN_MSGS: {
      INIT: 'Initialising connection',
      SEND_INVITE: 'Invite sent. Wait to remote to accept it',
      INVITE_ACCEPTED: 'Invite accepted. Establishing connection with remote',
      CALLING: 'Remote accepted the invite. Establishing connection with remote',
    },
    CONN_TIMER_INTERVAL: 2000,
    TIMER_INTERVAL: {
      FETCH_INVITES_POLL: 5000,
      CONNECTION_POLL: 4000,
    },
  },
  CONFIG: {
    SERVER: {
      iceServers: [
        { url: 'stun:stun1.l.google.com:19302' },
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'string21',
          username: 'shankar21mail@gmail.com'
        },
      ]
    },
    OFFER: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    },
    MEDIA_OFFER: {
      audio: true,
      video: true
    },
  },
  USER_POSITION: {
    CALLER: 'CALLER',
    CALLEE: 'CALLEE',
  },
  CONN_STATE: {
    INIT: 'INIT',
    SEND_INVITE: 'SEND_INVITE',
    INVITE_ACCEPTED: 'INVITE_ACCEPTED',
    CALLING: 'CALLING',
    CONNECTED: 'CONNECTED',
  },
  NET_STATE: {
    INIT: 'Init',
    DISCONNECTED: 'Disconnected',
    CONNECTED: 'Connected',
    UNKNOWN: 'Unknown',
  },
  PERMISSIONS: {
    READ: 'Read',
    INSERT: 'Insert',
    UPDATE: 'Update',
  },
  MD_KEY: '@webrtcSignalSample',
  SELECTED_PUB_NAME_KEY: 'selected_pub_name',
  MD_META_KEY: '_metadata',
  TYPE_TAG: {
    CHANNEL: 15005,
    DNS: 15001,
  },
  ERR_CODE: {
    NO_SUCH_ENTRY: -106,
  },
  CRYPTO_KEYS: {
    SEC_SIGN_KEY: '__SEC_SIGN_KEY__',
    PUB_SIGN_KEY: '__PUB_SIGN_KEY__',
    SEC_ENC_KEY: '__SEC_ENC_KEY__',
    PUB_ENC_KEY: '__PUB_ENC_KEY__',
  },
};
