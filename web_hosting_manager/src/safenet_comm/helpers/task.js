export default class Task {
  /* eslint-disable class-methods-use-this */
  execute(callback) {
    /* eslint-enable class-methods-use-this */
    const error = new Error(I18n.t('messages.notImplemented'));
    callback(error);
  }
}
