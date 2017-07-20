import { I18n } from 'react-redux-i18n';

export const MD_TARGET = {
  'PUBLIC_ID': 'publicId',
  SERVICE: 'service'
};

export const trimErrorMsg = (msg) => {
  let index = msg.indexOf('->');
  index = (index === -1) ? 0 : index + 2;
  return msg.slice(index).trim()
};

export const parseErrorMsg = (err, target) => {
  switch(err.code) {
    case -102: {
      return I18n.t('messages.accountAlreadyExists');
    }
    case -107: {
      if (target === MD_TARGET.SERVICE) {
        return I18n.t('messages.fileAlreadyExists');
      } else if (target == MD_TARGET.PUBLIC_ID) {
        return I18n.t('messages.serviceAlreadyExists');
      } else {
        return I18n.t('messages.entryAlreadyExists');
      }
    }
    case -108: {
      if (target === MD_TARGET.SERVICE) {
        return I18n.t('messages.fileNotFound');
      } else if (target == MD_TARGET.PUBLIC_ID) {
        return I18n.t('messages.serviceNotFound');
      } else {
        return I18n.t('messages.tooManyEntries');
      }
    }
    case -109: {
      if (target === MD_TARGET.SERVICE) {
        return I18n.t('messages.noMoreFiles');
      } else if (target == MD_TARGET.PUBLIC_ID) {
        return I18n.t('messages.noMoreService');
      } else {
        return I18n.t('messages.keyNotFound');
      }
    }
    case -113: {
      return I18n.t('messages.insufficientAccBalance');
    }
    default: {
      return trimErrorMsg(err.message);
    }
  }
};

export const domainCheck = (str) => {
  const regex = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9](?:)+$/;
  return regex.test(str);
};
