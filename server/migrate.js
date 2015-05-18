var migrate = (function() {

	var public = {},
		private = {};

	public.module = {};
	public.module.fs = require('fs');
	private._response = {};

	public.init = function( response ) {

		private._response = response;

		//private._response.writeHead( 200, headers );
		private._response.end( 'Welcome to the Migration Wizard' );

	}

	return public;
})();

module.exports = migrate;