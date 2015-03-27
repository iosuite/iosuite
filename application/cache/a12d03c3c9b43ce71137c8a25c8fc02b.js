(function(){

	var private = {},
		public = {};

	public.readCall = function( dataIn ) {
		nlapiLogExecution('DEBUG','sample ran','This Sample was successfully called');
		return {};
	}

	return public;
})();