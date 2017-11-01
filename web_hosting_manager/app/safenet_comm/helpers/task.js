export default class Task {
  /* eslint-disable class-methods-use-this */
  execute(callback) {
    /* eslint-enable class-methods-use-this */
    const error = new Error('Task class not implemented');
    callback(error);
  }
}
