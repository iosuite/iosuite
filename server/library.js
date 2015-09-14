var library = (function() {

	var public = {},
		private = {};

	public.module = {};
	public.module.fs = require('fs');

	public.format = function( template, options ) {
		var matches = template.match(/({{)([a-zA-Z0-9_]*)(}})/g),
			tag, tagData, replaceAll;

		if( matches ) {
			for( var match in matches ) {

				tag = matches[ match ].replace('{{','').replace('}}','');
				console.log( 'Tag: ' + tag );
				tagData = tag.split(':');
				replaceAll = new RegExp( '{{' + tag + '}}', "g");

				if( options != null && options[tag] ) {
					template = template.replace( replaceAll, options[tag] );
				} else {
					switch( tagData[0] ) {
						case 'script':
							var scriptTag = '<script type="text/javascript" src="' + options.site_url + options.asset_dir + '/scripts/' + tagData[1] + '.js"></script>';
							template = template.replace( replaceAll, scriptTag );
							break;
						case 'style':
							var styleTag = '<link href="' + options.site_url + options.asset_dir + '/styles/' + tagData[1] + '.css" rel="stylesheet" type="text/css">';
							template = template.replace( replaceAll, styleTag );
							break;
						case 'template':
							var templateLoad = 'nlapiRequestURL("' + options.site_url + options.asset_dir + '/templates/' + tagData[1] + '.html").getBody()',
							template = template.replace( replaceAll, templateLoad );
							break;
						case 'restlet':
							var environment = ( options.environment != 'production' ) ? 'sandbox.' : '',
								pieces = ( tagData[1] ) ? tagData[1].split('/') : false,
								url = '/app/site/hosting/restlet.nl?script=customscript_master_restlet&deploy=1';

							if( pieces && pieces[0] ) {
								url += '&module=' + pieces[0];
							}
							if( pieces && piecess[1] ) {
								url += '&restlet=' + pieces[1];
							}
							template = template.replace( replaceAll, url );
							break;
						case 'suitelet':
							var environment = ( options.environment != 'production' ) ? 'sandbox.' : '',
								pieces = ( tagData[1] ) ? tagData[1].split('/') : false,
								url = '/app/site/hosting/scriptlet.nl?script=customscript_master_suitelet&deploy=1';

							if( pieces && pieces[1] ) {
								url += '&module=' + pieces[0];
								url += '&suitelet=' + pieces[1];
							} else if( pieces && pieces[0] ) {
								url += '&suitelet=' + pieces[0];
							}
							template = template.replace( replaceAll, url );
							break;
					}
				}

			}
		}

		return template;
	};

	public.handleError = function( error ) {
		
		var errorTemplate = public.module.fs.readFileSync( './server/error.html', "utf8" ),
			errorOptions = {};

		errorOptions.code = error.name;
		errorOptions.details = error.message;
		errorOptions.stackRows = '';
		var stack = error.stack.split('\n');

		for( var stackItem in stack ) {

			var objectStart = stack[stackItem].indexOf('at ') + 3,
				objectEnd = stack[stackItem].indexOf(' ('),
				object = stack[stackItem].substring( objectStart, objectEnd ),
				fileStart = objectEnd + 2,
				fileEnd = stack[stackItem].indexOf(':', fileStart ),
				file = stack[stackItem].substring( fileStart, fileEnd ),
				lineNumStart = fileEnd + 1,
				lineNumEnd = stack[stackItem].indexOf(':', lineNumStart ),
				lineNum = stack[stackItem].substring( lineNumStart, lineNumEnd );

			if( stackItem == 1 ) {
				errorOptions.lineNum = lineNum;
				errorOptions.file = file;
			} else if( stackItem > 1 ) {
				errorOptions.stackRows += "<tr><td>" + object + "</td><td>" + file + "</td><td>" + lineNum + "</td></tr>";
			}
		}

		errorTemplate = public.format( errorTemplate, errorOptions );
		return errorTemplate;

	};

	return public;
})();

module.exports = library;