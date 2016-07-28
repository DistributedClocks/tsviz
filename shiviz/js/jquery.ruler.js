/**
 * jQuery.Ruler v1.1
 * Add Photoshop-like rulers and mouse position to a container element using jQuery.
 * http://ruler.hilliuse.com
 * 
 * Dual licensed under the MIT and GPL licenses.
 * Copyright 2013 Hillius Ettinoffe http://hilliuse.com
 */
;(function( $ ){

	$.fn.ruler = function(options) {
	
		var defaults = {
			vRuleSize: 45,
			hRuleSize: 0, // maybe comment out or set to 0
		};//defaults
		var settings = $.extend({},defaults,options);
		
		var vRule = '<div class="ruler vRule"></div>';
		var corner = '<div class="ruler corner"></div>';
				
		//resize
		$(window).resize(function(e){
			// var $hRule = $('.hRule');
			var $vRule = $('.vRule');
			// $vRule.empty().height(0).outerHeight($vRule.parent().outerHeight()); // --GIVES IT THE WHOLE GRAPH SIZE
			$vRule.empty().height(0).outerHeight($("#graphSVG").height());
			
			var userconstant = Number($("#timeunitviz").val().trim());
			// console.log("userconstant" + userconstant.toString());
			
			// Vertical ruler ticks
			// tickLabelPos = settings.hRuleSize;
			// newTickLabel = "";
			// var count = 0;
			// while (tickLabelPos <= $vRule.height()) {
			// 	if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
			// 		// newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize ) + "</span></div>";
			// 		newTickLabel = "<div class='tickLabel'><span>" + ( count ) + "</span></div>";
			// 		count += userconstant;
			// 		$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
			// 	} else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
			// 		newTickLabel = "<div class='tickMajor'></div>";
			// 		$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
			// 	} else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
			// 		newTickLabel = "<div class='tickMinor'></div>";
			// 		$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
			// 	}
			// 	tickLabelPos = ( tickLabelPos + 5 );			
			// }//vert ticks
		});//resize
		
		return this.each(function() {
			var $this = $(this);
			
			// Attach rulers
			
			if (settings.vRuleSize > 0) {
				var oldWidth = $this.outerWidth();
				$(vRule).width(settings.vRuleSize).height($("#graphSVG").height()).prependTo($this);
			}
			var $vRule = $this.children('.vRule');
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
			var userconstant = Number($("#timeunitviz").val().trim()); 

			// Vertical ruler ticks
			tickLabelPos = settings.hRuleSize;
			newTickLabel = "";
			var count = 0;
			// while (tickLabelPos <= $vRule.height()) {
			// 	if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
			// 		// newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize ) + "</span></div>";
			// 		newTickLabel = "<div class='tickLabel'><span>" + ( count ) + "</span></div>";
			// 		count += userconstant;
			// 		$(newTickLabel).css( "top", tickLabelPos + "px" ).appendTo($vRule);
			// 	} else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
			// 		newTickLabel = "<div class='tickMajor'></div>";
			// 		$(newTickLabel).css( "top", tickLabelPos + "px" ).appendTo($vRule);
			// 	} else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
			// 		newTickLabel = "<div class='tickMinor'></div>";
			// 		$(newTickLabel).css( "top", tickLabelPos + "px" ).appendTo($vRule);
			// 	}
			// 	tickLabelPos = ( tickLabelPos + 5 );
			// }//vert ticks
		});//each
	};//ruler
})( jQuery );
