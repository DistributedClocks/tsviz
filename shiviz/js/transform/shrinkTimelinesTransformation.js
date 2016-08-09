

function ShrinkTimelinesTransformation(){
	/** @private */
	this.threshold = 0;

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

    this.threshold = threshold;
};


ShrinkTimelinesTransformation.prototype.transform = function(model) {
	
	var nodes = model.graph.getAllNodes();
	var longEdges = [];
	var edge;

	//Isolate edges that are longer than the screen
	for(var i = 0; i < nodes.length; i++){
		var node = nodes[i];

		if (node.isHead() || node.isTail()) {
            continue;
        }

		var prev = node.getPrev();

		var linkId = model.getEdgeId(node, prev);
		edge = model.links[linkId];
		if(((edge.targetVisualNode.getY() - edge.sourceVisualNode.getY()) > this.getThreshold() && (edge.sourceVisualNode.getX() == edge.targetVisualNode.getX()))){
			longEdges.push(edge);
		}
	}

	//Sort edges by source's Y position
	longEdges.sort(function(a,b){
		return a.sourceVisualNode.getY() - b.sourceVisualNode.getY();
	});

	//--------- SECOND DRAFT

	function findInterval(longEdges, interval, edge, i, nhosts, threshold){

		var windowStart = edge.sourceVisualNode.getY();
		interval.maxSourceY = windowStart;
		interval.minTargetY = Number.MAX_VALUE;
		var windowEnd = windowStart + threshold;
		interval.hosts.push(edge.sourceVisualNode.getHost());
		interval.edges.push(edge);

		for(var j = 0; j < longEdges.length && j != i; j++){
			if(longEdges[j].sourceVisualNode.getY() >= windowStart || interval.hosts.length == nhosts){ 
				break;
			}
			if(longEdges[j].sourceVisualNode.getY() <= windowStart && longEdges[j].targetVisualNode.getY() > windowEnd){ //No nodes in the middle of interval
				//Include edge
				if(longEdges[j].targetVisualNode.getY() < interval.minTargetY) interval.minTargetY = longEdges[j].targetVisualNode.getY();
				interval.hosts.push(longEdges[j].sourceVisualNode.getHost());
				interval.edges.push(longEdges[j]);
			}
		}

		return interval.hosts.length == nhosts;
	}

	function checkInterval(interval, hosts, visualGraph) {
		//Check rejected intervals for the possibility of it being a incomplete interval
		for(var i = 0; i < hosts.length; i++){
			if(interval.hosts.indexOf(hosts[i]) < 0){ //Host is not present in interval, check if activity has ended for this host
				var node = visualGraph.graph.getLastValidNodebyHost(hosts[i]);
				var visual = visualGraph.getVisualNodeByNode(node);
				if(visual.getY() > interval.maxSourceY) return false;
			}
		}
		return true;

	}

	var intervals = [];
	var edgeCollection = [];
	var interval = new Interval();
	for(var i = 0; i < longEdges.length; i++){
		if(findInterval(longEdges, interval, longEdges[i], i, model.graph.hosts.length, this.threshold)){ //Found an interval
			for(var k = 0; k < interval.edges.length; k++){
				if(edgeCollection.indexOf(interval.edges[k]) < 0) edgeCollection.push(interval.edges[k]);
			}
			intervals.push(interval);
			interval = new Interval();
		}else{ //Interval not found
			//Check here if the interval was rejected because some threads have finished
			if(checkInterval(interval, model.getHosts(), model)){ 
				for(var k = 0; k < interval.edges.length; k++){
					if(edgeCollection.indexOf(interval.edges[k]) < 0) edgeCollection.push(interval.edges[k]);
				}
				intervals.push(interval);
			}
			interval = new Interval();
		}

	}
	//--------- END OF SECOND DRAFT

	//COLLAPSE!


	var cumulativeShift = 0;

	//Shift nodes up and update common edges
	for(var i = 0; i < intervals.length; i++){
		var compression = {};
		compression.original = {};
		compression.original.start = intervals[i].maxSourceY;
		compression.original.end = intervals[i].minTargetY;

		intervals[i].maxSourceY -= cumulativeShift;
		intervals[i].minTargetY -= cumulativeShift;

		compression.start = intervals[i].maxSourceY;
		compression.end = compression.start + 95;
		compression.shiftAmount = ((intervals[i].minTargetY) - compression.end);

		//Shift nodes that are positioned after the compression upwards
		model.getVisualNodes().forEach(function(visualNode){
			if(visualNode.getY() > intervals[i].maxSourceY){
				visualNode.setY(visualNode.getY() - compression.shiftAmount);
			}
		});

		//Update the common (not compressed) edges 
		model.getVisualEdges().forEach(function(visualEdge){
			visualEdge.updateCoords();
		});

		for(var j = 0; j < intervals[i].edges.length;  j++){
			var e = intervals[i].edges[j];
			//Save compression to edge
			e.compressions.push(compression);
	        
		}
		model.compressedParts.push(compression);
		cumulativeShift += compression.shiftAmount;
	}
	//Modify edges
	for(var i = 0; i < edgeCollection.length; i++){
		var e = edgeCollection[i];
		e.$line = {};
		e.$svg = Util.svgElement("g");
		e.$line = Util.svgElement("path");
		e.setDefaultAttributes();

		e.$line.attr({"d": ""});

		var lineData = [];
		var x = e.sourceVisualNode.getX();
		var y = e.sourceVisualNode.getY();

		lineData.push({x: x, y: y})

		for(var k = 0; k < e.compressions.length; k++){

			var lineBreak = {};
			//Define stoppers for the intervall
	        lineBreak.start = Util.svgElement("line");
	        lineBreak.end = Util.svgElement("line");
	        lineBreak.start.attr({
	        	"stroke-width": "2px",
	        	"opacity": 1,
	        	"stroke": "#999"
	        });
	        lineBreak.end.attr({
	        	"stroke-width": "2px",
	        	"opacity": 1,
	        	"stroke": "#999"
	        });
        	y = e.compressions[k].start + 20;
        	lineData.push({x: x, y: y});
        	//Add line break
        	lineBreak.start.attr({"x1": x-5,
        					"x2": x+5,
        					"y1": y,
        					"y2": y
        				});
        	e.$svg.append(lineBreak.start);
        	lineData.push(null);
        	y = e.compressions[k].end - 20;
        	lineData.push({x: x, y: y});
        	//Add line break
        	lineBreak.end.attr({"x1": x-5,
        					"x2": x+5,
        					"y1": y,
        					"y2": y
        				})
        	e.$svg.append(lineBreak.end);
        	y = e.compressions[k].end;
        	lineData.push({x: x, y: y});
        }


        y = e.targetVisualNode.getY();
        lineData.push({x: x, y: y})
        
        var lineFunction = d3.svg.line()
        .defined(function(d) { return d; })
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

        e.$line.attr("d", lineFunction(lineData));
        e.$svg.append(e.$line);
        
	}

}