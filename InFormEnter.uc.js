// ==UserScript==
// @name           InFormEnter Lite
// @version        1.4.0
// @description    InfFormEnter for userChrome.js
// @author         raqbgxue
// @include        chrome://browser/content/browser.xul
// ==/UserScript==
//
// 下のアレイを適当に編集。
// これが見られたらパスワード類がもろにバレるので注意。
//
(function(){
//----------- ここから -------------------------------------------
	var subMenuGoogle=[
		{label:"Gmail",text:"dummy@gmail.com"},
		{label:"password",text:"dummypass"},
		{label:"fullname",text:"dumdum"},
		{label:"account",text:"dumdum2"},
		];
	
	var subMenuYahooJapan=[
		{label:"YahooJapan ID",text:"dummy"},
		{label:"YahooJapan mail",text:"dummy@yahoo.co.jp"},
		{label:"password",text:"dummypass"},
		];

	var subMenuMails=[
		{label:"OCN mail",text:"dummy@xae.ocn.ne.jp"},
		{label:"Yahoo! mail",text:"dummy@yahoo.com"},
		{label:"mobile mail",text:"dummy@docomo.ne.jp"},
		];

	//mMenusに登録
	var mMenus=[
		{label:"Gmail",text:"dummy@gmail.com"},
		{label:"password",text:"dummypass"},
		{label:"_sep_"},
		{label:"_menu_",text:"Google",submenu:subMenuGoogle},
		{label:"_menu_",text:"YahooJapan",submenu:subMenuYahooJapan},
		{label:"_menu_",text:"mails",submenu:subMenuMails},
		];
//----------- ここまで -------------------------------------------

	init: {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		var separator = document.getElementById("context-sep-undo");
		var menu = document.createElement("menu");
		menu.id = "ife-context-menu";
		menu.setAttribute("label", "Infomation");
		menu.setAttribute("accesskey", "I");
		contextMenu.insertBefore(menu,separator);

		var menuPopup = document.createElement("menupopup");
		menu.appendChild(menuPopup);
		createSubMenu(menuPopup, mMenus)
		contextMenu.addEventListener("popupshowing", setMenuDisplay, false);
	}

	function createSubMenu(parent, menuArray) {
		var menuItem;
		for(var i=0, menu; menu=menuArray[i]; ++i)
		{
			if(menu.label == "_sep_") {
				menuItem=document.createElement("menuseparator");
			} else if (menu.label == "_menu_") {
				var menuItem = document.createElement("menu");
				menuItem.setAttribute("label",menu.text);
				parent.appendChild(menuItem);
				var menuPopup = document.createElement("menupopup");
				menuItem.appendChild(menuPopup);
				createSubMenu(menuPopup, menu.submenu)
			} else {
				menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", menu.label);
				menuItem.culMenu = menu;
				menuItem.addEventListener("command", pasteText, false);
			}

			parent.appendChild(menuItem);
		}
	};

	function pasteText(aEvent) {
		var text = aEvent.target.culMenu.text;
		if (text!="undefined")
		{
			goDoCommand('cmd_selectAll');
			Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(text);
			goDoCommand("cmd_paste");
		}
	};

	function setMenuDisplay() {
		if (gContextMenu != null && gContextMenu.onTextInput) {
			document.getElementById("ife-context-menu").hidden = false;
		} else {
			document.getElementById("ife-context-menu").hidden = true;
		}
	};

})();
