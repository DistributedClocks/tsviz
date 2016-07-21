/**
 * Constructs a MotifChart given a {@link MotifGroup}. The newly constructed
 * MotifChart will represent the time distribution of the {@link MotifGroup}.
 * 
 * @classdesc
 * 
 * A MotifChart represents the visualization of an {@link MotifGroup} that is,
 * this class displays a visual representation of the {@link Motif} in the single
 * parameter of this class.
 * 
 * @constructor
 * @param {MotifGroup} motifGroup contains the search results
 * @param {MotifNavigator} motifNavigator navigate the visual graph with this
 */
function MotifChart(motifGroup, motifNavigator) {

	/** @private */
	this.motifPoints = [];
    this.motifNavigator = motifNavigator;
	this.$chart = null;

	var motifs = motifGroup.getMotifs();
	var sorted = [];

	for (var i = 0; i < motifs.length; i++) {
		sorted[i] = new MotifPoint(motifs[i]);
	}

	sorted.sort(function(a, b) {
		// Descending order: largest y to smallest y
		return b.getY() - a.getY();
	});

	motifPoints = sorted;

	// Fix X co-ordinates to be from 0 to the number of motifs
	for (i = 0; i < motifPoints.length; i++) {
		motifPoints[i].setX(i);
		console.log(motifPoints[i].getY());
	}
}

/**
 * Draws the graph based on the data constructed.
 */
MotifChart.prototype.drawChart = function() {
	// Chart sizes
    var barPadding = 0; // Padding between bars
    var padding = {top: 0, right: 0, bottom: 2, left: 2};
    var width = ((176 > motifPoints.length) ? 176 : motifPoints.length);
    var height = 192 - padding.top - padding.bottom * 2;

    var motifNavigator = this.motifNavigator;

    // Create a x scale for the axis
    var xScale = d3.scale.linear()
    					 .domain([0, motifPoints.length])
    					 .range([0, width]);

    // Create a scale so that the data bars do not go above the chart height
   	var yScale = d3.scale.linear()
   						 .domain([0, d3.max(motifPoints, function(d) { return d.getY(); })])
   					     .range([0, height]);

    // Setup the axes 
    var xAxis = d3.svg.axis()
    			  .scale(xScale)
	    		  .orient("bottom")
	    		  .ticks(0);

   	var yAxis = d3.svg.axis()
   				  .scale(yScale)
			      .orient("left")
    			  .ticks(0);				     

    var tip = d3.tip()
  				.attr('class', 'd3-tip')
  				.offset([-14, 0])
  				.html(function(d) {
    				return "<strong>Time:</strong> <span style='color:white'>" + d.formatTime() + "</span>";
  				});

   	// Insert an SVG which we will draw our chart and translate
    var $svg = d3.select(".chart")
    			 .append("svg")
    			 .attr("width", width)
    			 .attr("height", height);

    $svg.call(tip);

    // Create an inner area for the bars in order to make space for axis
    $svg.append("g")
    	.attr("class", "barArea")
    	.attr("transform", "translate(" + padding.left + ", -" + padding.bottom + ")");

    // Insert the x-axis into the graph and translate it down
    $svg.append("g")
    	.attr("class", "axis")
    	.attr("transform", "translate(0," + (height - 1) +")")
    	.call(xAxis)
/*    	.append("text")
    	.attr("x", 88)
    	.attr("y", -14)
    	.attr("dy", ".71em")
    	.style("text-anchor", "middle")
    	.text("Search results");*/	
    			
    // Insert the y-axis into the graph
    $svg.append("g")
    	.attr("class", "axis")
    	.attr("transform", "translate(0,0)")
    	.call(yAxis)
    	.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("x", - height / 2)
    	.attr("y", 4)
    	.attr("dy", ".71em")
    	.style("text-anchor", "middle")
    	.text("Time");

    // Insert rectangles for each piece of data in the shifted bar area
    $svg.select(".barArea").selectAll("rect")
    	.data(motifPoints)
    	.enter()
    	.append("rect")
    	.attr("x", function(d, i) {
    		return i * (width / motifPoints.length);
    	})
    	.attr("y", function(d) {
    		return height - yScale(d.getY());
    	})
    	.attr("width", width / motifPoints.length - barPadding)
    	.attr("height", function(d) {
    		return yScale(d.getY());
    	})
    	.attr("fill", "#04a")
    	.on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
            motifNavigator.jumpTo(d.getMotif());
        });

    this.$chart = $svg;
};

/**
 * Removes the chart.
 */
MotifChart.prototype.removeChart = function() {
	this.$chart.remove();
};
