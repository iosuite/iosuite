(function(){

	var public,
		private;

	private._response = function() {
		nlapiLogExecution( 'DEBUG', 'Nothing to execute', 'Call contained no data');
	}

	public.load = function() {
		return private._reponse();
	}

})();