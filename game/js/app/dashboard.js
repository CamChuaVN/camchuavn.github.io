$(document).ready(function() {

    retrieve('info', { token: getCookie('token') }, function(res) {
		console.log(res);
		if(res.retcode == 0) {
			language = res.data;
			var elementsWithLangAttribute = document.querySelectorAll('[zvalue]');
			elementsWithLangAttribute.forEach(function(element) {
				var langAttributeValue = element.getAttribute('zvalue');
				element.value = language[langAttributeValue];
			});
		}
	});

});
