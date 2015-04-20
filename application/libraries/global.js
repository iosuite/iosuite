(function(){

	var private = {};

	public.mapTags = function( data, tags ) {
		var matches = data.match(/{{(.*)}}/g),
			tag, replaceAll;

		for( var match in matches ) {

			tag = matches[ match ].replace('{{','').replace('}}','');
			replaceAll = new RegExp( '{{' + tag + '}}', "g");

			if( tags[tag] ) {

				data = data.replace( replaceAll, tags[tag] );

			}

		}

		return data;
	};

	public.handleError = function( error, type ) {

		var responseError = {};

		if(error instanceof nlobjError ) {

			responseError.code = error.getCode();
			responseError.details = error.getDetails();
			responseError.lineNum = 'Unknown';
			responseError.stack = error.getStackTrace();
			responseError.assocRecord = error.getInternalId();
			responseError.misc = error.getUserEvent();
			
		} else {
			
			responseError.code = error.name;
			responseError.details = error.message;
			responseError.lineNum = error.lineNumber;
			var stackString = error.stack;
			responseError.assocRecord = 'Unknown';
			responseError.misc = error.rhinoException;
			
			responseError.stack = stackString.split('at');
			
		}

		for( var item in responseError ) {
			nlapiLogExecution('ERROR', type, responseError[item]);
		}

		return responseError;
	}

	return public;

})()