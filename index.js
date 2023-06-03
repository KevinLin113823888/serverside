var app = require('./app');

port = process.env.PORT || 9000;


let server = app.listen(port, () => console.log("Backend server live on " + port));

module.exports = server;