var iosuite = (function(){

	var public = {},
		private = {},
		m = {};

	private._settingsPath = './settings.ini';
	private._settings = {};

	private._modules = ['express', 'path', 'fs', 'url', 'child_process', 'crypto', 'ini', 'mime', 'util', 'node-uuid'];

	private._templates = require('./server/templates');
	public.app = {};

	private._construct = function() {

		/*
		 * Expose public to the submodules
		 */
		m.iosuite = Object.create( public );

		for( var i = 0; i < private._modules.length; i++ ) {
			m[ private._modules[ i ].replace('-', '_') ] = require( private._modules[ i ] );
		}

		try {
			private._settings = m.ini.parse( m.fs.readFileSync( private._settingsPath, 'utf-8' ) );
		} catch(e) {
			console.log('settings.ini file does not exist');
		}

		/*
		 *  Setup Express
		 */
		public.app = m.express();

		/*
		 *  When restarting the server, clear the cache
		 */
		var cacheDirectory = public.setting('application','root') + public.setting('application','directory') + '/cache/',
			cacheFiles = m.fs.readdirSync( cacheDirectory );

		for( var i = 0; i < cacheFiles.length; i++ ) {
			if( cacheFiles[i] != 'index.html' ) {
				m.fs.unlink( cacheDirectory + cacheFiles[i] );
			}
		}

		/*
		 *  Start the server
		 */
		private._templates.init( public, m );
		public.app.listen( public.setting('server','port') );//, private._run );

		public.app.set('views', __dirname + '/server/views');
		public.app.use('/', function(request, response, next) {
			var origin = ( public.setting('application','environment') == 'production' ) ? 'https://system.netsuite.com' : 'https://system.sandbox.netsuite.com';
			response.header("Access-Control-Allow-Origin", origin);
			response.header("Access-Control-Allow-Headers", "X-Requested-With");
			next();
		});

		public.app.use( private._templates.check );
		public.app.use( '/assets', m.express.static('assets') );

		private._core = require('./server/core');
		private._core.init( public, m );

		public.app.use(function(request, response){
			var fourohfour = './server/views/404.html';
			m.fs.readFile( fourohfour, 'utf8', function( error, data ){
				response.send( data );
				response.end();
			} );

		});

	};

	public.setting = function( section, key ) {
		return private._settings[section][key].trim();
	};

	public.version = function() {
		return private._version;
	};

	private._construct();

	return public;

})();