module.exports = function() {

	var public = {},
		private = {};

	private._return = 'success';

	private._response;

	private._requestFile;
	private._cacheFile;

	public.init = function( file, parameters, response ) {

		console.log( 'router' );

		private._response = response;

		private._return = private._readFile( file );

		return private._return;

	}

	private._readFile = function( file ) {

		var cacheHash = app.crypto.createHash('md5'),
			filePieces = 

		console.log( 'get file' );
		if( file.indexOf('.') >= 0 ) {

			private._requestFile = './' + app.application_directory + '/' + file.substr(0, file.lastIndexOf('.'));
			private._requestFileExt = file.split('.').pop();
		} else {
			private._requestFile = './' + app.application_directory + '/' + file + '.js';
			private._requestFileExt = '.js';
		}
		console.log( private._requestFile );

		/*
		 * Generate MD5 hash cache name
		 */
		cacheHash.update( private._requestFile );
		private._cacheFile = cacheHash.digest('hex');

		switch( app.environment ) {
			case 'development':
				/*
				 * If the app is in development, create a cache file and send
				 */
				app.module.fs.readFile( file, 'utf8', private._createCacheFile );
				break;
			default:
				/*
				 * If the app is in any other environment, read the cache if it exists otherwise create the file
				 * Note: The cache files shouldn't be saved to the repo, they will be created at first use
				 */
				break;
		}


	}

	private._createCacheFile = function( err, data ) {

		if( err == null ) {
			console.log( 'file found' );
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

			

			/*
			 * Run the file through the jshinter and show errors if needed
			 */
			app.module.child_process = app.module.child_process.exec();

			jsHintProcess = app.module.child_process( 'jshint ' + private._cacheFile, function(error, stdout, stderr) {
				if( error === null ) {
					private._writeResponse( 200, stdout, { 'Content-Type': 'text/plain', 'charset': 'utf-8' });
				}
			});

		} else {

			private._writeResponse( 404, err.toString() );

		}

		console.log( 'file written' );

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

		var templateUrl = app.server_url + 'templates/html/' + file + '.html',
			templateScript = 'nlapiRequestURL(' + templateUrl + ').getBody();';

		return data.replace( match, templateScript );

	};

	private._setupStyle = function( match, file ) {

		var styleUrl = app.server_url + 'templates/styles/' + file + '.css',
			styleHref = 'nlapiRequestURL(' + styleUrl + ').getBody();';

		return data.replace( match, styleHref );

	};

	private._setupClient = function( match, file ) {

		var scriptUrl = app.server_url + 'templates/scripts/' + file + '.js',
			scriptSrc = 'nlapiRequestURL(' + scriptUrl + ').getBody();';

		return data.replace( match, scriptSrc );

	};

	private._setupLibrary = function( match, file ) {

		var scriptUrl = app.server_url + 'libraries/' + file + '.js',
			library = 'nlapiRequestURL(' + scriptUrl + ').getBody();';

		return data.replace( match, library );
	}

	return public;
};