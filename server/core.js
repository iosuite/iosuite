var core = (function() {

	var public = module.parent.iosuite,
		private = {};

	private._return = 'success';

	private._response;

	private._requestFile = '';
	private._cacheFile = '';
	private._cacheFileFull = '';

	public.init = function( file, parameters, response ) {

		private._response = response;

		private._return = private._readFile( file );

		return private._return;

	}

	private._readFile = function( file ) {

		var cacheHash = public.module.crypto.createHash('md5'),
			filePieces = '';

		if( file.indexOf('.') >= 0 ) {

			private._requestFile = './' + public.setting('general','application_directory') + '/' + file.substr(0, file.lastIndexOf('.'));
			private._requestFileExt = file.split('.').pop();
		} else {
			private._requestFile = './' + public.setting('general','application_directory') + '/' + file;
			private._requestFileExt = '.js';
		}

		/*
		 * Generate MD5 hash cache name
		 */
		cacheHash.update( private._requestFile );
		private._cacheFile = cacheHash.digest('hex');
		private._cacheFileFull = './' + public.setting('general','application_directory') + '/cache/' + private._cacheFile + private._requestFileExt;

		switch( public.setting('general','environment') ) {
			case 'development':
				/*
				 * If the app is in development, create a cache file and send
				 */
				public.module.fs.readFile( private._requestFile + private._requestFileExt, 'utf8', private._createCacheFile );
				break;
			case 'production':
			case 'staging':
				/*
				 * If the app is in any other environment, read the cache if it exists otherwise create the file
				 * Note: The cache files shouldn't be saved to the repo, they will be created at first use
				 */
				public.module.fs.readFile( private._cacheFileFull, 'utf8', private._outputCacheFile );
				break;
		}

	}

	private._outputCacheFile = function( error, data ) {

		if( error === null ) {
			private._writeResponse( 200, data, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
		} else {
			public.module.fs.readFile( private._requestFile + private._requestFileExt, 'utf8', private._createCacheFile );
		}

	}

	private._createCacheFile = function( err, data ) {

		if( err == null ) {

			var lines, count,
				matches = data.match(/{{(.*)}}/g),
				tag = '',
				md5sum, newFile;

			for( var match in matches ) {

				var tag = matches[ match ].replace('{{','').replace('}}','').split(':'),
					call = '_setup' + tag[0].charAt(0).toUpperCase() + tag[0].slice(1);

				if( typeof private[ call ] == 'function' ) {
					data = private[ call ]( matches[ match ], tag[1] );
				}

			}

			newFile = public.setting('general','server_directory') + public.setting('general','application_directory') + '/cache/' + private._cacheFile + private._requestFileExt;

			public.module.fs.writeFileSync( newFile, data );
			

			/*
			 * Run the file through the jshinter and show errors if needed
			 */
			if( public.setting('general','environment') == 'development' ) {
				console.log( 'jshint --show-non-errors --reporter=' + public.setting('general','server_directory') + 'server/jshint_reporter.js ' + newFile );
				public.module.child_process.exec( 'jshint --show-non-errors --reporter=' + public.setting('general','server_directory') + '/server/jshint_reporter.js' + newFile, function(error, stdout, stderr) {
					if( stdout.toString() == '' ) {
						console.log( error );
						private._writeResponse( 200, stderr.toString(), { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
						//public.module.fs.readFile( private._cacheFileFull, 'utf8', private._outputCacheFile );
					} else {
						private._writeResponse( 200, stdout, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
					}

				});
			}

		} else {
			var fourohfour = './server/404.js';
			public.module.fs.readFile( fourohfour, 'utf8', function( error, data ){
				if( error === null ) {
					private._writeResponse( 200, data, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
				} else {
					private._writeResponse( 404, error.toString() );
				}
			} );

		}

	};

	private._writeResponse = function( code, output, headers ) {

		if( headers == null ) {
			private._response.writeHead( code );
		} else {
			private._response.writeHead( code, headers );
		}
		private._response.write( output );
		private._response.end();
	}

	/*
	 * Convert template call to NetSuite getBody
	 */
	private._setupTemplate = function( match, file ) {

		var templateUrl = public.setting('general','server_url') + 'templates/html/' + file + '.html',
			templateScript = 'nlapiRequestURL(' + templateUrl + ').getBody();';

		return data.replace( match, templateScript );

	};

	private._setupStyle = function( match, file ) {

		var styleUrl = public.setting('general','server_url') + 'templates/styles/' + file + '.css',
			styleHref = 'nlapiRequestURL(' + styleUrl + ').getBody();';

		return data.replace( match, styleHref );

	};

	private._setupClient = function( match, file ) {

		var scriptUrl = public.setting('general','server_url') + 'templates/scripts/' + file + '.js',
			scriptSrc = 'nlapiRequestURL(' + scriptUrl + ').getBody();';

		return data.replace( match, scriptSrc );

	};

	private._setupLibrary = function( match, file ) {

		var scriptUrl = iosuite.server_url + 'libraries/' + file + '.js',
			library = 'nlapiRequestURL(' + scriptUrl + ').getBody();';

		return data.replace( match, library );
	}

	return public;
})();

module.exports = core;