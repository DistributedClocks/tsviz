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
function ValidateBoundaries(numEvents, minTime, maxTime){
    
    /** @private  */
    this.numEvents = numEvents;
    this.minTime = minTime;
    this.maxTime = maxTime;
    //Change to proper nano seconds conversion
    const MINIMUM = 500;

}

/*
* Converts timescale based on 
* @param {string} Metric unit of timescale e.g (us, ns, ms)
* @param {float} timeUnit Value of granularity 
*/
function getFromTimeScale(timescale, timeUnit){
    
    
}