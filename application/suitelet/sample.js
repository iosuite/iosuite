(function(){

	var private = {};

	public.libraries.global = {{library:global}};

	public.load = function( dataIn ) {
		
		var response = '',
			context = nlapiGetContext(),
			html = {{template:sample}},
			tags = {};

		tags.company = context.getCompany();
		tags.environment = context.getEnvironment();
		tags.version = context.getVersion();
		tags.email = context.getEmail();
		tags.username = 'Hi there ' + context.getName() + "!";
		//tags.jobtitle = context
		tags.userid = context.getUser();

		response = public.libraries.global.mapTags( html, tags );

		return response;

	};

	return public;

})();