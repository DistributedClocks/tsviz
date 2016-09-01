/**
 * Constructs a MotifPoint given a {@link MotifPoint}. The newly constructed
 * MotifPoint will represent the visualization of the {@link ModelNode}.
 * 
 * @classdesc
 * 
 * A MotifPoint represents the visualization of an {@link Motif} that is,
 * this class describes how the Motif should be drawn (such as its size, color,
 * etc). Note that the actual drawing logic is not part of this class.
 * 
 * @constructor
 * @param {Motif} motif
 * @param {VisualGraph} that contains the motif
 */
function MotifPoint(visualGraph, motif) {

    /** @private */
    this.motif = motif;
    this.visualGraph = visualGraph;
    this.y = motif.getTotalTime();
    this.x = 0;
    
    /** @private */
    this.$svgElements = [];

    /** @private */
    this.fillColor = "#000";
    this.setFillColor(((this.getVisualGraph()).getVisualNodeByNode(this.getMotif().getNodes()[0])).getFillColor());

    /** @private */
    this.opacity = 0.7;
    this.setOpacity(0.7);

    /** @private */
    this.label = "";
    this.setLabel("");
}

/*
 * Gets all of the SVG Elements associated with this MotifPoint
 * 
 * @returns {SVGElement[]}
 */
MotifPoint.prototype.getSVGElements = function() {
    var $elems = [];

    for(var i = 0; i < this.$svgElements.length; i++) {
        $elems[i] = this.$svgElements[i];
    }

    return $elems;
};

/*
 * Adds an SVG element to this MotifPoint
 * 
 * @param {SVGElement} 
 */
MotifPoint.prototype.addSVGElement = function(elem) {
    this.$svgElements.push(elem);
}


/**
 * Gets the underlying {@link Motif} that this MotifPoint is a visualization
 * of
 * 
 * @returns {ModelNode} The underlying node
 */
MotifPoint.prototype.getMotif = function() {
    return this.motif;
};

/**
 * Gets the {@link VisualGraph} that this MotifPoint is in.
 * 
 * @returns {VisualGraph} that contains the information in this {@link MotifPoint}
 */
MotifPoint.prototype.getVisualGraph = function() {
    return this.visualGraph;
};

/**
 * Gets the x coordinate of the MotifPoint.
 * 
 * @returns {Number} The x-coordinate
 */
MotifPoint.prototype.getX = function() {
    return this.x;
};

/**
 * Sets the x coordinate of the of MotifPoint.
 * 
 * @param {Number} newX The new x-coordinate
 */
MotifPoint.prototype.setX = function(newX) {
    this.x = newX;
};

/**
 * Gets the y coordinate of the MotifPoint.
 * 
 * @returns {Number} The y-coordinate
 * 
 */
MotifPoint.prototype.getY = function() {
    return this.y;
};

/**
 * Sets the y coordinate of the MotifPoint.
 * 
 * @param {Number} newY The new y-coordinate
 */
MotifPoint.prototype.setY = function(newY) {
    this.y = newY;
};

/**
 * Gets the fill color of the MotifPoint.
 * 
 * @returns {String} The fill color
 */
MotifPoint.prototype.getFillColor = function() {
    return this.fillColor;
};

/**
 * Sets the fill color of the MotifPoint.
 * 
 * @param {String} newFillColor The new fill color. The color must be a string
 *            that parses to a valid SVG color as defined in
 *            http://www.w3.org/TR/SVG/types.html#WSP
 */
MotifPoint.prototype.setFillColor = function(newFillColor) {
    this.fillColor = newFillColor;
};

/**
 * Gets the opacity of the node
 * 
 * @returns {Number} The opacity
 */
MotifPoint.prototype.getOpacity = function() {
    return this.opacity;
};

/**
 * Sets the opacity
 * 
 * @param {Number} opacity The opacity
 */
MotifPoint.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};

/**
 * Gets the MotifPoint's label text. The label text is displayed inside the
 * MotifPoint itself
 * 
 * @returns {String} The label text
 */
MotifPoint.prototype.getLabel = function() {
    return this.label;
};

/**
 * Sets the MotifPoint's label text. The label text is displayed inside the
 * MotifPoint itself
 * 
 * @param {String} newLabel The new label text
 */
MotifPoint.prototype.setLabel = function(newLabel) {
    newLabel += "";
    if(this.label.trim() == "" && newLabel.trim() != "") {
        this.$svg.append(this.$text);
    }
    if(this.label.trim() != "" && newLabel.trim() == "") {
        this.$text.remove();
    }
    this.label = newLabel;
};

/**
 * Format total time to current timescale.
 *
 * @returns {String} scaled time with unit
 */
MotifPoint.prototype.formatTime = function() {
    if($("#graphtimescaleviz").val().trim() == "ns") return this.getYScaled() + " ns";
    else if($("#graphtimescaleviz").val().trim() == "us") return this.getYScaled()  + " μs";
    else if($("#graphtimescaleviz").val().trim() == "ms") return this.getYScaled()  + " ms";
    else if($("#graphtimescaleviz").val().trim() == "s") return this.getYScaled()  + " s";
};

/**
 * Gets the host of this point chosen 
 * from the first node in the motif
 * 
 * @returns {String} the host name
 */
MotifPoint.prototype.getHost = function() {
    return  this.motif.getNodes()[0].getHost();
};

/**
 * Gets the y coordinate of the MotifPoint scaled to the units selected by the user.
 * 
 * @returns {Number} The y-coordinate
 * 
 */
MotifPoint.prototype.getYScaled = function() {
    if($("#graphtimescaleviz").val().trim() == "ns") return this.getY();
    else if($("#graphtimescaleviz").val().trim() == "us") return this.getY() / 1000;
    else if($("#graphtimescaleviz").val().trim() == "ms") return this.getY() / 1000000;
    else if($("#graphtimescaleviz").val().trim() == "s") return this.getY() / 1000000000;
};