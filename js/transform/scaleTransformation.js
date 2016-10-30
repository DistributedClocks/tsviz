function ScaleTransformation() {
    /** @private */    
    this.baseScale = 1;
    this.scale = 1;
}

ScaleTransformation.prototype = Object.create(Transformation.prototype);
ScaleTransformation.prototype.constructor = ScaleTransformation;

ScaleTransformation.prototype.setBaseScale = function(baseScale) {
    this.baseScale = baseScale;
};

ScaleTransformation.prototype.setScale = function(scale) {
    this.scale = scale;
}

ScaleTransformation.prototype.transform = function(visualModel) {
    var scale = this.scale;
    visualModel.setScale(scale);
    var visualNodes = visualModel.getNonStartVisualNodes();
    var visualEdges = visualModel.getVisualEdges();

    var originY = Number.MAX_VALUE;
    visualNodes.forEach(function(visualNode) {
        if(visualNode.getY() <= originY) {
            originY = visualNode.getY();
        }
    });

    visualNodes.forEach(function(visualNode) {
        var currentY = visualNode.getY();
        var relativeY = currentY - originY;
        visualNode.setY(originY + (relativeY / scale));
    });

    visualEdges.forEach(function(visualEdge) {
        visualEdge.updateCoords();
    });
    console.log("Done scaling");
};