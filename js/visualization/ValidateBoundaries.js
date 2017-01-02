/**
 * Constructs a ValidateBoundaries that will determine thresholds that the graph can be
 * granulated into.  
 * 
 * @classdesc
 * 
 * <p>
 * Given an input log, ValidateBoundaries determines thresholds that the log can be visualized into
 * without compromising the dom by generating too many events in the dom tree </p>
 *
 * @constructor
 * @param {int} numEvents The number of events total in this log. 
 *        {int} minTime Time timestamp of the initial event    
 *        {int} maxTime Time timestamp of the latest event
 */
function ValidateBoundaries(numEvents, minTime, maxTime, timeunit, timescale){
    /** @private  */
    this.numEvents = numEvents;
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.timeunit = timeunit;
    this.timescale = timescale;
    //Change to proper nano seconds conversion
}

/*
* Converts timescale based on timeunit and scale
* @param {float} timeunit Value of granularity 
* @param {string} Metric unit of timescale e.g (us, ns, ms)
* @return {array} [scaledjust, timeunit]
*/
ValidateBoundaries.prototype.getFromTimeScale = function (){
    var scaledjust = 0;
    switch(this.timescale){
        case "ns":
        this.scaleadjust = this.timeunit / 1000;
        if(scaleadjust >= 1 && scaleadjust < 1000) this.timescale = "us";
        else if(scaleadjust >= 1000 && scaleadjust< 1000000) {
            this.timescale = "ms";
            scaleadjust /= 1000;
        }else if(scaleadjust >= 1000000 && scaleadjust < 1000000000) {
            this.timescale = "s";
            scaleadjust /= 1000000;
        }else scaleadjust *= 1000;
        break;
        case "us": 
        scaleadjust = this.timeunit / 1000;
        if(scaleadjust >= 1 && scaleadjust < 1000) this.timescale = "ms";
        else if(scaleadjust >= 1000 && scaleadjust < 1000000) {
            this.timescale = "s";
            scaleadjust /= 1000;
        }else scaleadjust *= 1000;
        this.timeunit = this.timeunit * 1000;
        break;
        case "ms":
        scaleadjust = this.timeunit / 1000;
        if(scaleadjust >= 1 && scaleadjust < 1000) this.timescale = "s";
        else scaleadjust *= 1000;
        this.timeunit = this.timeunit * 1000000;
        break;
        case "s":
        this.timeunit = this.timeunit * 1000000000;
        break;
    }
    this.scaledjust = scaledjust;
}

/**
 * Determine if value is valid granularity or not
 * @return true if valid false if not
 */
ValidateBoundaries.prototype.checkValue = function(value){
    /*TODO map number of events, max and min to function that displays whether or not the system can handle it
        The following is a general indicator (< 100 ns that fails but must be changed)
     */
    if (this.timeunit < 100) return false;
    return true;        
}

/**
 * Custom error message for when values are invalid.
 */
ValidateBoundaries.prototype.errorMessage = function(){
    $("#errorbox").html("Please select a larger value for time difference");
    $(".error").show();

    // Let users close errors with esc
    $(window).on('keydown.error', function(e) {
        if (e.keyCode == 27) {
            $(".error").hide();
            $(window).unbind('keydown.error');
        }
    });    
}

ValidateBoundaries.prototype.setscaledjust = function (scaledjust){
    this.scaledjust = scaledjust;
}

ValidateBoundaries.prototype.getscaledjust = function (){
    return this.scaledjust;
}

ValidateBoundaries.prototype.settimeunit = function (scaledjust){
    this.scaledjust = scaledjust;
}

ValidateBoundaries.prototype.gettimeunit = function (){
    return this.scaledjust;
}

ValidateBoundaries.prototype.setMinTime = function (mintime){
    this.minTime = mintime;
}

ValidateBoundaries.prototype.setMaxTime = function (maxtime){
    this.maxTime = maxtime;
}

ValidateBoundaries.prototype.setNumEvents = function (numevents){
    this.numEvents = numevents;
}
