class Err extends Error {
  constructor(code, message) {
    super();
    this.message = message;
    /* eslint-disable no-proto */
    this.__proto__.code = code;
    /* eslint-enable no-proto */
  }
}

export default (code, msg) => new Err(code, msg);
