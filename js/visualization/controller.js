/**
 * Constructs a Controller to control the given {@link Global}
 * 
 * @classdesc
 * 
 * The Controller manipulates the model on user input. It is responsible for
 * maintaining {@link Transformation}s.
 * 
 * @constructor
 */
function Controller(global) {

    /** @private */
    this.global = global;

    var self = this;
    var searchbar = SearchBar.getInstance();

    // MODIFIED
    self.bindScroll();

    $(window).unbind("resize");
    $(window).on("resize", function() {
        try {
            self.global.redrawAll();
        }
        catch (exception) {
            Shiviz.getInstance().handleException(exception);
        }
    });

    //User pressed ESC
    $(window).unbind("keydown.dialog").on("keydown.dialog", function(e) {
        if (e.which == 27) {
            self.clearSidebarInfo();
            //Collapse node info tab
            if($("#nodeInfoToggle").hasClass("active")) $("#nodeInfoToggle").click();            
            $(".dialog").hide();
            d3.selectAll("circle.sel").each(function(d) {
                $(this).remove();
                d.setSelected(false);
            });
            // Unhighlight any previously clicked edges
            d3.selectAll("line.sel").each(function(d) {
                $(this).remove();
            });
            // d3.selectAll("path.sel").each(function(d) {
            //     $(this).remove();
            // })
            d3.selectAll("line.dashed").remove();
            $(".tdiff").children().remove();
        }
        
        self.bindScroll();
    });
    
    //User clicks somewhere
    $(window).unbind("click.dialog").on("click.dialog", function(e) {
        var $target = $(e.target);
        var tn = $target.prop("tagName");
        
        // Test for click inside dialog
        if ($target.is(".dialog") || $target.parents(".dialog").length)
            return;
        // Test for node or host click
        if (tn == "g" || $target.parents("g").length || $target.parents(".hidden-hosts").length)
            return;
        // Test for line click
        if ($target.parents(".log").length || $target.is(".highlight"))
            return;
        // Test for clickable
        if (tn.match(/input/i) || tn.match(/button/i))
            return;
        // Test for panel visibility
        if ($("#searchbar #panel:visible").length)
            return;

        $(".dialog").hide();
        // remove the scrolling behavior for hiding/showing dialog boxes once we click outside the box
        $(window).unbind("scroll"); 
        
        // Remove event info if the sidebar area wasn't clicked
        if($(event.target).closest('#sidebar').length) { 
            // Leave sidebar info     
        }
        else {
            // Area other than the sidebar was clicked
            self.clearSidebarInfo();

            d3.selectAll(".toolTip").remove();

            d3.selectAll("circle.sel").each(function(d) {
                $(this).remove();
                d.setSelected(false);
            });
            // Unhighlight any previously clicked edges
            d3.selectAll("line.sel").each(function(d) {
                $(this).remove();
            });
            d3.selectAll("line.dashed").remove();
            // d3.selectAll("path.sel").each(function(d) {
            //     $(this).remove();
            // });
            d3.select("polygon.sel").each(function(d) {
                $(this).remove();
                d.setSelected(false);
            });
        }
        
        $(".tdiff").children().remove();
        self.bindScroll();
    });

    $("#searchbar #panel").unbind("click").on("click", function(e) {
        var $target = $(e.target);
        // Test for click inside a host square or a constraint dialog
        if ($target.is("rect") || $target.parents(".hostConstraintDialog").length)
            return;
        if ($target.is("text"))
            return;
        $(".hostConstraintDialog").hide();
    });

    $(".dialog button").unbind().click(function() {
        var type = this.name;
        var e = $(".dialog").data("element");

        switch (type) {

            // Hide host
            case "hide":
                self.hideHost(e);
                break;

            // Unhide host
            case "unhide":
                self.unhideHost(e);
                break;

            // Highlight host
            case "filter":
                self.toggleHostHighlight(e);
                break;

            // Toggle collapse
            case "collapse":
                self.toggleCollapseNode(e);
                break;
        }

    });
    
    $(".diffButton").unbind().click(function() {    
        // remove the scrolling behavior for hiding/showing dialog boxes when the diff button is clicked
        $(window).unbind("scroll");
        $(this).toggleClass("fade");
        

        if ($(this).text() == "Show Differences") {
            $(this).text("Hide Differences");
            global.setShowDiff(true);
            self.showDiff();
        }           
        else {
            $(this).text("Show Differences");
            global.setShowDiff(false);
            self.hideDiff();
        }
        self.bindScroll();
    });

    $(".pairwiseButton").unbind().click(function() {    
        // remove the scrolling behavior for hiding/showing dialog boxes when the pairwise button is clicked
        $(window).unbind("scroll");
        $(this).toggleClass("fade");
        

        if ($(this).text() == "Pairwise") {
            $(this).text("Individual");
            global.setPairwiseView(true);
            global.drawAll();
            if ($("#clusterNumProcess").is(":checked") || $("#clusterComparison").is(":checked")) {
                global.drawClusterIcons();
            }
        }           
        else {
            $(this).text("Pairwise");
            // Remove the right view arrow when viewing graphs individually
            $("table.clusterResults #clusterIconR").remove();
            // Remove differences when viewing graphs individually
            if (global.getShowDiff()) {
               $(".diffButton").click();
            }
            $(".diffButton").hide();
            global.setPairwiseView(false);
            global.drawAll();
            if ($("#clusterNumProcess").is(":checked") || $("#clusterComparison").is(":checked")) {
                global.drawClusterIcons();
            }
        }
        self.bindScroll();
    });

    // Event handler for switching between clustering options
    $("#clusterNumProcess, #clusterComparison").unbind().on("change", function() {
        $("#labelIconL, #labelIconR, #selectIconL, #selectIconR").hide();
        $("#clusterIconL, #clusterIconR").remove();

        if ($(this).is(":checked")) {
            $(this).siblings("input").prop("checked", false);
            // Generate clustering results
            var clusterMetric = $(this).attr("id");
            var clusterer = new Clusterer(clusterMetric, global);
            clusterer.cluster();
        } else {
            // Clear the results if no option is selected
            $(".clusterResults td.lines").empty();
            $(".clusterResults td:empty").remove();
            $("#baseLabel, .clusterBase").hide();
        }
    });

    //Set the behavior for the separators on the sidebar
    $("#nodeInfoToggle").unbind("click"); // unbind before to make sure we aren't adding extra listeners
    $("#nodeInfoToggle").on("click", function(){
        //if currently inactive
        if(!$("#nodeInfoToggle").hasClass("active")){
            $("#nodeInfoToggle").addClass("active");
            $("#nodeInfoTab").addClass("show");            
        }
        //if currently active
        else if($("#nodeInfoToggle").hasClass("active")){
            $("#nodeInfoToggle").removeClass("active");
            $("#nodeInfoTab").removeClass("show");            
        }        
    });

    $("#searchResultsToggle").unbind("click"); // unbind before to make sure we aren't adding extra listeners
    $("#searchResultsToggle").on("click", function(){
        //if currently inactive
        if(!$("#searchResultsToggle").hasClass("active")){
            $("#searchResultsToggle").addClass("active");
            $("#searchResultsTab").addClass("show");            
        }
        //if currently active
        else if($("#searchResultsToggle").hasClass("active")){
            $("#searchResultsToggle").removeClass("active");
            $("#searchResultsTab").removeClass("show");            
        }        
    });

    $("#graphOptionsToggle").unbind("click"); // unbind before to make sure we aren't adding extra listeners
    $("#graphOptionsToggle").on("click", function(){
        //if currently inactive
        if(!$("#graphOptionsToggle").hasClass("active")){
            $("#graphOptionsToggle").addClass("active");
            $("#graphOptionsTab").addClass("show");            
        }
        //if currently active
        else if($("#graphOptionsToggle").hasClass("active")){
            $("#graphOptionsToggle").removeClass("active");
            $("#graphOptionsTab").removeClass("show");            
        }        
    });

    //Multi-exec tab
    $("#multiExecToggle").unbind("click"); // unbind before to make sure we aren't adding extra listeners
    $("#multiExecToggle").on("click", function(){
        //if currently inactive
        if(self.global.getViews().length >= 2){
            if(!$("#multiExecToggle").hasClass("active")){
                $("#multiExecToggle").addClass("active");
                $("#multiExecTab").addClass("show");
                $(".pairwiseButton").show();
            }
            //if currently active
            else if($("#multiExecToggle").hasClass("active")){
                $("#multiExecToggle").removeClass("active");
                $("#multiExecTab").removeClass("show");
                $(".pairwiseButton").hide();
            }
        }
    });

    //If user presses backspace, confirm that they want to go away
    $(window).unbind("keydown.dialog").on("keydown.dialog", function(e) {
        if (e.which == 8) {
            if (!($(document.activeElement).attr("type") == "text" || $(document.activeElement).attr("type") == "textarea")) {
                if (confirm("Are you sure you want to navigate away?") == true) {
                    window.history.back();
                }                  
            }     
    }
});    
    
}

/**
 * Highlights a motif across all {@link View}s using the provided motif finder.
 * The visualization is then re-drawn.
 * 
 * @param {MotifFinder} motifFinder
 * @see {@link HighlightMotifTransformation}
 */
Controller.prototype.highlightMotif = function(motifFinder) {
    this.global.getViews().forEach(function(view) {
        view.getTransformer().highlightMotif(motifFinder, false);
    });

    this.global.drawAll();
    // this.bindScroll();
};

/**
 * Clears highlighting of motifs across all {@link View}s. The visualization is
 * then re-drawn
 * 
 * @see {@link HighlightMotifTransformation}
 */
Controller.prototype.clearHighlight = function() {
    this.global.getViews().forEach(function(view) {
        view.getTransformer().unhighlightMotif();
    });

    this.global.redrawAll();
    // this.bindScroll();
};

/**
 * Determines if a motif is being highlighted in any of the {@link View}s.
 * 
 * @returns {Boolean} True if a motif is being highlighted
 */
Controller.prototype.hasHighlight = function() {
    var views = this.global.getViews();
    for (var i = 0; i < views.length; i++) {
        if (views[i].getTransformer().hasHighlightedMotif()) {
            return true;
        }
    }
    return false;
};

/**
 * Determines if a motif is being highlighted in the given View
 *
 * @param {View} view
 * @returns {Boolean} True if a motif is being highlighted in the view
 */
Controller.prototype.hasHighlightInView = function(view) {
    if (view.getTransformer().hasHighlightedMotif()) {
        return true;
    } else {
        return false;
    }
}

/**
 * Hides the specified host across all {@link View}s. The visualization is then
 * re-drawn.
 * 
 * @param {String} host The host to hide.
 */
Controller.prototype.hideHost = function(host) {
    $(window).unbind("scroll");
    this.global.getViews().forEach(function(view) {
        view.getTransformer().hideHost(host);
    });

    this.global.redrawAll();
    // this.bindScroll();
};

/**
 * Unhides the specified host across all {@link View}s. The visualization is
 * then re-drawn.
 * 
 * @param {String} host The host to unhide.
 */
Controller.prototype.unhideHost = function(host) {
    $(window).unbind("scroll");
    this.global.getViews().forEach(function(view) {
        view.getTransformer().unhideHost(host);
    });

    this.global.redrawAll();
    // this.bindScroll();
};

/**
 * Toggles the highlighting of a host across all {@link View}s. The
 * visualization is then re-drawn.
 * 
 * @param {String} host The host whose highlighting is to be toggled
 */
Controller.prototype.toggleHostHighlight = function(host) {
    this.global.getViews().forEach(function(view) {
        view.getTransformer().toggleHighlightHost(host);
    });

    this.global.drawAll();
    // this.bindScroll();
};

/**
 * Toggles the collapsing of a node.
 * 
 * @param {ModelNode} node
 */
Controller.prototype.toggleCollapseNode = function(node) {
    $(window).unbind("scroll");
    this.global.getViews().forEach(function(view) {
        view.getTransformer().toggleCollapseNode(node);
    });

    this.global.redrawAll();
};

/**
 * Highlights different hosts among the current active views
 * This method should only be called when there are > 1 execution
 * and graphs are displayed pairwise
 * @see {@link ShowDiffTransformation}
 */

Controller.prototype.showDiff = function() {
    var views = this.global.getActiveViews();
    var viewL = views[0];
    var viewR = views[1];
    viewL.getTransformer().showDiff(viewR);
    viewR.getTransformer().showDiff(viewL);
    this.global.drawAll();
};

/**
 * Re-draws the graph to not highlight different hosts
 * This method should only be called when there are > 1 execution
 * and graphs are displayed pairwise
 * @see {@link ShowDiffTransformation}
 */
 
Controller.prototype.hideDiff = function() {
    var views = this.global.getActiveViews();
    var viewL = views[0];
    var viewR = views[1];
    viewL.getTransformer().hideDiff(viewR);
    viewR.getTransformer().hideDiff(viewL);
    this.global.drawAll();
};

/**
 * Binds events to the nodes.
 * 
 * <ul>
 * <li>mouseover: highlights node & log line, shows info in sidebar</li>
 * <li>shift + click: toggles collapsed node</li>
 * </ul>
 * 
 * @param {d3.selection} nodes A D3 selection of the nodes.
 */
Controller.prototype.bindNodes = function(nodes) {
    var controller = this;
    var tip = d3.tip();
    nodes.call(tip);
    
    nodes.on("click", function(e) {
        //If the node info tab is hidden, unhide it
        if(! $("#nodeInfoToggle").hasClass("active")) $("#nodeInfoToggle").click();

        if (d3.event.shiftKey) {
            // Toggle node collapsing
            controller.toggleCollapseNode(e.getNode());
            tip.hide(e);
        }
        else {
            controller.clearSidebarInfo();

            // Add name to the dialog and colour the circle
            $(".event").find(".source").find(".name").text(e.getText());
            d3.select(".source").select(".circle").select("svg")
                .attr("width", 10)
                .attr("height", 10)
                .select("circle")
                .attr("cx", 5)
                .attr("cy", 5)
                .attr("r", 5)
                .style("fill", e.getFillColor());

            if (!e.isCollapsed()) {
                var fields = e.getNode().getLogEvents()[0].getFields();
                var scaledTimeStamp = fields.timestamp - VisualEdge.minTimestamp;
                    switch($("#graphtimescaleviz").val().trim()){
                        case "ns":                        
                        break;
                        
                        case "us":                        
                        scaledTimeStamp /= 1000;
                        break;
                        
                        case "ms":
                        scaledTimeStamp /=1000000;
                        break;

                        case "s":
                        scaledTimeStamp /= 100000000;
                        break; 

                        default:
                        break;
                    }
                
                for (var i in fields) {
                    var $f = $("<tr>", {
                        "class": "field"
                    });
                    var $t = $("<th>", {
                        "class": "title"
                    }).text(i + ":");
                    if (i == 'timestamp'){
                        var $v = $("<td>", {
                            "class": "value"
                        }).text(scaledTimeStamp + ($("#graphtimescaleviz").val().trim()));                        
                    }
                    else {
                        var $v = $("<td>", {
                            "class": "value"
                        }).text(fields[i]);
                    }

                    $f.append($t).append($v);
                    $(".fields").append($f);
                }
            }

            if(e.isCollapsed()){
                var timestamps = [];
                var stats = [];
                var statsnames = ["Smallest timestamp", "Largest timestamp", "Median", "Range", "Minimum difference"];
                var logEvents = e.getNode().getLogEvents();
                for(var i = 0; i < logEvents.length; i++){
                    timestamps.push(Number(logEvents[i].fields.timestamp.slice(3, logEvents[i].fields.timestamp.length)));
                }

                function getMedian(array){
                    array.sort(function(a,b){
                        return a - b;
                    });

                    var half = Math.floor(array.length/2);

                    if(array.length % 2) return array[half];
                    else return (array[half-1] + array[half]) / 2.0;
                    
                }

                function minDiff(array){
                    var diff = 0;
                    var min = Math.pow(2, 54);
                    for(var i = 0; i < array.length-1; i++){
                        diff = Math.abs(array[i]-array[i+1]);
                        if(diff<min) min = diff;
                    }
                    return min;
                }
                //Calculate everything
                stats[0] = Math.min.apply(Math, timestamps);
                stats[1] = Math.max.apply(Math, timestamps);
                stats[2] = getMedian(timestamps).toString();
                stats[2] = logEvents[0].fields.timestamp.slice(0, 3) + stats[2];
                stats[2] = stats[2] - VisualEdge.minTimestamp;
                stats[3] = stats[1] - stats[0]; //difference in nanoseconds
                stats[4] = minDiff(timestamps);

                //Convert to string and format
                stats[0] = logEvents[0].fields.timestamp.slice(0, 3) + stats[0];
                stats[1] = logEvents[0].fields.timestamp.slice(0, 3) + stats[1];
                switch($("#graphtimescaleviz").val().trim()){
                    case "ns":
                    stats[2] = stats[2].toString() + " ns";
                    stats[3] = stats[3].toString() + " ns";
                    stats[4] = stats[4].toString() + " ns"; 
                    break;
                    case "us":
                    stats[2] /= 1000;
                    stats[3] /= 1000;
                    stats[4] /= 1000;
                    stats[3] = stats[3].toString() + " us";
                    stats[4] = stats[4].toString() + " us";
                    stats[2] = stats[2].toString() + " us";

                    break;
                    case "ms":
                    stats[3] /= 1000000;
                    stats[3] = stats[3].toString() + " ms";
                    stats[4] /= 1000000;
                    stats[4] = stats[4].toString() + " ms";
                    stats[2] /= 1000000;
                    stats[2] = stats[2].toString() + " ms";                    
                    break;
                    case "s":
                    stats[3] /=1000000000;
                    stats[3] = stats[3].toString() + " s";
                    stats[4] /=1000000000;
                    stats[4] = stats[4].toString() + " s";
                    stats[2] /=1000000000;
                    stats[2] = stats[2].toString() + " s";
                    break;
                    default: 
                    stats[3] = stats[3].toString() + " ns";
                    stats[4] = stats[4].toString() + " ns";
                    stats[2] = stats[2].toString() + " ns";
                    stats[2] = stats[2].toString() + " ns";
                    break;
                }
                
                //Display
                for(var i = 2; i <= 4; i++){
                    var $f = $("<tr>", {
                        "class": "field"
                    });
                    var $g = $("<tr>", {
                        "class": "field"
                    });
                    var $t = $("<th>", {
                        "class": "title"
                    }).text(statsnames[i] + ":");
                    var $v = $("<td>", {
                        "class": "value"
                    }).text(stats[i]);

                    
                    $f.append($t);
                    $(".fields").append($f);
                    $g.append($v);
                    $(".fields").append($g);
                }
            }

            controller.showDialog(e, 0, this);
            var group = d3.select("#node" + e.getId());
                group.append("line").attr("class", "dashed")
                    .attr("x1", -e.getX())
                    .attr("x2", $("#vizContainer").width())
                    .attr("y1", 0)
                    .attr("y2", 0)
                    .attr("stroke-dasharray", "5,5")
                    .attr("stroke-width", "2px")
                    .attr("stroke", "#999")
                    .attr("z-index", 120);

            $(".line.focus").css({
                "color": $(".focus").data("fill"),
                "background": "",
                "width": "inherit"
            }).removeClass("focus");

            $(".reveal").removeClass("reveal");

            var $line = $("#line" + e.getId());
            var $parent = $line.parent(".line").addClass("reveal");
            $(".event").css("font-size", "12pt");
            $(".fields").css("font-size", "10pt");
            while($(".info").outerHeight() > $("#nodeInfoTab").outerHeight()){
                var oldevent = parseFloat($(".event").css("font-size"));
                var oldfield = parseFloat($(".fields").css("font-size"));
                if(oldfield > 5){
                    $(".event").css("font-size", String(oldevent-1) + "px");
                    $(".fields").css("font-size", String(oldfield-1) + "px");
                }
                else break;
            }
            // console.log("info outerHeight: ");
            // console.log($(".info").outerHeight());
            // console.log(parseFloat());
            // console.log(parseFloat($(".fields").css("font-size")));
            // console.log("nodeInfoTab outerHeight: ");
            // console.log($("#nodeInfoTab").outerHeight());

        }
        
        // Unhighlight any previously clicked edges
        d3.selectAll("line.sel").each(function(d) {
            $(this).remove();
        });
    }).on("mouseover", function(e) {
        d3.selectAll("g.focus .sel").transition().duration(100)
            .attr("r", function(d) {
                return d.getRadius() + 4;
            });
        d3.selectAll("g.focus").classed("focus", false).select("circle:not(.sel)").transition().duration(100)
            .attr("r", function(d) {
                return d.getRadius();
            });

        d3.select(this).classed("focus", true).select("circle:not(.sel)").transition().duration(100)
            .attr("r", function(d) {
                return d.getRadius() + 2;
            });
        d3.selectAll("g.focus .sel").transition().duration(100)
            .attr("r", function(d) {
                return d.getRadius() + 6;
            });

        //Draws the tooltip
        tip.attr('class', 'd3-tip')
            .offset([-14, 0])
            .html(function(d) {
                return "<span style='color:white'>" + d.getText() + "</span>";
            });

            nodes.call(tip);

        tip.show(e);

    }).on("mouseout", function(e){
        //Return nodes to their original side on hover off
        d3.selectAll("g.focus").classed("focus", false).select("circle:not(.sel)").transition().duration(100)
            .attr("r", function(d) {
                return d.getRadius();
            });
        tip.hide();

    });
};

/**
 * Binds events to the edges.
 * 
 * <ul>
 * <li>mouseover: highlights edge, shows info in sidebar</li>
 * <li>click: shows dialog with info</li>
 * </ul>
 * 
 * @param {d3.selection} edges A D3 selection of the edges.
 */
Controller.prototype.bindEdges = function(edges) {
    var controller = this;
    var tip = d3.tip();
    edges.call(tip);

    edges.on("click", function(e) {
        //If the node info tab is hidden, unhide it
        if(! $("#nodeInfoToggle").hasClass("active")) $("#nodeInfoToggle").click();

        //Clear previously selected nodes
        d3.selectAll("circle.sel").each(function(d){
            $(this).remove();
            d.setSelected(false);
        });
        e.selectEdge(true);
        controller.clearSidebarInfo();
        controller.formatSidebarInfo(e.getSourceVisualNode(), e.getTargetVisualNode(), 0);
    }).on("mouseover", function(e) {

        // Calculate offset for tip
        var horizontalOffset = 0
        if(e.getSourceVisualNode().getNode().getHost() == e.getTargetVisualNode().getNode().getHost()) {
            horizontalOffset = 0;
        }
        else {
            horizontalOffset = event.pageX - 45 - (e.getSourceVisualNode().getX() + e.getTargetVisualNode().getX()) / 2;
        }
           
        tip.attr('class', 'd3-tip')
           .offset([event.pageY - e.getSourceVisualNode().getY() - 155, horizontalOffset])
           .html(function(d) {
                return "<strong>Time:</strong> <span style='color:white'>" + e.getTimeDifference() + "</span>";
           });
    
        d3.selectAll("g.focus .sel").transition().duration(100)
            .attr("stroke-width", function(d) {
                return d.getWidth() + 2;
            })
            .attr("stroke", "dimgrey")
            .attr("opacity", 1);
        d3.selectAll("g.focus").classed("focus", false).select("line:not(.sel)").transition().duration(100)
            .attr("stroke-width", function(d) {
                return d.getWidth();
            })
            .attr("stroke", function(d) {
                return d.getColor();
            })
            .attr("opacity", function(d) {
                return d.getOpacity();
            });

        d3.select(this).classed("focus", true).select("line:not(.sel)").transition().duration(100)
            .attr("stroke-width", function(d) {
                return d.getWidth() ;
            })
            .attr("stroke", "dimgrey")
            .attr("opacity", 1);

        d3.selectAll("g.focus .sel").transition().duration(100)
            .attr("stroke-width", function(d) {
                return d.getWidth() + 4;
            })
            .attr("stroke", "dimgrey")
            .attr("opacity", 1);

        tip.show(e);

    }).on("mouseout", function(e){
        tip.hide(e);
       
        d3.selectAll("g.focus").classed("focus", false).select("line:not(.sel)").transition().duration(100)
            .attr("stroke-width", function(d) {
                return d.getWidth();
            })
            .attr("stroke", function(d) {
                return d.getColor();
            })
            .attr("opacity", function(d) {
                return d.getOpacity();
            });
    });
};

/**
 * Binds events to hosts
 * 
 * <ul>
 * <li>double-click: Hides the host</li>
 * <li>shift+double-click: Highlights the host</li>
 * </ul>
 * 
 * @param {d3.selection} hosts A D3 selection of the host rects
 */
Controller.prototype.bindHosts = function(hosts) {
    var controller = this;
    var tip = d3.tip();
    hosts.call(tip);

    hosts.on("mouseover", function(e) {
        tip.attr('class', 'd3-tip')
           .offset([-14, 0])
           .html(function(d) {
                return "<span style='color:white'>" + e.getText() + "</span>";
           });
        tip.show(e);
    }).on("dblclick", function(e) {
        var views = controller.global.getViews();

        if (d3.event.shiftKey) {
            // Filtering by host
            // If more than one view / execution then return
            if (views.length != 1)
                return;

            controller.toggleHostHighlight(e.getHost());
        }
        else {
            // Hide host
            controller.hideHost(e.getHost());
            tip.hide(e);
        }
    }).on("click", function(e) {
        controller.showDialog(e, 1, this);
        controller.clearSidebarInfo();
        $(".event").find(".source").find(".name").text(e.getText());
    }).on("mouseout", tip.hide);
};


/**
 * Binds unhide to double-click event on hidden hosts.
 * 
 * @param {String} host The host that is hidden
 * @param {d3.selection} node The visualNode that was hidden
 */
Controller.prototype.bindHiddenHosts = function(host, node) {
    var controller = this;
    var tip = d3.tip();
    node.call(tip);

    node.on("dblclick", function(e) {

        $(window).unbind("scroll");
        var views = controller.global.getViews();
        views.forEach(function(view) {
            view.getTransformer().unhideHost(host);
        });
        controller.global.redrawAll();
        tip.hide(e);

    }).on("mouseover", function(e) {
        tip.attr('class', 'd3-tip')
           .offset([-14, 0])
           .html(function(d) {
                return "<span style='color:white'>" + host + "</span>";
           });
        tip.show(e);
    }).on("click", function(e) {
        controller.showDialog(host, 2, this);
        controller.clearSidebarInfo();
        $(".event").find(".source").find(".name").text(host);
    }).on("mouseout", tip.hide);
};

/**
 * Ensures things are positioned correctly on scroll
 * 
 * @private
 * @param {Event} e The event object JQuery passes to the handler
 */
Controller.prototype.onScroll = function(e) { //Enables the hostbar to scroll horizontally, since it has a fixed position
    var x = window.pageXOffset;
    var y = window.pageYOffset;
    $("#hostBar, .dialog.host:not(.hidden)").css("margin-left", -x);
    $("#graph .vRule").css("margin-top", -y);
    $(".log").css("margin-left", x);

    if ($(".line.focus").length) {
        $(".highlight").css({
            "left": $(".line.focus").offset().left - parseFloat($(".line.focus").css("margin-left")) - $(".visualization .left").offset().left
        });
    }

    this.toggleGreyHostNodes();
};

/**
 * Shows the node selection popup dialog
 * 
 * @param {VisualNode} e The VisualNode that is selected
 * @param {Number} type The type of node: 0 for regular, 1 for host, 2 for
 *            hidden host
 * @param {DOMElement} elem The SVG node element
 */
Controller.prototype.showDialog = function(e, type, elem) {
    const controller = this;

    // Erase second event from the bottom
    $(".dialog").find(".nameBottom").text("");

    
    if(type === 0 && // Don't want to show sidebar between host node and circle node
      d3.selectAll("circle.sel").size() == 1){ //If there's another selected node
        //Get nodes
        var node1 = d3.selectAll("circle.sel").data()[0];
        var node2 = e;
        
        if(!node1.isCollapsed() && !node2.isCollapsed()){    
            this.formatSidebarInfo(node1, node2, 0);
        }

    }
    // Remove existing selection highlights
    // The user can select at most two nodes at a time. If she selects a third, the previous selections will be cleared.
    if(d3.selectAll("circle.sel").size() == 2){
        d3.selectAll("circle.sel").each(function(d){
            $(this).remove();
            d.setSelected(false);
        });

        d3.selectAll("line.dashed").remove();
        $(".tdiff").children().remove();

    }

    //TODO: apply the same selection rule to polygons
    if(d3.selectAll("polygon.sel").size() == 2){
        d3.select("polygon.sel").each(function(d) {
            $(this).remove();
            d.setSelected(false);
        }); 
    } 

    // Highlight the node with an appropriate outline
    if (!type) { //type == 0
        
        e.setSelected(true);
        var id = e.getId();
        var views = this.global.getActiveViews();

        // If showDiff is true, check if the selected node should be outlined with a rhombus
        if (this.global.getShowDiff()) {
          var uniqueEventsL = views[0].getTransformer().getUniqueEvents();
          var uniqueEventsR = views[1].getTransformer().getUniqueEvents();
        
          // If this node is not a unique event, highlight the node with a circular outline
          if (uniqueEventsL.indexOf(id) == -1 && uniqueEventsR.indexOf(id) == -1) {
            var selcirc = d3.select("#node" + e.getId()).insert("circle", "circle");
            selcirc.style("fill", function(d) {
                  return d.getFillColor();
                });
            selcirc.attr("class", "sel")
                .attr("r", function(d) {
                  return d.getRadius() + 6;
                });
          // If this node is a unique event, highlight it with a rhombus outline
          } else {
            var selrhombus = d3.select("#node" + e.getId()).insert("polygon", "polygon");
            selrhombus
                .style("stroke", function(d) { return d.getFillColor(); })
                .style("stroke-width", 2)
                .style("fill", "white");
            selrhombus.attr("class", "sel")
                .attr("points", function(d) {
                    var points = d.getPoints();
                    var newPoints = [points[0], points[1]-3, points[2]+3, points[3],
                          points[4], points[5]+3, points[6]-3, points[7]];
                    return newPoints.join();
               });
          }

        // If showDiff is false, all node outlines are circular
        } else {
            var selcirc = d3.select("#node" + e.getId()).insert("circle", "circle");
            selcirc.style("fill", function(d) {
                   return d.getFillColor();
                });
            selcirc.attr("class", "sel")
                .attr("r", function(d) {
                  return d.getRadius() + 6;
                });

            if (e.getRadius() <= 5) {
                var viz = $("#vizContainer");
                // var group = d3.select("#node" + e.getId());
                // group.append("line").attr("class", "dashed")
                //     .attr("x1", -e.getX())
                //     .attr("x2", viz.width())
                //     .attr("y1", 0)
                //     .attr("y2", 0)
                //     .attr("stroke-dasharray", "5,5")
                //     .attr("stroke-width", "2px")
                //     .attr("stroke", "#999")
                //     .attr("z-index", 120);
            }
        }
    }

    const $rect = $(elem).is("rect") ? $(elem) : $(elem).find("rect");
    var $svg = $rect.parents("svg");
    var $dialog = $(".dialog");
    var $graph = $("#graph");
    
    // Set properties for dialog, and show
    if (type == 2)
        $dialog.css({
            "left": $rect.offset().left - $dialog.width()/2 + Global.HOST_SIZE/2,
        }).addClass("top").show();
    else if (type == 1) 
        $dialog.css({
            "left": e.getX() + $svg.offset().left - 50,
            "margin-top": 22,
            "margin-left": type ? -$(window).scrollLeft() : 0
        }).addClass("top").show();
    else if (e.getX() - $(window).scrollLeft() > $graph.width() / 2)
        $dialog.css({
            "left": e.getX() + $svg.offset().left - 50,
            "margin-top": 35,
            "margin-left": type ? -$(window).scrollLeft() : 0
        }).addClass("top").show();
    else 
        $dialog.css({
            "left": e.getX() - 2,
            "margin-top": 35,
            "margin-left": type ? -$(window).scrollLeft() : 0
        }).addClass("top").show();

    // Set fill color, etc.
    if (type) {
        const rectOffset = $rect.offset().top;
        const scrollOffset = $(window).scrollTop(); 
        const hostAdjust = Global.HOST_SIZE / 2;
        const top = rectOffset - scrollOffset + hostAdjust;
        $dialog.css({
            "top": top,
            "background": type == 2 ? $rect.css("fill") : e.getFillColor(),
            "border-color": type == 2 ? $rect.css("fill") : e.getFillColor()
        }).data("element", type == 2 ? e : e.getHost());
    } else {
        $dialog.css({
            "top": e.getY() + $svg.offset().top,
            "background": e.getFillColor(),
            "border-color": e.getFillColor()
        }).data("element", e.getNode());
    }

    // Set class "host" if host (hidden or not) is selected
    if (type) {
        $dialog.addClass("host");
        if (type == 2) {
            $dialog.addClass("hidden");
        } else {
            $dialog.removeClass("hidden");
        }
    } else {
        $dialog.removeClass("host");
    }

    // Add info to the sidebar
    $dialog.find(".name").text(type == 2 ? e : e.getText());
    $dialog.find(".info").children().remove();

    if (!type && !e.isCollapsed()) {
        //Add fields, if normal node
        var fields = e.getNode().getLogEvents()[0].getFields();
        for (var i in fields) {
            var $f = $("<tr>", {
                "class": "field"
            });
            var $t = $("<th>", {
                "class": "title"
            }).text(i + ":");
            var $v = $("<td>", {
                "class": "value"
            }).text(fields[i]);

            $f.append($t).append($v);
            $dialog.find(".info").append($f);
        }

        // Hide highlight button
        $dialog.find(".filter").hide();

        // If node is collapsible then show collapse button
        // Else don't show button
        if (!this.global.getViews()[0].getTransformer().collapseNodesTransformation.isCollapseable(e.getNode(), 2, this.global.getViews()[0].minDistance)){
            $dialog.find(".collapse").hide();
            $dialog.hide();
        }
        else
            $dialog.find(".collapse").show().text("Collapse");

    }
    else if (!type) {
        // Show uncollapse button for collapsed nodes
        $dialog.find(".collapse").show().text("Expand");
        $dialog.find(".filter").hide();
    }
    else {
        // Show highlight button if only one execution
        if (type == 2 || this.global.getViews().length > 1)
            $dialog.find(".filter").hide();
        else
            $dialog.find(".filter").show();

        // Set highlight/unhighlight based on current state
        if (type != 2 && e.isHighlighted())
            $dialog.find(".filter").text("Unfilter");
        else
            $dialog.find(".filter").text("Filter");

        // Set hide/unhide based on state
        if (type == 2)
            $dialog.find(".hide").attr("name", "unhide").text("Unhide");
        else
            $dialog.find(".hide").attr("name", "hide").text("Hide");

        // Hide collapse button
        $dialog.find(".collapse").hide();
    }
    
    // The dialogtop doesn't change while scrolling, but it does get set
    // to 0 by JS when hidden, so must keep track of its location 
    const visibleDialogTop = $dialog.offset().top;
    
    $(window).scroll(function() {
        toggleDialogVisibility();
        controller.toggleGreyHostNodes();
    });

    // Makes the dialog disappear if it scrolls above the bottom of the
    // hostbar; or reappear if scrolls lower than it. Does nothing
    // to host node dialogs
    function toggleDialogVisibility() {
        // After scrolling, the hostbarbottom offset will have changed. We
        // will use this latest version to determine if the dialog
        // is above it or not.
        const scrolledHostbarBottom = getHostbarBottomOffset();
        const isHostDialog = $dialog.attr("id") === Global.HOST_DIALOG_ID;

        if (isHostDialog) {
            // do nothing
        } else if (scrolledHostbarBottom > visibleDialogTop) {
            // dialog is above hostbar
            $dialog.hide();
        } else {
            // dialog is below hostbar
            $dialog.show();
        }
    }
}

// If scrolling past a host's last process, grey out host
Controller.prototype.toggleGreyHostNodes = function () {
    for (let view of this.global.getViews()) {
        for (let visualNode of view.getTailNodes()) {
            const isScrolledPast = isAboveHostbar(visualNode);
            view.setGreyHost(visualNode, isScrolledPast);
        }
    }
 
    // VisualNode => Boolean
    function isAboveHostbar(visualNode) {
        const $circle = visualNode.getSVG().find("circle");
        if ($circle.length > 0) {
            const circleTop = $circle.offset().top;
            const hostBarBottom = getHostbarBottomOffset();
            return circleTop < hostBarBottom;
        } else {
            return true;
        }
    }
};

/**
 * Clears the information in the sidebar
 */
Controller.prototype.clearSidebarInfo = function() {
    var sidebar = $(".event");

    d3.select(".source").select(".circle").select("svg").select("circle")
        .style("fill", "white");  
    d3.select(".target").select(".circle").select("svg").select("circle")
        .style("fill", "white"); 
    sidebar.find(".source").find(".name").text("");
    sidebar.find(".target").find(".name").text("");
    sidebar.find(".fields").children().remove();
    d3.select(".nodeConnection").select("svg").select("line").attr("opacity", 0);
}

/**
 * Formats the sidebar for up to two nodes
 * 
 * @param {VisualEdge} edge
 * @param {infoContainer} either the sidebar or dialog 
 * @param {Integer} number of nodes between sourceNode and targetNode
 */
Controller.prototype.formatSidebarInfo = function(sourceNode, targetNode, numberOfNodes) {
    var infoContainer = $(".event");
    var difference = this.getTimeDifference(sourceNode, targetNode);

    // Add names to the dialog and colour the circles
    infoContainer.find(".source").find(".name").text(sourceNode.getText());
    d3.select(".source").select(".circle").select("svg")
        .attr("width", 10)
        .attr("height", 10)
        .select("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .style("fill", function(d) {
            if(sourceNode.getNode().isHead()) {
                return "white";
            }
            else {
                return sourceNode.getFillColor();
            }
        });

    infoContainer.find(".target").find(".name").text(targetNode.getText());
    d3.select(".target").select(".circle").select("svg")
        .attr("width", 10)
        .attr("height", 10)
        .select("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .style("fill", targetNode.getFillColor());    
    
    // Get the location of the fields
    $fields = infoContainer.find(".fields");
    $fields.children().remove();

    // Source host
    var $f = $("<tr>", {
        "class": "field"
    });
    var $t = $("<th>", {
        "class": "title"
    }).text("Source host:");
    var $v = $("<td>", {
        "class": "value"
    }).text(sourceNode.getHost());
    $f.append($t).append($v);
    $fields.append($f);


    // Add time difference info
    $f = $("<tr>", {
        "class": "field"
    });
    $t = $("<th>", {
        "class": "title"
    }).text("Time:");
    $v = $("<td>", {
        "class": "value"
    }).text(difference);

    $f.append($t).append($v);
    $fields.append($f);

    if(numberOfNodes > 0) {
        // Add number of nodes info
        $f = $("<tr>", {
            "class": "field"
        });
        $t = $("<th>", {
            "class": "title"
        }).text("# of events:");
        $v = $("<td>", {
            "class": "value"
        }).text(numberOfNodes);

        $f.append($t).append($v);
        $fields.append($f);
    }

    // Target host info
    $f = $("<tr>", {
        "class": "field"
    });
    $t = $("<th>", {
        "class": "title"
    }).text("Target host:");
    $v = $("<td>", {
        "class": "value"
    }).text(targetNode.getHost());
    $f.append($t).append($v);
    $fields.append($f);

    // Figure out whether or not to draw connecting line between two node circles
    var drawLine = false;

    if ((sourceNode.getNode().getNext().getId() == targetNode.getNode().getId()) ||
        (sourceNode.getNode().getPrev().getId() == targetNode.getNode().getId())) {
        drawLine = true;
    }

    if(drawLine === false) {
        var parents = sourceNode.getNode().getParents();
        for (var i in parents) {
            if(parents[i].getId() === targetNode.getNode().getId()) {
                drawLine = true;
            }
        }

        var children = sourceNode.getNode().getChildren();
        for (var i in children) {
            if(children[i].getId() === targetNode.getNode().getId()) {
                drawLine = true;
            }
        }
    }

    if(!sourceNode.getNode().isHead() && drawLine === true){
        // Add the line to connect the two circles together
        //1.5 ===> circle radius
        var positionTop = $("#sourceCircle").offset().top - $(window).scrollTop() + 2;
        var positionBottom = $("#targetCircle").offset().top - $(window).scrollTop();
        
        if($("#multiExecToggle").is(":visible")){
            positionTop -= $("#multiExecToggle").height();
            positionBottom -= $("#multiExecToggle").height();
            positionTop -= $(".pairwiseButton").height();
            positionBottom -= $(".pairwiseButton").height();
        }

        if($("#multiExecTab").hasClass("show")){    
            positionTop -= $("#multiExecTab").height();
            positionTop -= parseFloat($(".pairwiseButton").css("margin-bottom"));             
            positionBottom -= $("#multiExecTab").height();
            positionBottom -= parseFloat($(".pairwiseButton").css("margin-bottom"));    
        }
        
        d3.select(".nodeConnection").select("svg").select("line")
                                    .attr("stroke-dasharray", "0,0")
                                    .attr("stroke", "dimgrey")
                                    .attr("stroke-width", 1)
                                    .attr("opacity", 0.5)
                                    .attr("x1", 8)
                                    .attr("y1", positionTop - 74)
                                    .attr("x2", 8)
                                    .attr("y2", positionBottom - 80);
    }
};

/*
 * Formats the sidebar information box with a set of VisualNodes.
 * 
 * @param {VisualNode[]} at least 2 or more nodes
 */
Controller.prototype.formatSidebarMultipleNodes = function(visualNodes) {
    this.formatSidebarInfo(visualNodes[0], visualNodes[visualNodes.length - 1], visualNodes.length);

    // Add the line to connect the two circles together
    var positionTop = $("#sourceCircle").offset().top - $(window).scrollTop();
    var positionBottom = $("#targetCircle").offset().top - $(window).scrollTop();

    d3.select(".nodeConnection").select("svg").select("line")
                                .attr("stroke-dasharray", "4,4")
                                .attr("stroke", "dimgrey")
                                .attr("stroke-width", 1)
                                .attr("opacity", 0.5)
                                .attr("x1", 8)
                                .attr("y1", positionTop - 70)
                                .attr("x2", 8)
                                .attr("y2", positionBottom - 70);
};

/*
 * Displays a tooltip with some information specified above a node
 * 
 * @param {VisualNode} the tooltip will be displayed above this node
 * @param {String} the information contained in the tooltip
 */
Controller.prototype.displayTooltip = function(visualNode, information) {
    //Remove all other tooltips before displaying a new one.
    d3.selectAll(".toolTip").remove();
    
    var tip = d3.tip();

    d3.selectAll("line", "circle", "path").call(tip);

    tip.attr('class', "toolTip")
        .attr('z-index', 1000)
        .offset([-14, 0])
        .html(function(d) {
            return "<span style='color:white'>" + information + "</span>";
        });

    tip.show(visualNode.getSVG()[0]);
}

/**
 * Calculates the time difference between this edge represents
 *
 * @returns {String} formatted with the correct time units
 */
Controller.prototype.getTimeDifference = function(sourceNode, targetNode) {
    // Calculate time difference between source and target nodes
    // Compress to fit in number type
    var difference;
    var sourceTime;

    if (sourceNode.getNode().isHead()) {
        sourceTime = VisualEdge.minTimestamp;
    }
    else {
        sourceTime = sourceNode.getNode().getFirstLogEvent().fields.timestamp;
    }
    
    var targetTime = targetNode.getNode().getFirstLogEvent().fields.timestamp;
    sourceTime = Number(sourceTime.slice(3, sourceTime.length));
    targetTime = Number(targetTime.slice(3, targetTime.length));
    
    difference = Math.abs(sourceTime - targetTime);

    return this.formatTime(difference);
};

/*
 * Formats the provided integer time with correct time units currently selected
 * 
 * @param {Integer} time
 * @returns {String} formatted time
 */
Controller.prototype.formatTime = function(time) {
    if($("#graphtimescaleviz").val().trim() == "ns") return time + " ns";
    else if($("#graphtimescaleviz").val().trim() == "us") return time / 1000 + " μs";
    else if($("#graphtimescaleviz").val().trim() == "ms") return time / 1000000 + " ms";
    else if($("#graphtimescaleviz").val().trim() == "s") return time / 1000000000 + " s";
};

Controller.prototype.bindScroll = function (){
    var self = this;
    $(window).unbind("scroll");
    $(window).bind("scroll", function(e) {
        self.onScroll(e);
    });
    $(window).scroll();
};

// Return current offset of the hostbar. This gets larger the lower down we
// scroll
function getHostbarBottomOffset() {
    const $hostbar = $("#hostBar");
    if ($hostbar.length > 0) {
        const hostbarBottom = $hostbar.offset().top + $hostbar.height()
            + parseFloat($hostbar.css('padding-top'));
        return hostbarBottom;
    } else {
        return 0;
    }
}


Controller.prototype.resetSidebar = function(){
    if($("#graphOptionsToggle").hasClass("active")) $("#graphOptionsToggle").click();
    if($("#nodeInfoToggle").hasClass("active")) $("#nodeInfoToggle").click();
    if($("#searchResultsToggle").hasClass("active")) $("#searchResultsToggle").click();
};


Controller.prototype.hideSidebarElements = function(){
    //Attaches clicks to active sidebar elements
    if($("#nodeInfoToggle").hasClass("active") && $("#nodeInfoTab").hasClass("show")) $("#nodeInfoToggle").click();
    if($("#graphOptionsToggle").hasClass("active") && $("#graphOptionsTab").hasClass("show")) $("#graphOptionsToggle").click();
    if($("#searchResultsToggle").hasClass("active") && $("#searchOptions").hasClass("show")) $("#searchResultsToggle").click();
};
