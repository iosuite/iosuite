var templates = (function() {

	var public = {},
		private = {},
		m = {};

	private._library = require('./library');

	public.init = function( app, modules ) {

		m = modules;
		public = app;

	};

	public.check = function( request, response, next ) {
		var parts = m.url.parse(request.url);

		// find all html assets
		var match = parts.pathname.match(/^\/assets\/(templates|styles|scripts)([a-zA-Z0-9\/]*)([a-zA-Z0-9]*).(html|htm|css|js|txt)/);
		if( match ) {
			m.fs.exists( './' + parts.pathname, function (exists) {

				if( !exists ) {
					// pass on the results to the static middleware
					next();
				} else {
					asset = private._library.format( m.fs.readFileSync( './' + parts.pathname, 'utf-8' ), {site_url: public.setting('server','url'), asset_dir: public.setting('application','assets'), environment: public.setting('application','environment')} );
				}

				var contentType = m.mime.lookup( './' + parts.pathname ),
				headers = {};

				headers['Content-Type'] = contentType;
				headers["Access-Control-Allow-Headers"] = 'Origin, X-Requested-With, Content-Type, Accept';
				headers["Access-Control-Allow-Origin"] = ( public.setting('application','environment') == 'production' ) ? 'https://system.netsuite.com' : 'https://system.sandbox.netsuite.com';

				response.writeHead( 200, headers );
				response.end( asset, 'binary' );

			});
		} else {
			next();
		}
	};

	return public;
})();

module.exports = templates;