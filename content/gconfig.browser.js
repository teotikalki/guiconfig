var guiconfig = {
	
	MozPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
	
	init: function() {
		this.MozPreferences = this.MozPrefs.getBranch(null);
		
		window.addEventListener("load", this.placeMenuItem, false);
		
		this.MozPrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.MozPrefs.addObserver("", this, false);
	},
	
	observe: function(subject, topic, data) {
		if(topic != "nsPref:changed")
			return;

		switch(data) {
			case 'extensions.guiconfig.sticktopreferences':
				guiconfig.placeMenuItem();
				break;
			
			case "extensions.guiconfig.matchversion":
				if(this.configIsOpen())
					this.configWindow.guiconfig.updatePreferences();
				break;
			
			case 'browser.preferences.instantApply':
				if(this.configIsOpen())
					this.configWindow.guiconfig.setButtons();
			
			default:
				if(this.configIsOpen())
					this.configWindow.guiconfig.observeOption.call(this.configWindow.guiconfig, data);
				break;
		}
	},
	
	placeMenuItem: function() {
		var stick = guiconfig.MozPreferences.getBoolPref("extensions.guiconfig.sticktopreferences");
		var tools_menu = document.getElementById("menu_ToolsPopup");
		var pref_menuitem = document.getElementById("menu_preferences");
		var gc_menuitem = document.getElementById("gcToolsItem");

		if(pref_menuitem && stick && gc_menuitem.previousSibling != pref_menuitem) {
			if(!pref_menuitem.nextSibling)
				pref_menuitem.parentNode.appendChild(gc_menuitem.cloneNode(true));
			else
				pref_menuitem.parentNode.insertBefore(gc_menuitem.cloneNode(true), pref_menuitem.nextSibling);
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		}
		else if((!pref_menuitem || !stick) && gc_menuitem.parentNode != tools_menu) {
			tools_menu.appendChild(gc_menuitem.cloneNode(true));
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		}
		return true;
	},
	
	openWindow: function() {
		if(this.configIsOpen())
			this.configWindow.focus();
		else
			this.configWindow = window.open("chrome://guiconfig/content/config.xul", "gcwindow", "chrome");
	},
	
	configIsOpen: function() {
		return (!!this.configWindow && !this.configWindow.closed);
	}
}