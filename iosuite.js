var iosuite = (function(){

	var public = {},
		private = {};

	private._settingsPath = './settings.ini';
	private._settings = {};

	public.module = {};
	private._modules = ['path', 'fs', 'url', 'child_process', 'crypto', 'ini'];

	private._server = {};
	private._core = {};
	private._urlObject = {};
	private._route = '';
	private._parameters = '';

	private._construct = function() {

		/*
		 * Make the modules inherit from public
		 */
		module.iosuite = Object.create( public );

		for( var i = 0; i < private._modules.length; i++ ) {
			public.module[ private._modules[ i ] ] = require( private._modules[ i ] );
		}

		private._settings = public.module.ini.parse( public.module.fs.readFileSync( private._settingsPath, 'utf-8' ) );
		
		/*
		 *  When restarting the server, clear the cache
		 */
		var cacheDirectory = public.setting('general','server_directory') + '/' + public.setting('general','application_directory') + '/cache/',
			cacheFiles = public.module.fs.readdirSync( cacheDirectory );

		for( var i = 0; i < cacheFiles.length; i++ ) {
			if( cacheFiles[i] != 'index.html' ) {
				public.module.fs.unlink( cacheDirectory + cacheFiles[i] );
			}
		}

		/*
		 *  Start the server
		 */
		private._server = require('./server/launch');
		private._core = require('./server/core');

		private._server.start( 8888, 8080, private._run );

	};

	private._run = function( request, response ) {

		if( public.setting('general', 'environment') != 'production' ) {
			console.log( 'request received' );
			console.log( '-----------REQUEST START-----------' );
			console.log( request.headers['user-agent'] );
			console.log( request.connection.remoteAddress );
			console.log( request.url );
			console.log( '-----------REQUEST END-----------' );
		}
		var routeArray = [];

		private._urlObject = public.module.url.parse( request.url, true );

		private._route = private._urlObject.pathname.substring(1);

		private._parameters = private._urlObject.query;

		private._core.init( private._route, private._parameters, response );

	};

	public.setting = function( section, key ) {
		return private._settings[section][key];
	};

	public.version = function() {
		return private._version;
	};

	private._construct();

	return public;

})();