/**
 * Module Description
 * 
 * If you've decided not to directly install the NetSuite bundle, here is the router file needed for each iosuite call
 *
 */

var mcp = (function(){

	/*
	 * Declare private / public
	 */
	var public = {},
		private = {};
	
	public.libraries = {};

	/*
	 * Execution Time Variables
	 */
	private._startTime = new Date().getTime();
	private._executionTime = [];

	private._callType = '';
	private._callFile = '';
	private._callModule = '';
	private._callFunction = '';
	private._callVariables = '';
	private._arguments = '';
	private._dataIn = {};
	private._requestPost = {};

	/*
	 * Declare environment info
	 */
	private._context = nlapiGetContext();
	private._nsEnvironment = private._context.getEnvironment(); // Get NetSuite environment
	private._nsUserId = private._context.getUser(); // Get NetSuite User ID
	private._nsUserName = private._context.getName(); // Get NetSuite User Full Name
	private._nsUserEmail = private._context.getEmail(); // Get NetSuite User Email
	private._nsUserUrl = '';

	private._environment = '';
	private._scriptUrl = false;

	/*
	 * Declare payload information for Restlets
	 */
	private._returnStatus = { SUCCESS : "Success", ERROR : "Error", WARNING : "Warning", INCOMPLETE : "Incomplete" };
	private._messages = [];
	private._status;
	private._data;

	private._response;


	/**
	 *
	 * Constructor function
	 *
	 */
	private.__construct = function() {

		/*
		 * ------------------------------------------------------------------------------------------------
		 * Determine the environment
		 * ------------------------------------------------------------------------------------------------
		 */

		var scriptSrc = '';
		
		var iosuiteFilters = [],
			iosuiteColumns = [],
			iosuiteUserIdKey = false,
			iosuiteEnvironmentKey = 0,
			results = null,
			urlInfo = null,
			userDir = '';

		iosuiteColumns.push( new nlobjSearchColumn('custrecord_iosuite_employee') );
		iosuiteColumns.push( new nlobjSearchColumn('custrecord_iosuite_url') );
		iosuiteColumns.push( new nlobjSearchColumn('custrecord_iosuite_is_production') );
		iosuiteColumns.push( new nlobjSearchColumn('custrecord_iosuite_is_staging') );

		switch( private._nsEnvironment ) {

			case 'PRODUCTION':

				// Production Environment
				iosuiteFilters.push(new nlobjSearchFilter('custrecord_iosuite_is_production', null, 'is', 'T'));
				iosuiteFilters.push(new nlobjSearchFilter('custrecord_iosuite_employee', null, 'isempty'));

				results = nlapiSearchRecord('customrecord_iosuite_users', null, iosuiteFilters, iosuiteColumns) || [];
				private._environment = 'production';
				
				break;

			case 'SANDBOX':

				// Staging Environment
				iosuiteFilters  = [
				                   	[ 'custrecord_iosuite_is_staging', 'is', 'T' ],
				                    'or',
				                    [ 'custrecord_iosuite_employee', 'is', private._nsUserName ]
				                  ];
				results = nlapiSearchRecord('customrecord_iosuite_users', null, iosuiteFilters, iosuiteColumns) || [];

				if( results.length > 0 ) {
					for( var i = 0; i < results.length; i++ ) {

						if( results[i].getValue('custrecord_iosuite_employee') == private._nsUserId && results[i].getText('custrecord_iosuite_access_instance') == 'Development' ) {
							iosuiteUserIdKey = i;
							//private._nsUserUrl = '/' + private._nsUserEmail;
						}
						if( results[i].getValue('custrecord_iosuite_employee') == '' && results[i].getValue('custrecord_iosuite_is_staging') == 'T'  ) {
							iosuiteEnvironmentKey = i;
						}
					}

					if( iosuiteUserIdKey !== false ) {
						iosuiteEnvironmentKey = iosuiteUserIdKey;
					}
				}

				private._environment = results[ iosuiteEnvironmentKey ].getText('custrecord_iosuite_access_instance').toString().toLowerCase();
				break;

		}
		

		private._scriptUrl = results[ iosuiteEnvironmentKey ].getText('custrecord_iosuite_url').toLowerCase() + private._nsUserUrl;
		private._scriptUrl = ( private._scriptUrl.slice(-1) != '/' ) ? private._scriptUrl + '/' : private._scriptUrl;
		
		public.setStatus( 'INCOMPLETE' );

	}

	private.masterControlProceedure = function() {

		/*
		 * ------------------------------------------------------------------------------------------------
		 * This is the master control, prep and call 
		 * ------------------------------------------------------------------------------------------------
		 */

		var call, url, urlObject,
			contents,
			code, error,
			response = {};

		call = private._callType + private._callModule + private._callFile;// + '/' + private._deploymentId
		url = private._scriptUrl + call + private._arguments;
	
		try{

			public.addExecutionTime('start:' + call );

			// Call the URL and get contents
			nlapiLogExecution('DEBUG', 'url', url);
			urlObject = nlapiRequestURL(url); //, postdata, headers, callback, httpMethod);
			contents = urlObject.getBody();
			nlapiLogExecution('DEBUG', 'contents', contents);

			public.addExecutionTime('load:' + call );

			nlapiLogExecution('DEBUG', 'function', private._callFunction);

			code = eval( contents );
			
			nlapiLogExecution('DEBUG', 'code', code);
			
			public.addExecutionTime('loaded:' + call );

			response = code[ private._callFunction ]( private._dataIn );
			
			nlapiLogExecution('DEBUG', 'response', response);

			public.addExecutionTime('finishExecute:' + call );

		} catch(error) {
			
			if(error instanceof nlobjError ) {
				
				//error = error.getCode() + '\n' + error.getDetails();
				nlapiLogExecution( 'ERROR', 'system error', error + '. DUMP: ' + error.toString());
				if( private._callType == 'client' ) {
					console.error( 'system error | ' + error.getCode() + ': ' + error.getDetails() + '. DUMP: ' + error.toString());
				}
				
			} else {
				
				nlapiLogExecution('DEBUG', 'unexpected error', error.toString() );
				nlapiLogExecution('DEBUG', 'error', error.rhinoException );
				nlapiLogExecution('DEBUG', 'error', error.lineNumber );
				
				if( private._callType == 'client' ) {
					console.error( 'system error | ' + error.toString());
					console.error( error.line );
				}
				
			}
			
			public.setStatus( 'ERROR' );
			public.addMessage(197, 'Attempted URL: ' + url);
			public.addMessage( 197, 'Invalid API Call: ' + error + ". Request: [ " + private._callType + ' | ' + private._callFunction + " ]" );

		}
		
		switch( private._callType ) {
			case 'restlet':
				// Further processing for RESTlets
				return private._return();
				break;
			case 'suitelet':
				return response;
				break;
		}

	}

	/**
	 *
	 * Suitelet Function
	 *
	 */

	public.suitelet = function( request, response ) {

		private._response = response;

		var parameters = request.getAllParameters(),
			arguments = '',
			callFile,
			callModule = '',
			output;

		for( parameter in parameters ) {
			switch( parameter ) {
				case 'suitelet':
					callFile = '/' + parameters[ parameter ];
					break;
				case 'module':
					callModule = '/' + parameters[ parameter ];
					break;
				default:
					var argument = parameter + "=" + encodeURIComponent( parameters[ parameter ] );
					arguments += ( arguments == '' ) ? '?' + argument : '&' + argument;
					break;
			}
		}

		private._callType = 'suitelet';
		private._callFile = callFile;
		private._callModule = callModule;
		private._callFunction = 'load';
		private._arguments = arguments;
		private._dataIn = request;

		output = private.masterControlProceedure();

		response.write( output );

	};

	/**
	 * --------------------------------------------------------
	 * Restlet Controls
	 * --------------------------------------------------------
	 */
	
	private._restletRouter = function( dataIn ) {

		var arguments = '',
			callFile = '',
			callModule = '';

		for( parameter in dataIn ) {
			nlapiLogExecution('DEBUG', 'restlet data', parameter + ':' + dataIn[parameter]);
			switch( parameter ) {
	
				case 'restlet':
					callFile = dataIn[ parameter ];
					break;
				case 'module':
					callModule = dataIn[ parameter ];
					break;
				default:
					var argument = parameter + "=" + encodeURIComponent( dataIn[ parameter ] );
					arguments += ( arguments == '' ) ? '?' + argument : '&' + argument;
					break;
			}
		}

		private._callType = 'restlet';
		private._callFile = '/' + callFile;
		private._callModule = '/' + callModule;
		private._arguments = arguments;
		private._dataIn = dataIn;

	}

	public.restletCreate = function( dataIn ) {
		nlapiLogExecution('DEBUG', 'dataIn', JSON.stringify(dataIn) );
		dataIn = JSON.parse( JSON.stringify( dataIn ) );
		private._restletRouter( dataIn );

		private._callFunction = 'createCall';

		return private.masterControlProceedure();

	}

	public.restletRead = function( dataIn ) {

		private._restletRouter( dataIn );

		private._callFunction = 'readCall';

		return private.masterControlProceedure();

	}

	public.restletUpdate = function( dataIn ) {

		private._restletRouter( dataIn );

		private._callFunction = 'updateCall';

		return private.masterControlProceedure();

	}

	public.restletDelete = function( dataIn ) {

		private._restletRouter( dataIn );

		private._callFunction = 'deleteCall';

		return private.masterControlProceedure();

	}

	/*
	 * "Is Status" functions
	 */
	public.isStatus = function( status ){
		return private._status == private._returnStatus[ status ];
	}

	/*
	 * Setters/Adders
	 */
	public.setStatus = function( status ) {
		private._status = private._returnStatus[ status ];
	}
	
	public.setReturnPayload = function( payload ) {
		private._data = payload;
	}
	
	public.addMessage = function( code, message ) {
		private._messages.push( { 'code' : code, 'message' : message } );
	}

	/*
	 * Getters
	 */
	public.getStatus = function() {
		return private._status;
	}
	
	public.getReturnPayload = function() {
		return private._data;
	}
	
	public.getMessages = function() {
		return private._messages;
	}

	/**
	 * @returns {String} Output string based on return type
	 */
	private._return = function() {
		
		var returnObject = {},
			returnString = '';
		
		returnObject.status = public.getStatus();
		returnObject.message = public.getMessages();
		returnObject.data = public.getReturnPayload();
		returnObject.executionTime = public.getExecutionTime();

		return returnObject;

	};

	/**
	 *
	 * User Event Functions
	 *
	 */

	public.userEventBeforeLoad = function( type, form, request ) {

		private._callType = 'userEvent';
		private._callFunction = 'beforeLoad';
		private._arguments.type = type;
		private._arguments.form = form;
		private._arguments.request = request;

		private.masterControlProceedure();

	}

	public.userEventBeforeSubmit = function( type ) {

		private._callType = 'userEvent';
		private._callFunction = 'beforeSubmit';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.userEventAfterSubmit = function( type ) {

		private._callType = 'userEvent';
		private._callFunction = 'afterSubmit';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	/**
	 *
	 * Client Functions
	 *
	 */
	
	public.clientMaster = function( callFile, callModule ) {
		
		private._callType = 'client';
		private._callFile = '/' + callFile;
		private._callModule = '/' + callModule;
		private._callFunction = 'init';
		
		private.masterControlProceedure();
		
	}

	public.clientPageInit = function( type ) {

		private._callType = 'client';
		private._callFunction = 'pageInit';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.clientSaveRecord = function( type ) {

		private._callType = 'client';
		private._callFunction = 'saveRecord';

		private.masterControlProceedure();

	}

	public.clientValidateField = function( type, name, linenum ) {

		private._callType = 'client';
		private._callFunction = 'validateField';
		private._arguments.type = type;
		private._arguments.name = name;
		private._arguments.linenum = linenum;

		private.masterControlProceedure();

	}

	public.clientFieldChanged = function( type, name, linenum ) {

		private._callType = 'client';
		private._callFunction = 'fieldChanged';
		private._arguments.type = type;
		private._arguments.name = name;
		private._arguments.linenum = linenum;

		private.masterControlProceedure();

	}

	public.clientPostSourcing = function( type, name ) {

		private._callType = 'client';
		private._callFunction = 'postSourcing';
		private._arguments.type = type;
		private._arguments.name = name;

		private.masterControlProceedure();

	}

	public.clientLineInit = function( type ) {

		private._callType = 'client';
		private._callFunction = 'lineInit';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.clientValidateLine = function( type ) {

		private._callType = 'client';
		private._callFunction = 'validateLine';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.clientRecalc = function( type ) {

		private._callType = 'client';
		private._callFunction = 'recalc';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.clientValidateInsert = function( type ) {

		private._callType = 'client';
		private._callFunction = 'validateInsert';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	public.clientValidateDelete = function( type ) {

		private._callType = 'client';
		private._callFunction = 'validateDelete';
		private._arguments.type = type;

		private.masterControlProceedure();

	}

	/*
	 * Generate hash for external call
	 *
	 *
	 */
	private._hashGen = function() {

	}

	/*
	 * Execution Time Functions
	 */

	public.trackTime = function() {

		var testTime = new Date().getTime(),
			executionTime = testTime - public.getStartTime();

		return executionTime;

	};

	public.addExecutionTime = function( action ) {
		private._executionTime.push( { 'action' : action, 'time' : public.trackTime() } );
	};

	public.getExecutionTime = function() {
		return private._executionTime;
	};

	public.getStartTime = function() {
		return private._startTime;
	};


	private.__construct();

	return public;

}());

if( typeof callFile != 'undefined' && typeof callModule != 'undefined' ) {
	mcp.clientMaster( callFile, callModule );
}