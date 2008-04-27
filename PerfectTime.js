/* 
    Original implimentation by Why The Lucky Stiff
    <http://whytheluckystiff.net/>, described at:
    
    http://redhanded.hobix.com/inspect/showingPerfectTime.html
    
    Modified to fit in a single, unobtrusive javascript
    class by Mike West <http://mikewest.org/>
        
    I'm not sure what the original license chosen for this
    code was.  I'm assuming it's liberal enough, and this 
    class is released under the same license, whatever that
    turns out to be.
    
    Heavily refactored by Daniel Morrison
    http://github.com/collectiveidea/perfecttime
*/

/* PerfectTime */
var PerfectTime = Class.create({
  defaultFormat: '%d %b %Y at %H:%M',
  defaultSelector: '.PerfectTime',
  
  initialize: function(format, selector) {
    this.selector  = (selector)?selector:this.defaultSelector;
    this.format = (format)?format:this.defaultFormat;
    $$(selector).each(function(item) {
      var ISOtime = item.getAttribute('title');
      var newDate = this.parseISO(ISOtime);
      item.innerHTML = this.strftime(newDate);
    }, this);    
  },

  isoRegEx:  /(\d{4})(-?(\d{2})(-?(\d{2})(T(\d{2}):?(\d{2})(:?(\d{2})([.]?(\d+))?)?(Z|(([+-])(\d{2}):?(\d{2}))?)?)?)?)?/,     
  
  parseISO: function(isoString) {
    // Parse ISO 8601 type times (e.g. hCalendar)
    //     based on Paul Sowden's method, tweaked to match up 
    //     with 'real world' hCalendar usage:
    //
    //         http://delete.me.uk/2005/03/iso8601.html
    //    
    var d       = isoString.match(this.isoRegEx);
    
    var theDate = new Date(d[1], 0, 1);
    
    // <month> - 1:  Because JS months are 0-11
    if (d[ 3]) { theDate.setMonth(  d[ 3] - 1); }
    if (d[ 5]) { theDate.setDate(   d[ 5]); }
    if (d[ 7]) { theDate.setHours(  d[ 7]); }
    if (d[ 8]) { theDate.setMinutes(d[ 8]); }
    if (d[10]) { theDate.setSeconds(d[10]); }
    // Must be between 0 and 999), using Paul Sowden's method: http://delete.me.uk/2005/03/iso8601.html
    if (d[12]) { theDate.setMilliseconds(Number("0." + d[12]) * 1000); }
    var offset = 0;
    if (d[15]) {
        var offset = (Number(d[16])*60 + Number(d[17])) * 60;
        if (d[15] == "+") { offset *= -1; }
    }
    
    offset -= theDate.getTimezoneOffset() * 60;
    theDate.setTime(Number(theDate) + (offset * 1000));
    return theDate;
  },
        
  strftime_funks: {
      zeropad: 
              function( n ){ return n>9 ? n : '0'+n; },
      a:      function(t) { return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][t.getDay()] },
      A:      function(t) { return ['Sunday','Monday','Tuedsay','Wednesday','Thursday','Friday','Saturday'][t.getDay()] },
      b:      function(t) { return ['Jan','Feb','Mar','Apr','May','Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'][t.getMonth()] },
      B:      function(t) { return ['January','February','March','April','May','June', 'July','August', 'September','October','November','December'][t.getMonth()] },
      c:      function(t) { return t.toString() },
      d:      function(t) { return this.zeropad(t.getDate()) },
      H:      function(t) { return this.zeropad(t.getHours()) },
      I:      function(t) { return this.zeropad((t.getHours() + 12) % 12) },
      l:      function(t) { return (t.getHours() + 12) % 12 },
      m:      function(t) { return this.zeropad(t.getMonth()+1) }, // month-1
      M:      function(t) { return this.zeropad(t.getMinutes()) },
      p:      function(t) { return this.H(t) < 12 ? 'AM' : 'PM'; },
      P:      function(t) { return this.H(t) < 12 ? 'am' : 'pm'; },
      S:      function(t) { return this.zeropad(t.getSeconds()) },
      w:      function(t) { return t.getDay() }, // 0..6 == sun..sat
      y:      function(t) { return this.zeropad(this.Y(t) % 100); },
      Y:      function(t) { return t.getFullYear() },
      Z:      function(t) { 
                  if (t.getTimezoneOffset() > 0) {
                      return "-" + this.zeropad(t.getTimezoneOffset()/60) + "00";
                  } else {
                      return "+" + this.zeropad(Math.abs(t.getTimezoneOffset())/60) + "00";
                  }
              },    
      '%':    function(t) { return '%' }
  },
  strftime: function(theDate) {
      var fmt = this.format;
      for (var s in this.strftime_funks) {
          if (s.length == 1) {
              fmt = fmt.replace('%' + s, this.strftime_funks[s](theDate));
          }
      }
      return fmt;
  }
        
});

document.observe('dom:loaded', function(){
  new PerfectTime('%Y-%m-%d %H:%M.%S %Z');
});