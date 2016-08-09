/**
 * Constructs an empty motif.
 * 
 * @classdesc
 * 
 * A Motif is a set of edges and nodes that are a subgraph of a
 * {@link AbstractGraph}. Motifs can be used by other classes to identify or
 * store interesting or useful parts of a larger graph. The exact importance of
 * the edges and nodes stored is left up to the utilizing class.
 * In order to keep track of a motif's space in time, the user must add the
 * edges between each pair of nodes in the particular motif. 
 * 
 * @constructor
 */
function Motif() {

    /** @private */
    this.id = Motif.number++;

    /** @private */
    this.nodes = {};

    /** @private */
    this.edges = {};

    /** @private */
    this.totalTime = 0;
}

/**
 * Global counter used to assign each motif a unique ID
 * 
 * @static
 * @private
 */
Motif.number = 0;

/**
 * Adds a node to this motif
 * 
 * @param {AbstractNode} node the node to add
 */
Motif.prototype.addNode = function(node) {
    this.nodes[node.getId()] = node;
};

/**
 * Adds multiple nodes to this motif
 * 
 * @param {Array<AbstractNode>} nodes An array containing the nodes to add
 */
Motif.prototype.addAllNodes = function(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        this.addNode(nodes[i]);
    }
};

/**
 * Gets all nodes that are contained in this motif.
 * 
 * @returns {Array<AbstractNode>}
 */
Motif.prototype.getNodes = function() {
    var array = [];
    for (var key in this.nodes) {
        array.push(this.nodes[key]);
    }
    return array;
};

/**
 * Adds an edge to this motif, given the two nodes that the edge connects. Note
 * that this class does not check that the added edge actually exists anywhere
 * or is otherwise meaningful in any way. Such checks are the responsibility of
 * classes utilizing Motif
 * 
 * @param {AbstractNode} node1 One of the nodes the edge connects. Must not be
 *            identical to node2. 
 * @param {AbstractNode} node2 One of the nodes the edge connects. Must not be
 *            identical to node1. 
 */
Motif.prototype.addEdge = function(node1, node2) {
    this.edges[Motif.getEdgeId(node1, node2)] = [ node1, node2 ];
    
    var node1Time = node1.getFirstLogEvent().fields.timestamp;
    node1Time = Number(node1Time.slice(3, node1Time.length));

    var node2Time = node2.getFirstLogEvent().fields.timestamp;
    node2Time = Number(node2Time.slice(3, node2Time.length));
    
    this.totalTime += Math.abs(node2Time - node1Time);
};

/**
 * Adds multiple edges to this motif.
 * 
 * @param {Array<Array<AbstractNode>>} edges The edges to add. edges[i] is the
 *            i-th edge to be added. edge[i][0] and edge[i][1] are the two nodes
 *            the i-th edge connects. For example, if you want to add two edges:
 *            one from x to y and another from t to w, edges would be [ [x, y],
 *            [t, w] ]
 */
Motif.prototype.addAllEdges = function(edges) {
    for (var i = 0; i < edges.length; i++) {
        this.addEdge(edges[i][0], edges[i][1]);
    }
};

Motif.prototype.addTrail = function(nodes) {
    for (var i = 1; i < nodes.length; i++) {
        this.addEdge(nodes[i], nodes[i - 1]);
        this.addNode(nodes[i]);
    }
    if (nodes.length > 0) {
        this.addNode(nodes[0]);
    }
};

/**
 * Gets all the edges in this motif
 * 
 * @returns {Array<Array<AbstractNode>>} the edges in this motif. edges[i] is
 *          the i-th edge in the motif. edge[i][0] and edge[i][1] are the two
 *          nodes the i-th edge connects. For example, if there are two edges:
 *          one from x to y and another from t to w, the returned array would be [
 *          [x, y], [t, w] ]
 */
Motif.prototype.getEdges = function() {
    var edges = [];
    for (var key in this.edges) {
        edges.push(this.edges[key]);
    }
    return edges;
};

/**
 * Merges two motifs. All of the edges and nodes in other will be added to this.
 * The other motif will be unmodified
 * 
 * @param {Motif} other the other motif to merge into this one
 */
Motif.prototype.merge = function(other) {
    this.addAllNodes(other.getNodes());
    this.addAllEdges(other.getEdges());
};

/**
 * Gets the number of nodes in this motif
 * 
 * @returns {Number} the number of nodes in this motif
 */
Motif.prototype.getNumNodes = function() {
    var count = 0;
    for(var key in this.nodes) {
        count++;
    }
    return count;
};

/**
 * Gets the number of edges in this motif
 * 
 * @returns {Number} the number of edges in this motif
 */
Motif.prototype.getNumEdges = function() {
    var count = 0;
    for(var key in this.edges) {
        count++;
    }
    return count;
};

/**
 * 
 * @private
 */
Motif.getEdgeId = function(node1, node2) {
    var min = Math.min(node1.getId(), node2.getId());
    var max = Math.max(node1.getId(), node2.getId());
    return min + ":" + max;
};

/**
 * Gets the total time of this motif
 *
 * @returns {Number} the space in time the nodes take up
 */
Motif.prototype.getTotalTime = function() {
    return this.totalTime;
};

/**
 * Gets the ID of the Motif
 *
 * @returns {Number} the ID of this motif
 */
Motif.prototype.getId = function() {
    return this.id;
};

/**
 * Checks if this motif is the same as the one provided
 *
 * @parameter {Motif} motif being compared against
 * @returns {boolean} true if both motifs are the same, false otherwise
 */
Motif.prototype.equals = function(motif) {
    return (this.id == motif.getId());
};