/**
 * Constructs a CollapseNodeTransformation that will either call collapse all
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

function CollapseNodesTransformation(threshold) {
    /** @private */
    this.threshold = 2;
    
    this.setThreshold(threshold);

    /** @private */
    this.exemptLogEvents = {};
}


CollapseNodesTransformation.prototype = Object.create(Transformation.prototype);
CollapseNodesTransformation.prototype.constructor = CollapseNodesTransformation;


/**
 * Gets the threshold. Nodes are collapsed if the number of nodes in the group
 * is greater than or equal to the threshold. The threshold must be greater than
 * or equal to 2.
 * 
 * @returns {Number} The threshold
 */
CollapseNodesTransformation.prototype.getThreshold = function() {
    return this.threshold;
};

/**
 * Sets the threshold. Nodes are collapsed if the number of nodes in the group
 * is greater than or equal to the threshold. The threshold is always greater
 * than or equal to 2.
 * 
 * @param {Number} threshold The new threshold
 */
CollapseNodesTransformation.prototype.setThreshold = function(threshold) {
    if (threshold < 2) {
        throw new Exception("CollapseNodesTransformation.prototype.setThreshold: Invalid threshold. Threshold must be greater than or equal to 2");
    }

    this.threshold = threshold;
};

/**
 * <p>
 * Adds an exemption. An exemption is a LogEvent whose Node will never be
 * collapsed.
 * </p>
 * 
 * <p>
 * Note that addExemption and removeExemption are not inverses of each other.
 * addExemption affects only the LogEvents of the given node, while
 * removeExemption affects the LogEvents of the given node and all nodes in its
 * group.
 * </p>
 * 
 * @param {ModelNode} node The node whose LogEvents will be added as exemptions
 */
CollapseNodesTransformation.prototype.addExemption = function(node) {
    // console.log("got here");
    // console.trace();
    var logEvents = node.getLogEvents();
    for ( var i = 0; i < logEvents.length; i++) {
        this.exemptLogEvents[logEvents[i].getId()] = true;
    }
};

/**
 * <p>
 * Removes an exemption. An exemption is a LogEvent whose Node will never be
 * collapsed
 * </p>
 * 
 * <p>
 * Note that addExemption and removeExemption are not inverses of each other.
 * addExemption affects only the LogEvents of the given node, while
 * removeExemption affects the LogEvents of the given node and all nodes in its
 * group.
 * </p>
 * 
 * @param {ModelNode} node The LogEvents of this node and the LogEvents of every
 *            node in its group will be removed as exemptions
 */
CollapseNodesTransformation.prototype.removeExemption = function(node) {
    if (node.hasFamily()) {
        var logEvents = node.getLogEvents();
        for ( var i = 0; i < logEvents.length; i++) {
            delete this.exemptLogEvents[logEvents[i].getId()];
        }
        return;
    }

    var head = node;
    while (!head.isHead() && !head.hasFamily()) {
        head = head.getPrev();
    }

    var tail = node;
    while (!tail.isTail() && !tail.hasFamily()) {
        tail = tail.getNext();
    }

    var curr = head.getNext();
    while (curr != tail) {
        var logEvents = curr.getLogEvents();
        for ( var i = 0; i < logEvents.length; i++) {
            delete this.exemptLogEvents[logEvents[i].getId()];
        }
        curr = curr.getNext();
    }
};

/**
 * Toggles an exemption.
 * 
 * @param {ModelNode} node The node to toggle.
 */
CollapseNodesTransformation.prototype.toggleExemption = function(node) {
    if (this.isExempt(node)) {
        this.removeExemption(node);
    }
    else {
        this.addExemption(node);
    }
};

/**
 * <p>
 * Determines if any of the LogEvents contained inside the given node is an
 * exemption
 * </p>
 * 
 * @param {ModelNode} node The node to check
 * @returns {Boolean} True if one of the LogEvents is an exemption
 */
CollapseNodesTransformation.prototype.isExempt = function(node) {
    var logEvents = node.getLogEvents();
    for ( var i = 0; i < logEvents.length; i++) {
        if (this.exemptLogEvents[logEvents[i].getId()]) {
            return true;
        }
    }
    return false;
};

/**
 * Determines if the provided node can be collapsed based on the given threshold
 * 
 * @static
 * @param {ModelNode} node This method determines if this node can be collapsed
 * @param {Integer} threshold The collapsing threshold (see
 *            {@link CollapseSequentialNodesTransformation#setThreshold}). Must
 *            be greater than or equal to 2
 * @returns {Boolean} true if the node can be collapsed
 */
CollapseNodesTransformation.isCollapseable = function(node, threshold) {
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
};

// TO BE OVERRIDDEN
CollapseNodesTransformation.prototype.transform = function(model) {
	return 0;
}