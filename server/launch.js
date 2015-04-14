var launch = (function() {

	var public = module.parent.iosuite,
		private = {};

	private._http = require('http');
	private._httpServer;

	public.start = function( port, callback ) {

		private._httpServer = private._http.createServer( callback );
		private._httpServer.listen( port );
		console.log( 'Listening for http on port: ' + port );

	}

	return public;
})();

module.exports = launch;