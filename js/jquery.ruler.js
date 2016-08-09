
;(function( $ ){

	function scaleTime(number){
		switch($("#graphtimescaleviz").val().trim()){
	        case "ns":
	        break;
	        case "us":
	        return number / 1000; 
	        break;
	        case "ms":
	        return number / 1000000; 
	        break;
	        case "s":
	        return number / 1000000000; 
	        break;
	    }
	}

	function drawRuler(visualGraph, layout, svg){

		var compressions = visualGraph.compressedParts;
		var numberOfCompressions = compressions.length;
		var timeStart = Number(visualGraph.timeRange[0].slice(3, visualGraph.timeRange[0].length));
		var timeEnd = Number(visualGraph.timeRange[1].slice(3, visualGraph.timeRange[1].length));
		var origTimeSpan = timeEnd - timeStart;
		var timeSpan = 0;
		var scaleMinDistance = 0;
		var scale = {};
		var axis = {};
		var height = 0;

		if(numberOfCompressions == 0){ //If there are no compressed intervals
			//Calculate and adjust the time span and the minimum distance to the scale selected by the user
			timeSpan = timeEnd - timeStart;
			scaleMinDistance = visualGraph.minDistance;

		    timeSpan = scaleTime(timeSpan);
		    scaleMinDistance = scaleTime(scaleMinDistance);

		    //Generate the axis scale
		    scale = d3.scale.ordinal().domain(d3.range(0, timeSpan, scaleMinDistance)).rangePoints([layout.rangeStart,layout.rangeEnd]);
		    //Generate the axis
		    axis = d3.svg.axis().scale(scale).tickFormat(d3.format(".3s")).orient("left");
	        height = svg.attr("height");

	        //Draw ruler
	       	d3.selectAll(".ruler.vRule svg").remove();
			var ruler = d3.selectAll(".ruler.vRule").append("svg")
	        .attr("class", "axisSVG")
	        .attr("height", height)
	        .attr("width", "50px").append("g")
	        .attr("class", "y axis")
	        .attr("transform", "translate(40,0)")
	        .call(axis);

		}else{ // If there are compressed intervals
			d3.selectAll(".ruler.vRule svg").remove();

			
			var minDistPix = layout.minDistancePixels;
			var minDistance = visualGraph.minDistance;
			var rangeStart = layout.rangeStart;
			var rangeEnd = 0;
			var scaleStart = 0;
			var scaleEnd = 0;

			height = svg.attr("height");
			var ruler = d3.selectAll(".ruler.vRule").append("svg")
	        .attr("class", "axisSVG")
	        .attr("height", height)
	        .attr("width", "50px")

	        timeStart = 0;
			for(var i = 0; i < numberOfCompressions + 1; i++){
				//Calculate and adjust the time span and the minimum distance to the scale selected by the user
				if(i == numberOfCompressions) timeEnd = origTimeSpan;
				else timeEnd = (compressions[i].original.start/minDistPix) * minDistance;

				timeSpan = timeEnd - timeStart;
				scaleStart = timeStart;
				scaleEnd = timeStart + timeSpan;

				scaleMinDistance = visualGraph.minDistance;
				if(i == 0) rangeEnd = ((timeSpan / minDistance) * minDistPix);
				else rangeEnd = rangeStart + ((timeSpan / minDistance) * minDistPix);

			    scaleStart = scaleTime(scaleStart);
			    scaleEnd = scaleTime(scaleEnd);
			    scaleMinDistance = scaleTime(scaleMinDistance);

			    scale = d3.scale.ordinal().domain(d3.range(scaleStart, scaleEnd, scaleMinDistance)).rangePoints([rangeStart,rangeEnd]);

			    axis = d3.svg.axis().scale(scale).tickFormat(d3.format(".3s")).orient("left");
		        height = rangeEnd - rangeStart;

		        //Draw ruler
				ruler.append("g")
		        .attr("class", "y axis")
		        .attr("transform", "translate(40,0)")
		        .call(axis);

		        if(i < numberOfCompressions){
		        	timeStart = (compressions[i].original.end/minDistPix) * minDistance;
		        	rangeStart = compressions[i].end;
		     	}

			}

		}
	}

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
			drawRuler(view.getVisualModel(), view.layout, view.$svg);

		});//resize
		
		return this.each(function() {
			var $this = $(this);

			// Attach rulers
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

			drawRuler(view.getVisualModel(), view.layout, view.$svg);

		});//each
	};//ruler
})( jQuery );
