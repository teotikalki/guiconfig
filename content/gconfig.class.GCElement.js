var GCElement = function(type, options) {
	var
	returnValue,
	element,
	klass = this,
	options = options || new Object,
	
	buildElement = function(type, options) {
		var fragment = document.createDocumentFragment();
		switch(type) {
			case 'group':
				element = document.createElement("groupbox");
				var caption = document.createElement("caption");
				caption.setAttribute("label", options.label.value);
				element.appendChild(caption);
				var innergroup = document.createElement("vbox");
				innergroup.setAttribute("flex", "1");
				element.appendChild(innergroup);
			break;
			
			case 'textbox':
				element = document.createElement("textbox");
				setAttribute("type", options.type);
				if(options.size)
					setAttribute("size", options.size);
				else
					element.setAttribute("flex", "1");
				assignEvents({
					'keyup': options.onchange,
					'command': options.onchange,
					'mouseover': options.onmouseover
				});
				fragment.appendChild(buildLabel(options.label));
			break;
			
			case 'checkbox':
				element = document.createElement("checkbox");
				element.setAttribute("label", options.label.value);
				assignEvents({
					'command': options.onchange,
					'mouseover': options.onmouseover
				});
			break;
			
			case 'colorpicker':
				element = document.createElement("colorpicker");
				element.setAttribute("type", "button");
				assignEvents({
					'change': options.onchange,
					'mouseover': options.onmouseover
				});
				fragment.appendChild(buildLabel(options.label));
			break;
			
			case 'menulist':
				var select = new Array,
					values = options.values,
					menupopup, menuitem;
				
				element = document.createElement("menulist");
				assignEvents({
					'command': options.onchange,
					'mouseover': options.onmouseover
				});
				menupopup = document.createElement("menupopup");
				
				for (var i = 0, l = values.length; i < l; i++) {
					menuitem = document.createElement("menuitem");
					menuitem.setAttribute("crop", "end");
					menuitem.setAttribute("label", values[i].label);
					menuitem.setAttribute("value", values[i].value);
					menupopup.appendChild(menuitem);
				}				
				element.appendChild(menupopup);
				fragment.appendChild(buildLabel(options.label));
			break;
			
			case 'radiogroup':
				var radio,
					values = options.values;
				
				element = document.createElement("radiogroup");
				assignEvents({
					'command': options.onchange,
					'mouseover': options.onmouseover
				});
				
				for(var i = 0, l = values.length; i < l; i++) {
					radio = document.createElement("radio");
					radio.setAttribute("label", values[i].label);
					radio.setAttribute("value", values[i].value);
					element.appendChild(radio);
				}
			break;
			
			default:
				return false;
			break;
		}
		fragment.appendChild(element);
		klass.element = element;
		klass.dom = fragment;
	},
	
	assignEvents = function(events) {
		var event, callback;
		for(var i in events) {
			callback = events[i];
			if(typeof callback == "function") {
				element.addEventListener(i, callback, false);
			}
		}
	},
	
	buildLabel = function(options) {
		var label = document.createElement("label");
		label.setAttribute("value", options.value);
		label.setAttribute("control", options.control);
		label.setAttribute("class", "optionLabel");
		return label;
	};
	
	setAttribute = function(attribute, value) {
		if(value)
			element.setAttribute(attribute, value);
	};
	
	this.inject = function(parent) {
		parent.appendChild(this.dom);
		return this;
	};
	
	buildElement(type, options);
}