import ACTION_TYPES from './actionTypes';

export const setInitializerTask = (task) => ({
  type: ACTION_TYPES.SET_INITIALIZER_TASK,
  task
});

export const authoriseApplication = (data) => {
  return {
    type: ACTION_TYPES.AUTHORISE_APP,
    payload: {
      request: {
        method: 'post',
        url: '/auth',
        data: data
      }
    }
  };
};

export const pushToInbox = (data) => ({
  type: ACTION_TYPES.PUSH_TO_INBOX,
  data
});

export const clearInbox = _ => ({
  type: ACTION_TYPES.CLEAR_INBOX
});
