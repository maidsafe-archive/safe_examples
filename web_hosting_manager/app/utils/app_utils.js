export const trimErrorMsg = (msg) => {
  let index = msg.indexOf('->');
  index = (index === -1) ? 0 : index + 2;
  return msg.slice(index).trim()
};

export const domainCheck = (str) => {
  const regex = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9](?:)+$/;
  return regex.test(str);
};
