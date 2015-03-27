(function(){

	var private = {},
		public = {};

	public.readCall = function( dataIn ) {
		nlapiLogExecution('DEBUG','sample ran','This Sample was successfully called and in a user directory');
		return {};
	}

	return public;
})();