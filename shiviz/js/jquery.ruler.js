
;(function( $ ){

	$.fn.ruler = function(view) {
	
		var defaults = {
			vRuleSize: 45,
			hRuleSize: 0, // maybe comment out or set to 0
		};//defaults
		var settings = $.extend({},defaults);
		
		var vRule = '<div class="ruler vRule"></div>';
		var corner = '<div class="ruler corner"></div>';
		

		//WINDOW RESIZE
		$(window).resize(function(e){
			var $vRule = $('.vRule');
			$vRule.empty().height(0).outerHeight($("#graphSVG").height());

			var axis = view.layout.axis;
	        var width = view.$svg.attr("width");
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

			var axis = view.layout.axis;
	        var width = view.$svg.attr("width");
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

		});//each
	};//ruler
})( jQuery );
