(function(){

	var private = {};

	private._response = function() {
		nlapiLogExecution( 'DEBUG', 'Nothing to execute', 'Call contained no data');
		return {error:'No Data'};
	};

	public.load = function() {
		return private._response();
	};

	public.readCall = function() {
		return private._response();
	};

	return public;

})();