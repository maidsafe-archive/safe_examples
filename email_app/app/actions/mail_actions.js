import ACTION_TYPES from './actionTypes';

export const setMailProcessing = () => ({
  type: ACTION_TYPES.SET_MAIL_PROCESSING
});

export const clearMailProcessing= _ => ({
  type: ACTION_TYPES.CLEAR_MAIL_PROCESSING
});

export const setActiveMail = (data) => ({
  type: ACTION_TYPES.SET_ACTIVE_MAIL,
  data
});

export const clearInbox = () => ({
  type: ACTION_TYPES.SET_ACTIVE_MAIL
});

export const cancelCompose = () => ({
  type: ACTION_TYPES.CANCEL_COMPOSE
});
