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
            self.global.drawAll();
        }
        catch (exception) {
            Shiviz.getInstance().handleException(exception);
        }
    });

    $(window).unbind("keydown.dialog").on("keydown.dialog", function(e) {
        if (e.which == 27) {
            self.clearSidebarInfo();
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
        
        self.clearSidebarInfo();

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

    // Event handler for switching between the left tabs
    $(".visualization .leftTabLinks a").unbind().on("click", function(e) {

        var anchorHref = $(this).attr("href");
        $(".visualization #" + anchorHref).show().siblings().hide();
        $(this).parent("li").addClass("default").siblings("li").removeClass("default");
        $("#labelIconL, #labelIconR, #selectIconL, #selectIconR").hide();

        if (anchorHref != "logTab") {
            // Remove any log line highlighting when not on the Log lines tab
            $(".highlight").css("opacity", 0);
        }
        if (anchorHref == "clusterTab") {
            // Clear all motif results when on the clusters tab
            if (searchbar.getMode() == SearchBar.MODE_MOTIF) {
                if (global.getController().hasHighlight()) {
                    searchbar.clearResults();
                }
                searchbar.resetMotifResults();
            }
            if ($("#clusterNumProcess").is(":checked") || ($("#clusterComparison").is(":checked") && $(".clusterBase").find("option:selected").text() != "Select a base execution")) {
                $("#labelIconL, #selectIconL").show();
                if (global.getPairwiseView()) {
                    $("#labelIconR, #selectIconR").show();
                }
            }
        }
        // Show the pairwise button for log lines and clusters when not doing a motif search
        if (global.getViews().length > 1 && searchbar.getMode() != SearchBar.MODE_MOTIF) {
            $(".pairwiseButton").show();
        }
        if (anchorHref == "motifsTab") {
            if (global.getPairwiseView()) {
                $(".pairwiseButton").click();
            }
            $(".pairwiseButton").hide();
            if ($(".motifResults a").length > 0) {
                searchbar.setValue("#motif");
            }
        }
        e.preventDefault();
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

    this.global.drawAll();
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

    this.global.drawAll();
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

    this.global.drawAll();
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

    this.global.drawAll();
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
        if (d3.event.shiftKey) {
            // Toggle node collapsing
            controller.toggleCollapseNode(e.getNode());
            tip.hide(e);
        }
        else {
            controller.showDialog(e, 0, this);

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
                stats[3] = stats[1] - stats[0]; //differece in nanoseconds
                stats[4] = minDiff(timestamps);


                //Convert to string and format
                stats[0] = logEvents[0].fields.timestamp.slice(0, 3) + stats[0];
                stats[1] = logEvents[0].fields.timestamp.slice(0, 3) + stats[1];
                switch($("#graphtimescaleviz").val().trim()){
                    case "ns":
                    stats[3] = stats[3].toString() + " ns";
                    stats[4] = stats[4].toString() + " ns"; 
                    break;
                    case "us":
                    stats[3] /= 1000;
                    stats[4] /= 1000;
                    stats[3] = stats[3].toString() + " us";
                    stats[4] = stats[4].toString() + " us";
                    break;
                    case "ms":
                    stats[3] /= 1000000;
                    stats[3] = stats[3].toString() + " ms";
                    stats[4] /= 1000000;
                    stats[4] = stats[4].toString() + " ms";
                    break;
                    case "s":
                    stats[3] /=1000000000;
                    stats[3] = stats[3].toString() + " s";
                    stats[4] /=1000000000;
                    stats[4] = stats[4].toString() + " s";
                    break;
                    default: 
                    stats[3] = stats[3].toString() + " ns";
                    stats[4] = stats[4].toString() + " ns";
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

            $(".line.focus").css({
                "color": $(".focus").data("fill"),
                "background": "",
                "width": "inherit"
            }).removeClass("focus");

            $(".reveal").removeClass("reveal");

            var $line = $("#line" + e.getId());
            var $parent = $line.parent(".line").addClass("reveal");

            // Only highlight log lines on the Log Lines tab

            if ($(".leftTabLinks li").first().hasClass("default")) {
                
                $line.addClass("focus").css({
                    "background": "transparent",
                    "color": "white",
                    "width": "calc(" + $line.width() + "px - 1em)"
                }).data("fill", e.getFillColor());

                $(".highlight").css({
                    "width": $line.width(),
                    "height": $line.height(),
                    "opacity": e.getOpacity()
                });

                var top = parseFloat($line.css("top")) || 0;
                var ptop = parseFloat($parent.css("top")) || 0;
                var margin = parseFloat($line.css("margin-top")) || 0;
                var pmargin = parseFloat($parent.css("margin-top")) || 0;
                var vleft = $(".visualization .left").offset().left;
                var vtop = $(".visualization .left").offset().top;
                var offset = $(".log").offset().top - vtop;

                $(".highlight").css({
                    "background": e.getFillColor(),
                    "top": top + ptop + margin + pmargin + offset,
                    "left": $line.offset().left - parseFloat($line.css("margin-left")) - vleft
                }).attr({
                    "data-ln": e.getLineNumber()
                }).data({
                    "id": e.getId()
                }).show();
            }
        }

        // Unhighlight any previously clicked edges
        d3.selectAll("line.sel").each(function(d) {
            $(this).remove();
        });
    }).on("mouseover", function(e) {
        d3.selectAll("g.focus .sel").transition().duration(100).attr({
            "r": function(d) {
                return d.getRadius() + 4;
            }
        });
        d3.selectAll("g.focus").classed("focus", false).select("circle:not(.sel)").transition().duration(100).attr({
            "r": function(d) {
                return d.getRadius();
            }
        });

        d3.select(this).classed("focus", true).select("circle:not(.sel)").transition().duration(100).attr({
            "r": function(d) {
                return d.getRadius() + 2;
            }
        });
        d3.selectAll("g.focus .sel").transition().duration(100).attr({
            "r": function(d) {
                return d.getRadius() + 6;
            }
        });

        tip.attr('class', 'd3-tip')
            .offset([-14, 0])
            .html(function(d) {
                return "<span style='color:white'>" + d.getText() + "</span>";
            });

            nodes.call(tip);

        tip.show(e);

    }).on("mouseout", tip.hide);
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
        controller.selectEdge(e, this);
        controller.clearSidebarInfo();
        controller.formatEdgeInfo(e, $(".event"));
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
    
        d3.selectAll("g.focus .sel").transition().duration(100).attr({
            "stroke-width": function(d) {
                return d.getWidth() + 2;
            },
            "stroke": "dimgrey",
            "opacity": 1
        });
        d3.selectAll("g.focus").classed("focus", false).select("line:not(.sel)").transition().duration(100).attr({
            "stroke-width": function(d) {
                return d.getWidth();
            },
            "stroke": function(d) {
                return d.getColor();
            },
            "opacity": function(d) {
                return d.getOpacity();
            }
        });

        d3.select(this).classed("focus", true).select("line:not(.sel)").transition().duration(100).attr({
            "stroke-width": function(d) {
                return d.getWidth() ;
            },
            "stroke": "dimgrey",
            "opacity": 1
        });
        d3.selectAll("g.focus .sel").transition().duration(100).attr({
            "stroke-width": function(d) {
                return d.getWidth() + 4;
            },
            "stroke": "dimgrey",
            "opacity": 1
        });

        tip.show(e);

    }).on("mouseout", tip.hide);
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
 * Binds node highlighting to mouseover event on log lines
 * 
 * @param {jQuery.selection} lines A jQuery selection of the log lines
 */
Controller.prototype.bindLines = function(lines) {
    lines.unbind().on("mouseover", function() {
        var id = "#node" + $(this).data("id");
        $(id)[0].dispatchEvent(new MouseEvent("mouseover"));
    })

    lines.add(".highlight").on("click", function() {
        var id = "#node" + $(this).data("id");
        $(id)[0].dispatchEvent(new MouseEvent("click"));
    });
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
        controller.global.drawAll();
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

    if ($(".line.focus").length)
        $(".highlight").css({
            "left": $(".line.focus").offset().left - parseFloat($(".line.focus").css("margin-left")) - $(".visualization .left").offset().left
        });
};

/**
 * Shows the edge selection popup dialog
 * 
 * @param {VisualEdge} e The VisualEdge that is selected
 * @param {DOMElement} elem The SVG edge element
 */
Controller.prototype.selectEdge = function(e, elem) {
    // Don't do anything if the source node is the head node
    if(e.getSourceVisualNode().getNode().isHead()) {
        return;
    }

    //Remove the dashed lines (if any exists)
    d3.selectAll("line.dashed").remove();

    // Unhighlight any previously clicked edges
    d3.selectAll("line.sel").each(function(d) {
        $(this).remove();
    });
        
    // Add extra highlight to selected edge
    var $selLine = d3.select(elem).append("line", "line");
    $selLine.style({
        "stroke": "firebrick",
        "stroke-width": e.getWidth(),
        "opacity": 1
    });
    $selLine.attr({
        "class": "sel",
        "x1": e.getSourceVisualNode().getX(),
        "y1": e.getSourceVisualNode().getY(),
        "x2": e.getTargetVisualNode().getX(),
        "y2": e.getTargetVisualNode().getY(),
    });
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
    // Erase second event from the bottom
    $(".dialog").find(".nameBottom").text("");

    if(d3.selectAll("circle.sel")[0].length == 1){ //If there's another selected node
        //Get nodes
        var node1 = d3.selectAll("circle.sel").data()[0];
        var node2 = e;
        
        if(!node1.isCollapsed() && !node2.isCollapsed()){    
            //Compress to fit in number type
            node1 = d3.selectAll("circle.sel").data()[0].getNode().getFirstLogEvent().fields.timestamp;
            node2 = e.getNode().getFirstLogEvent().fields.timestamp;
            node1 = Number(node1.slice(3, node1.length));
            node2 = Number(node2.slice(3, node2.length));
            //Calculate the difference
            var difference = Math.abs(node1 - node2);

            //Scale the difference
            if($("#graphtimescaleviz").val().trim() == "us") difference /= 1000;
            else if($("#graphtimescaleviz").val().trim() == "ms") difference /= 1000000;
            else if($("#graphtimescaleviz").val().trim() == "s") difference /= 1000000000;

            var $f = $("<tr>", {
                "class": "field"
            });
            var $t = $("<th>", {
                "class": "title"
            }).text("Time difference" + ":");
            var $v = $("<td>", {
                "class": "value"
            }).text(difference + $("#graphtimescaleviz").val().trim());

            $f.append($t).append($v);
            $(".tdiff").append($f);
        }

    }
    // Remove existing selection highlights
    // The user can select at most two nodes at a time. If she selects a third, the previous selections will be cleared.
    if(d3.selectAll("circle.sel")[0].length == 2){
        d3.selectAll("circle.sel").each(function(d){
            $(this).remove();
            d.setSelected(false);
        });

        d3.selectAll("line.dashed").remove();
        $(".tdiff").children().remove();

    }

    //TODO: apply the same selection rule to polygons
    if(d3.selectAll("polygon.sel")[0].length == 2){
        d3.select("polygon.sel").each(function(d) {
            $(this).remove();
            d.setSelected(false);
        }); 
    } 

    // Highlight the node with an appropriate outline
    if (!type) {
        
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
            selcirc.style({
               "fill": function(d) {
                  return d.getFillColor();
                }
            });
            selcirc.attr({
               "class": "sel",
               "r": function(d) {
                  return d.getRadius() + 6;
                }
            });
          // If this node is a unique event, highlight it with a rhombus outline
          } else {
            var selrhombus = d3.select("#node" + e.getId()).insert("polygon", "polygon");
            selrhombus.style({
              "stroke": function(d) { return d.getFillColor(); },
              "stroke-width": 2,
              "fill": "white"
            });
            selrhombus.attr({
              "class": "sel",
              "points": function(d) {
                  var points = d.getPoints();
                  var newPoints = [points[0], points[1]-3, points[2]+3, points[3], points[4], points[5]+3, points[6]-3, points[7]];
                  return newPoints.join();
               }
            });
          }

        // If showDiff is false, all node outlines are circular
        } else {
            var selcirc = d3.select("#node" + e.getId()).insert("circle", "circle");
            selcirc.style({
                "fill": function(d) {
                   return d.getFillColor();
                }
            });
            selcirc.attr({
               "class": "sel",
               "r": function(d) {
                  return d.getRadius() + 6;
                }
            });

            if (e.getRadius() <= 5) {
                var viz = $("#vizContainer");
                var group = d3.select("#node" + e.getId());
                group.append("line").attr("class", "dashed")
                    .attr("x1", -e.getX())
                    .attr("x2", viz.width())
                    .attr("y1", 0)
                    .attr("y2", 0)
                    .attr("stroke-dasharray", "5,5")
                    .attr("stroke-width", "2px")
                    .attr("stroke", "#999")
                    .attr("z-index", 120);
            }
        }
    }

    var $dialog = $(".dialog");
    var $svg = $(elem).parents("svg");
    var $graph = $("#graph");

    // Set properties for dialog, and show
    if (type == 2)
        $dialog.css({
            "left": $(elem).offset().left - 38,
            "margin-left": -$(window).scrollLeft()
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
    if (type)
        $dialog.css({
            "top": $(elem).offset().top - $(window).scrollTop() + Global.HOST_SIZE / 2,
            "background": type == 2 ? $(elem).css("fill") : e.getFillColor(),
            "border-color": type == 2 ? $(elem).css("fill") : e.getFillColor()
        }).data("element", type == 2 ? e : e.getHost());
    else
        $dialog.css({
            "top": e.getY() + $svg.offset().top,
            "background": e.getFillColor(),
            "border-color": e.getFillColor()
        }).data("element", e.getNode());

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
    
    // keep a copy of the dialog box's top coordinate
    var copyOfDialogTop = $dialog.offset().top;
    
    $(window).scroll(function() {
        // get the current top coordinate of the dialog box and the current bottom coordinate of the hostbar 
        // (both values change with scrolling)
        var dialogTop = $dialog.offset().top;
        var hostBarBottom = $("#hostBar").offset().top + $("#hostBar").height();
        // get the vertical position of the scrollbar (position = 0 when scrollbar at very top)
        var scrollbarTop = $(window).scrollTop();
        
        // when a dialog box is hidden, its top coordinate is set to 0 so dialogTop starts having the same value as scrollbarTop
        // we don't want it to be hidden forever after the first time it's hidden so we check for this condition below. We also check
        // if we've scrolled past the distance between the dialog box and host bar, this is when we want to hide it. 
        // Note: the 20 in the second condition is hardcoded for host dialog boxes so that they're never hidden when scrolling
        if ((scrollbarTop != dialogTop) && (scrollbarTop - 20 > (dialogTop - (hostBarBottom - scrollbarTop)))) { 
            $dialog.hide();
        // otherwise, if we haven't scrolled past the distance, show the dialog. Note: we use copyOfDialogTop here
        // because dialogTop has already changed with scrolling and we want the original distance
        } else if ($(window).scrollTop() <= (copyOfDialogTop - (hostBarBottom - $(window).scrollTop()))){
            $dialog.show();
        }
    });
}


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
 * Formats the edge information for the container
 * 
 * @param {VisualEdge} edge
 * @param {infoContainer} either the sidebar or dialog 
 */
Controller.prototype.formatEdgeInfo = function(edge, infoContainer) {
    var sourceNode = edge.getSourceVisualNode();
    var targetNode = edge.getTargetVisualNode();

    var difference = edge.getTimeDifference();

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
    }).text("Source host" + ":");
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

    // Target host info
    $f = $("<tr>", {
        "class": "field"
    });
    $t = $("<th>", {
        "class": "title"
    }).text("Target host" + ":");
    $v = $("<td>", {
        "class": "value"
    }).text(targetNode.getHost());
    $f.append($t).append($v);
    $fields.append($f);


    if(!sourceNode.getNode().isHead()) {
        // Add the line to connect the two circles together
        var positionTop = $("#sidebar .info .source .circle circle").offset().top - $(window).scrollTop();
        var positionBottom = $("#sidebar .info .target .circle circle").offset().top - $(window).scrollTop();

        d3.select(".nodeConnection").select("svg").select("line")
                                    .attr("stroke", "dimgrey")
                                    .attr("stroke-width", 2)
                                    .attr("opacity", 0.25)
                                    .attr("x1", 8)
                                    .attr("y1", positionTop - 22)
                                    .attr("x2", 8)
                                    .attr("y2", positionBottom - 32);
    }
};

Controller.prototype.bindScroll = function (){
    var self = this;
    $(window).unbind("scroll");
    $(window).bind("scroll", self.onScroll);
    $(window).scroll();
};