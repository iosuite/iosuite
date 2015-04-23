$(document).on('click', '#update_title', function(e){
	var title = prompt('New Job Title'),
		url = '{{restlet}}',
		userid = $('label.userid span').text(),
		data = {id: userid, title: title, module: 'sample', restlet: 'updateJobTitle'};

	if( title !== null ) {
		$.ajax({
			url: url,
			type: 'PUT',
			data: JSON.stringify( data ),
			dataType: 'JSON',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}).done( function(response) {
			if( response.status == 'Success' ) {
				$('label.title span').text( response.data.title );
			} else {
				alert( response.message[0].message );
			}
		});
	}

});