export const trimErrorMsg = (msg) => {
  let index = msg.indexOf('->');
  index = (index === -1) ? 0 : index + 2;
  return msg.slice(index).trim()
};

export const parseErrorMsg = (err) => {
  switch(err.code) {
    case -102: {
      return 'Account already exist';
    }
    case -107: {
      return 'Entry already exist';
    }
    case -108: {
      return 'Mutable data maximum size reached';
    }
    case -109: {
      return 'Key not found';
    }
    case -113: {
      return 'Network operation has reached its maximum';
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
