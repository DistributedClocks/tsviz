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

    /** @private */
    // Cache a mapping of hostnames to abbreviated hostnames
    this.abbreviatedHostnames = null; // {String} -> {String}
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
        
        const d3Hosts = d3.selectAll(arr).data(startNodes);
        drawHostLabels(d3Hosts);

        const hostbar = view.$hostSVG[0]; 
        const d3Hostbar = d3.select(hostbar);
        view.controller.bindHosts(d3Hostbar, startNodes);
    }

    function drawHostLabels(d3Hosts) {
        view.$hostSVG.attr("overflow", "visible");

        var x_offset = Global.HOST_SIZE / 3;
        var hostLabels = d3Hosts.append("text")
            .text(function(node) {
                const label = view.getAbbreviatedHostname(node.getHost());
                return label;
            })
            //.attr("text-anchor", "middle")
            .attr("transform", "rotate(-45)")
            .attr("x", x_offset)
            .attr("y", "1em")
            .attr("font-size", "x-small");

        if (!view.hasAbbreviatedHostnames()) {
            setTimeout(function() {
                // Must abbreviate after timeout so that the text elements will have
                // been drawn. Otherwise they will have no computed text length.
                abbreviateD3Texts(hostLabels);
            });
        }
    }

    function abbreviateD3Texts(d3Texts) {
        const textsToFitter = getD3FitterMap(d3Texts, Global.HOST_LABEL_WIDTH);
        const textsToSetter = getD3SetterMap(d3Texts);

        // Must come after after creating the textsToXXXMaps, since it mutates
        // the d3Texts
        const abbrevs = Abbreviation.generateFromStrings(textsToFitter);

        for (let abbrev of abbrevs) {
            const hostname = abbrev.getOriginalString();
            view.setAbbreviatedHostname(hostname, abbrev.getEllipsesString());

            let setText = textsToSetter.get(hostname);
            setText(abbrev);
        }

        function getD3FitterMap(d3Texts, svgWidth) {
            const textsToFitter = new Map();
            d3Texts.each(function() {
                const d3Text = d3.select(this);
                const self = this;
                textsToFitter.set(d3Text.text(),
                    function (str) {
                        d3Text.text(str);
                        return self.getComputedTextLength() < svgWidth;
                    });
            });
            return textsToFitter;
        }
        
        function getD3SetterMap(d3Texts) {
            const textsToSetter = new Map();
            d3Texts.each(function() {
                const d3Text = d3.select(this);
                const setAbbrevText = makeAbbrevTextSetter(this);
                textsToSetter.set(d3Text.text(), setAbbrevText);
                    
            });
            return textsToSetter;
        }

        function makeAbbrevTextSetter(svgText) {
            const d3Text = d3.select(svgText);
            return function(abbrev) {
                d3Text.text(abbrev.getEllipsesString());
            };
        }
    }

};

/**
 * Returns true if the abbrviated hostname strings have been cached.
 * @return {boolean} 
 */
View.prototype.hasAbbreviatedHostnames = function() {
    return this.abbreviatedHostnames !== null;
};

/**
 * Gets the abbreiviated hostname string associated with given hostname
 * string. If no abbreviation is recorded, then returns original string.
 * @param {string} hostname
 * @return {string} abbreviated hostname
 */
View.prototype.getAbbreviatedHostname = function(hostname) {
    if (this.hasAbbreviatedHostnames() &&
        this.abbreviatedHostnames.has(hostname)) {
        return this.abbreviatedHostnames.get(hostname);
    } else {
        return hostname;
    }
};

/**
 * Caches the abbreviated hostname, creating the cache if necessary
 * @param {string, string}
 */
View.prototype.setAbbreviatedHostname = function(hostname, abbrev) {
    if (!this.hasAbbreviatedHostnames()) {
        this.abbreviatedHostnames = new Map();
    }
    this.abbreviatedHostnames.set(hostname, abbrev);
}
