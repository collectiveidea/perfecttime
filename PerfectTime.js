function handleEvent(obj, event, func) {
    try {
        obj.addEventListener(event, func, false);
    } catch (e) {
        if (typeof eval("obj.on"+event) == "function") {
            var existing = obj['on'+event];
            obj['on'+event] = function () { existing(); func(); };
        } else {
            obj['on'+event] = func;                        
        }
    }
}   

/* PerfectTime */
    function PerfectTime() {
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
        */
            
        var self = this;
        
        self.defaultFormat = '<nobr>%d %b %Y</nobr> at <nobr>%H:%M</nobr>';
        self.format = (arguments[0])?arguments[0]:self.defaultFormat;
        self.isoRegEx = /(\d{4})(-?(\d{2})(-?(\d{2})(T(\d{2}):?(\d{2})(:?(\d{2})([.]?(\d+))?)?(Z|(([+-])(\d{2}):?(\d{2}))?)?)?)?)?/;
        
        self.parseISO = function (isoString) {
            // Parse ISO 8601 type times (e.g. hCalendar)
            //     based on Paul Sowden's method, tweaked to match up 
            //     with 'real world' hCalendar usage:
            //
            //         http://delete.me.uk/2005/03/iso8601.html
            //

            
            var d       = isoString.match(self.isoRegEx);
            
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
        }
        
        self.strftime_funks = {
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
            m:      function(t) { return this.zeropad(t.getMonth()+1) }, // month-1
            M:      function(t) { return this.zeropad(t.getMinutes()) },
            p:      function(t) { return this.H(t) < 12 ? 'AM' : 'PM'; },
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
        }
        self.strftime = function (theDate) {
            var fmt = self.format;
            for (var s in self.strftime_funks) {
                if (s.length == 1) {
                    fmt = fmt.replace('%' + s, self.strftime_funks[s](theDate));
                }
            }
            return fmt;
        }
        
        
        self.instantiate = function () {
            // Spans by old method
            var spans = document.getElementsByTagName('span');
            for (i=0, numSpans=spans.length; i < numSpans; i++) {
                if (spans[i].className.match(/PerfectTime/)) {
                    self.processSpan(spans[i]);
                }
            }
            
            // ABBRs by new method
            var abbrs = document.getElementsByTagName('abbr');
            for (i=0, numAbbrs=abbrs.length; i < numAbbrs; i++) {
                if (abbrs[i].className.match(/PerfectTime/)) {
                    self.processAbbr(abbrs[i]);
                }
            }            
        }
        
        self.processSpan = function (theSpan) {
            var GMT = parseInt(theSpan.getAttribute('gmt_time')) * 1000;
            var newDate = new Date(GMT);
            theSpan.innerHTML = self.strftime(newDate);
        }
        
        self.processAbbr = function (theAbbr) {
            var ISOtime = theAbbr.getAttribute('title');
            var newDate = self.parseISO(ISOtime);
            theAbbr.innerHTML = self.strftime(newDate);
        }
        
        handleEvent(window, 'load', self.instantiate);
    }
    var timeThing = new PerfectTime('%Y-%m-%d %H:%M.%S %Z');