var migrate = (function() {

	var public = {},
		private = {};

	public.module = {};
	public.module.fs = require('fs');
	private._response = {};
	private._html = '';

	public.init = function( response ) {

		private._response = response;

		var template, asset,
			deployments = '', deployment_list;

		template = public.module.fs.readFileSync( './server/migrate/wizard.html', 'utf8' );
		asset = public.module.fs.readFileSync( './server/migrate/wizard.css', 'utf8' );
		
		deployment_list = public.module.fs.readdirSync( './deployment' );

		for( var i = 0; i < deployment_list.length; i++ ) {
			var deploymentStatus = deployment_list[i].substr(0, 3).split(''),
				deployment = '',
				developer = '',
				eveodd = '';

			

			deployment = deployment_list[i].substring(deployment_list[i].indexOf('-') + 1,deployment_list[i].lastIndexOf('-'));
			developer = deployment_list[i].substring(deployment_list[i].lastIndexOf('-') + 1,deployment_list[i].lastIndexOf('.'));

			eveodd = ( i > 0 && i % 2 == 0 ) ? 'even' : 'odd';

			deployments += '<tr class="' + eveodd + '">';
			deployments += '<td>'
			deployments += ( deploymentStatus[0] == 'd' ) ? '<span class="icon-laptop"></span>' : '<span class="icon-blocked"></span>';
			deployments += ( deploymentStatus[1] == 's' ) ? '<span class="icon-cloud"></span>' : '<span class="icon-blocked"></span>';
			deployments += ( deploymentStatus[2] == 'p' ) ? '<span class="icon-flag"></span>' : '<span class="icon-blocked"></span>';
			deployments += '</td>';
			deployments += '<td>' + deployment + '</td>';
			deployments += '<td>' + developer + '</td>';

			deployments += '</tr>';
		}

		template = template.replace('{{deployments}}', deployments);


		private._html = '<style>' + asset + '</style>' + template;
		private._response.end( private._html );

	}

	return public;
})();

module.exports = migrate;