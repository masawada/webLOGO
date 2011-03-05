//
// Palm.js (Panel Management )
// Andante Software 
//

var Palm = function(panels){
	var Class = arguments.callee;
	if(!(this instanceof Class)) return new Class(panels);
	
	var self = this;
	this.opacity = 0.2;
	this.zindex = 0;
	this.depth = [];
	this.panels = this.initPanels_(panels);
	this.initOpacity_();
	
	for(var id in this.panels){
		this.panels[id].element.onmousemove = function(e){
			/*if(self.checkDorR_(this, e.clientX, e.clientY) === true){
				// resize
				this.style.cursor = 'se-resize';
				this.onmousedown = function(e){
					self.bringToTop_(this.id);
					self.resizeDown_(e, this);
					return false;
				};
			*/
			//}else{
				// move
				this.style.cursor = 'all-scroll';
				this.onmousedown = function(e){
					self.bringToTop_(this.id);
					if(e.target === this){
						self.dragDown_(e, this);
						return false;
					}
				};
			//}
		};
		
		this.panels[id].element.onmouseout = function(){
			this.style.cursor = 'default';
		};
	}
	
};
Palm.prototype = (function(){
	var proto = {};
	
	// public
	proto.showPanel = function(){
		
	};
	
	proto.closePanel = function(){
		
	};
	
	/* New feature: add/remove panel
	proto.addPanel = function(){
		
	};
	
	proto.removePanel = function(){
		
	};
	*/
	
	// drag and resize
	proto.getElementData_ = function(element){
		return {height: element.style.pixelHeight||element.offsetHeight, width: element.style.pixelWidth||element.offsetWidth, top: element.style.pixelTop||element.offsetTop, left: element.style.pixelLeft||element.offsetLeft};
	};
	
	proto.checkDorR_ = function(element, cx, cy){
		var dt = this.getElementData_(element);
		var df = 24;
		var rx = dt.width + dt.left;
		var ry = dt.height + dt.top;
		if(rx-df < cx && cx < rx && ry-df < cy && cy < ry){
			return true;
		}else{
			return false;
		}
	};
	
	// resize
	proto.resizeDown_ = function(e, that){
		var mousemove = that.onmousemove;
		var mouseout = that.onmouseout;
		that.onmousemove = function(){};
		that.onmouseout = function(){};
		var self = this;
		
		var id = that.id;
		var pos = this.getElementData_(that);
		var x = pos.width - e.clientX;
		var y = pos.height - e.clientY;
		var panel = this.panels[id];
		
		document.onmousemove = function(e){
			self.resizeMove_(e, that, x, y, panel.minHeight, panel.minWidth);
		};
		
		document.onmouseup = function(e){
			document.onmousemove = function(){};
			that.onmousemove = mousemove;
			that.onmouseout = mouseout;
		};
	};
	
	proto.resizeMove_ = function(e, that, startX, startY, minHeight, minWidth){
		var width = startX + e.clientX;
		var height = startY + e.clientY;
		if(width < minWidth){
			width = minWidth;
		}
		if(height < minHeight){
			height = minHeight;
		}
		that.style.width = width + 'px';
		that.style.height = height + 'px';
		return false;
	};
	
	// drag
	proto.dragDown_ = function(e, that){
		var mousemove = that.onmousemove;
		var mouseout = that.onmouseout;
		that.onmousemove = function(){};
		that.onmouseout = function(){};
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
			that.onmouseout = mouseout;
		};
	};
	
	proto.dragMove_ = function(e, that, startX, startY){
		that.style.left = startX + e.clientX + 'px';
		that.style.top = startY + e.clientY + 'px';
	};
	
	// private
	proto.initPanels_ = function(panels){
		var obj = {};
		for(var i = 0; i < panels.length; i++){
			obj[panels[i].id] = this.genPanelData_(panels[i]);
			obj[panels[i].id].element.style.zIndex = this.zindex++;
		}
		return obj;
	};
	
	proto.initOpacity_ = function(){
		this.setOpacity_(this.panels[this.depth[0]].element, 1);
		for(var i = 1; i < this.depth.length; i++){
			this.setOpacity_(this.panels[this.depth[i]].element, this.opacity);
		}
	};
	
	/* New feature: add/remove panel
	proto.addPanel_ = function(){
		
	};
	
	proto.removePanel_ = function(){
		
	};
	*/
	
	proto.genPanelData_ = function(data){
		var obj = {
			element		: document.getElementById(data.id),
			minHeight	: document.getElementById(data.id).style.minHeight || 0,
			minWidth	: document.getElementById(data.id).style.minWidth || 0
		};
		this.registDepth_(data.id);
		return obj;
	};
	
	proto.bringToTop_ = function(id){
		this.registDepth_(id);
		this.applyOpacity_();
		this.panels[this.depth[0]].element.style.zIndex = this.zindex++;
	};
	
	proto.applyOpacity_ = function(){
		this.setOpacity_(this.panels[this.depth[1]].element, this.opacity);
		this.setOpacity_(this.panels[this.depth[0]].element, 1);
	};
	
	// management depth
	proto.registDepth_ = function(id){
		if(this.judgeDepth_(id) === false){
			this.depth.unshift(id);
		}else{
			this.removeDepth_(id);
			this.depth.unshift(id);
		}
	};
	
	proto.removeDepth_ = function(id){
		for(var i = 0; i < this.depth.length; i++){
			if(this.depth[i] === id){
				this.depth.splice(i, 1);
				break;
			}
		};
	};
	
	proto.judgeDepth_ = function(id){
		for(var i = 0; i < this.depth.length; i++){
			if(this.depth[i] === id){
				return i;
			}
		}
		return false;
	};
	
	// set opacity
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