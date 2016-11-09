

function CollapseTemporallyCloseNodesTransformation(threshold) {
	CollapseNodesTransformation.call(this, threshold);
    this.setThreshold(threshold);
}


CollapseTemporallyCloseNodesTransformation.prototype = Object.create(CollapseNodesTransformation.prototype);
CollapseTemporallyCloseNodesTransformation.prototype.constructor = CollapseTemporallyCloseNodesTransformation;


CollapseTemporallyCloseNodesTransformation.prototype.isCollapseable = function(node, threshold, minDistance) {
	if (threshold < 2) {
        throw new Exception("CollapseNodesTransformation.isCollapseable: Invalid threshold. Threshold must be greater than or equal to 2");
    }

    if(node.isHead() || node.isTail()) {
        return false;
    }

    // console.trace();
    var countfor = 1;
    var prev = node;
    var curr = node.getNext();
    var temp1 = 0;
	var temp2 = 0;
	var temp3 = 0;

	//Count forward how many nodes can be collapsed starting on the current node
	while(!curr.isTail()){
		temp1 = parseInt(curr.getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	    temp2 = parseInt(prev.getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	    temp3 = temp1 - temp2;
	    if(temp3 >= minDistance){ //current node is not collapseable
	    	break;
	    }else{ //current node is collapseable
	    	countfor++;
	    	if(countfor >= threshold) break;
	    	curr = curr.getNext();
	    	prev = prev.getNext();
	    }
	}

	//Count backwards how many nodes can be collapsed starting on the current node
	var countback = 1;
	prev = node.getPrev();
	curr = node;
	while(!prev.isHead()){
		temp1 = parseInt(curr.getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	    temp2 = parseInt(prev.getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	    temp3 =  temp1 - temp2;
	    if(temp3 >= minDistance){ //current node is not collapseable
	    	break;
	    }else{ //current node is collapseable
	    	countback++;
	    	if(countback >= threshold) break;
	    	prev = prev.getPrev();
	    	curr = curr.getPrev();
	    }
	}

	return countback >= threshold || countfor >= threshold;
}

/**
 * Overrides {@link CollapseNodesTransformation#transform}
 */
CollapseTemporallyCloseNodesTransformation.prototype.transform = function(model) {
	// console.log(model instanceof VisualGraph);
    var graph = model.getGraph();

    function collapse(curr, removalCount) {
        var logEvents = [];
        var hasHiddenParent = false;
        var hasHiddenChild = false;

        while (removalCount-- > 0) {
			remove = true;
            var prev = curr.getPrev();
            logEvents = logEvents.concat(prev.getLogEvents().reverse());
            var removedVN = model.getVisualNodeByNode(prev);
            hasHiddenParent |= removedVN.hasHiddenParent();
            hasHiddenChild |= removedVN.hasHiddenChild();
            //prev.remove();
			var children = prev.getChildren();
			var parents = prev.getParents();
			if (children.length > 0){
				remove = false;
			}
			if (parents.length > 0){
				remove = false;
			}
			if (remove) prev.remove();
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
    var test = "";
    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];

        var groupCount = 0;
        var ngroups = 0;
        var curr = graph.getHead(host).getNext();
        
        var next;
	    var temp1 = 0;
	    var temp2 = 0;
	    var temp3 = 0;

	    while (curr != null) { 

	        curr = curr.getNext();            
	        
	        if(curr != null){
	            if(!curr.isTail()){
	            	if(test != curr.getFirstLogEvent().fields.timestamp.slice(0, 3)) {
	            		// console.log("old:  " + test);
	            		if(test.length != 0)  console.log("LOG IS HUGE");
	            		test = curr.getFirstLogEvent().fields.timestamp.slice(0, 3);
	            		// console.log("new:  " + test);
	            	}
	                temp1 = parseInt(curr.getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	                temp2 = parseInt(curr.getPrev().getFirstLogEvent().fields.timestamp.slice(3, curr.getFirstLogEvent().fields.timestamp.length));
	                temp3 = temp1 - temp2;
	                if (((temp3) >= model.minDistance) || CollapseNodesTransformation.prototype.isExempt.call(this, curr)) {
	                        if(groupCount >= this.threshold) {
	                            collapse(curr, groupCount);
	                          
	                            groupCount = -1;
	                            ngroups++;
	                        }
	                }else{
	                    (groupCount == 0)? groupCount = 2 : groupCount++;
	                }
	            }	            
	        }
	    }
    }

    model.update();
};