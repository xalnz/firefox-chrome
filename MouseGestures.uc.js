//==UserScript==
// @name         Advanced Mouse Gestures (with Wheel Gesture and Rocker Gesture)
// @namespace    http://www.xuldev.org/
// @namespace    http://d.hatena.ne.jp/raqbgxue/
// @description  Lightweight customizable mouse gestures.
// @include      main
// @author       Gomita + raqbgxue
// @version      10.3.23 (folk from original 9.5.18)
// @homepage     http://www.xuldev.org/misc/ucjs.php
// @homepage     http://d.hatena.ne.jp/raqbgxue/20090624/1245848856
// @note         Ctrl+(right-click-up) => Reset Gesture
//               動作がおかしくなったらCtrl+右クリックで初期化。
// @note         Fx3.5/Ubuntu9.10 と Fx3.6/WinVistaSP2 で動作確認
// @note         このスクリプトの最後におまけ機能があります。
//==/UserScript==

var ucjsMouseGestures = {
// options
enableWheelGestures: true,
enableRockerGestures: true,
enablePopupGestures: true,

_lastX: 0,
_lastY: 0,
_directionChain: '',
_isMouseDownL: false,
_isMouseDownR: false,
_hideFireContext: false, //for windows
_shouldFireContext: false, //for linux

POPUP_ID: 'GesturePopup',
GESTURES:{
/*=== Navigation ===*/
	'L':{name:'History Back',cmd:function(){document.getElementById("Browser:Back").doCommand();}},
	'R':{name:'History Forward',cmd:function(){document.getElementById("Browser:Forward").doCommand();}},
	'U':{name:'Page Up',cmd:function(){goDoCommand("cmd_scrollPageUp");}},
	'D':{name:'Page Down',cmd:function(){goDoCommand("cmd_scrollPageDown");}},
	'LU':{name:'Scroll Top',cmd:function(){goDoCommand("cmd_scrollTop");}},
	'LD':{name:'Scroll Bottom',cmd:function(){goDoCommand("cmd_scrollBottom");}},
	'DURD':{name:'Home',cmd:function(){document.getElementById("Browser:Home").doCommand();}},
	'DRUDL':{name:'Go to yahoo.co.jp',cmd:function(){const URL="http://www.yahoo.co.jp";const IN_NEW_TAB=false;if(IN_NEW_TAB){gBrowser.loadOneTab(URL,null,null,null,false,false);}else{gBrowser.loadURI(URL);}}},
	'LDRUL':{name:'Go to google.co.jp',cmd:function(){const URL="http://www.google.co.jp";const IN_NEW_TAB=false;if(IN_NEW_TAB){gBrowser.loadOneTab(URL,null,null,null,false,false);}else{gBrowser.loadURI(URL);}}},
	//'ULU':{name:'Go Up Directory',cmd:function(){var uri=gBrowser.currentURI;if(uri.path=="/")return;var pathList=uri.path.split("/");if(!pathList.pop())pathList.pop();loadURI(uri.prePath+pathList.join("/")+"/");}},

/*=== Tab and Window ===*/
	'UD':{name:'Reload',cmd:function(){document.getElementById("Browser:Reload").doCommand();}},
	'UDU':{name:'Reload Skip Cache',cmd:function(){document.getElementById("Browser:ReloadSkipCache").doCommand();}},
	//'DUD':{name:'Reload All Tabs',cmd:function(){gBrowser.reloadAllTabs(gBrowser.mCurrentTab);}},
	//'DLDL':{name:'Close Other Tabs',cmd:function(){gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);}},
	'RDU':{name:'Minimize Window',cmd:function(){window.minimize();}},
	'RUD':{name:'Maximize or Resore Window',cmd:function(){window.windowState==1?window.restore():window.maximize();}},
	'DRU':{name:'Close Window',cmd:function(){BrowserCloseTabOrWindow();}},
	'URD':{name:'Full Screen',cmd:function(){document.getElementById("View:FullScreen").doCommand();}},
	'LR':{name:'Open New Tab',cmd:function(){document.getElementById("cmd_newNavigatorTab").doCommand();document.getElementById("searchbar").focus();goDoCommand('cmd_selectAll');}},
	'DR':{name:'Close Tab',cmd:function(){gBrowser.removeCurrentTab();}},
	//'DR':{name:'Close Tab or Window',cmd:function(){if(gBrowser.mTabs.length>1)document.getElementById("cmd_close").document();else document.getElementById("cmd_closeWindow").doCommand();}},
	'DU':{name:'Undo Tab',cmd:function(){try{document.getElementById('History:UndoCloseTab').doCommand();}catch(ex){if('undoRemoveTab'in gBrowser)gBrowser.undoRemoveTab();else throw"Session Restore feature is disabled."}}},
	'RL':{name:'Duplicate Tab',cmd:function(){openNewTabWith(gBrowser.currentURI.spec,null,null,null,false);}},
	'L<R':{name:'Previous Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(-1,true);}},
	'UL':{name:'Previous Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(-1,true);}},
	'L>R':{name:'Next Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(+1,true);}},
	'UR':{name:'Next Tab',cmd:function(){gBrowser.mTabContainer.advanceSelectedTab(+1,true);}},
	'DLU':{name:'Restart Firefox',cmd:function(){Application.restart();}},

/*=== Popup ===*/
	'RD':{name:'[Popup] Search Engines',cmd:function(self,event){self._buildPopup(event,"WebSearchPopup");}},
	//'RU':{name:'[Popup] All Tabs',cmd:function(self,event){self._buildPopup(event,"AllTabsPopup");}},
	'RU':{name:'[Popup] Google Suggestions',cmd:function(self,event){self._buildPopup(event,"GoogleSuggestPopup");}},
	'W+':{name:'[Popup] Closed Tabs',cmd:function(self,event){self._buildPopup(event,"ClosedTabsPopup");}},
	'W-':{name:'[Popup] Histories',cmd:function(self,event){self._buildPopup(event,"HistoryPopup");}},

/*=== Browser UI ===*/
	'LDR':{name:'Show/Hide Upper Toolbars',cmd:function(){var menubar=document.getElementById("toolbar-menubar");var bmToolbar=document.getElementById("PersonalToolbar");menubar.collapsed=!menubar.collapsed;if(!bmToolbar.collapsed)bmToolbar.collapsed=true;}},
	'RUL':{name:'Show/Hide Statusbar',cmd:function(){document.getElementById("cmd_toggleTaskbar").doCommand();}},
	'DLR':{name:'Show/Hide Bookmarks Sidebar',cmd:function(){toggleSidebar("viewBookmarksSidebar");}},
	'DL':{name:'Show/Hide BookmarksToolbar',cmd:function(){var bmToolbar=document.getElementById("PersonalToolbar");bmToolbar.collapsed=!bmToolbar.collapsed;}},
	'RDL':{name:'Clear Privacy Infomation',cmd:function(){setTimeout(function(){ document.getElementById("Tools:Sanitize").doCommand();},0);}},

/*=== Noscript ===*/
	'DRDR':{name:'[Noscript] Allow All This Page Temporarily',cmd:function(){noscriptOverlay.allowPage(true);}},
	'DRD':{name:'[Noscript] Allow Page Temporarily',cmd:function(){noscriptOverlay.allowPage();}},
	'DLD':{name:'[Noscript] Revoke Page Temporarily',cmd:function(){noscriptOverlay.revokeTemp();}},

/*=== Utility ===*/
	'RUR':{name:'Search For Selection',cmd:function(){var t=getBrowserSelection().toString();if(t){var b=document.getElementById('searchbar').textbox;b.value=t;BrowserSearch.loadSearch(t,true);}}},
	'RDR':{name:'Eijiro',cmd:function(){const TERM=getBrowserSelection().toString();const URL="http://eow.alc.co.jp/"+TERM+"/UTF-8/";if(TERM)gBrowser.loadOneTab(URL,null,null,null,false,false);}},
	'UDR':{name:'CSS ON/OFF',cmd:function(){var _document=document.commandDispatcher.focusedWindow.document;var l,i,x,s,j,y;l=_document.getElementsByTagName('link');for(i=0;i<l.length;i++){x=l.item(i);if(x.rel.match(/^stylesheet$/i)){if(x.disabled==false)x.disabled=true;else if(x.disabled==true)x.disabled=false;}}s=_document.getElementsByTagName('style');for(j=0;j<s.length;j++){y=s.item(j);if(y.disabled==false)y.disabled=true;else if(y.disabled==true)y.disabled=false;}}},
//	'---':{name:'Cookies',cmd:function(){alert('Cookies:\n\n'+document.commandDispatcher.focusedWindow.document.cookie.replace(/; /g,'\n'));}},
//	'---':{name:'Google Cache of This Page',cmd:function(){var _window=document.commandDispatcher.focusedWindow;var _location=_window.location;var _document=_window.document;(_location.protocol=='http:')?_location.href='http://www.google.co.jp/search?q=cache:'+_document.location.href.replace('http://',''):alert('Can\'t preview the page.');}},
	'RDRD':{name:'Excite Translation (en>ja)',cmd:function(){const FROM="EN",TO="JA";const DOMAIN="www.excite.co.jp";const URL="http://"+DOMAIN+"/world/english/web/?wb_url=%URL%&wp_lp="+FROM+TO;var curURL=gBrowser.currentURI.spec;if(curURL.indexOf(ExciteDOMAIN)!=-1)BrowserReload();else gBrowser.loadURI(URL.replace("%URL%",encodeURIComponent(curURL)));}},
	'RLU':{name:'Search under the Domain',cmd:function(){var _document=document.commandDispatcher.focusedWindow.document;var p=prompt('Input word to search under the domain('+_document.location.hostname+'):','');if(p)_document.location.href='http://www.google.com/search?q=site:'+_document.location.href.split('/')[2]+' '+encodeURIComponent(p);}},

	'UDUD':{name:'Save Selection to Local',cmd:function(self){
		// 選択範囲をテキストファイルとして保存する。
		var _window = document.commandDispatcher.focusedWindow;
		var sel = _window.getSelection();
		if (sel && !sel.isCollapsed) {
			var fname = _window.location.href.match(/[^\/]+$/) + '.txt';
			self.saveTextToLocal(sel.toString(), fname, false);
		} else {
			alert('No Selection!');
		}
	}},

	'LRD':{name:'Gallery Maker',cmd:function(self){
		// http://d.hatena.ne.jp/raqbgxue/20100228/1267348384
		//
		// ページ内の画像(Link.href, Image.src, テキストリンク)を拾って別なタブに開く。
		//
		// 範囲を選択したままこのジェスチャを起動すると、選択範囲内の画像のみを拾う。
		// 
		// アイコンなどを除くため、Image.srcは、minWidth, minHeightより大きいサイズの
		// 画像のみを拾う。Link.href、テキストリンクに関してはサイズ取得が面倒なので
		// サイズフィルターはかからない。
		//
		// 判明している問題として、Frameのあるページでは、
		// うまく画像が拾えないことがある。
		//
		var filter = ".+\\.(png|jpg|gif|bmp|svg|jpeg)$";
		var minWidth=50, minHeight=50;
		var skipTextLink = false;

		//if (!(filter = prompt('Input your filter:', filter))) return void(0);

		var _window = document.commandDispatcher.focusedWindow;
		var album = new self.Album(); // Album object
		album.autoImport(_window, (new RegExp()).compile(filter, 'i'), minWidth, minHeight, skipTextLink);

		if (!album.length) {
			alert('No images!');
		} else {
			var title = 'Gallery: '+ album.length +' images in ' + _window.location.href;

			// Array.join()より+=の方が速いとどこかに書いてあった。
			var html = '';
			html += '<html><head>';
			html += '<title>'+title+'</title>';
			html += '<meta http-equiv="Content-Type" content="text/html" charset="UTF-8">';
			html += '<style type="text/css"><!--\nbody{background-color:white;font-family:"Impact","Times New Roman",sans-serif;}#ctl-bgc{padding:1;}#ctl-bgc img{border:solid 1px gray;width:20px;height:20px;}#ctl-size{padding:5px;}#ctl-size a.szlb{color:blue;text-decoration:underline;}#ctl-size a.selected{color:black;text-decoration:none;}#table-gallery table{table-layout:fixed;}#table-gallery td{text-align:center;padding:1%;}#table-gallery img.g{}#table-gallery img.sdw{-moz-box-shadow:2px 2px 3px gray;-webkit-box-shadow:2px 2px 3px gray;}#table-gallery img.szS{max-width:30%;max-height:80%;}#table-gallery img.szM{max-width:60%;max-height:80%;}#table-gallery img.szL{max-width:80%;max-height:80%;}#table-gallery img.szX{max-width:100%;max-height:90%;}#table-gallery img.szO{max-width:100%;max-height:100%;}\n--></style>';
			html += '<script type="text/javascript">\nvar changeBgColor=function(cc){document.body.style.backgroundColor=cc;};var changeImageSize=function(sizeClass){var table=document.getElementById("table-gallery");if(sizeClass=="szO"){table.width="";}else table.width="90%";var imgs=document.getElementById("table-gallery").getElementsByTagName("img");for(var i=0,x;x=imgs[i];i++){x.className=x.className.replace(/sz[A-Z]/,sizeClass);}var anc=document.getElementById("ctl-size").getElementsByTagName("a");for(var i=0,x;x=anc[i];i++){if(x.name&&x.name==sizeClass)x.className="szlb selected";else x.className="szlb";}};var toggleShadow=function(){var cb=document.getElementById("checkbox-shadow");var imgs=document.getElementById("table-gallery").getElementsByTagName("img");if(!cb.checked){for(var i=0,x;x=imgs[i];i++)x.className=x.className.replace("sdw","");}else{for(var i=0,x;x=imgs[i];i++)if(x.className.indexOf("sdw")<0)x.className+=" sdw";}};var initColorPallet=function(){var bgc=["White","LightYellow","AliceBlue","MistyRose","PeachPuff","LightBlue","BurlyWood","DarkGray","YellowGreen","Firebrick","Black","RosyBrown","DodgerBlue","#252525","Gold","DarkSeaGreen"];var cpallet=document.getElementById("ctl-bgc_colorpallet");var tds=cpallet.getElementsByTagName("td");var anc=cpallet.getElementsByTagName("a");var img=cpallet.getElementsByTagName("img");var cnum=bgc.length;if(tds.length==cnum&&anc.length==cnum){for(var i=0;i<cnum;i++){tds[i].bgcolor=bgc[i];anc[i].href="javascript:changeBgColor(\'"+bgc[i]+"\')";}}};var initSizeControl=function(){var anc=document.getElementById("ctl-size").getElementsByTagName("a");for(var i=0,a;a=anc[i];i++){a.href="javascript:changeImageSize(\'"+a.name+"\')";}};window.onload=function(){initColorPallet();initSizeControl();};\n</script>';
			html += '</head><body>';
			html += '<div id="div-control"><table id="table-control"><tbody>';
			html += '<tr><td id="ctl-blank" rowspan="3" width="100%"></td>';
			html += 	'<td id="ctl-bgc" colspan="2"><table id="ctl-bgc_colorpallet" border="0" cellspacing="3" cellpadding="0">';
			html += 			'<tr> <td bgcolor="White"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="LightYellow"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="AliceBlue"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="MistyRose"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="PeachPuff"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="LightBlue"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="BurlyWood"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="DarkGray"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="YellowGreen"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="Firebrick"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="Black"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="RosyBrown"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="DodgerBlue"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="#252525"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="Gold"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 				 '<td bgcolor="DarkSeaGreen"><a><img src="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"></a></td>';
			html += 			'</tr></table></td></tr>';
			html += '<tr><td id="ctl-size">Size [ <a class="szlb" name="szS">small</a> | <a class="szlb selected" name="szM">medium</a> | <a class="szlb" name="szL">large</a> | <a class="szlb" name="szX">xlarge</a> | <a class="szlb" name="szO">original</a> ]</td>';
			html +=		'<td id="ctl-shadow"><label><input type="checkbox" id="checkbox-shadow" onClick="toggleShadow()" checked="">Shadow</label><td></tr>';
			html += '</tbody></table></div>';
			html += '<div id="div-gallery"><center><table id="table-gallery" cols="3" width="90%" style="table-layout:fixed;"><tbody>';
			var i=0, rs=0;
			for (url in album.URLs) {
				if (rs==0) html += '<tr>';
				html += '\n<td><img class="g szM sdw" src="'+ url +'" title="'+ url +'"><br /></td>';
				if ((rs=(++i)%3)==0) html += '</tr>';
			}
			if (rs!=0) html += '</tr>';
			html += '</tbody></table>';
			html += '</center></div></body></html>';
			
//			var dataURI = 'data:text/html;charset=utf-8,'+html;
//			gBrowser.loadOneTab(dataURI,null,null,null,false,false);

			// 一時ファイルの取得と書き込み
			var tmpf = Cc['@mozilla.org/file/directory_service;1']
						.getService(Ci.nsIProperties).get('TmpD', Ci.nsIFile);
			tmpf.append("gallery.html");
			tmpf.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0664);

			var strm = Cc["@mozilla.org/network/file-output-stream;1"]
						.createInstance(Ci.nsIFileOutputStream);
			var convert = Cc['@mozilla.org/intl/scriptableunicodeconverter']
						.getService(Ci.nsIScriptableUnicodeConverter);
			convert.charset = "UTF-8";
			html = convert.ConvertFromUnicode(html);

			try {
				strm.init(tmpf, 0x04|0x08|0x20, 0600, 0);
				strm.write(html,html.length);
				strm.flush();
			} catch (ex) {
				alert('failed:\n'+ex);
			}
			strm.close();
			gBrowser.loadOneTab(tmpf.path,null,null,null,false,false);

			// Firefoxを閉じる時に一時ファイルを全て削除。
			if (self._tmpfiles == undefined) {
				self._tmpfiles = new Array();
				window.addEventListener("unload",function(){
//					//alert('end phase\n'+self._tmpfiles + '\n length = '+ self._tmpfiles.length);
					for (var i=0, f; f=self._tmpfiles[i]; ++i) {
						//alert('remove['+i+']\n'+f.path);
						f.remove(false);
					}
				},false);
			}
			self._tmpfiles.push(tmpf);
		}
	}},

	'LRU':{name:'Save Links',cmd:function(self){
		// 入力された正規表現にマッチするリンクURL（Link.href、
		// Image.src、テキストリンク）をすべて保存する。
		// 選択範囲があるなら、その中からURLを拾う。
		// 
		// 例えば、出てくるダイアログに ".+\\.(zip)"と入力すれば
		// ページ内のzipファイルを全て落とせる。
		//
		// バックグラウンド処理なので保存完了が分からないのが欠点。
		// フォルダを開いて全てダウンロード完了したかを確認するしかない。
		//
		var filter = ".+\\.(png|jpg|gif|bmp|svg|jpeg)$";
		var minWidth=50, minHeight=50;
		var skipTextLink = false;

		if (!(filter = prompt('Input your filter:', filter))) return void(0);

		var _window = document.commandDispatcher.focusedWindow;
		var album = new self.Album();
		album.autoImport(_window, (new RegExp()).compile(filter, 'i'), minWidth, minHeight, skipTextLink);

		if (!album.length) { alert('No images!'); return; }
		else if (!confirm(album.length+" URLs were found. Continue?")){ return; }

		var delay=0, saveDir, url, filename;
		var re_base = (new RegExp()).compile('([^/]+)$');
		for (url in album.URLs) {
			filename = url.match(re_base)[0];
			if (delay) {
				setTimeout('ucjsMouseGestures.saveLinkToLocal("'+ url +'","'+ saveDir + filename +'", true)', delay);
			} else {
				var savefile = ucjsMouseGestures.saveLinkToLocal(url, filename, false);
				if (!savefile) return;
				saveDir = savefile.path.match(/^(.+)\//)[0];
			}
			delay += 1000;
		}
	}},

	'RLD':{name:'Classify Links',cmd:function(){
		// 画像IMG、動画MOV、音声AUD、書類DOCへのリンクを目立たせる。
		// FirefoxのインクリメンタルサーチでIMGなど調べれば場所がすぐ分かる。
		// 同ホスト内のリンクには[self]というタグが付く。
		var _window = document.commandDispatcher.focusedWindow;
		var _document = _window.document;
		var links = _document.links;
		var hostself = _window.location.hostname;
		var re_ext   = (new RegExp()).compile('([^/]+)\\.([a-z0-9]+)$', 'i');
		var re_video = (new RegExp()).compile('(wmv|mpg|mpeg|flv|mp4|swf|avi|wmv|ra|mkv|rm|asf)','i');
		var re_audio = (new RegExp()).compile('(mp3|m4a|wma|wav|ogg|spx|flac|fla|aac|aiff|tta|tak|ape)','i');
		var re_image = (new RegExp()).compile('(jpg|png|gif|bmp|jpeg|svg|eps|epsf|tif|tiff|tga)','i');
		var re_document = (new RegExp()).compile('(pdf|doc|docx|ppt|pptx|xls|xlsx|odt|ods|odp)','i');

		var mktag = function(_link, _tagname, _color){
			if (_color) return '<span style="font-weight:bold;color:'+ _color +'">['+ _tagname +']</span>'+ _link.innerHTML;
			return '<span style="font-weight:bold;">['+ _tagname +']</span>'+ _link.innerHTML;
		};

		var cm=0, ci=0, ca=0, cd=0;
		for (var j=0,x; x=links[j]; ++j) {
			var ext = '';
			if (re_ext.test(x.href)) ext = RegExp.$2;

			if (re_video.test(ext)) {
				x.innerHTML = mktag(x, 'MOV'+(++cm)+'/'+ext);
				x.style.color = 'firebrick';
			} else if (re_image.test(ext)) {
				x.innerHTML = mktag(x, 'IMG'+(++ci)+'/'+ext);
				x.style.color = 'orangered';
			} else if (re_audio.test(ext)) {
				x.innerHTML = mktag(x, 'AUD'+(++ca)+'/'+ext);
				x.style.color = 'purple';
			} else if (re_document.test(ext)) {
				x.innerHTML = mktag(x, 'DOC'+(++cd)+'/'+ext);
				x.style.color = 'forestgreen';
			} else {
				x.innerHTML = mktag(x, '/'+ext);
				x.style.color = 'tan';
				//x.style.textDecoration = 'line-through';
			}

			if (x.hostname == hostself) {
				x.innerHTML = mktag(x, 'self', 'dodgerblue');
			}
		}
		_document.title='[m:'+ cm + '/a:'+ ca +'/i:'+ ci +'/d:'+ cd +']'+_document.title;
	}},
}, // ~GESTURES

init:function(){
	var self=this;
	var events=["mousedown","mousemove","mouseup","contextmenu"];
	if(this.enableRockerGestures)events.push("draggesture");
	if(this.enableWheelGestures)events.push("DOMMouseScroll");
	function registerEvents(aAction,eventArray){
		eventArray.forEach(function(aType){
				getBrowser().mPanelContainer[aAction+"EventListener"](aType,self,aType=="contextmenu");
		});
	};
	registerEvents("add",events);
	window.addEventListener("unload",function(){
			registerEvents("remove",events);
		},false);
},

handleEvent:function(event){
	switch(event.type){
		case"mousedown":
			if(event.button==2){
				this._isMouseDownR=true;
				this._hideFireContext=false;
				this._startGesture(event);
			}
			if(this.enableRockerGestures){
				if(event.button==2&&this._isMouseDownL){
					this._isMouseDownR=false;
					this._shouldFireContext=false;
					this._hideFireContext=true;
					this._directionChain="L>R";
					this._stopGesture(event);
				}else if(event.button==0){
					this._isMouseDownL=true;
					if(this._isMouseDownR){
						this._isMouseDownL=false;
						this._shouldFireContext=false;
						this._hideFireContext=true;
						this._directionChain="L<R";
						this._stopGesture(event);
					}
				}
			}
			break;
		case"mousemove":
			if(this._isMouseDownR){
				this._hideFireContext=true;
				this._progressGesture(event);
			}
			break;
		case"mouseup":
			if(event.ctrlKey&&event.button==2){
				this._isMouseDownL=false;
				this._isMouseDownR=false;
				this._shouldFireContext=false;
				this._hideFireContext=false;
				this._directionChain='';
				event.preventDefault();
				XULBrowserWindow.statusTextField.label="Reset Gesture";
				break;
			}
			if(this._isMouseDownR&&event.button==2){
				if(this._directionChain)this._shouldFireContext=false;
				this._isMouseDownR=false;
				this._stopGesture(event);
				if(this._shouldFireContext&&!this._hideFireContext){
					this._shouldFireContext=false;
					this._displayContextMenu(event);
				}
			}else if(this.enableRockerGestures&&event.button==0&&this._isMouseDownL){
				this._isMouseDownL=false;
				this._shouldFireContext=false;
			}else if(this.enablePopupGestures&&(event.button==0||event.button==1)&&event.target.localName=='menuitem'){
				this._isMouseDownL=false;
				this._shouldFireContext=false;
				var popup=document.getElementById(this.POPUP_ID);
				var activeItem=event.target;
				switch(popup.getAttribute("gesturecommand")){
					case"WebSearchPopup":
						var selText=popup.getAttribute("selectedtext");
						var engine=activeItem.engine;
						if(!engine)break;
						var submission=engine.getSubmission(selText,null);
						if(!submission)break;
						document.getElementById('searchbar').textbox.value=selText;
						gBrowser.loadOneTab(submission.uri.spec,null,null,submission.postData,null,false);
						break;
					case"ClosedTabsPopup":
						undoCloseTab(activeItem.index);
						break;
					case"HistoryPopup":
						gBrowser.webNavigation.gotoIndex(activeItem.index);
						break;
					case"AllTabsPopup":
						gBrowser.selectedTab=gBrowser.mTabs[activeItem.index];
						break;
					case"GoogleSuggestPopup":
						var suggestion=activeItem.suggestion;
						document.getElementById('searchbar').textbox.value=suggestion;
						var url='http://www.google.co.jp/search?hl=ja&ie=utf-8&oe=utf-8&q='
									+ encodeURIComponent(suggestion);
						gBrowser.loadOneTab(url,null,null,null,false,false);
						break;
				}
				popup.hidePopup();
			}
			break;
	case"popuphiding":
		var popup=document.getElementById(this.POPUP_ID);
		popup.removeEventListener("popuphiding",this,true);
		document.documentElement.removeEventListener("mouseup",this,true);
		while(popup.hasChildNodes())popup.removeChild(popup.lastChild);
		break;
	case"contextmenu":
		if(this._isMouseDownL||this._isMouseDownR||this._hideFireContext){
			event.preventDefault();
			event.stopPropagation();
			this._shouldFireContext=true;
			this._hideFireContext=false;
		}
		break;
	case"DOMMouseScroll":
		if(this.enableWheelGestures&&this._isMouseDownR){
			event.preventDefault();
			event.stopPropagation();
			this._shouldFireContext=false;
			this._hideFireContext=true;
			this._directionChain="W"+(event.detail>0?"+":"-");
			this._stopGesture(event);
		}
		break;
	case"draggesture":
		this._isMouseDownL=false;
		break;
	}
},

_displayContextMenu:function(event){
	var evt=event.originalTarget.ownerDocument.createEvent("MouseEvents");
	evt.initMouseEvent("contextmenu",true,true,event.originalTarget.defaultView,0,event.screenX,event.screenY,event.clientX,event.clientY,false,false,false,false,2,null);
	event.originalTarget.dispatchEvent(evt);
},

_startGesture:function(event){
	this._lastX=event.screenX;
	this._lastY=event.screenY;
	this._directionChain="";
},

_progressGesture:function(event){
	var x=event.screenX, y=event.screenY;
	var lastX=this._lastX, lastY=this._lastY;
	var subX=x-lastX, subY=y-lastY;
	var distX=(subX>0?subX:(-subX)),distY=(subY>0?subY:(-subY));
	var direction;
	if(distX<10&&distY<10)return;
	if(distX>distY)direction=subX<0?"L":"R";
	else direction=subY<0?"U":"D";
	var dChain = this._directionChain;
	if(direction!=dChain.charAt(dChain.length-1)){
		dChain+=direction;
		this._directionChain+=direction;
		var gesture=this.GESTURES[dChain];
		XULBrowserWindow.statusTextField.label="Gesture: "+dChain+(gesture?' ('+gesture.name+')':'');
	}
	this._lastX=x;
	this._lastY=y;
},

_stopGesture:function(event){
	try{
		if(dChain=this._directionChain)this.GESTURES[dChain].cmd(this,event);
		XULBrowserWindow.statusTextField.label="";
	}catch(e){
		XULBrowserWindow.statusTextField.label='Unknown Gesture: '+dChain;
	}
	this._directionChain="";
},

_buildPopup:function(event,gestureCmd){
	if(!this.enablePopupGestures)return;
	var popup=document.getElementById(this.POPUP_ID);
	if(!popup){
		popup=document.createElement("popup");
		popup.id=this.POPUP_ID;
	}

	document.getElementById("mainPopupSet").appendChild(popup);
	popup.setAttribute("gesturecommand",gestureCmd);

	switch(gestureCmd){
		case"WebSearchPopup":
			var searchSvc = Cc["@mozilla.org/browser/search-service;1"].getService(Ci.nsIBrowserSearchService);
			var engines=searchSvc.getVisibleEngines({});
			if (engines.length<1)
				throw "No search engines installed.";
			for (var i=engines.length-1; i>=0; --i){
				var engine = engines[i];
				var menuitem = document.createElement("menuitem");
				menuitem.setAttribute("label",engine.name);
				menuitem.setAttribute("class","menuitem-iconic");
				if (engine.iconURI) menuitem.setAttribute("src", engine.iconURI.spec);
				popup.insertBefore(menuitem,popup.firstChild);
				menuitem.engine = engine;
			}
			popup.setAttribute("selectedtext", getBrowserSelection().toString());
			break;
		case"ClosedTabsPopup":
			try {
				if (!gPrefService.getBoolPref("browser.sessionstore.enabled"))
					throw "Session Restore feature is disabled.";
			} catch (e) {}
			var ss = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);
			if (ss.getClosedTabCount(window)==0)
				throw "No restorable tabs in this window.";
			var undoItems = eval("("+ss.getClosedTabData(window)+")");
			for(var i=0,itm; item=undoItems[i]; i++){
				var menuitem = popup.appendChild(document.createElement("menuitem"));
				menuitem.setAttribute("label", item.title);
				menuitem.setAttribute("class", "menuitem-iconic bookmark-item");
				menuitem.index = i;
				var iconURL = item.image;
				if (iconURL) menuitem.setAttribute("image", iconURL);
			}
			break;
		case"HistoryPopup":
			var sessionHistory = gBrowser.webNavigation.sessionHistory;
			if (sessionHistory.count<1)
				throw "No back/forward history for this tab.";
			var curIdx = sessionHistory.index;
			for (var i=0,entry; entry=sessionHistory.getEntryAtIndex(i,false); i++){
				if (!entry) continue;
				var menuitem = document.createElement("menuitem");
				popup.insertBefore(menuitem, popup.firstChild);
				menuitem.setAttribute("label", entry.title);
				try {
					var iconURL = Cc["@mozilla.org/browser/favicon-service;1"].getService(Ci.nsIFaviconService).getFaviconForPage(entry.URI).spec;
					menuitem.style.listStyleImage = "url("+iconURL+")";
				} catch (e) {}
				menuitem.index = i;
				if (i == curIdx){
					menuitem.style.listStyleImage = "";
					menuitem.setAttribute("type", "radio");
					menuitem.setAttribute("checked", "true");
					menuitem.className = "unified-nav-current";
					activeItem = menuitem;
				} else {
					menuitem.className = i<curIdx ? "unified-nav-back menuitem-iconic" : "unified-nav-forward menuitem-iconic";
				}
			}
			break;
		case"AllTabsPopup":
			var tabs = gBrowser.mTabs;
			if (tabs.length<1) return;
			for(var i=0,tab; tab=tabs[i]; i++){
				var menuitem = popup.appendChild(document.createElement("menuitem"));
				menuitem.setAttribute("class", "menuitem-iconic bookmark-item");
				menuitem.setAttribute("label", tab.label);
				menuitem.setAttribute("crop", tab.getAttribute("crop"));
				menuitem.setAttribute("image", tab.getAttribute("image"));
				menuitem.index = i;
				if (tab.selected)
					activeItem = menuitem;
			}
			break;
		case"GoogleSuggestPopup":
			var seltext = getBrowserSelection().toString();
			if (!seltext) return;
			var url = 'http://www.google.co.jp/complete/search?output=toolbar&q='
							+ encodeURIComponent(seltext); 

			var req = new XMLHttpRequest()
			req.open('GET', url, true);
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (req.status == 200) {
						var res = req.responseXML;
						var tags = res.getElementsByTagName('suggestion');
						var suggestions = new Array();

						suggestions.push(seltext);
						for (var i=0,tag; tag=tags[i]; ++i)
							suggestions.push(tag.getAttribute('data'));

						for (var i=0, sugg; sugg=suggestions[i]; ++i) {
							var menuitem = document.createElement("menuitem");
							menuitem.setAttribute("label", sugg);
							menuitem.suggestion = sugg;
							popup.appendChild(menuitem);
						}
					} else {
						//alert('Error: MouseGesutures > GoogleSuggestPopup:\n'+ url);
					}
				}
			};
			req.send(null);
			break;
		case"KeyPhrasePopup":
			var seltext = getBrowserSelection().toString();
			if (!seltext) return;
			var url = 'http://jlp.yahooapis.jp/KeyphraseService/V1/extract?appid=<あなたのアプリケーションID>&sentence=<対象のテキスト>'
							+ encodeURIComponent(seltext); 

			var req = new XMLHttpRequest()
			req.open('GET', url, true);
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (req.status == 200) {
						var res = req.responseXML;
						var tags = res.getElementsByTagName('suggestion');
						var suggestions = new Array();

						suggestions.push(seltext);
						for (var i=0,tag; tag=tags[i]; ++i)
							suggestions.push(tag.getAttribute('data'));

						for (var i=0, sugg; sugg=suggestions[i]; ++i) {
							var menuitem = document.createElement("menuitem");
							menuitem.setAttribute("label", sugg);
							menuitem.suggestion = sugg;
							popup.appendChild(menuitem);
						}
					} else {
						//alert('Error: MouseGesutures > GoogleSuggestPopup:\n'+ url);
					}
				}
			};
			req.send(null);
			
	}
	document.popupNode=null;
	document.tooltipNode=null;
	popup.addEventListener("popuphiding",this,true);
	popup.openPopup(null,"",event.clientX,event.clientY,false,false);
	document.documentElement.addEventListener("mouseup",this,true);
},

saveLinkToLocal: function(url, fpath, skipPrompt) {
	var file = null;
	if (!skipPrompt) {
		var nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(document.commandDispatcher.focusedWindow, "Select a File", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterImages);
		fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterHTML);
		fp.defaultString = fpath;
		switch (fp.show()) {
			case (nsIFilePicker.returnOK):
			case (nsIFilePicker.returnReplace):
				file = fp.file;
				break;
			case (nsIFilePicker.returnCancel):
			default:
				return null;
		}
	} else {
		file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fpath);
	}

	var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
											.createInstance(Ci.nsIWebBrowserPersist);
	var nsIWBPersist = Ci.nsIWebBrowserPersist;
	persist.persistFlags = nsIWBPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES
											| nsIWBPersist.PERSIST_FLAGS_FROM_CACHE;

	var uri = Cc['@mozilla.org/network/io-service;1']
					.getService(Ci.nsIIOService).newURI(url, null, null);

	try {
		//saveURL(url, fpath, null, false, skipPrompt, null);
		persist.saveURI( uri, null, null, null, "", file);
	} catch (ex) { alert('failed:\n' + ex); return null; }
	return file; // nsILocalFileObject or null
},

saveTextToLocal: function(text, fpath, skipPrompt) {
	var file = null;
	if (!skipPrompt) {
		var nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(document.commandDispatcher.focusedWindow, "Select a File", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterImages);
		fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
		fp.defaultString = fpath;
		switch (fp.show()) {
			case (nsIFilePicker.returnOK):
			case (nsIFilePicker.returnReplace):
				file = fp.file;
				break;
			case (nsIFilePicker.returnCancel):
			default:
				return null;
		}
	} else {
		file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(fpath);
	}
	var strm = Cc["@mozilla.org/network/file-output-stream;1"]
							 .createInstance(Ci.nsIFileOutputStream);
	var convert = Cc['@mozilla.org/intl/scriptableunicodeconverter']
				.getService(Ci.nsIScriptableUnicodeConverter);
	convert.charset = "UTF-8";
	text = convert.ConvertFromUnicode(text);
	try {
		strm.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		strm.write(text, text.length);
		strm.flush();
	} catch (ex) {
		alert('failed:\n' + ex);
		file = null;
	}
	strm.close();
	return file; // nsILocalFileObject or null
},

Album: function(){
	// ページ内のURLを拾って連想配列に収める。URLの重複は無い。
	// album.URLs   : URLが収められている連想配列（値は適当）
	// album.length : URLsの長さ
	// 
	this.length = 0;
	this.URLs = {};

	this._reTextLink = (new RegExp()).compile('([a-z0-9\+\$\;\?\.\*\/%,!#~:@&=_-]+)','ig');
	this._re0 = (new RegExp()).compile('^http(s?):\/\/', 'i');
	this._re1 = (new RegExp()).compile('^t?t?p(s?):\/\/', 'i');
	this._re2 = (new RegExp()).compile('^h[\+\*\?]{2}p(s?):\/\/', 'i');
	this._re3 = (new RegExp()).compile('^h[\+\*\?]{3}s:\/\/', 'i');
	this._re4 = (new RegExp()).compile('^www\.', 'i');
	this._re5 = (new RegExp()).compile('^([a-z0-9\.:_-]+\.(com|jp|net|org|info|edu|ar|au|bd|fr|cn|ca|de|dk|uk|hk|in|kr|ru|sg|tw|us|se|it|es|int|gov)/)', 'i');

	this.count = function(){
		var c=0;
		for (x in this.URLs) {c++;}
		this.length = c;
		return this.length;
	};

	// DOMを走査してURLを拾う
	this.import = function(_ownerDocument, _parentNode, _reFilter, _minWidth, _minHeight) {
		_minWidth = (_minWidth != undefined) ? _minWidth : 50;
		_minHeight = (_minHeight != undefined) ? _minHeight : 50;
		var treeWalker = _ownerDocument.createTreeWalker(_parentNode, NodeFilter.SHOW_ELEMENT, null, true);
		while (treeWalker.nextNode()) {
			var node = treeWalker.currentNode;
			var url;
			if ((node instanceof HTMLAnchorElement) && node.href
					&& node.href.match(_reFilter))
				{ url=node.href; }
			else if ((node instanceof HTMLImageElement) && node.src
					&& node.src.match(_reFilter)
					&& node.naturalWidth > _minWidth
					&& node.naturalHeight > _minHeight)
				{ url=node.src; }
			else { url = null; }
			if (url) this.URLs[url] = true;
		}

		this.count();
		return this;
	};

	// documentコンテントを走査して、テキストリンクを拾う。
	// ttp://, www. などの中途半端なURLも拾う。
	this.importTextLinks = function(_content, _reFilter){
		var self = this;
		_content = _content.split('\n');
		_content.forEach(function(t){
			var mArr = t.match(self._reTextLink);
			if (!mArr) return;
			for (var i=0, m; m=mArr[i]; i++) {
				if (!m || m.length < 10) return;
				m = self._re0.test(m) ? m :
					self._re1.test(m) ? m.replace(self._re1, 'http$1://') :
					self._re2.test(m) ? m.replace(self._re2, 'http$1://') :
					self._re3.test(m) ? m.replace(self._re3, 'http://') :
					self._re4.test(m) ? m.replace(self._re4, 'http://www.') :
					self._re5.test(m) ? m.replace(self._re5, 'http://$1') : null;
				if ( m && _reFilter.test(m) ) self.URLs[m] = true;
			}
		});
		this.count();
		return this;
	};

	// 選択範囲があるならその中を、無いならドキュメント全体からURLを拾い集める。
	this.autoImport = function(_window, _reFilter, _minWidth, _minHeight, _skipTextLink){
		var sel = _window.getSelection();
		if (sel && !sel.isCollapsed) {
			//選択範囲がある場合はその部分を走査
			for (var i=0; i<sel.rangeCount; i++) {
				var range = sel.getRangeAt(i);
				var frag = range.cloneContents();
				this.import(frag.ownerDocument, frag, _reFilter, _minWidth, _minHeight);
			}

			if (!_skipTextLink) // テキストリンクも取り込む。
				this.importTextLinks(sel.toString(), _reFilter);

		} else {
			// 選択範囲がない場合_documentを全て走査
			var _document = _window.document;
			this.import(_document, _document.body, _reFilter, _minWidth, _minHeight);

			if (!_skipTextLink) this.importTextLinks(_document.body.textContent, _reFilter);
			if (_window.frames.length>0) {
				for (var i=0,fr;fr=_window.frames[i];i++) {
					this.import(fr.document, fr.document.body, _reFilter, _minWidth, _minHeight);
					if (!_skipTextLink)
						this.importTextLinks(fr.document.body.textContent, _reFilter);
				}
			}
		}
		return this;
	};
}, /* ~ Album() */

};

ucjsMouseGestures.init();



//==Misc==
// @homepage     http://d.hatena.ne.jp/Griever
// @description  おまけ機能
//==/Misc==

// マウスホイールで「次を検索」「前を検索」
gFindBar.addEventListener('DOMMouseScroll', function (event){
	gFindBar.onFindAgainCommand(event.detail < 0);
}, false);

// タブバーを中クリックで閉じたタブを戻す
gBrowser.mTabContainer.addEventListener('mousedown', function (event){
	if (event.target.localName != 'tab' && event.button == 1){
		document.getElementById('History:UndoCloseTab').doCommand();
	}
}, false);

// タブをダブルクリックで更新
gBrowser.mTabContainer.addEventListener('dblclick', function (event){
	if (event.target.localName == 'tab' && event.button == 0){
		getBrowser().getBrowserForTab(event.target).reload();
	}
}, false);


// vim: fenc=utf-8 ff=unix
