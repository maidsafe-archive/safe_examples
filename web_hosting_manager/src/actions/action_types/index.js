import common from './common';
import authorisation from './authorisation';
import initialiser from './initialiser';
import publicNames from './public_names';
import services from './services';
import fileManager from './file_manager';

export default {
  ...common,
  ...authorisation,
  ...initialiser,
  ...publicNames,
  ...services,
  ...fileManager,
};
