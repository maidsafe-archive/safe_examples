import { app } from 'electron';
const log = require( 'electron-log' );
const pkg = require('../package.json');

if(log.transports) {
  // Log level
  // error, warn, info, verbose, debug, silly
  log.transports.console.level = 'verbose';
  
  /**
  * Set output format template. Available variables:
  * Main: {level}, {text}
  * Date: {y},{m},{d},{h},{i},{s},{ms}
  */
  log.transports.console.format = '{level} {h}:{i}:{s}:{ms} {text}';
  log.transports.file.file = `./${pkg.name}-nodejs.log`;
  log.transports.file.level = 'info';
  log.transports.file.format = '{level} {y}/{m}/{d} {h}:{i}:{s}:{ms} {text}';
  
  // Set approximate maximum log size in bytes. When it exceeds,
  // the archived log will be saved as the log.old.log file
  log.transports.file.maxSize = 5 * 1024 * 1024;
}

export default log;
