var launch = (function() {

	var public = module.parent.iosuite,
		private = {};

	private._https = require('https');
	private._http = require('http');
	
	private._ssl = require('ssl-root-cas').inject().addFile( public.module.path.join('/var', 'certs', 'my-root-ca.crt.pem'));

	private._httpsServer;
	private._httpServer;

	private._secureServerOptions = {
		key: public.module.fs.readFileSync( public.module.path.join('/var', 'certs', 'my-server.key.pem' ) ),
		cert: public.module.fs.readFileSync( public.module.path.join('/var', 'certs', 'my-server.crt.pem') )
	};

	public.start = function( port, callback ) {

		/*private._httpsServer = private._https.createServer( private._secureServerOptions, callback );
		private._httpsServer.listen( port );
		console.log( 'Listening for https on port: ' + port );*/

		private._httpServer = private._http.createServer( callback );
		private._httpServer.listen( port );
		console.log( 'Listening for http on port: ' + port );

	}

	return public;
})();

module.exports = launch;