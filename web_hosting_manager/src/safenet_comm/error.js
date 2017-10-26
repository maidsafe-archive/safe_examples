import CONSTANTS from '../constants';

class Err extends Error {
  constructor(code, message) {
    super();
    this.message = message;
    this.__proto__.code = code;
  }
}

export default (code, msg) => new Err(code, msg);
