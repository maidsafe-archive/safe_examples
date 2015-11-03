# Safe DNS Example

An example application to demonstrate uploading files of a static website to the Safe network. 
This examples showcases features from the `safe_nfs` and `safe_dns` crates and also the IPC connection with Launcher. 
The application can not be run as a Standalone example. 
Can work only with [safe_launcher](https://github.com/maidsafe/safe_launcher)

## Prerequisites
  NodeJs should be installed

## Development

After cloning the repository, install npm and bower dependencies.
```
$ npm install
$ bower install
```

### Package the application

```
$ npm run build-win
$ npm run build-linux
$ npm run build-osx
```

`npm run build-{platform}` will build the project for 64bit binaries

Builds the app for OS X, Linux, and Windows, using [electron-packager](https://github.com/maxogden/electron-packager).

### Logging

Application by default Log level is 'info'

Log level can be explicitly set by passing `--LOG_LEVEL` command line argument.

Permitted values for LOG_LEVEL can be found [here](https://www.npmjs.com/package/npmlog#log-level-prefix-message)
