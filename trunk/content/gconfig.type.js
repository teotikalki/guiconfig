guiconfig.__proto__ = {
	boolean: {
		write : function(obj) {
			var value = guiconfig.tryPref(obj);
			var c = document.createElement("checkbox");
			if (value != null)
				c.setAttribute("checked", value);
			else {
				c.setAttribute("disabled", true);
				var mwrt = guiconfig.addOptButton("edit", obj, [c]);
			}
			c.setAttribute("label", obj.name);
			c.setAttribute("id", obj.key);
			return [c, mwrt];
		},
		get : function(obj) {
			try {
				return guiconfig.pref.getBranch("").getBoolPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null)
				return false;
			guiconfig.pref.setBoolPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.pref.getBranch("").setBoolPref(obj.bind[i],
								value);
				if (typeof obj.bind == "string")
					guiconfig.pref.getBranch("").setBoolPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ? document
					.getElementById(obj.key).checked : null;
		},
		reset : function(obj) {
			try {
				return guiconfig.pref.getBranch("").clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	},
	integer : {
		write : function(obj) {
			var value = guiconfig.tryPref(obj);
			var l = document.createElement("label");
			l.setAttribute("value", obj.name);
			l.setAttribute("control", obj.key);
			l.setAttribute("class", "optionLabel");
			if (obj.select) {
				var c = guiconfig.buildSelect(obj, value);
				if (value == null) {
					c.setAttribute("disabled", true);
					var mwrt = guiconfig.addOptButton("edit", obj, [l, c]);
				}
			} else {
				var c = document.createElement("textbox");
				if (value != null)
					c.setAttribute("value", value);
				else {
					c.setAttribute("disabled", true);
					var mwrt = guiconfig.addOptButton("edit", obj, [l, c]);
				}
				c.setAttribute("id", obj.key);
				c.setAttribute("flex", 2);
			}
			return [l, c, mwrt];
		},
		get : function(obj) {
			try {
				return guiconfig.pref.getBranch("").getIntPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null)
				return false;
			guiconfig.pref.setIntPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.pref.getBranch("").setIntPref(obj.bind[i],
								value);
				if (typeof obj.bind == "string")
					guiconfig.pref.getBranch("").setIntPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ? document
					.getElementById(obj.key).value : null;
		},
		reset : function(obj) {
			try {
				return guiconfig.pref.getBranch("").clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	},
	char : {
		write : function(obj) {
			var value = guiconfig.tryPref(obj);
			var l = document.createElement("label");
			l.setAttribute("value", obj.name + ":");
			l.setAttribute("control", obj.key);
			l.setAttribute("class", "optionLabel");
			if (obj.select) {
				var c = guiconfig.toSelect(obj, value);
				if (value == null) {
					c.setAttribute("disabled", true);
					var mwrt = guiconfig.addOptButton("edit", obj, [l, c]);
				}
			} else {
				var c = document.createElement("textbox");
				if (value != null)
					c.setAttribute("value", value);
				else {
					c.setAttribute("disabled", true);
					var mwrt = guiconfig.addOptButton("edit", obj, [l, c]);
				}
				c.setAttribute("id", obj.key);
			}
			return [l, c, mwrt];
		},
		get : function(obj) {
			try {
				return guiconfig.pref.getBranch("").getCharPref(obj.key);
			} catch (e) {
				return null;
			}
		},
		set : function(obj, value) {
			if (value == null)
				return false;
			guiconfig.pref.setCharPref(obj.key, value);
			if (obj.bind) {
				if (typeof obj.bind == "array")
					for (var i = 0; i < obj.bind.length; i++)
						guiconfig.pref.getBranch("").setCharPref(obj.bind[i],
								value);
				if (typeof obj.bind == "string")
					guiconfig.pref.getBranch("").setCharPref(obj.bind, value);
			}
			return true;
		},
		value : function(obj) {
			return (guiconfig.tryPref(obj) != null) ? document
					.getElementById(obj.key).value : null;
		},
		reset : function(obj) {
			try {
				return guiconfig.pref.getBranch("").clearUserPref(obj.key);
			} catch (e) {
				return false;
			}
		}
	}
}