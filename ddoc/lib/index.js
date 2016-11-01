var loadFile = require('../utils').loadFile;

module.exports = {
  environments: loadFile('lib/environments'),
  jsv: loadFile('lib/jsv'),
  validate: loadFile('lib/validate'),
  uri: {
    uri: loadFile('lib/uri/uri'),
    schemes: {
      urn: loadFile('lib/uri/schemes/urn')
    }
  }
}



