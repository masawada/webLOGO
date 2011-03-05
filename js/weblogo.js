//
// weblogo.js
//

var init = function(){
	/* set node */
	var ctrform = {
			control	: document.getElementById('control'),
			setting	: document.getElementById('preference')
	};
	
	var node = {
		canvas			: document.getElementById('canvas'),
		canvasArea		: document.getElementById('canvasArea'),
		pointer			: document.getElementById('pointer'),
		
		errorPanel		: document.getElementById('errorPanel'),
		errorIndicator	: document.getElementById('errorIndicator'),
		
		control			: ctrform.control,
		samples			: ctrform.control.samples,
		source			: ctrform.control.source,
		startButton		: document.getElementById('runCode'),
		
		setting			: ctrform.setting,
		intervalNum		: ctrform.setting.intervalNum,
		canvasHeight	: ctrform.setting.canvasHeight,
		canvasWidth		: ctrform.setting.canvasWidth
	};
	
	var panels = [{
		id: 'error'
	},{
		id: 'setting'
	},{
		id: 'editor'
	}]
	
	// samples
	var _ = '   ';
	var samples = {
		"四角":
			"Center\n"+
			"Repeat 4 [\n"+
			_+"Forward 100\n"+
			_+"Turn 90\n"+
			"]",
		"星":
			"Center\n"+
			"Turn 90\n"+
			"Repeat 5 [\n"+
			_+"Forward 100\n"+
			_+"Turn 144\n"+
			"]",
		"円":
			"Center\n"+
			"Turn 60\n"+
			_+"Repeat 360 [\n"+
			_+"Forward 1\n"+
			_+"Turn 1\n"+
			"]",
		"花":
			"Center\n"+
			"Repeat 6 [\n"+
			_+"Turn 60\n"+
			_+"Repeat 360 [\n"+
			_+_+"Forward 1\n"+
			_+_+"Turn 1\n"+
			_+"]\n"+
			"]",
	};
	
	var turtle = new Turtle(node.canvas);
	var validator = new Validator();
	
	var indent = new AutoIndent(node.source, 3);
	var controller = new LOGOController(node);
	
	var palm = Palm(panels);
	
	var clickHandler; // closure
	
	// handle events
	turtle.on("start", function(){
		node.startButton.innerText = "停止する";
		
		clickHandler = node.startButton.onclick;
		node.startButton.onclick = function(){
			turtle.interrupt();
		};
	});
	
	turtle.on("end", function(){
		node.startButton.innerText = "描画する";

		if(clickHandler) 
			node.startButton.onclick = clickHandler;
	});

	turtle.on("point", function(x,y){
		node.pointer.style.left = (x-1) + "px";
		node.pointer.style.top = (y-1) + "px";
	});
	
	node.startButton.onclick = function(){
		var errors = validator.check(node.source.value);
		if(errors.length === 0){
			node.intervalNum.onchange();
			turtle.run(node.source.value);
		}else{
			controller.notifyError(errors);
			controller.printError(errors);
			palm.bringToTop('error');
		}
	};
	
	node.errorIndicator.onclick = function(){
		palm.bringToTop('error');
	};
	
	/* canvas Size Changer */
	var canvasSizeChanger = function(width, height){
		if(width === ''){
			width = node.canvas.width;
		}
		if(height === ''){
			height = node.canvas.height;
		}
		controller.setCanvasSize(width, height);
	};
	
	node.canvasWidth.onblur = function(){
		canvasSizeChanger(node.canvasWidth.value, node.canvasHeight.value);	
	};
	
	node.canvasHeight.onblur = function(){
		canvasSizeChanger(node.canvasWidth.value, node.canvasHeight.value);
	};
	
	// animation speed
	node.intervalNum.onchange = function(){
		turtle.skipRadius = Number(this.value);
	};
	
	// auto indent
	node.source.onfocus = function(){
		setTimeout(function(){
			window.onkeydown = function(e){
				if(e.keyCode === 13){
					indent.insertTab();
					return false;
				}else if(e.keyCode === 221 || e.keyCode === 93){
					indent.deleteTab();
					return false;
				}
			};
		}, 100);
	};
	
	node.source.onblur = function(){
		window.onkeydown = function(){};
	};
	
	// set samples
	for(var name in samples){
		var opt = document.createElement("option");
		opt.setAttribute("value", samples[name]);
		opt.innerHTML = name;
		node.samples.appendChild(opt);
	}
	node.samples.onchange = function(){
		var index = node.samples.selectedIndex;
		if(index <= 0) return false;

		node.source.value = node.samples.options[index].getAttribute("value");
	};
};

var AutoIndent = function(source, spacesnum){
	// constructor
	var spaces = '';
	for(var i = 0; i < Number(spacesnum); i++){
		spaces += ' ';
	}
	this.spaces = spaces;
	this.source = source;
};
AutoIndent.prototype = (function(){
	var proto = {};
	
	// public
	proto.insertTab = function(){
		var source = this.source;
		var startPos = source.selectionStart;
		var endPos = source.selectionEnd;
		var before = source.value.slice(0, startPos);
		var after = source.value.slice(endPos);
		
		var depth = this.returnDepth_(before);
		var newline = '\n' + this.genSpace_(depth);
		
		source.value = before + newline + after;
		source.setSelectionRange(endPos+newline.length, endPos+newline.length);
	};
	
	proto.deleteTab = function(){
		var source = this.source;
		var startPos = source.selectionStart;
		var endPos = source.selectionEnd;
		var before = source.value.slice(0, startPos);
		var after = source.value.slice(endPos);
		var lines = before.split(/\n/);
		
		if(this.trim_(lines.pop()) === ''){
			var depth = this.returnDepth_(before) - 1;
			var newline = this.genSpace_(depth) + ']';
			lines.push(newline);
			var modlines = lines.join('\n');
			
			source.value = modlines + after;
			source.setSelectionRange(modlines.length, modlines.length);
		}else{
			source.value = before + ']' + after;
			source.setSelectionRange(endPos+1, endPos+1);
		}
	};
	
	// private
	proto.trim_ = function(line){
		line = line.replace(/^\s+/,"");
		line = line.replace(/\s+$/m,"");
		return line;
	};
	
	proto.returnDepth_ = function(code){
		var lines = code.split(/\n/);
		var depth = 0;
		for(var i = 0; i < lines.length; i++){
			var line = this.trim_(lines[i]);
			if(line.slice(-1) === '['){
				depth++;
			}else if(line.slice(0,1) === ']'){
				depth--;
			}
			if(depth < 0) depth = 0;
		}
		return depth;
	}
	
	proto.genSpace_ = function(depth){
		var spaces = '';
		for(var i = 0; i < depth; i++){
			spaces += this.spaces;
		}
		return spaces;
	};
	
	return proto;
})();

var LOGOController = function(node){
	this.node = node;
};
LOGOController.prototype = (function(){
	var proto = {};
	
	/* onError */
	// public
	proto.notifyError = function(errors){
		this.notifyError_(errors);
	};
	
	proto.printError = function(errors){
		var errorPanel = this.node.errorPanel;
		var div = document.createElement('div');
		errorPanel.insertBefore(div, errorPanel.firstChild);
		var newErrors = document.createDocumentFragment();
		newErrors.appendChild(this.genErrorHeader_(errors));
		for(var i = 0; i < errors.length; i++){
			newErrors.appendChild(this.genErrorNode_(errors[i]));
		}
		div.appendChild(newErrors);
	};
	
	
	// private
	proto.notifyError_ = function(errors){
		errors = errors || [];
		if(0 < errors.length){
			this.node.errorIndicator.innerText = errors.length + 'つのエラーが発生しました。';
		}else{
			this.node.errorIndicator.innerText = '';
		}
	};
	
	proto.genErrorHeader_ = function(errors){
		var p = document.createElement('p');
		p.innerText = errors.length + 'つのエラーが発生しました。';
		return p;
	};
	
	proto.genErrorNode_ = function(error){
		if(error.code === 500){
			var message = error.line + '行目で文法エラーが発生しました: ' + error.source;
		} else if (error.code === 503) {
			var message = 'どこかで括弧が閉じられていません。';
		}
		var p = document.createElement('p');
		p.innerText = message;
		return p;
	};
	
	/* setCanvasSize */
	// public
	proto.setCanvasSize = function(width, height){
		width = Number(width);
		height = Number(height);
		this.setCanvasSize_(width, height);
		this.setCanvasAreaSize_(width, height);
	};
	
	// private
	proto.setCanvasSize_ = function(width, height){
		this.node.canvas.width = width;
		this.node.canvas.height = height;
	};
	
	proto.setCanvasAreaSize_ = function(width, height){
		var marginleft = '-' + String(width/2 + 1) + 'px';
		var margintop = '-' + String(height/2 + 1) + 'px';
		this.node.canvasArea.style.width = width + 'px';
		this.node.canvasArea.style.height = height + 'px';
		this.node.canvasArea.style.marginLeft = marginleft;
		this.node.canvasArea.style.marginTop = margintop;
	};
	
	return proto;
})();

window.onload = init;