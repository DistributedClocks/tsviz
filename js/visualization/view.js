/**
 * Constructs a View that draws the specified model
 * 
 * @class
 * 
 * A View is responsible for drawing a single VisualGraph.
 * 
 * @constructor
 * @param {ModelGraph} model
 * @param {HostPermutation} hostPermutation
 * @param {String} label
 */
function View(model, hostPermutation, label, minDistance, collapseLocal) {
    // console.trace();

    /** @private */
    this.collapseLocal = collapseLocal;

    /** @private */
    // console.log("in view.js, minDistance:  " + minDistance);
    this.minDistance = minDistance;
    
    /** @private */
    this.$svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    
    /** @private */
    this.$hostSVG = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
 
    /** @private */
    this.hostPermutation = hostPermutation;

    /** @private */
    this.label = label;

    /** @private */
    this.initialModel = model;

    /** @private */
    this.layout = new SpaceTimeLayout(0, 56);

    /** @private */
    this.visualGraph = new VisualGraph(model, this.layout, hostPermutation, this.minDistance, this.collapseLocal);

    /** @private */
    this.transformer = new Transformer(this.collapseLocal);

    /** @private */
    this.controller = null;
}

/**
 * Gets the transformer associated with this view. In other words, the
 * transformer configured for and responsible for transforming the
 * {@link VisualGraph} that this view draws.
 * 
 * @returns {Transformer} The transformer associated with this view
 */
View.prototype.getTransformer = function() {
    return this.transformer;
};

View.prototype.getSVG = function() {
    return this.$svg;
};

View.prototype.getHostSVG = function() {
    return this.$hostSVG;
};

/**
 * Gets the hosts as an array
 * 
 * @returns {Array<String>} The hosts
 */
View.prototype.getHosts = function() {
    return this.initialModel.getHosts();
};

/**
 * Gets the model
 * 
 * @returns {Graph} The model
 */
View.prototype.getModel = function() {
    return this.initialModel;
};

/**
 * Gets the label
 * 
 * @returns {Graph} The label
 */
View.prototype.getLabel = function() {
    return this.label;
};

/**
 * Gets the current visual model
 * 
 * @returns {VisualGraph} The current model
 */
View.prototype.getVisualModel = function() {
    return this.visualGraph;
};

/**
 * Sets the width of this view
 * 
 * @param {Number} newWidth The new width
 */
View.prototype.setWidth = function(newWidth) {
    this.layout.setWidth(newWidth);
};

/**
 * Returns whether this modelGraph has the given host
 * 
 * @returns {Boolean} True if the graph has this particular host
 */
View.prototype.hasHost = function(host) {
    return this.initialModel.hasHost(host);
};

/**
 * Returns whether this modelGraph has structures matching the current query
 *
 * @returns {Boolean} True if this modelGraph has elements matching the current search
 */
View.prototype.hasQueryMatch = function() {
    var hmt = this.getTransformer().getHighlightMotifTransformation();
    if (hmt != null) { 
        hmt.findMotifs(this.initialModel);
        return hmt.getHighlighted().getMotifs().length > 0;
    } else {
        return false;
    }
}

function scaleTime(number){
    switch($("#graphtimescaleviz").val().trim()){
        case "ns":
        return number;
        case "us":
        return number / 1000; 
        case "ms":
        return number / 1000000; 
        case "s":
        return number / 1000000000; 
    }
}

View.prototype.drawElapsedTimeTags = function(){
    var compressions = this.visualGraph.compressedParts;
    var numberOfCompressions = compressions.length;
    var smallTimestamp = Number(this.visualGraph.timeRange[0].slice(3, this.visualGraph.timeRange[0].length));
    
    var scaleStart = 0;
    var scaleEnd = 0;

    var graph = d3.select("#graphSVG");
    for(var i = 0; i < numberOfCompressions; i++){
        scaleStart = Number(compressions[i].original.timestart.slice(3, compressions[i].original.timestart.length)) - smallTimestamp;
        scaleEnd = Number(compressions[i].original.timeend.slice(3, compressions[i].original.timeend.length)) - smallTimestamp;

        var compTime = scaleEnd - scaleStart;

        compTime = scaleTime(compTime);

        //Add time difference to interval
        var timedif = graph.append("text")
        .attr("x", "50%")
        .attr("y", compressions[i].start + 45)
        .attr("fill", "#000")
        .text("Elapsed time: " + compTime.toString() + " " + $("#graphtimescaleviz").val().trim());

    }
}

/**
 * Clears the current visualization and re-draws the current model.
 */
View.prototype.draw = function(viewPosition) {

    this.model = this.initialModel.clone();
    this.visualGraph = new VisualGraph(this.model, this.layout, this.hostPermutation, this.minDistance, this.collapseLocal);
    this.transformer.transform(this.visualGraph);

    // Update the VisualGraph
    this.visualGraph.update();

    this.transformer.shrinkTimelinesTransformation.transform(this.visualGraph);

    // Define locally so that we can use in lambdas below
    var view = this;

    this.$svg.children("*").remove();

    this.$svg.attr({
        "id": "graphSVG",
        "height": this.visualGraph.getHeight(),
        "width": this.visualGraph.getWidth()
    });
    
    var hackyFixRect = Util.svgElement("rect");
    hackyFixRect.attr({
        "height": this.visualGraph.getHeight() + "px",
        "width": this.visualGraph.getWidth() + "px",
        "opacity": 0,
        "stroke-width": "0px",
        "z-index": -121
    });
    this.$svg.append(hackyFixRect);

    drawLinks();
    drawNodes();
    drawHosts();

    // Hide line highlight
    $(".highlight").hide();

    function drawLinks() {
        var edges = view.visualGraph.getVisualEdges();
        var arr = [];
        edges.forEach(function(visualEdge) {
            var svg = visualEdge.getSVG();
            view.$svg.append(svg);
            arr.push(svg[0]);
        });

        // Bind the edges
        view.controller.bindEdges(d3.selectAll(arr).data(edges));
    }

    function drawNodes() {
        var nodes = view.visualGraph.getNonStartVisualNodes();
        var arr = [];
        nodes.forEach(function(visualNode) {
            var svg = visualNode.getSVG();
            view.$svg.append(svg);
            arr.push(svg[0]);
        });

        // Bind the nodes
        view.controller.bindNodes(d3.selectAll(arr).data(nodes));
    }

    function drawHosts() {
        
        view.$hostSVG.children("*").remove();
        
        view.$hostSVG.attr({
            "width": view.visualGraph.getWidth(),
            "height": Global.HOST_SIZE,
            "class": view.id
        });

        if (viewPosition == "R") {
            view.$hostSVG.css("margin-left", ".15em");
        }
        
        else {
            view.$hostSVG.css("margin-left", "0em");
        }
        var startNodes = view.visualGraph.getStartVisualNodes();
        var arr = [];
        startNodes.forEach(function(visualNode) {
            var svg = visualNode.getSVG();
            view.$hostSVG.append(svg);
            arr.push(svg[0]);
        });
        
        // Bind the hosts
        view.controller.bindHosts(d3.selectAll(arr).data(startNodes));
    }
};