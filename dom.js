function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
};

function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}
DOMDisplay.prototype.drawBackground = function() {
	var table = elt("table", "background");
	table.style.width = this.level.width * scale + "px";
	this.level.grid.forEach(function(row) {
		var rowElt = table.appendChild(elt("tr"));
		rowElt.style.height = scale + "px";
		row.forEach(function(type) {
			rowElt.appendChild(elt("td", type));
		});
	});
	return table;
};
DOMDisplay.prototype.drawActors = function() {
	var wrap = elt("div");
	this.level.actors.forEach(function(actor) {
		var rect = wrap.appendChild(elt("div", "actor " + actor.type));
		rect.style.width = actor.size.x * scale + "px";
		rect.style.height = actor.size.y * scale + "px";
		rect.style.left = actor.pos.x * scale + "px"
		rect.style.top = actor.pos.y * scale + "px";
	});
	return wrap;
};
DOMDisplay.prototype.drawFrame = function() {
	if(this.actorLayer)
		this.wrap.removeChild(this.actorLayer);
	this.actorLayer = this.wrap.appendChild(this.drawActors());
	this.wrap.className = "game " + (this.level.status || "");
	this.scrollPlayerIntoView();
};
DOMDisplay.prototype.scrollPlayerIntoView = function() {
	var width = this.wrap.clientWidth;
	var height = this.wrap.clientHeight;
	var margin = width / 3;

	// The viewport
	var left = this.wrap.scrollLeft,
		right = left + width,
		top = this.wrap.scrollTop,
		bottom = top + height;

	var player = this.level.player;
	var center = player.pos.plus(player.size.times(0.5)).times(scale);

	// Horizontal scroll
	if(center.x < left + margin)
		this.wrap.scrollLeft = center.x - margin;
	else if(center.x > right - margin)
		this.wrap.scrollLeft = center.x + margin - width;

	// Vertical scroll
	if(center.y < top + margin)
		this.wrap.scrollTop = center.y - margin;
	else if(center.y > bottom - margin)
		this.wrap.scrollTop = center.y + margin - height;

};
DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};


var arrowCodes = {37: "left", 38: "up", 39: "right"};
function trackKeys(codes) {
	var pressed = Object.create(null);
	function handler(event) {
		if(codes.hasOwnProperty(event.keyCode)) {
			var down = event.type == "keydown";
			pressed[codes[event.keyCode]] = down;
			event.preventDefault();
		}
	}
	addEventListener("keydown", handler);
	addEventListener("keyup", handler);
	return pressed;
}

function runAnimation(frameFunc) {
	var lastTime = null;
	function frame(time) {
		var stop = false;
		if(lastTime != null) {
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if(!stop)
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);
function runLevel(level, Display, andThen) {
	var display = new Display(document.body, level);
	runAnimation(function(step) {
		level.animate(step, 0.05, arrows);
		display.drawFrame(step);
		if(level.isFinished()) {
			display.clear();
			if(andThen)
				andThen(level.status);
			return false;
		}
	});
}

function runGame(plans, Display) {
	function startLevel(n) {
		runLevel(new Level(plans[n]), Display, function(status) {
			if(status == "lost")
				startLevel(n);
			else if(n < plans.length - 1)
				startLevel(n + 1);
			else
				console.log("You win!");
		});
	}
	startLevel(0);
}