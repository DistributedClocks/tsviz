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
 * @param {MotifGroup} motifGroup
 */
function MotifChart(motifGroup) {

	/** @private */
	this.motifPoints = [];

	var motifs = motifGroup.getMotifs();
	var sorted = [];

	for (var i = 0; i < motifs.length; i++) {
		sorted[i] = new MotifPoint(motifs[i]);
	}

	sorted.sort(function(a, b) {
		//Descending order: largest y to smallest y
		return b.getY() - a.getY();
	});

	motifPoints = sorted;

	for (i = 0; i < motifPoints.length; i++) {
		motifPoints[i].setX(i);
		console.log(motifPoints[i].getY());
	}
}

MotifChart.prototype.draw = function() {

    var width = ((176 > motifPoints.length) ? 176 : motifPoints.length);
    var height = 192;
    var barPadding = 0;

    var $svg = d3.select(".chart")
    			.append("svg")
    			.attr("width", width)
    			.attr("height", height);

    $svg.selectAll("rect")
    	.data(motifPoints)
    	.enter()
    	.append("rect")
    	.attr("x", function(d, i) {
    		return i * (width / motifPoints.length);
    	})
    	.attr("y", function(d) {
    		return height - d.getY() / 349;
    	})
    	.attr("width", width / motifPoints.length - barPadding)
    	.attr("height", function(d) {
    		return d.getY() / 349;
    	})
    	.attr("fill", "red");



};