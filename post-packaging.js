#!/usr/bin/env node
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'example', alias: 'e', type: String,defaultOption: true, defaultValue: 'web_hosting_manager' },
]

const options = commandLineArgs(optionDefinitions)
const pkg = require(`./${options.example}/package.json`);

let targetDir = path.resolve( __dirname, options.example, 'release');

let isEmailApp = false;

if( options.example === 'email_app')
{
	isEmailApp = true;
	targetDir = path.resolve( __dirname, options.example, 'out');

}

const platform = process.platform;
const OSX = 'darwin';
const LINUX = 'linux';
const WINDOWS = 'win32';
const LOG_TOML = path.resolve( __dirname, 'log.toml');
const pkgName = pkg.name;

let PLATFORM_NAME;

let releaseFolder;
let dirForLog;

if (platform === OSX) {
  releaseFolder = path.resolve( targetDir, 'mac');

  if( isEmailApp )
  {
	  releaseFolder = path.resolve( targetDir, 'safe-mail-tutorial-darwin-x64');
  }

  dirForLog = path.resolve(releaseFolder, `${pkgName}.app/Contents/Frameworks/${pkgName} Helper.app/Contents/Resources`);
  PLATFORM_NAME = 'osx';
  fs.ensureDirSync(dirForLog);
}

if (platform === LINUX ) {
  releaseFolder = path.resolve(targetDir, 'linux-unpacked');

  if( isEmailApp )
  {
	releaseFolder = path.resolve( targetDir, 'safe-mail-tutorial-linux-x64');
  }

  dirForLog = releaseFolder;
  PLATFORM_NAME = LINUX;
  fs.ensureDirSync(dirForLog);
}

if (platform === WINDOWS ) {
  releaseFolder = path.resolve(targetDir, 'win-unpacked');
  if( isEmailApp )
  {
	releaseFolder = path.resolve( targetDir, 'safe-mail-tutorial-win32-x64');
  }

  dirForLog = releaseFolder;
  PLATFORM_NAME = 'win';
  fs.ensureDirSync(dirForLog);
}

const RELEASE_FOLDER_NAME = `${pkgName}-v${pkg.version}-${PLATFORM_NAME}-x64`;



// Add log where it's needed
fs.copySync(LOG_TOML, `${dirForLog}/log.toml`, { overwrite: true } );

//add version file
fs.outputFileSync(path.resolve(releaseFolder, 'version'), pkg.version);

// remove licenses
const removalArray = ['LICENSE.electron.txt','LICENSES.chromium.html', 'LICENSE'];

removalArray.forEach( ( file) =>
{
  fs.removeSync( `${releaseFolder}/${file}` );
})

console.log("Renaming package to:", path.resolve( targetDir,`${RELEASE_FOLDER_NAME}` ));
//rename release folder
fs.moveSync( releaseFolder, path.resolve( targetDir,`${RELEASE_FOLDER_NAME}` ), { overwrite: true } );


// create a file to stream archive data to.
var output = fs.createWriteStream( path.resolve( targetDir, `${RELEASE_FOLDER_NAME}.zip` ) );
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');

  // remove osx junk
  if (platform === OSX) {
    console.log('run to remove zipped nonsense: zip -d release/web-hosting-manager-v0.4.1-osx-x64.zip  *.DS_Store');

	exec(`zip -d ${targetDir}/${RELEASE_FOLDER_NAME}.zip *.DS_Store`, (error, stdout, stderr) => {
	  if (error) {
	    console.error(`exec error: ${error}`);
	    return;
	  }
	  console.log(`stdout: ${stdout}`);
	  console.log(`stderr: ${stderr}`);
	});
  }

});

console.log("Zipping...");

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn( err )
  } else {
    console.error( err )
    throw err;
  }
});
// pipe archive data to the file
archive.pipe(output);
archive.directory(`${targetDir}/${RELEASE_FOLDER_NAME}`, RELEASE_FOLDER_NAME);
archive.finalize();
