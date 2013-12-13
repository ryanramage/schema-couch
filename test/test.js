var test = require('tape');
var ddoc = require('../ddoc');

var list_by_type = require('../ddoc_libs/views/lib/list_by_type');

test('schema with no list', function(t){
  var schema = {},
      doc = { type: 'apple' },
      mockEmit = function(key, val){
        t.deepEqual(key, ['apple'], 'emits an array length 1 with doc.type');
        t.equal(val, null, 'emits value of null');
        t.end();
      };
  list_by_type(schema, doc, mockEmit);
})

test('schema with list, no value property', function(t){
  var schema = { list:{} },
      doc = { type: 'apple' },
      mockEmit = function(key, val){
        t.deepEqual(key, ['apple'], 'emits an array length 1 with doc.type');
        t.equal(val, null, 'emits value of null');
        t.end();
      };
  list_by_type(schema, doc, mockEmit);
})