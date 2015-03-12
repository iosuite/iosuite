module.exports = function() {

	var public = {},
		private = {};

	private._https = require('https');
	private._http = require('http');
	
	private._ssl = require('ssl-root-cas').inject().addFile( app.module.path.join('/var', 'certs', 'my-root-ca.crt.pem'));

	private._httpServer;
	private._httpsServer;

	private._secureServerOptions = {
		key: app.module.fs.readFileSync( app.module.path.join('/var', 'certs', 'my-server.key.pem' ) ),
		cert: app.module.fs.readFileSync( app.module.path.join('/var', 'certs', 'my-server.crt.pem') )
	};

	public.start = function( securePort, insecurePort, callback ) {

		private._secureServer = private._https.createServer( private._options, callback );
		private._secureServer.listen( securePort );

		private._insecureServer = private._http.createServer( private._return, callback );
		private._insecureServer.listen( insecurePort );

	}

	return public;
};