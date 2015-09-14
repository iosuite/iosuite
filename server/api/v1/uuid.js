var api = (function() {

	var public = {},
		private = {},
		m = {};

	public.init = function( app, modules ) {

		m = modules;
		public = app;

	};

	public.get = function() {

		var uuid = m.node_uuid.v4();
		return { code: 200, data: uuid, headers: { 'Content-Type': 'text/plain', 'charset': 'utf-8' } };

	}

	return public;
})();

module.exports = api;