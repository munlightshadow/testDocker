var http = require('http');
	
http.createServer(function (_, response) {
	response.writeHead(200, {
             "Content-Type": "text/plain"
        });
	response.end("Hello World\n");
})
.listen(8080);