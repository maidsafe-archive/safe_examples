export const trimErrorMsg = (msg) => {
  let index = msg.indexOf('->');
  index = (index === -1) ? index : index + 2;
  return msg.slice(index).trim()
};
