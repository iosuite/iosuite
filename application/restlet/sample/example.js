(function(){

	var _public = {},
		_private = {};

	_public.readCall = function( dataIn ) {
		
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