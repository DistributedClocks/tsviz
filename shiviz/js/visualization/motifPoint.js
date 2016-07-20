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
 */
function MotifPoint(motif) {

    /** @private */
    this.motif = motif;
    this.y = motif.getTotalTime();
    this.x = 0;
    
    /** @private */
    this.$svg = Util.svgElement("g");
    
    this.$title = $("<title></title>");

    this.$rect = Util.svgElement("rect");

    this.$highlightRect = Util.svgElement("rect");


    /** @private */
    this.fillColor = "#000";
    this.setFillColor("#000");

    /** @private */
    this.opacity = 0.7;
    this.setOpacity(0.7);

    /** @private */
    this.label = "";
    this.setLabel("");

    this.$title.text(this.val);
    this.$svg.append(this.$title);

    var mouseOverRect = Util.svgElement("rect");
    mouseOverRect.attr({
        "width": 12,
        "height": 12,
        "x": -6,
        "y": -6
    });
    this.$svg.append(mouseOverRect);
}

MotifPoint.prototype.getSVG = function() {
    return this.$svg;
};

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
    this.$rect.attr("fill", newFillColor);
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
    this.$rect.attr("opacity", opacity);
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
    if($("#graphtimescaleviz").val().trim() == "ns") return this.getY() + " ns";
    else if($("#graphtimescaleviz").val().trim() == "us") return this.getY() / 1000 + " μs";
    else if($("#graphtimescaleviz").val().trim() == "ms") return this.getY() / 1000000 + " ms";
    else if($("#graphtimescaleviz").val().trim() == "s") return this.getY() / 1000000000 + " s";
};