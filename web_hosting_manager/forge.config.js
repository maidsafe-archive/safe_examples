const os = require('os');
const pkg = require('./package.json');

const icon = {
  darwin: './resources/icon.icns',
  linux: './resources/icon.png',
  win32: './resources/icon.ico'
};

module.exports = {
  'make_targets': {
    'win32': [
      'squirrel'
    ],
    'darwin': [
      'zip'
    ],
    'linux': [
      'deb',
      'rpm'
    ]
  },
  'electronPackagerConfig': {
    name: pkg.name,
    'app-bundle-id': 'net.maidsafe.demo.app.webhost',
    'app-category-type': 'public.app-category.tools',
    dir: './',
    icon: icon[os.platform()],
    'app-version': pkg.version,
    prune: true,
    archs: ['ia32', 'x64'],
    platform: ['linux', 'win32', 'darwin'],
    protocol: ['safe-bmv0lm1hawrzywzllnnhzmvob3n0aw5nbwfuywdlcg'],
    'protocol-name': ['safehostingmanager'],
    win32metadata: {
      CompanyName: pkg.author.name,
      FileDescription: pkg.description,
      ProductName: pkg.productName
    }
  },
  'electronWinstallerConfig': {},
  'electronInstallerDebian': {},
  'electronInstallerRedhat': {},
  'github_repository': {},
  'windowsStoreConfig': {}
};
