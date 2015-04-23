(function(){

	var private = {};

	public.libraries.global = {{library:global}};

	public.load = function( dataIn ) {
		
		var response = '',
			context = nlapiGetContext(),
			html = {{template:sample}},
			tags = {},
			employeeFilters = [],
			employeeColumns = [],
			employeeRecord;

		/*
		 *  Set Filters and Columns
		 */
		employeeFilters.push( new nlobjSearchFilter('internalid', null, 'is', context.getUser() ) );
		employeeColumns.push( new nlobjSearchColumn('title') );
		try {
			employeeRecord = nlapiSearchRecord('employee', null, employeeFilters, employeeColumns);
		} catch(error) {
			public.libraries.global.handleError( error, 'ERROR' );
		}

		tags.company = context.getCompany();
		tags.environment = context.getEnvironment();
		tags.version = context.getVersion();
		tags.email = context.getEmail();
		tags.username = context.getName();
		tags.jobtitle = employeeRecord[0].getValue('title') || 'Not Set';
		tags.userid = context.getUser();

		response = public.libraries.global.mapTags( html, tags );

		return response;

	};

	return public;

})();