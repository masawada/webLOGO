//
// Palm.js (Panel Management Library)
//

var init = function(){
	var panels = [{
		key: 'setting', 
		obj: document.getElementById('setting')
	},{
		key: 'editor', 
		obj: document.getElementById('editor')
	}];
	var palm = Palm(panels);
};

var Palm = function(panels){
	var Class = arguments.callee;
	if(!(this instanceof Class)) return new Class(panels);
	
	var self = this;
	this.opacity = 0.5;
	this.current = '';
	this.zindex = 0;
	this.panels = this.genElmentsArray_(panels);
	
	for(var key in this.panels){
		this.panels[key].obj.onmousemove =  function(e){
			if(self.checkDorR_(this, e.clientX, e.clientY) === true){
				// resize
				this.style.cursor = 'pointer';
				this.onmousedown = function(e){
					self.bringToTop_(this);
					self.resizeDown_(e, this);
					return false;
				};
			}else{
				// move
				this.style.cursor = 'default';
				this.onmousedown = function(e){
					self.bringToTop_(this);
					self.dragDown_(e, this);
					return false;
				};
			}
		};
	}
};
Palm.prototype = (function(){
	var proto = {};
	
	// public
	
	
	
	// resize
	proto.resizeDown_ = function(e, that){
		var mousemove = that.onmousemove;
		that.onmousemove = function(){};
		var self = this;
		
		var pos = this.getElementData_(that);
		var x = pos.width - e.clientX;
		var y = pos.height - e.clientY;
		
		document.onmousemove = function(e){
			self.resizeMove_(e, that, x, y);
		};
		
		document.onmouseup = function(e){
			document.onmousemove = function(){};
			that.onmousemove = mousemove;	
		};
	};
	
	proto.resizeMove_ = function(e, that, startX, startY){
		that.style.width = startX + e.clientX + 'px';
		that.style.height = startY + e.clientY + 'px';
		return false;
	};
	
	// drag
	proto.dragDown_ = function(e, that){
		var mousemove = that.onmousemove;
		that.onmousemove = function(){};
		var self = this;
		
		var pos = this.getElementData_(that);
		var x = pos.left - e.clientX;
		var y = pos.top - e.clientY;
		
		document.onmousemove = function(e){
			self.dragMove_(e, that, x, y);
			return false;
		};
		
		document.onmouseup = function(e){
			document.onmousemove = function(){};
			that.onmousemove = mousemove;	
		};
	};
	
	proto.dragMove_ = function(e, that, startX, startY){
		that.style.left = startX + e.clientX + 'px';
		that.style.top = startY + e.clientY + 'px';
		return false;
	};
	
	// private
	proto.genElmentsArray_ = function(elms){
		var obj = {};
		for(var i = 0; i < elms.length; i++){
			var element = elms[i];
			var val = {
				obj		: element.obj,
				visible	: 'invisible'
			};
			obj[element.key] = val;
			element.obj.style.zIndex = i;
			this.setOpacity_(element.obj, this.opacity);
			this.current = element.obj;
		}
		this.setOpacity_(this.current, 1);
		this.zindex = i;
		return obj;
	};
	
	proto.getElementData_ = function(elm){
		return {height: elm.offsetHeight, width: elm.offsetWidth, top: elm.offsetTop, left: elm.offsetLeft};
	};
	
	proto.checkDorR_ = function(obj, cx, cy){
		var dt = this.getElementData_(obj);
		var df = 16;
		var rx = dt.width + dt.left;
		var ry = dt.height + dt.top;
		if(rx-df < cx && cx < rx && ry-df < cy && cy < ry){
			return true;
		}else{
			return false;
		}
	};
	
	proto.bringToTop_ = function(obj){
		var before = this.current;
		var after = obj;
		this.setOpacity_(before, this.opacity);
		this.setOpacity_(after, 1);
		after.style.zIndex = this.zindex++;
		this.current = after;
	};
	
	proto.setOpacity_ = function(elm, val){
		val = Number(val);
		// IE
		elm.style.filter = 'alpha(opacity=' + (val * 100) + ')';
		// Firefox, Netscape
		elm.style.MozOpacity = val;
		// Chrome, Safari, Opera
		elm.style.opacity = val;
	};
	
	
	return proto;
})();


window.onload = init;