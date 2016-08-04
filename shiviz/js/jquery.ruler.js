
;(function( $ ){

	$.fn.ruler = function(view) {
	
		var defaults = {
			vRuleSize: 45,
			hRuleSize: 0, // maybe comment out or set to 0
		};//defaults
		var settings = $.extend({},defaults);
		
		var vRule = '<div id="vRule" class="ruler vRule"></div>';
		var corner = '<div class="ruler corner"></div>';
		

		//WINDOW RESIZE
		$(window).resize(function(e){
			var $vRule = $('.vRule');
			$vRule.empty().height(0).outerHeight($("#graphSVG").height());

			var axis = view.layout.axis;
	        var height = view.$svg.attr("height");

	        //Draw ruler
	        d3.selectAll(".ruler.vRule svg").remove();
			var ruler = d3.selectAll(".ruler.vRule").append("svg")
	        .attr("class", "axisSVG")
	        .attr("height", height)
	        .attr("width", "40px").append("g")
	        .attr("class", "y axis")
	        .attr("transform", "translate(30,0)")
	        .call(axis);
			

		});//resize
		
		return this.each(function() {
			var $this = $(this);

			// Attach rulers
			// console.log(view);
			if (settings.vRuleSize > 0) {
				var oldWidth = $this.outerWidth();
				$(vRule).width(settings.vRuleSize).height($("#graphSVG").height()).prependTo($this);
			}
			var $vRule = $this.children('.vRule');
			//Set corner (ruler magnification)
			if ( (settings.vRuleSize > 0) ) {
				if($("#graphtimescaleviz option:selected").val().trim() == "us") var magnification = "<span> &mu;s </span>";
				else var magnification = "<span> " + $("#graphtimescaleviz option:selected").val().trim() + "</span>";
				
				$(corner).css({
					width: settings.vRuleSize+5,
					height: 70
				}).prependTo($this);
				var $corner = $(".corner")
				$corner.children().remove();
				$(magnification).appendTo($corner);
			}

			var timeStart = Number(view.getVisualModel().timeRange[0].slice(3, view.getVisualModel().timeRange[0].length));
    		var timeEnd = Number(view.getVisualModel().timeRange[1].slice(3, view.getVisualModel().timeRange[1].length));
    		var origTimeSpan = timeEnd - timeStart;
    		var timeSpan = 0;
    		var tempMindistance = 0;
    		var scale = {};
    		var axis = {};
    		var height = 0;

    		if(view.getVisualModel().compressedParts.length == 0){
    			//Calculate and adjust the time span and the minimum distance to the scale selected by the user
    			timeSpan = timeEnd - timeStart;
    			tempMindistance = view.getVisualModel().minDistance;

			    switch($("#graphtimescaleviz").val().trim()){
			        case "ns":
			        break;
			        case "us":
			        timeSpan /= 1000; 
			        tempMindistance /= 1000;
			        break;
			        case "ms":
			        timeSpan /= 1000000; 
			        tempMindistance /= 1000000;
			        break;
			        case "s":
			        timeSpan /= 1000000000; 
			        tempMindistance /= 1000000000;
			        break;
			    }
			    //Generate the axis scale
			    scale = d3.scale.ordinal().domain(d3.range(0, timeSpan, tempMindistance)).rangePoints([view.layout.rangeStart,view.layout.rangeEnd]);
			    //Generate the axis
			    axis = d3.svg.axis().scale(scale).tickFormat(d3.format(".3s")).orient("left");
		        height = view.$svg.attr("height");

		        //Draw ruler
		       	d3.selectAll(".ruler.vRule svg").remove();
				var ruler = d3.selectAll(".ruler.vRule").append("svg")
		        .attr("class", "axisSVG")
		        .attr("height", height)
		        .attr("width", "50px").append("g")
		        .attr("class", "y axis")
		        .attr("transform", "translate(40,0)")
		        .call(axis);

    		}else{
    			d3.selectAll(".ruler.vRule svg").remove();

    			var nCompressions =view.getVisualModel().compressedParts.length;
    			var compressions = view.getVisualModel().compressedParts;
    			var minDistPix = view.layout.minDistancePixels;
    			var minDistance = view.getVisualModel().minDistance;
    			var rangeStart = view.layout.rangeStart;
    			var rangeEnd = 0;
    			var scaleStart = 0;
    			var scaleEnd = 0;

    			height = view.$svg.attr("height");
    			var ruler = d3.selectAll(".ruler.vRule").append("svg")
		        .attr("class", "axisSVG")
		        .attr("height", height)
		        .attr("width", "50px")

		        timeStart = 0;
    			for(var i = 0; i < nCompressions + 1; i++){
    				//Calculate and adjust the time span and the minimum distance to the scale selected by the user
    				if(i == nCompressions) timeEnd = origTimeSpan;
    				else timeEnd = (compressions[i].original.start/minDistPix) * minDistance;
    				// console.log("Time end:   " + timeEnd);
    				timeSpan = timeEnd - timeStart;
    				scaleStart = timeStart;
    				scaleEnd = timeStart + timeSpan;
    				// console.log("time Span:   " + timeSpan);
	    			tempMindistance = view.getVisualModel().minDistance;
	    			rangeEnd = rangeStart + ((timeSpan / minDistance) * minDistPix);
	    			// console.log("Range Start:    " + rangeStart);
	    			// console.log("Range end:   " + rangeEnd);
				    switch($("#graphtimescaleviz").val().trim()){
				        case "ns":
				        break;
				        case "us":
				        if(scaleStart != 0) scaleStart /= 1000;
				        scaleEnd /= 1000; 
				        tempMindistance /= 1000;
				        break;
				        case "ms":
				        if(scaleStart != 0) scaleStart /= 1000000;
				        scaleEnd /= 1000000;
				        tempMindistance /= 1000000;
				        break;
				        case "s":
				        if(scaleStart != 0) scaleStart /= 1000000000;
				        scaleEnd /= 1000000000;
				        tempMindistance /= 1000000000;
				        break;
				    }
				    // console.log("Before scale:  ");
				    // console.log("timeStart:  " + timeStart);
				    // console.log("timeSpan:   " + timeSpan);
				    // console.log("tempMindistance:  " + tempMindistance);
				    
				    scale = d3.scale.ordinal().domain(d3.range(scaleStart, scaleEnd, tempMindistance)).rangePoints([rangeStart,rangeEnd]);

				    axis = d3.svg.axis().scale(scale).tickFormat(d3.format(".3s")).orient("left");
			        height = rangeEnd - rangeStart;

			        //Draw ruler
					// if(i == 0){
						ruler.append("g")
				        .attr("class", "y axis")
				        .attr("transform", "translate(40,0)")
				        .call(axis);
				  // rangeStart = 0;}
					// }else{
					// 	ruler.append("g")
					// 	.attr("class", "y axis" + i.toString())
					// 	.attr("transform", "translate(40," + rangeStart.toString() + ")")
					// 	.call(axis);
					// }

			        if(i == nCompressions) timeStart = 0;
			        else{
			        	timeStart = (compressions[i].original.end/minDistPix) * minDistance;
			        	rangeStart = compressions[i].end;
			     	}

    			}

    		}

			// var axis = view.layout.axis;
	        

		});//each
	};//ruler
})( jQuery );
