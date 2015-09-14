var core = (function() {

	var public = {},
		private = {},
		m = {};

	private._response;

	private._requestFile = '';
	private._cacheFile = '';
	private._cacheFileFull = '';
	private._library = require('./library');

	public.init = function( app, modules ) {

		m = modules;
		public = app;

		private._setupRoutes();

	};

	private._setupRoutes = function() {

		public.app.all('/', function(req, res, next) {
			var origin = ( public.setting('application','environment') == 'production' ) ? 'https://system.netsuite.com' : 'https://system.sandbox.netsuite.com';
			res.header("Access-Control-Allow-Origin", origin);
			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			next();
		});

		public.app.get('/restlet/*', private._scriptServe);
		public.app.get('/suitelet/*', private._scriptServe);
		public.app.get('/client/*', private._scriptServe);

		public.app.route('/api/*')
			.get( private._api )
			.post( private._api )
			.put( private._api )
			.delete( private._api );

	};

	private._scriptServe = function( request, response ) {

		var file = '';
		private._parseRequest( request );
		private._response = response;

		file = private._readFile();

	};

	/*
	 *  API Calls
	 */
	private._api = function( request, response ) {
		
		var method = request.method,
			api = {},
			returnObject = {};

		private._parseRequest( request );
		private._response = response;

		try {
			api = require( './' + private._file );
			api.init( public, m );
			returnObject = api[ method.toLowerCase() ]();
		} catch(e) {
			returnObject = false;
		}

		if( returnObject ) {
			private._writeResponse( returnObject.code || 404, returnObject.data || '', returnObject.headers || null );
		} else {
			private._writeResponse( 404, 'API Call does not exist');
		}
		
	};


	/*
	 *   Parse request
	 */
	private._parseRequest = function( request ) {
		private._urlObject = m.url.parse( request.url, true );

		private._file = private._urlObject.pathname.substring(1);

		private._parameters = private._urlObject.query;
	};


	/*
	 *   File handling
	 */
	private._readFile = function() {

		var cacheHash = m.crypto.createHash('md5'),
			filePieces = private._file.split('/'),
			requestFolder = './';

		if( private._file.indexOf('.') >= 0 ) {
			private._requestFile = requestFolder + private._file.substr(0, private._file.lastIndexOf('.'));
			private._requestFileExt = '.' + private._file.split('.').pop();
		} else {
			private._requestFile = requestFolder + public.setting('application','directory') + '/' + private._file;
			private._requestFileExt = '.js';
		}

		/*
		 * Generate MD5 hash cache name
		 */
		cacheHash.update( private._requestFile );
		private._cacheFile = cacheHash.digest('hex');
		private._cacheFileFull = './' + public.setting('application','directory') + '/cache/' + private._cacheFile + private._requestFileExt;

		switch( public.setting('application','environment') ) {
			case 'development':
				/*
				 * If the app is in development, create a cache file and send
				 */
				m.fs.readFile( private._requestFile + private._requestFileExt, 'utf8', private._createCacheFile );
				break;
			case 'production':
			case 'staging':
				/*
				 * If the app is in any other environment, read the cache if it exists otherwise create the file
				 * Note: The cache files shouldn't be saved to the repo, they will be created at first use
				 */
				m.fs.readFile( private._cacheFileFull, 'utf8', private._outputCacheFile );
				break;
		}

	};

	private._outputCacheFile = function( error, data ) {

		if( error === null ) {
			private._writeResponse( 200, data, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
		} else {
			m.fs.readFile( private._requestFile + private._requestFileExt, 'utf8', private._createCacheFile );
		}

	}

	private._createCacheFile = function( err, data ) {

		if( err == null ) {

			var lines, count,
				regex = new RegExp( '{{([a-zA-Z0-9_]*):?([a-zA-Z0-9_\/]*)?}}', 'ig'),
				md5sum, newFile;

			data = data.replace( regex, function(match, tag, options){
				var call = '_setup' + tag.charAt(0).toUpperCase() + tag.slice(1);
				
				if( typeof private[ call ] == 'function' && options != '}}' ) {
					return private[ call ]( options );
				} else {
					return match;
				}
			});

			data = data.replace(/[^'":]\/\/.*/g, function(match){
				return '/*' + match.replace('//','') + '*/';
			});

			newFile = public.setting('application','root') + public.setting('application','directory') + '/cache/' + private._cacheFile + private._requestFileExt;

			m.fs.writeFileSync( newFile, data );
			

			/*
			 * Run the file through the jshinter and show errors if needed
			 */
			if( public.setting('application','environment') == 'development' ) {
				//console.log( 'jshint --show-non-errors --reporter=' + public.setting('general','server_directory') + 'server/jshint_reporter.js ' + newFile );
				m.child_process.exec( 'jshint --show-non-errors --reporter=' + public.setting('application','root') + '/server/jshint_reporter.js' + newFile, function(error, stdout, stderr) {
					if( stdout.toString() == '' ) {
						console.log( error );
						//private._writeResponse( 200, stderr.toString(), { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
						m.fs.readFile( private._cacheFileFull, 'utf8', private._outputCacheFile );
					} else {
						private._writeResponse( 200, stdout, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
					}

				});
			} else {

				/*
				 *  For non-development environments, display the cache file
				 */
				m.fs.readFile( private._cacheFileFull, 'utf8', private._outputCacheFile );
			}

		} else {
			var fourohfour = './server/assets/404.js';
			m.fs.readFile( fourohfour, 'utf8', function( error, data ){
				if( error === null ) {
					private._writeResponse( 200, data, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
				} else {
					private._writeResponse( 404, error.toString() );
				}
			} );

		}

	};

	/*
	 * Convert template call to NetSuite getBody
	 */
	private._setupTemplate = function( file ) {

		var templateUrl = public.setting('server','url') + public.setting('application','assets') + '/templates/' + file + '.html',
			templateScript = 'nlapiRequestURL("' + templateUrl + '").getBody()';

		return templateScript;

	};

	private._setupStyle = function( file ) {

		var styleUrl = public.setting('server','url') + public.setting('application','assets') + '/styles/' + file + '.css',
			styleHref = 'nlapiRequestURL("' + styleUrl + '").getBody()';

		return styleHref;

	};

	private._setupClient = function( file ) {

		var scriptUrl = public.setting('server','url') + '/scripts/' + file + '.js',
			scriptSrc = 'nlapiRequestURL("' + scriptUrl + '").getBody()';

		return scriptSrc;

	};

	private._setupLibrary = function( file ) {

		var scriptUrl = ( file == 'global' ) ? './server/assets/global.js' : './' + public.setting('application','directory') + '/libraries/' + file + '.js',
			library = private._stripBackreference( m.fs.readFileSync(scriptUrl, 'utf8') ),
			library = ( file != 'global' ) ? private._library.format( library, {site_url: public.setting('server','url'), asset_dir: public.setting('application','assets'), environment: public.setting('application','environment')} ) : library;

		return private._replaceBackreference( library );
	};

	private._stripBackreference = function( text ) {
		var pattern = new RegExp(/(\$)((?! )(.))/g);

		return text.replace( pattern, '|{$1+$2}|' );
	};

	private._replaceBackreference = function( text ) {
		var pattern = new RegExp(/(\|{)(\$)(\+)(.)(}\|)/g);

		return text.replace( pattern, '$2$4' );
	};

	private._writeResponse = function( code, output, headers ) {

		private._response.status( code );
		if( headers != null ) {
			private._response.set( headers );
		}
		private._response.send( output );
		private._response.end();

	};

	return public;
})();

module.exports = core;