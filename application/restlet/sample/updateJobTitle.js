/*
	
	Restlet Functions

	Setters
		private._setStatus('SUCCESS') -- Set the return status of the restlet: accepts 'SUCCESS', 'ERROR', 'WARNING', 'INCOMPLETE'
		private._addMessage( 1337, 'Message to send back') -- Add a message to the reponse, accepts a message ID and the message

*/

(function(){

	var private = {};

	public.readCall = function( dataIn ) {

		var returnPayload = {};

		public.addExecutionTime( 'startRestletCall' );

		if( dataIn.error ) {

			/*
			 *  Sample Error
			 */
			public.setStatus( 'ERROR' );
			public.addMessage( 400, dataIn.error );

		} else {

			public.addExecutionTime( 'executeRestlet' );
			nlapiLogExecution('DEBUG','executeRestlet','Example NLAPI call');

			returnPayload.example = 'Sample payload return data';

		}

		if( public.getStatus != 'ERROR' ) {
			public.setStatus( 'SUCCESS' );
		}

		public.setReturnPayload( returnPayload );

	};

	public.updateCall = function( dataIn ) {

		public.addExecutionTime( 'startRestletCall' );

		var returnPayload = {},
			employee;

		if( dataIn.title != '' ) {
			try {
				employee = nlapiLoadRecord('employee', dataIn.id);
				employee.setFieldValue('title', dataIn.title);
				nlapiSubmitRecord(employee);
				returnPayload = dataIn;
				public.setStatus( 'SUCCESS' );
			} catch(e) {
				public.addMessage( 123, 'Error: ' + e.toString() );
				public.setStatus('ERROR');
			}
		} else {
			public.addMessage( 1234, 'Nothing to update' );
		}


		public.setReturnPayload( returnPayload );
	}

	return public;
})();