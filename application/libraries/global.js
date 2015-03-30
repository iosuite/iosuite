(function(){

	var private = {},
		public = {};

	public.mapTags = function( data, tags ) {
		var matches = data.match(/{{(.*)}}/g),
			tag, replaceAll;

		for( var match in matches ) {

			tag = matches[ match ].replace('{{','').replace('}}','');
			replaceAll = new RegExp(tag, "g");

			if( tags[tag] ) {

				data.replace( replaceAll, tags[tag] );

			}

		}

		return data;
	};

})()