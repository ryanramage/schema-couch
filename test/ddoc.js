var assert = require('assert'),
    ddoc = require('../ddoc');


// var resp = ddoc.shows.schemas.call(ddoc, null, {query:{}});
// assert.equal('application/json', resp.headers['Content-Type']);
// var schemas = JSON.parse(resp.body);
// console.log(schemas);
// assert.equal(schemas.ok, false);


ddoc.views.lib.types.quiz = require('./schemas/quiz');


var resp = ddoc.shows.schemas.call(ddoc, null, {query:{}});
assert.equal('application/json', resp.headers['Content-Type']);
var schemas = JSON.parse(resp.body);
console.log(schemas);

assert.equal(schemas.ok, false);

//console.log(resp);