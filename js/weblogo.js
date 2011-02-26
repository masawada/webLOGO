//
// webLOGO.js
// (webLOGO controller)

var init = function(){
	var canvas = document.getElementById('canvas');
	var control = document.getElementById('control');
	var pointer = document.getElementById('pointer');
	var source = control.source;
	var setting = document.getElementById('preference');
	var intervalNum = setting.interval;
	var startButton = document.getElementById('runcode');
	var samples = control.samples;
	
	var _ = '   ';
	
	var panels = [{
		id:			'setting',
		minHeight:	200,
		minWidth:	400
	},{
		id:			'editor',
		minHeight:	400,
		minWidth:	300
	}];
	var palm = Palm(panels);
	
	var turtle = new Turtle(canvas);
	var validator = new Validator();
	
	var clickHandler;
	
	turtle.on("start", function() {
		startButton.value = "実行中(クリックで中断)";
		
		// めんどくさいからクロージャで実装。
		// 誰かてきとーになおして
		clickHandler = startButton.onclick;
		startButton.onclick = function() {
			turtle.interrupt();
		};
	});
	
	turtle.on("end", function() {
		startButton.value = "実行";

		if (clickHandler) 
			startButton.onclick = clickHandler;
	});

	turtle.on("point", function(x,y) {
		pointer.style.left = (x-1) + "px";
		pointer.style.top = (y-1) + "px";
	});
	
	intervalNum.onchange = function() {
		turtle.skipRadius = Number(this.value);
	};
	
	startButton.onclick = function() {
		var errors = validator.check(source.value);
		if (errors.length === 0) {
			intervalNum.onchange();
			turtle.run(source.value);
		} else {
			alert('Errors have occurred.');
			console.log('---');
			console.log(String(errors.length) + ' ERRORS FOUND.');
			for(var i = 0; i < errors.length; i++){
				var error = errors[i];
				if(error.code === 500){
					console.log(error.message + ': ' + error.source);
				} else if (error.code === 503) {
					console.log(error.message);
				}
			}
			console.log('---');
		}
	};
	
	var draws = {
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

	for (var name in draws) {
		var opt = document.createElement("option");
		opt.setAttribute("value", draws[name]);
		opt.innerHTML = name;
		samples.appendChild(opt);
	}
	samples.onchange = function() {
		var index = samples.selectedIndex;
		if (index <= 0) return false;

		source.value = samples.options[index].getAttribute("value");
	};
};
window.onload = init;