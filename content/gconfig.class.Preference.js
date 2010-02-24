var Preference = function(key, type) {
	if(!key)
		return false;
	this.key = key;
	
	var types = {"32": "Char", "64": "Int", "128": "Bool"};
	this.type = (types[type] || type || types[gcCore.MozPreferences.getPrefType(this.key)] || false);
	if(!this.type)
		return false;
	
	gcCore.addObserver(this.key, this._onchange, this, "Preference");
}

Preference.prototype.onchange = function() {}
Preference.prototype._onchange = function() {
	this.onchange();
}

Preference.prototype.__defineGetter__("exists", function() {
	return this.getPref() != null;
});

Preference.prototype.getPref = function(d) {
	try {
		return gcCore.MozPreferences["get" + this.type + "Pref"](this.key);
	}
	catch (e) {
		return (d || null);
	}
}

Preference.prototype.setPref = function(value) {
	return gcCore.MozPreferences["set" + this.type + "Pref"](this.key, value);
}

Preference.prototype.resetPref = function() {
	try {
		return gcCore.MozPreferences.clearUserPref(this.key);
	}
	catch (e) {
		return false;
	}
}

Preference.prototype.getDefaultValue = function() {
	gcCore.stopObserver(this.key, "Preference");
	var current_value = this.getPref();
	this.resetPref();
	var default_value = this.getPref();
	this.setPref(current_value);
	return default_value;
	gcCore.startObserver(this.key, "Preference");
}