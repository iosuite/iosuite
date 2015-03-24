"use strict";

module.exports = {
	reporter: function (result, config, options) {
		var total = result.length;
		var str = "";

		str = JSON.stringify( result );
/*		str += table(result.map(function (el, i) {
				var err = el.error,
					isError = (err.code && err.code[0] === 'E');

				return isError;
			})
		);*/
/*		result.forEach(function (r) {
			var file = r.file;
			var err = r.error;

			str += file + ": test line " + err.line + ", col " + err.character + ", " + err.reason + "\n";
		});*/

		if (str) {
			process.stdout.write(str + "\n" + total + " error" + ((total === 1) ? "" : "s") + "\n");
		} else {
			process.stdout.write('hello');
		}
	}
};