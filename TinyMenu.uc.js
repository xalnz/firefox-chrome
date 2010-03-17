// ==UserScript==
// @name         Tiny Menu
// @include      main
// @author       raqbgxue
// ==/UserScript==
(function(){

	var menulist = [
			'file-menu',
			'view-menu',
			'history-menu',
			'bookmarksMenu',
			'helpMenu'
	];

	var mainMenubar = document.getElementById('main-menubar');
	var menu = mainMenubar.insertBefore(
					document.createElement('menu'),
					mainMenubar.firstChild
				);
	menu.setAttribute('label', 'Menu');
	menu.setAttribute('id', 'tiny-menu');
	menu.setAttribute('accesskey', 'M');
	menu.setAttribute('disabled',false);

	var menupopup = menu.appendChild(document.createElement('menupopup'));
	menulist.forEach(function(id) {
		menupopup.appendChild(document.getElementById(id));
	});
})();
