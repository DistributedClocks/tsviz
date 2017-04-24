/**
 * Constructs a VisualEdge. The resulting VisualEdge will represent the
 * visualization of the edge between the two {@link VisualNode}s given as
 * arguments
 * 
 * @classdesc
 * 
 * A VisualEdge is a visualization of an edge between {@link ModelNode}s; it
 * describes how the edge is to be drawn. Note that actual drawing logic is not
 * part of this class
 * 
 * @constructor
 * @param {VisualNode} sourceVisualNode One of the Nodes that is connected by
 *            this edge. sourceVisualNode.getNode() must either be the parent or
 *            the prev node of targetVisualNode.getNode()
 * @param {VisualNode} targetVisualNode One of the Nodes that is connected by
 *            this edge. targetVisualNode.getNode() must either be the child or
 *            the next node of sourceVisualNode.getNode()
 */
function VisualEdge(sourceVisualNode, targetVisualNode) {
    
    /** @private */
    /** @private */
    this.$svg = Util.svgElement("g");

    this.$line = Util.svgElement("line");

    this.$mouseOverLine = Util.svgElement("line");

    /** @private */
    this.sourceVisualNode = sourceVisualNode;

    /** @private */
    this.targetVisualNode = targetVisualNode;

    /** @private */
    this.compressions = [];

    /** @private */
    this.width;
    

    /** @private */
    this.dashLength;
    this.setDashLength(0);

    /** @private */
    this.color;
    

    /** @private */
    this.opacity;

    this.setDefaultAttributes();
    
    this.$line.attr({
        "x1": sourceVisualNode.getX(),
        "y1": sourceVisualNode.getY(),
        "x2": targetVisualNode.getX(),
        "y2": targetVisualNode.getY()
    }); 

    this.$svg.append(this.$line);

    this.intervals = [];
    // This will help us detect a mouseover event
    this.$mouseOverLine.attr({
        "opacity": 0,
        "stroke-width": 16,
        "stroke": "white",
        "x1": sourceVisualNode.getX(),
        "y1": sourceVisualNode.getY(),
        "x2": targetVisualNode.getX(),
        "y2": targetVisualNode.getY()
    });
    this.$svg.append(this.$mouseOverLine);
    
    // Find the minimum timestamp
    if (sourceVisualNode.getNode().isHead()) {
        // Do nothing
    }
    else if (sourceVisualNode.getNode().getFirstLogEvent().fields.timestamp < VisualEdge.minTimestamp) {
        VisualEdge.minTimestamp = sourceVisualNode.getNode().getFirstLogEvent().fields.timestamp;
    }
}

/**
 * Global variable used to hold the earliest timestamp
 * 
 * @private
 * @static
 */
VisualEdge.minTimestamp = Number.MAX_VALUE;

VisualEdge.prototype.setDefaultAttributes = function() {
    this.setWidth(1);
    this.setDashLength(0);
    this.setColor("lightgrey");
    this.setOpacity(1);
};

VisualEdge.prototype.getSVG = function() {
    return this.$svg;
};

/**
 * Gets the source {@link VisualNode}. The source VisualNode is the VisualNode
 * connected by this VisualEdge such that getSourceVisualNode().getNode() is
 * either the parent or the prev node of getTargetVisualNode().getNode()
 * 
 * @returns {VisualNode} The source VisualNode
 */
VisualEdge.prototype.getSourceVisualNode = function() {
    return this.sourceVisualNode;
};

/**
 * Gets the target {@link VisualNode}. The target VisualNode is the VisualNode
 * connected by this VisualEdge such that getTargetVisualNode().getNode() is
 * either the child or the next node the getSourceVisualNode().getNode()
 * 
 * @returns {VisualNode} The target VisualNode
 */
VisualEdge.prototype.getTargetVisualNode = function() {
    return this.targetVisualNode;
};

VisualEdge.prototype.updateCoords = function() {
    var attr = $(this.$line).attr('x1');

    // For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
    if (typeof attr !== typeof undefined && attr !== false) {
      // Element has this attribute
        this.$line.attr({
            "x1": this.sourceVisualNode.getX(),
            "y1": this.sourceVisualNode.getY(),
            "x2": this.targetVisualNode.getX(),
            "y2": this.targetVisualNode.getY()
        });
        this.$mouseOverLine.attr({
            "x1": this.sourceVisualNode.getX(),
            "y1": this.sourceVisualNode.getY(),
            "x2": this.targetVisualNode.getX(),
            "y2": this.targetVisualNode.getY()
        });
    } 
};

/**
 * Gets the line width of this VisualEdge.
 * 
 * @returns {Number} The line width
 */
VisualEdge.prototype.getWidth = function() {
    return this.width;
};

/**
 * Sets the line width of this VisualEdge.
 * 
 * @param {Number} newWidth The new line width
 */
VisualEdge.prototype.setWidth = function(newWidth) {
    this.width = newWidth;
    this.$line.attr("stroke-width", newWidth + "px");
};

/**
 * Gets the dash length of the VisualEdge. A dash length of zero indicates that
 * this VisualEdge is not dashed
 * 
 * @returns {Number} The dash length. Always non-negative
 */
VisualEdge.prototype.getDashLength = function() {
    return this.dashLength;
};

/**
 * Sets the dash length of the VisualEdge. A dash length of zero indicates that
 * this VisualEdge is not dashed
 * 
 * @param {Number} newDashLength The new dash length. Must be non-negative
 */
VisualEdge.prototype.setDashLength = function(newDashLength) {
    if (newDashLength < 0) {
        throw new Exception("VisualEdge.prototype.setDashLength: Dash length must be non-negative");
    }

    this.dashLength = newDashLength;
    this.$line.attr("stroke-dasharray", newDashLength);
};

/**
 * Gets the color of the VisualEdge
 * 
 * @returns {String} The color.
 */
VisualEdge.prototype.getColor = function() {
    return this.color;
};

/**
 * Sets the color of the VisualEdge
 * 
 * @returns {String} The color. The color must be a string that parses to a
 *          valid SVG color as defined in
 *          http://www.w3.org/TR/SVG/types.html#WSP
 */
VisualEdge.prototype.setColor = function(newColor) {
    this.color = newColor;
    this.$line.attr("stroke", newColor);
};

/**
 * Gets the opacity of the VisualEdge
 * 
 * @returns {Number} The opacity. Will be between 0 and 1 inclusive
 */
VisualEdge.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Sets the opacity of the VisualEdge
 * 
 * @param {Number} newOpacity The new opacity. Must be between 0 and 1 inclusive
 */
VisualEdge.prototype.setOpacity = function(newOpacity) {
    this.opacity = newOpacity;
    // var attr = $(this.$line).attr('x1');

    // For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
    // if (typeof attr !== typeof undefined && attr !== false) {
      // Element has this attribute
      this.$line.attr("opacity", newOpacity);  
    // }else{
    //     this.$line.attr("stroke-opacity", newOpacity);
    // }
    
};

/**
 * Adds an additional highlight over the VisualEdge
 *
 * @param {boolean} clears previous highlights if true
 */
VisualEdge.prototype.selectEdge = function(clear) {
    //Remove the dashed lines (if any exists)
    d3.selectAll("line.dashed").remove();

    // Unhighlight any previously clicked edges
    if(clear) {
        d3.selectAll("line.sel").each(function(d) {
            $(this).remove();
        });
    }
        
    // Add extra highlight to selected edge
    var selLine = d3.select(this.$svg[0]).append("line", "line");

    selLine
        .style("stroke", "firebrick")
        .style("stroke-width", this.getWidth())
        .style("opacity", 1);

    selLine
        .attr("class", "sel")
        .attr("x1", this.getSourceVisualNode().getX())
        .attr("y1", this.getSourceVisualNode().getY())
        .attr("x2", this.getTargetVisualNode().getX())
        .attr("y2", this.getTargetVisualNode().getY());
};

/**
 * Calculates the time difference between this edge represents
 *
 * @returns {String} formatted with the correct time units
 */
VisualEdge.prototype.getTimeDifference = function() {
    // Calculate time difference between source and target nodes
    // Compress to fit in number type
    var difference;
    var sourceTime;

    if (this.getSourceVisualNode().getNode().isHead()) {
        sourceTime = VisualEdge.minTimestamp;
    }
    else {
        sourceTime = this.getSourceVisualNode().getNode().getFirstLogEvent().fields.timestamp;
    }
    
    var targetTime = this.getTargetVisualNode().getNode().getFirstLogEvent().fields.timestamp;
    sourceTime = Number(sourceTime.slice(3, sourceTime.length));
    targetTime = Number(targetTime.slice(3, targetTime.length));
    
    difference = Math.abs(sourceTime - targetTime);

    if($("#graphtimescaleviz").val().trim() == "ns") return difference + " ns";
    else if($("#graphtimescaleviz").val().trim() == "us") return difference / 1000 + " μs";
    else if($("#graphtimescaleviz").val().trim() == "ms") return difference / 1000000 + " ms";
    else if($("#graphtimescaleviz").val().trim() == "s") return difference / 1000000000 + " s";
};
