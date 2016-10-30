function ScaleTransformation() {
    /** @private */    
    this.baseScale = 1;
    this.currentScale = 1;
}

ScaleTransformation.prototype = Object.create(Transformation.prototype);
ScaleTransformation.prototype.constructor = ScaleTransformation;

ScaleTransformation.prototype.setBaseScale = function(baseScale) {
    this.baseScale = baseScale;
};

ScaleTransformation.prototype.setScale = function(scale) {
    this.currentScale = scale;
}

ScaleTransformation.prototype.transform = function(visualModel) {
    var graph = visualModel.getGraph();
    var nodes = graph.getNodes();
    var visualNodes = visualModel.getVisualNodes();
    var visualEdges = visualModel.getVisualEdges();

    var originY = Number.MAX_VALUE;
    visualNodes.forEach(function(visualNode) {
        if(!visualNode.isStart() && visualNode.getY() <= originY) {
            originY = visualNode.getY();
        }
    });
    console.log(originY);
    visualNodes.forEach(function(visualNode) {
        if(!visualNode.isStart()) {
            var currentY = visualNode.getY();
            var relativeY = currentY - originY;
            visualNode.setY(originY + (relativeY / 2));
        }
    });

    visualEdges.forEach(function(visualEdge) {
        visualEdge.updateCoords();
    });
};