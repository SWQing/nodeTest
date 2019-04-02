const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
let db = mongoose.connection;
db.on('open', function () {
    console.log('mongodb connection successful！');
})
db.on('error', function () {
    console.log('mongodb connection fail!');
})