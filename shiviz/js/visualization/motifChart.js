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
 * @param {MotifNavigator} motifNavigator navigate the visual graph with this
 */
function MotifChart(motifNavigator) {

	/** @private */
	this.motifPoints = [];
    this.hiddenMotifPoints = [];
    this.motifNavigator = motifNavigator;
	this.$chart = null;
    this.sortedByHost = false;

    this.xScale = null;
    this.yScale = null;
    this.xAxis = null;
    this.yAxis = null;
}

/**
 * Adds a group of motifs to the chart
 * 
 * @param {VisualGraph} visualGraph The visual graph that contains the motif
 *        group
 * @param {MotifGroup} motifGroup The group of motifs to add
 */
MotifChart.prototype.addMotif = function(visualGraph, motifGroup) {

    var motifs = motifGroup.getMotifs();

    for (var m = 0; m < motifs.length; m++) {
        var motif = motifs[m];
        var motifPoint = new MotifPoint(visualGraph, motif);
        this.motifPoints.push(motifPoint);
    }
};

/**
 * Draws the graph based on the data constructed.
 */
MotifChart.prototype.drawChart = function() {
    if (this.xScale == null || this.yScale == null || this.xAxis == null || this.yAxis == null) {
        console.log("Error: MotifChart scale not set.");
        return;
    }
	var motifPoints = this.motifPoints;
    var sortedByHost = this.sortedByHost;
    var motifNavigator = this.motifNavigator;
    var visualGraph = this.visualGraph;

    // Figure out how many whole digits are in the longest time
    var temp = motifPoints[0].getYScaled();
    var axisWidth = 1;

    while (temp > 10) {
        temp /= 10;
        axisWidth++;
        console.log(axisWidth);
    }

    axisWidth *= 12;

    // Chart sizes
    var barPadding = 0; // Padding between bars
    var padding = {top: 0, right: 0, bottom: 2, left: axisWidth};
    var width = ((176 / 3 > motifPoints.length) ? 176 : motifPoints.length * 3);
    var height = 200 - padding.top - padding.bottom * 2;

    // Get the axes
    var xScale = this.xScale.range([0, width]);
   	var yScale = this.yScale.range([height, 0]);

    var xAxis = this.xAxis;
   	var yAxis = this.yAxis;	  

    var tip = d3.tip()
  				.attr('class', 'd3-tip')
  				.offset([-16, 0])
  				.html(function(d) {
    				return "<span style='color:white'>" + d.formatTime() 
                            + "<br><center>" + d.getHost() +"</center></span>";
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
    	.attr("transform", "translate(" + (padding.left - 2) + "," + (height - 1) +")")
    	.call(xAxis);
    			
    // Insert the y-axis into the graph
    $svg.append("g")
    	.attr("class", "axis")
    	.attr("transform", "translate(" + (padding.left - 2) + ",0)")
    	.call(yAxis)
    	.append("text")
    	.attr("x", -22)
    	.attr("y", height - 12)
    	.attr("dy", ".71em")
    	.text($("#graphtimescaleviz").val().trim());

    // Remove the "0" at the bottom of the y-axis
    $svg.selectAll(".tick")
        .filter(function (d) { 
            return d == 0 || d == 1;  
        }).remove();

    // Insert rectangles for each piece of data in the shifted bar area
    $svg.select(".barArea").selectAll("rect")
    	.data(motifPoints)
    	.enter()
    	.append("rect")
    	.attr("x", function(d, i) {
    		return i * (width / motifPoints.length);
    	})
    	.attr("y", function(d) {
    		return yScale(d.getYScaled());
    	})
    	.attr("width", width / motifPoints.length - barPadding)
    	.attr("height", function(d) {
            // Really small value close to zero to satisfy both linear and log scales
    		return yScale(0.00000000000000000001) - yScale(d.getYScaled());
    	})
    	.attr("fill", function(d){
            if(sortedByHost)
                return d.getFillColor();
            else
                return "#04a";
        })
    	.on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
            motifNavigator.jumpTo(d.getMotif());
        });

    this.$chart = $svg;
};

/**
 * Sets up the axis with a linear scale
 */
MotifChart.prototype.linearScale = function() {
    this.xScale = d3.scale.linear()
                          .domain([0, this.motifPoints.length]);

    // Create a scale so that the data bars do not go above the chart height
    this.yScale = d3.scale.linear()
                          .domain([0, d3.max(this.motifPoints, function(d) { return d.getYScaled(); })]);                 

    // Set up the axes
    this.xAxis = d3.svg.axis()
                   .scale(this.xScale)
                   .orient("bottom")
                   .ticks(0);

    this.yAxis = d3.svg.axis()
                   .scale(this.yScale)
                   .orient("left")
                   .outerTickSize(0)
                   .ticks(5);
};


/**
 * Sets up the axis with a log scale
 */
MotifChart.prototype.logScale = function() {
    // Create a x scale for the axis
    this.xScale = d3.scale.linear()
                          .domain([0, this.motifPoints.length]);

    // Create a scale so that the data bars do not go above the chart height                          
    this.yScale = d3.scale.log()
                          .base(10)
                          .domain([1, d3.max(this.motifPoints, function(d) { return d.getYScaled() + 1; })]);

    // Set up the axes
    this.xAxis = d3.svg.axis()
                   .scale(this.xScale)
                   .orient("bottom")
                   .ticks(0);

    this.yAxis = d3.svg.axis()
                   .scale(this.yScale)
                   .orient("left")
                   .ticks(7, ",.1s")
                   .tickSize(6, 0); 
};

/**
 * Removes original chart and redraws the chart.
 *
 * @param {Array<String>} the hosts that have been hidden
 */
MotifChart.prototype.redrawChart = function(hiddenHosts) {
    // Move all motifs into same place
    var temp = this.motifPoints.concat(this.hiddenMotifPoints);
    var hiddenMotifPoints = [];
    var motifPoints = [];

    this.removeChart();

    // Remove motifs start start with the hidden hosts
    for (var i = 0; i < this.motifPoints.length; i++) {
        if(hiddenHosts.includes(temp[i].getHost())){
            hiddenMotifPoints.push(temp[i]);
        }
        else {
            motifPoints.push(temp[i]);
        }
    }

    this.motifPoints = motifPoints;
    this.hiddenMotifPoints = hiddenMotifPoints;

    this.sortByHost();
    this.drawChart();
    
    this.sortByTime(true);
    this.drawChart();
};

/**
 * Sorts by host and descending time.
 */
MotifChart.prototype.sortByHost = function() {
    var motifPoints = this.motifPoints;

    console.log("Number of motifs before sort: " + this.motifPoints.length);

    motifPoints.sort(function(a, b) {
        // Hosts must be the same
        return (b.getHost() == a.getHost());
    });

    var allSorted = [];
    var i = 0;

    // Separate motifs by host and sort them by descending time
    while (i < motifPoints.length) {
        var sort = [];

        // Add the first motif of this host and then go to the next one
        sort.push(motifPoints[i]);
        i++;

        // Compare current motif's host with the previous one, if its the same add to the array
        while (i < motifPoints.length && motifPoints[i - 1].getHost() == motifPoints[i].getHost()) {
            sort.push(motifPoints[i]);
            i++;
        }

        // Sort the new array
        sort.sort(function(a, b) {
            // Descending order: largest y to smallest y
            return b.getY() - a.getY();
        });

        // Add sorted motifs with same host to final array
        allSorted.push(sort);
    }

    allSorted.sort(function(a, b) {
        // Sort the individual host arrays by the longest motif in descending time
        return (b[0].getY() - a[0].getY());
    });

    var newMotifPoints = [];

    // Add indiviual motifPoints to a new array
    for (i = 0; i < allSorted.length; i++ ) {
        newMotifPoints = newMotifPoints.concat(allSorted[i]);
    }

    // Update reference 
    this.motifPoints = newMotifPoints;

    this.setXValues();
    this.sortedByHost = true;

    console.log("Number of motifs: " + this.motifPoints.length);
};

/**
 * Sorts by time only.
 *
 * @param {boolean} true for descending, false for ascending
 */
MotifChart.prototype.sortByTime = function(descending) {
    console.log("Number of motifs before sort: " + this.motifPoints.length);

    this.motifPoints.sort(function(a, b) {
        // Descending order: largest y to smallest y
        return (descending ? b.getY() - a.getY() : a.getY() - b.getY());
    });

    this.setXValues();
    this.sortedByHost = false;

    console.log("Number of motifs: " + this.motifPoints.length);
};

/**
 * Sets the x-coordinates of the data in its current order.
 *
 * @private
 */
MotifChart.prototype.setXValues = function() {
    // Fix X co-ordinates to be from 0 to the number of motifs
    for (i = 0; i < this.motifPoints.length; i++) {
        this.motifPoints[i].setX(i);
    }
};

/**
 * Removes the chart.
 */
MotifChart.prototype.removeChart = function() {
	this.$chart.remove();
    d3.select(".chart").selectAll("svg").remove();
};
