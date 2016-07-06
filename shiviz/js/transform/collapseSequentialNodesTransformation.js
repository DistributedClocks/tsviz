/**
 * Constructs a CollapseSequentialNodeTransformation that will collapse all
 * local consecutive events that have no remote dependencies, subject to the
 * threshold parameter.
 * 
 * @classdesc
 * 
 * <p>
 * CollapseSequentialNodeTransformation groups local consecutive events that
 * have no remote dependencies. The collapsed nodes will have an increased
 * radius and will contain a label indicating the number of nodes collapsed into
 * it. This transformation provides methods for adding and removing nodes exempt
 * from this collapsing process.
 * </p>
 * 
 * <p>
 * This transformation collapses nodes that belong to the same group.
 * Intuitively, nodes belong to the same group if they are local consecutive
 * events that have no remote dependencies. More formally, a node y is in x's
 * group if y == x or y has no family and y's prev or next node is in x's group.
 * </p>
 * 
 * @constructor
 * @extends Transformation
 * @param {Number} threshold Nodes are collapsed if the number of nodes in the
 *            group is greater than or equal to the threshold. The threshold
 *            must be greater than or equal to 2.
 */
function CollapseSequentialNodesTransformation(threshold) {
    //Call constructor from superclass to initialize
    CollapseNodesTransformation.call(this, threshold);
    this.setThreshold(threshold);
}

// CollapseSequentialNodesTransformation extends Transformation
CollapseSequentialNodesTransformation.prototype = Object.create(CollapseNodesTransformation.prototype);
CollapseSequentialNodesTransformation.prototype.constructor = CollapseSequentialNodesTransformation;

CollapseSequentialNodesTransformation.prototype.isCollapseable = function(node, threshold) {
    if (threshold < 2) {
        throw new Exception("CollapseNodesTransformation.isCollapseable: Invalid threshold. Threshold must be greater than or equal to 2");
    }

    if (node.hasFamily() || node.isHead() || node.isTail()) {
        return false;
    }

    var count = 1;
    var curr = node.getNext();
    while (!curr.isTail() && !curr.hasFamily()) {
        curr = curr.getNext();
        count++;
    }

    curr = node.getPrev();
    while (!curr.isHead() && !curr.hasFamily()) {
        curr = curr.getPrev();
        count++;
    }

    return count >= threshold;
}

/**
 * Overrides {@link CollapseNodesTransformation#transform}
 */
CollapseSequentialNodesTransformation.prototype.transform = function(model) {

    var graph = model.getGraph();

    function collapse(curr, removalCount) {
        var logEvents = [];
        var hasHiddenParent = false;
        var hasHiddenChild = false;

        while (removalCount-- > 0) {
            var prev = curr.getPrev();
            logEvents = logEvents.concat(prev.getLogEvents().reverse());
            var removedVN = model.getVisualNodeByNode(prev);
            hasHiddenParent |= removedVN.hasHiddenParent();
            hasHiddenChild |= removedVN.hasHiddenChild();
            prev.remove();
        }
        var newNode = new ModelNode(logEvents.reverse());
        curr.insertPrev(newNode);

        var visualNode = model.getVisualNodeByNode(newNode);
        visualNode.setRadius(15);
        visualNode.setLabel(logEvents.length);
        visualNode.setHasHiddenParent(hasHiddenParent);
        visualNode.setHasHiddenChild(hasHiddenChild);
    }

    var hosts = graph.getHosts();

    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];

        var groupCount = 0;
        var groupCount2 = 0;
        var ngroups = 0;
        var curr = graph.getHead(host).getNext();

        
        var next;
        var curr2 = curr;

        while (curr != null) { 
             if (curr.hasFamily() || curr.isTail() || this.isExempt(curr)){ //Node is not collapseable
                if (groupCount >= this.threshold) { //collapse all the nodes grouped behind it
                    collapse(curr, groupCount);
                }
                groupCount = -1;

            }
            groupCount++;
            curr = curr.getNext();
        }

    }

    model.update();
};
