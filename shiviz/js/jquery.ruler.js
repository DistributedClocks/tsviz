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
			vRuleSize: 18,
			hRuleSize: 0, // maybe comment out or set to 0
			showCrosshair : false,
			showMousePos: false //Maybe comment out
		};//defaults
		var settings = $.extend({},defaults,options);
		
		var hRule = '<div class="ruler hRule"></div>';
		var vRule = '<div class="ruler vRule"></div>';
		var corner = '<div class="ruler corner"></div>';
		var vMouse = '<div class="vMouse"></div>';
		var hMouse = '<div class="hMouse"></div>';
		var mousePosBox = '<div class="mousePosBox">x: 50%, y: 50%</div>';
		

		// Probably don't want mouse position for now, so comment this out
		// if (!Modernizr.touch) { //Check if it's a touchscreen device
			// Mouse crosshair
			if (settings.showCrosshair) {
				$('body').append(vMouse, hMouse);
			}
			// Mouse position
			if (settings.showMousePos) {
				$('body').append(mousePosBox);
			}
			// If either, then track mouse position
			if (settings.showCrosshair || settings.showMousePos) {
				$(window).mousemove(function(e) {
					if (settings.showCrosshair) {
						$('.vMouse').css("top",e.pageY-($(document).scrollTop())+1);
						$('.hMouse').css("left",e.pageX+1);
						//-($(window).scrollTop())
					}
					if (settings.showMousePos) {
						$('.mousePosBox').html("x:" + (e.pageX-settings.vRuleSize) + ", y:" + (e.pageY-settings.hRuleSize) ).css({
							top: e.pageY-($(document).scrollTop()) + 16,
							left: e.pageX + 12
						});
					}
				});
			}
		// }
		
		//resize
		$(window).resize(function(e){
			var $hRule = $('.hRule');
			var $vRule = $('.vRule');
			$hRule.empty();
			// console.log($vRule.parent());
			// console.log($vRule.parent().outerHeight());
			// console.log($( window ).height());
			// $vRule.empty().height(0).outerHeight($vRule.parent().outerHeight());
			$vRule.empty().height(0).outerHeight($(window).height());

			
			// // Horizontal ruler ticks
			var tickLabelPos = settings.vRuleSize;
			var newTickLabel = "";
			while ( tickLabelPos <= $hRule.width() ) {
				if ((( tickLabelPos - settings.vRuleSize ) %50 ) == 0 ) {
					newTickLabel = "<div class='tickLabel'>" + ( tickLabelPos - settings.vRuleSize ) + "</div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %10 ) == 0 ) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css("left",tickLabelPos+"px").appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %5 ) == 0 ) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				}
				tickLabelPos = (tickLabelPos + 5);				
			}//hz ticks
			
			// Vertical ruler ticks
			tickLabelPos = settings.hRuleSize;
			newTickLabel = "";
			var count = 0;
			while (tickLabelPos <= $vRule.height()) {
				if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
					// newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize ) + "</span></div>";
					newTickLabel = "<div class='tickLabel'><span>" + ( count ++ ) + "</span></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				}
				tickLabelPos = ( tickLabelPos + 5 );				
			}//vert ticks
		});//resize
		
		return this.each(function() {
			var $this = $(this);
			
			// Attach rulers
			
			// Should not need 1 min padding-top of 1px but it does
			// will figure it out some other time
			// $this.css("padding-top", settings.hRuleSize + 1 + "px");
			// if (settings.hRuleSize > 0) {				
			// 	$(hRule).height(settings.hRuleSize).prependTo($this);
			// }
			
			if (settings.vRuleSize > 0) {
				var oldWidth = $this.outerWidth();
				// $this.css("padding-left", settings.vRuleSize + 1 + "px").outerWidth(oldWidth);
				// $(vRule).width(settings.vRuleSize).height($this.outerHeight()).prependTo($this);
				$(vRule).width(settings.vRuleSize).height($(window).height()).prependTo($this);
			}
			
			if ( (settings.vRuleSize > 0) && (settings.hRuleSize > 0) ) {
			// if ( (settings.vRuleSize > 0) ) {
				$(corner).css({
					width: settings.vRuleSize,
					height: settings.hRuleSize
				}).prependTo($this);
			}
			
			
			var $hRule = $this.children('.hRule');
			var $vRule = $this.children('.vRule');
			// console.log($vRule.parent());
			// console.log($vRule.parent().outerHeight());
			// console.log($(window).height());
		
			// Horizontal ruler ticks
			var tickLabelPos = settings.vRuleSize;
			var newTickLabel = "";
			while ( tickLabelPos <= $hRule.width() ) {
				if ((( tickLabelPos - settings.vRuleSize ) %50 ) == 0 ) {
					newTickLabel = "<div class='tickLabel'>" + ( tickLabelPos - settings.vRuleSize ) + "</div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %10 ) == 0 ) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css("left",tickLabelPos+"px").appendTo($hRule);
				} else if ((( tickLabelPos - settings.vRuleSize ) %5 ) == 0 ) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "left", tickLabelPos+"px" ).appendTo($hRule);
				}
				tickLabelPos = (tickLabelPos + 5);				
			}//hz ticks
			
			// Vertical ruler ticks
			tickLabelPos = settings.hRuleSize;
			newTickLabel = "";
			var count = 0;
			while (tickLabelPos <= $vRule.height()) {
				if ((( tickLabelPos - settings.hRuleSize ) %50 ) == 0) {
					// newTickLabel = "<div class='tickLabel'><span>" + ( tickLabelPos - settings.hRuleSize ) + "</span></div>";
					newTickLabel = "<div class='tickLabel'><span>" + ( count ++ ) + "</span></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%10) == 0) {
					newTickLabel = "<div class='tickMajor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				} else if (((tickLabelPos - settings.hRuleSize)%5) == 0) {
					newTickLabel = "<div class='tickMinor'></div>";
					$(newTickLabel).css( "top", tickLabelPos+"px" ).appendTo($vRule);
				}
				tickLabelPos = ( tickLabelPos + 5 );				
			}//vert ticks			
			
		});//each		
		
	};//ruler
})( jQuery );