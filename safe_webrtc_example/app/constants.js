export default {
  UI: {
    LABELS: {
      title: 'SAFE WebRTC Signalling',
      activePubName: 'Active Public Name',
      newVideoCall: 'New video call',
      invites: 'Invites',
      switch: 'Switch',
      connect: 'Connect',
      cancel: 'Cancel',
      activate: 'Activate',
      friendIdPlaceholder: 'Enter remote peer\'s Public Name',
      chooseInvite: 'Choose an invite',
      noInvites: 'No invites available',
      noPublicName: 'No Public Name available to switch',
      choosePublicName: 'Select Public Name',
    },
    MESSAGES: {
      authorise: 'Authorising with Authenticator',
      authoriseFail: 'Authorisation failed',
      initialise: 'Initialising application',
      initialiseFail: 'Failed to initialise application',
      noPubNameFound: 'No Public Name found.',
      fetchPublicName: 'Fetching Public Names',
      fetchPublicNameFail: 'Unable to fetch Public Names',
      fetchInvites: 'Fetching invites',
      fetchInvitesFail: 'Unable to fetch invites',
      activatePublicName: 'Activating Public Name',
      activatePublicNameFail: 'Failed to activate Public Name',
      connecting: 'Connecting with remote peer',
      connectingFail: 'Failed to connect with remote peer',
      invalidPublicName: 'Invalid Public Name',
      cantInviteYourself: 'Can\'t invite yourself',
      inviteAcceptFail: 'Failed to accept invite',
      callAcceptFail: 'Failed after remote peer accepted the call',
      checkCallingFail: 'Failed to accept remote peer call',
      initialisationFail: 'Failed to initialise the connection',
      sendInviteFail: 'Failed to send invitation to remote peer',
      callingFail: 'Failed to call remote peer',
      connectingFail: 'Failed to connect with remote peer'
    },
    DEFAULT_LOADING_DESC: 'Please wait...',
    CONN_MSGS: {
      INIT: 'Initialising connection',
      SEND_INVITE: 'Invite sent. Waiting for the remote peer to accept the connection',
      INVITE_ACCEPTED: 'Invite accepted. Establishing connection with remote peer',
      CALLING: 'Remote peer accepted invite. Establishing connection',
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
        { url: 'STUN_SERVER_URL' }, // fill STUN Server url
        {
          url: 'TURN_SERVER_URL', // fill turn server url
          credential: 'TURN_PASSWORD', // fill turn server password
          username: 'TURN_USERNAME' // fill turn server username
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
  CRYPTO_KEYS: {
    SEC_SIGN_KEY: '__SEC_SIGN_KEY__',
    PUB_SIGN_KEY: '__PUB_SIGN_KEY__',
    SEC_ENC_KEY: '__SEC_ENC_KEY__',
    PUB_ENC_KEY: '__PUB_ENC_KEY__',
  },
};
