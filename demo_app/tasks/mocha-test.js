'use strict'

var gulp = require('gulp');
var pathUtil = require('path');
var childProcess = require('child_process');

var gulpPath = pathUtil.resolve('./node_modules/.bin/electron-mocha');
if (process.platform === 'win32') {
  gulpPath += '.cmd';
}

process.env['mocha-unfunk-style'] = 'plain';

var runMochaTests = function() {
  childProcess.spawn(gulpPath, [
    '--renderder',
    '--compilers',
    'js:babel-core/register',
    '--timeout',
    '30000',
    '-R',
    'mocha-unfunk-reporter',
    './tests/*'
  ], {
    stdio: 'inherit'
  });
}

gulp.task('test', runMochaTests);
