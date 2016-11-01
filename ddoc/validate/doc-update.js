module.exports = function(newDoc, oldDoc, userCtx) {

    // Don't validate documents being deleted
    if (newDoc._deleted) {
        return;
    }
    if (!newDoc.type) {
        return
    }
    if (!newDoc.data) {
        throw({forbidden : 'A document with a type must have a data property'});
    }
    var schema;
    try {
        schema = require('views/lib/types/' + newDoc.type);
    } catch(e) {
        // no schema found
        return;
    }

    var JSV = require("lib/jsv").JSV,
        env = JSV.createEnvironment('json-schema-draft-03'),
        report = env.validate(newDoc.data, schema),
        property;

    if (report.errors.length) {
        // Can only throw one error at a time (without stringifying)
        // See issue: COUCHDB-1635
        property = report.errors[0].uri.split('/')[1];
        throw({forbidden: report.errors[0].message + " : " + property});
    }
}