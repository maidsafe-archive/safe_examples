var ffi = require('ffi');

process.on('message', function(request) {
  var api;

  this.load = function(path) {
    api = ffi.Library(path, {
      'create_sub_directory': ['int', ['string', 'bool']]
      //'create_file': ['int', ['string', IntArray, 'int']],
      //'register_dns': ['int', ['string', 'string', 'string']]
    });
    process.send('Registered');
  };

  this._init = function() {
    this.load(request.path);
  }.bind(this)();

});

process.on('uncaughtException',function(err) {
 process.send(err.message);
});