(function(){

	var private = {},
		public = {};

	public.load = function( dataIn ) {
		console.log('test');
		nlapiLogExecution();
		private._error();
	}

	return public;
})();