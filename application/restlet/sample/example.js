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

		private._addExecutionTime( 'startRestletCall' );

		if( dataIn.error ) {

			/*
			 *  Sample Error
			 */
			private._setStatus( 'ERROR' );
			private._addMessage( 400, dataIn.error );

		} else {

			private._addExecutionTime( 'executeRestlet' );
			nlapiLogExecution('DEBUG','executeRestlet','Example NLAPI call');

			returnPayload.example = 'Sample payload return data';

		}

		if( private._getStatus != 'ERROR' ) {
			private._setStatus( 'SUCCESS' );
		}

		private._setReturnPayload( returnPayload );

	}

	return public;
})();