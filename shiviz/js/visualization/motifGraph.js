/**
 * Constructs a MotifGraph given a {@link MotifGroup}. The newly constructed
 * MotifGraph will represent the time distribution of the {@link MotifGroup}.
 * 
 * @classdesc
 * 
 * A MotifGraph represents the visualization of an {@link MotifGroup} that is,
 * this class displays a visual representation of the {@link Motif} in the single
 * parameter of this class.
 * 
 * @constructor
 * @param {MotifGroup} motifGroup
 */
function MotifGraph(motifGroup) {

	/** @private */
	this.motifPoints = [];

	var motifs = motifGroup.getMotifs();
	var sorted = [];

	for (var i = 0; i < motifs.length; i++) {
		sorted[i] = new MotifPoint(motifs[i]);
	}

	sorted.sort(function(a, b) {
		//Descending order: largest y to smallest y
		return a.getY() - b.getY();
	});

	motifPoints = sorted;

	for (var i = 0; i < motifPoints.length; i++) {
		motifPoints[i].setX(i);
		console.log(motifPoints[i].getY());
	}
}