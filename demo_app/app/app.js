// Use new ES6 modules syntax for everything.
// import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
// import jetpack from 'fs-jetpack'; // module loaded from npm
import Uploader from './backend/uploader';
import Downloader from './backend/file_downloader';
import * as templateFile from './backend/create_template_file';

class Utils {
  constructor() {
    this.remote = remote;
    this.Uploader = Uploader;
    this.createTemplateFile = templateFile.createTemplateFile;
    this.Downloader = Downloader;
  }

  closeApp() {
    this.remote.getCurrentWindow().close();
  }
}
window.uiUtils = new Utils();
