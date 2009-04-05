/**
 * @description Class for basic preferences operations
 * @param {} key
 * @param {} type
 * TODO Add conditions for disabling/enabling preferences dynamically
 */
var Preference = function(key, type, options) {
	this.key = __(key, "");
	this.type = __(type, "");
	this.Bind = __(guiconfig.Bindings[this.key], new Object);
	this.Options = __(options, new Object);	
	this.Elements = { Buttons: new Object };
	this.name = guiconfig.getLocaleString(this.key.replace(/\./g, "_") + "_name", guiconfig.LocaleOptions);
	this.description = guiconfig.getLocaleString(this.key.replace(/\./g, "_") + "_description", guiconfig.LocaleOptions);
}

/**
 * @description Helper function to create a new Preference instance out of a XML node
 * @param {} pref
 * @return {}
 */
Preference.instance = function(pref) {
	var key = pref.getAttribute("key");
	var type = __(pref.getAttribute("config"), {"32": "Char", "64": "Int", "128": "Bool"}[gcCore.MozPreferences.getPrefType(key)], null);
	var options = {
		type: __(pref.getAttribute("type"), "default"),
		defaultValue: __(pref.getAttribute("default"), null),
		indent: !!pref.getAttribute("indent"),
		version: __(pref.getAttribute("version"), null),
		minVersion: __(pref.getAttribute("minVersion"), null),
		maxVersion: __(pref.getAttribute("maxVersion"), null),
		validValues: new Array,
		bindings: new Array,
		fileFilters: new Array
	};
	for(var children = pref.childNodes, i = 0, l = children.length, data, child; i < l; i++) {
		child = children[i];
		switch(child.nodeName) {
			case 'option':
				data = child.firstChild.data;
				options.validValues.push(gcCore.validateVersion(gcCore.MozInfo.version, __(child.getAttribute("minVersion"), null), __(child.getAttribute("maxVersion"), null))?(type=="Int"?parseInt(data):(type=="Bool"?!!data:data)):null);
				break;
			case 'bind':
				for(var bindings = child.childNodes, e = 0, bl = bindings.length, binding, preference; e < bl; e++) {
					binding = bindings[e];
					if(binding.nodeName != "pref")
						continue;
					preference = Preference.instance(binding);
					if(!preference)
						continue;
					options.bindings.push(preference);
				}
				break;
			case 'filter':
				options.fileFilters.push("filter" + child.firstChild.data);
				break;
		}
	}
	try {
		return new window[type + "Preference"](key, type, options);
	}
	catch(e) {
		return false;
	}
}

Preference.customBinding = function(key, proto) {
	var bind_functions = new Object;
	for(var i in proto)
		bind_functions[i] = proto[i];
	guiconfig.Bindings[key] = bind_functions;
}

Preference.prototype.onvaluechange = function() {
	if(!gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply"))
		return false;
	return this.setPref();
}

Preference.prototype.onprefchange = function() {
	if(this.getPref() == null)
		this.disabled = true;
	else
		this.setValue();
}

/**
 * @description Get the value of a preference from the current Firefox preferences
 * @param {string} def
 * @return {}
 */
Preference.prototype.getPref = function(def) {
	if($defined(this.Bind.getPref))
		return this.Bind.getPref.call(this, def);
	else
		return this.getCustomPref(this.type, def);
}

Preference.prototype.getCustomPref = function(type, def) {
	try {
		return gcCore.MozPreferences["get" + type + "Pref"](this.key);
	}
	catch (e) {
		return __(def, null);
	}
}

/**
 * @description Set the value of a preference in the Firefox preferences
 * @param {} v
 * @return {bool}
 */
Preference.prototype.setPref = function(value) {
	var set_pref = true;
	if(!$defined(value))
		var value = this.getValue();
	guiconfig.stop_option_observation = true;
	if($defined(this.Bind.setPref))
		set_pref = this.Bind.setPref.call(this, value);
	else if(this.Options.bindings.length > 0)
		for(var i = 0, l = this.Options.bindings.length; i < l; i++)
			this.Options.bindings[i].setPref(value);
	if(set_pref)
		this.setCustomPref(this.type, value);
	guiconfig.stop_option_observation = false;
	return true;
}

Preference.prototype.setCustomPref = function(type, value) {
	return gcCore.MozPreferences["set" + type + "Pref"](this.key, value);
}

/**
 * @description Reset a preference to its default value
 * @return {bool}
 */
Preference.prototype.reset = function() {
	try {
		gcCore.MozPreferences.clearUserPref(this.key);
		if($defined(this.Bind.reset))
			this.Bind.reset.call(this);
		else if(this.Options.bindings.length > 0)
			for(var i = 0, l = this.Options.bindings.length; i < l; i++)
				this.Options.bindings[i].reset();
		this.onprefchange();
		return true;
	}
	catch (e) {
		return false;
	}
}

/**
 * @description Build the XUL tree for this preference
 */
Preference.prototype.build = function() {
	this.Elements.prefRow = document.createElement("hbox");
	this.Elements.prefRow.setAttribute("context", "gcoptrightclick");
	this.Elements.prefRow.setAttribute("class", "optionRow");
	this.Options.indent && this.Elements.prefRow.setAttribute("class", "indent");
	this.Elements.prefRow.Preference = this;

	this.Elements.prefBox = document.createElement("hbox");
	this.Elements.prefBox.setAttribute("flex", "2");
	this.Elements.prefBox.addEventListener("mouseover", function(Preference) {
		return function() { guiconfig.setDescription(Preference.description); }
	}(this), false);
	
	this.Elements.buttonBox = document.createElement("hbox");
	
	this.Elements.prefRow.appendChild(this.Elements.prefBox);
	this.Elements.prefRow.appendChild(this.Elements.buttonBox);
}

/**
 * @description Build a menu list
 * @return {element}
 */
Preference.prototype.buildMenuList = function() {	
	var select = new Array,
		menulist, menupopu, menuitem,
		labels = guiconfig.getSelectLocaleStrings(this);
	
	menulist = document.createElement("menulist");
	menulist.addEventListener("command", function(Preference) {
		return function() {
			Preference.onvaluechange();
		}
	}(this), false);
	menupopup = document.createElement("menupopup");
	
	for (var i = 0, l = this.Options.validValues.length; i < l; i++) {
		if(this.Options.validValues[i] == null)
			continue;
		menuitem = document.createElement("menuitem");
		menuitem.setAttribute("crop", "end");
		menuitem.setAttribute("label", labels[i]);
		menuitem.setAttribute("value", this.Options.validValues[i]);
		menupopup.appendChild(menuitem);
	}
	
	menulist.appendChild(menupopup);
	return menulist;
}

Preference.prototype.buildTextBox = function() {
	var textbox = document.createElement("textbox");
	textbox.setAttribute("flex", "1");
	textbox.addEventListener("keydown", function() {
		guiconfig.timeout && window.clearTimeout(guiconfig.timeout);
	}, false);
	textbox.addEventListener("keyup", function(Preference) {
		return function() {
			guiconfig.timeout = window.setTimeout(function() {
				Preference.onvaluechange();
			}, 700);
		}
	}(this), false);
	return textbox;
}

Preference.prototype.buildColorPicker = function() {
	var colorpicker = document.createElement("colorpicker");
	colorpicker.setAttribute("type", "button");
	colorpicker.addEventListener("change", function(Preference) {
		return function() {
			Preference.onvaluechange();
		}
	}(this), false);	
	return colorpicker;
}

Preference.prototype.addButton = function(type) {
	if(this.hasButton(type))
		return true;
	
	this.Elements.Buttons[type] = document.createElement("button");

	switch(type) {
		case 'edit':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-edit-enable", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("add"));
			this.Elements.Buttons[type].addEventListener("click", function(Preference) {
				return function() {
					Preference.disabled = false;
				}
			}(this), false);
			break;

		case 'color':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-custom-value", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("color"));
			this.Elements.Buttons[type].addEventListener("click", function(Preference) {
				return function() {
					var input = gcCore.userInput("gui:config", guiconfig.getLocaleString("fill-in-value", guiconfig.LocaleOptions));
					if(input != null) {
						Preference.disabled = false;
						Preference.setValue(input);
						Preference.onvaluechange();
					}
				}
			}(this), false);
			break;
		
		case 'file':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-file-select", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].addEventListener("click", function(Preference) {
				return function() {
					var input = gcCore.fileInput(guiconfig.getLocaleString("choose-file", guiconfig.LocaleOptions), Preference.Options.fileFilters);
					if(input) {
						Preference.disabled = false;
						Preference.setValue(input.path);
						Preference.onvaluechange();
					}
				}
			}(this), false);
			break;

	}
	this.Elements.buttonBox.appendChild(this.Elements.Buttons[type]);
	return true;
}

Preference.prototype.removeButton = function(type) {
	if(!this.hasButton(type))
		return true;
	
	this.Elements.Buttons[type].parentNode.removeChild(this.Elements.Buttons[type]);
	delete this.Elements.Buttons[type];
}

Preference.prototype.hasButton = function(type) {
	return $defined(this.Elements.Buttons[type]);
}

/**
 * @description Property "exists" is true if there is a preference with a key "this.key"
 */
Preference.prototype.__defineGetter__("exists", function() {
	return this.getPref() != null;
});

Preference.prototype.__defineSetter__("disabled", function(value) {
	this.Options.disabled = !!value;
	this[(value ? "addButton" : "removeButton")]("edit");
	this.Elements.option.setAttribute("disabled", (value ? "true" : ""));
	this.Elements.option.disabled = !!value;
	if(this.Options.defaultValue)
		this.setValue(this.Options.defaultValue);
	if(!value)
		this.setPref();
});

Preference.prototype.__defineGetter__("disabled", function() {
	return this.Options.disabled;
});