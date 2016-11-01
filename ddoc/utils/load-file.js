var fs = require('fs');
var path = require('path');

module.exports = function (filePath) {
  var finalPath = path.join(__dirname, '../../ddoc_libs', filePath + '.js');

  //console.log('loading: ', __filename);
  return fs.readFileSync(finalPath).toString();
}
