var arangojs = require('arangojs');

// const host = '159.203.44.118'
const host = 'localhost'
const port = '8529'
const username = 'root'
const password = '24687531'
const databasename = '_system'


db = new arangojs.Database({
    url: `http://${username}:${password}@${host}:${port}`,
    databaseName: databasename,
});


module.exports = db;