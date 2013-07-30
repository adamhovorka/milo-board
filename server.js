var http = require("http");
var url  = require("url");
var stat = require("node-static");
var fork = require("child_process");
var querystring = require("querystring");

var serv = new stat.Server("./webroot", { cache: 0 });

function getPost(req, res) {
	if (req.method == "POST" || req.method == "PUT") {
                var queryData = "";

        req.on('data', function(data) {
                queryData += data;
                        if(queryData.length > 1e6) {
                                queryData = "";
                                res.writeHead(413, {'Content-Type': 'text/plain'});
                                req.connection.destroy();
                        }
                });

                req.on('end', function() {
                        res.post = querystring.parse(queryData);
                        handle(req, res, queryData);
		});
	} else {
		handle(req, res);
	}
}

function handle(req, res, query) {
	if (/\/speak\/?.*/.test(url.parse(req.url).pathname)) {
		var content = "";
		try {	content = JSON.parse(query).content;
			fork.exec("espeak \"" + content + "\""); } catch (e) {}
		//console.log(content);
		res.end(content);
	} else {
		serv.serve(req, res);
	}
}

http.createServer(getPost).listen(8080);
