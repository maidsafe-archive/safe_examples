// Use new ES6 modules syntax for everything.
// import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
// import jetpack from 'fs-jetpack'; // module loaded from npm
import Uploader from './backend/uploader';
import * as templateFile from './backend/create_template_file';

class Utils {
  constructor(remote, Uploader, templateFile) {
    this.remote = remote;
    this.Uploader = Uploader;
    this.createTemplateFile = templateFile.createTemplateFile;
  }

  closeApp() {
    this.remote.getCurrentWindow().close();
  }
};
window.uiUtils = new Utils(remote, Uploader, templateFile);
