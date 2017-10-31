import Task from './task';
import CONSTANTS from '../../constants';

export default class EmptyDirTask extends Task {
  constructor() {
    super();
    this.errorMsg = 'Uploading empty folders is not supported/allowed';
  }

  execute(callback) {
    const error = new Error(this.errorMsg);
    error.code = CONSTANTS.ERROR_CODE.EMPTY_DIR;
    callback(error, { isFile: false, isCompleted: true, size: 1 });
  }
}
