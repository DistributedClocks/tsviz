/**
 * Constructs an event motif finder to match sections of nodes based on the specified
 * start and end events.
 * 
 * @classdesc
 * 
 * EventMotifFinder is responsible for finding structures in a {@link ModelGraph}
 * that match the start and end node events. Each found structure is considered 
 * its own {@link Motif} and are collectively returned as a {@link MotifGroup}.
 * 
 * @constructor
 * @param {String} start
 * @param {String} end
 * @param {boolean} onlyCommunication - search only communication between hosts
 */
function EventMotifFinder(start, end, onlyCommunication) {

    /** @private */
    this.start = start;
    this.end = end;
    this.logEventMatcherStart = new LogEventMatcher(start);
    this.logEventMatcherEnd = new LogEventMatcher(end);
    this.searchCommunicationOnly = onlyCommunication;
}

// EventMotifFinder extends MotifFinder
EventMotifFinder.prototype = Object.create(MotifFinder.prototype);
EventMotifFinder.prototype.constructor = EventMotifFinder;

/**
 * Overrides {@link MotifFinder#find}
 */
EventMotifFinder.prototype.find = function(graph) {

    var motifGroup = new MotifGroup();
    var hosts = graph.getHosts();

    // Iterate through all the different hosts
    for(var i = 0; i < hosts.length; i++) {
        var prevNode = graph.getHead(hosts[i]);
        var currNode = prevNode.getNext();

        // Iterate through all the nodes of this host
        while(!currNode.isTail()) {

            // If we found a start-event, add the node to a motif
            if(this.logEventMatcherStart.matchAny(currNode.getLogEvents())) {
                var motif = new Motif();

                // Check if the start-event communicates to another host, maybe the communication
                // to another host leads to the end event
                if(currNode.hasChildren()) {
                    var children = currNode.getChildren();

                    for(var j = 0; j < children.length; j++) {
                        if(this.logEventMatcherEnd.matchAny(children[j].getLogEvents())) {
                            motif.addNode(currNode);
                            motif.addNode(children[j]);
                            motif.addEdge(currNode, children[j]);
                        }
                    }
                    // This is another branch so we separate the motif
                    // incase the main path has more results
                    motifGroup.addMotif(motif);
                    motif = new Motif();
                }

                // Also add other nodes from the individual hosts if we don't 
                // want only communication results
                if(!this.searchCommunicationOnly) {
                    motif.addNode(currNode);
                    prevNode = currNode;
                    currNode = currNode.getNext();

                    // Continue adding nodes to the motif until we've reached the end event or the end of the line
                    while(!this.logEventMatcherEnd.matchAny(currNode.getLogEvents()) && !currNode.isTail()){
                        motif.addNode(currNode);
                        motif.addEdge(prevNode, currNode);
                        prevNode = currNode;
                        currNode = currNode.getNext();
                    }

                    // Add the end-event nodes to the motif
                    while(this.logEventMatcherEnd.matchAny(currNode.getLogEvents()) && !currNode.isTail()) {
                        motif.addNode(currNode);
                        motif.addEdge(prevNode, currNode);
                        prevNode = currNode;
                        currNode = currNode.getNext();
                    }
                }
                // Otherwise move onto next node
                else {
                    prevNode = currNode;
                    currNode = currNode.getNext();
                }

                // Add the newly constructed motif to the group of motifs
                motifGroup.addMotif(motif);
            }
            // Otherwise go to the next node of this host
            else {
                prevNode = currNode;
                currNode = currNode.getNext();
            }
        }   
    }

    return motifGroup;
};