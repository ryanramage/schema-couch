module.exports = function (obj, path) {
  var get = new Function('_', 'return _.' + path);
  return get(obj);
};