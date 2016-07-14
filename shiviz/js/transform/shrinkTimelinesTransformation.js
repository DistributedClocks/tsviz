

function ShrinkTimelinesTransformation(){
	/** @private */
	this.threshold = 0;

	// console.log(($(window).height - 171));

	this.setThreshold(($(window).height() - 171));
}

ShrinkTimelinesTransformation.prototype = Object.create(Transformation.prototype);
ShrinkTimelinesTransformation.prototype.constructor = ShrinkTimelinesTransformation;


/**
 * Gets the threshold. Nodes are collapsed if the number of nodes in the group
 * is greater than or equal to the threshold. The threshold must be greater than
 * or equal to 2.
 * 
 * @returns {Number} The threshold
 */
ShrinkTimelinesTransformation.prototype.getThreshold = function() {
    return this.threshold;
};

/**
 * Sets the threshold. Nodes are collapsed if the number of nodes in the group
 * is greater than or equal to the threshold. The threshold is always greater
 * than or equal to 2.
 * 
 * @param {Number} threshold The new threshold
 */
ShrinkTimelinesTransformation.prototype.setThreshold = function(threshold) {
    if (threshold < 2) {
        throw new Exception("CollapseNodesTransformation.prototype.setThreshold: Invalid threshold. Threshold must be greater than or equal to 2");
    }
    console.log("got into setThreshold, threshold:  " + threshold);

    this.threshold = threshold;
};


ShrinkTimelinesTransformation.prototype.transform = function(model) {
	
	var graph = model;
	var nodes = graph.graph.getAllNodes();
	var longEdges = [];
	var edge;
	
	console.log("threshold:  " + this.getThreshold());

	//Isolate edges that are longer than the screen
	for(var i = 0; i < nodes.length; i++){
		var node = nodes[i];

		if (node.isHead() || node.isTail()) {
            continue;
        }

		var prev = node.getPrev();

		var linkId = graph.getEdgeId(node, prev);
		edge = graph.links[linkId];
		if(((edge.targetVisualNode.getY() - edge.sourceVisualNode.getY()) > this.getThreshold() && (edge.sourceVisualNode.getX() == edge.targetVisualNode.getX()))){
			longEdges.push(edge);
		}
	}

	//Sort edges by source's Y position
	longEdges.sort(function(a,b){
		// return (b.targetVisualNode.getY() - b.sourceVisualNode.getY()) - (a.targetVisualNode.getY() - a.sourceVisualNode.getY());
		return a.sourceVisualNode.getY() - b.sourceVisualNode.getY();
	});

	//Look for intervals
	var covered = 0;
	var intervals = [];
	var nintervals = 0;
	var interval = new Interval();

	function addEdgetoCollection(interval, edge, threshold){
		var windowStart = edge.sourceVisualNode.getY();
		var windowEnd = windowStart + threshold;

		for(i = 0; i < interval.edges.length; i++){ //Update array
			if(interval.edges[i].targetVisualNode.getY() < windowEnd){
				interval.edges.splice(i, 1);
				interval.hosts.splice(i, 1);
			}
		}

		//Add host and edge to interval arrays
		interval.hosts.push(edge.sourceVisualNode.getHost());
		interval.edges.push(edge);
		return true; //ADDED SUCCESSFULLY
	}


	while(covered < longEdges.length){
		if(interval.hosts.length == model.graph.hosts.length){ //Found an interval
			interval.minTargetY = Number.MAX_VALUE;
			for(var k = 0; k < interval.edges.length; k++){
				if(interval.edges[k].sourceVisualNode.getY() > interval.maxSourceY) interval.maxSourceY = interval.edges[k].sourceVisualNode.getY();
				if(interval.edges[k].targetVisualNode.getY() < interval.minTargetY) interval.minTargetY = interval.edges[k].targetVisualNode.getY();
			}
			intervals.push(interval);
			nintervals++;
			interval = new Interval();
		}else{ //Keep searching
			if(addEdgetoCollection(interval, longEdges[covered], this.threshold)){ //Great! keep going
				covered++;
			}else{ //Slide the window (try to start another interval with the edge that was not added)
				console.log(interval);
				interval = new Interval();
			}
		}
	}

	console.log(intervals);
	console.log(intervals.length);
	console.log(intervals[0].edges.length);
	//COLLAPSE!

	for(var i = 0; i < intervals.length; i++){
		var collapseStart = intervals[i].maxSourceY;
		var collapseEnd = collapseStart + 130;
		var shiftAmount = (intervals[i].minTargetY - collapseEnd);

		model.getVisualNodes().forEach(function(visualNode){
			if(visualNode.getY() > collapseStart){
				visualNode.setY(visualNode.getY() - shiftAmount);
			}
		});

		model.getVisualEdges().forEach(function(visualEdge){
			visualEdge.updateCoords();
		});

		for(var j = 0; j < intervals[i].edges.length;  j++){
			var e = intervals[i].edges[j];
			e.$svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
	        e.setWidth(1);
	        e.setDashLength(0);
	        e.setColor("#999");
	        e.setOpacity(0.6);
	        var lineData = [];

	        var x = e.sourceVisualNode.getX();
	        var y = e.sourceVisualNode.getY();
	        lineData.push({x: x, y: y})
	        y = collapseStart + 20;
	        lineData.push({x: x, y: y})
	        y+=5;
	        var count = 2;
	        for(var g = 0; g < 100; g+=5, y+=5){
	            lineData.push({x: x + (Math.pow((-1), count) * 10), y: y});
	            count ++;
	        }
	        lineData.push({x: x, y: y})
	        y = e.targetVisualNode.getY();
	        lineData.push({x: x, y: y})
	        var lineFunction = d3.svg.line().x(function(d) { return d.x; }).y(function(d) { return d.y; }).interpolate("monotone");

	        e.$svg.attr("d", lineFunction(lineData));
		}

		
	}

	// console.log("in transformation:   " + (longEdges[0].targetVisualNode.getY() - longEdges[0].sourceVisualNode.getY()));
	// console.log(covered);
	
}