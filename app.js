var app = (function(){

	var public = {},
		private = {};

	private._server = require('./server/launch');
	private._core = require('./server/core');
	
	public.module = {};
	private._modules = ['path', 'fs', 'url', 'child_process', 'crypto'];

	public.application_directory = 'application';
	public.server_url = '//23.253.35.20:8888/';
	public.environment = 'development';
	public.version = '0.0.1';

	private._constructor = function() {

		for( var i = 0; i < private._modules.length; i++ ) {
			public.module[ private._modules[ i ] ] = require( private._modules[ i ] );
		}

		/*
		 *  Load server
		 */
		private._server.start( 8888, 8080, private._run );

	};

	private._run = function( request, response ) {

		console.log( 'request received' );
		console.log( '-----------REQUEST START-----------' );
		console.log( request.headers['user-agent'] );
		console.log( request.connection.remoteAddress );
		console.log( request.url );
		console.log( '-----------REQUEST END-----------' );
		var routeArray = [];

		private._urlObject = private._url.parse( request.url, true );

		private._route = private._urlObject.pathname.substring(1);

		private._parameters = private._urlObject.query;

		console.log( 'Call File module' );
		private._core.init( private._route, private._parameters, response );

	}

	private._constructor();

	return public;

});

