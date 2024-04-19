const http = require('node:http');

http.createServer((req, res) => {
    res.write('im alive');
    res.end();
}).listen(8000);