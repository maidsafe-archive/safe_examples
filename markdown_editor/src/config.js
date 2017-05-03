// CONFIGURATION
import pkg from './../package.json';

// Theme for the editor
// try 'elegant' or 'material'
// see all: https://codemirror.net/demo/theme.html
export const EDITOR_THEME = 'mdn-like';

// GLOBAL CONSTANTS
export const APP_NAME = "SAFE Markdown Editor";
export const APP_VERSION = pkg.version;
export const APP_ID = 'net.maidsafe.examples.markdown-editor';
export const TYPE_TAG = 15463;
export const APP_INFO = {
  id: APP_ID,
  name: APP_NAME,
  vendor: 'MaidSafe.net Ltd.',
  scope: ''
};

export const CONTAINERS = {
  '_public': ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
};
