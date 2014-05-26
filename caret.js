var Caret = Caret ? Caret : {};

(function(cr){
    
    ////////////////////////////////////////////////////////////////////
    //
    //      return the next caret in direction d
    // 
    //  caret   : {row:, col:}
    //
    ////////////////////////////////////////////////////////////////////
    
    cr.side = function(caret, d) {
        var shift = [
            [0,-1], [-1,0], [0,1], [1,0]
        ]
        return {row: caret.row + shift[d][0], col: caret.col + shift[d][1]}
    }

    ////////////////////////////////////////////////////////////////////
    // 
    //      Get/Set Character in Textarea by Row/Column
    // 
    //    - everything outside of textflow is space
    //    - set() should handle
    //        + space/newline padding issue
    // 
    ////////////////////////////////////////////////////////////////////

    cr.get = function(elem, caret) {
        var row = caret.row
        var col = caret.col
        var lines = elem.value.split('\n');
        var l = lines[row] ? lines[row] : ''
        return row < 0 || row >= lines.length || col < 0 || col >= l.length ? ' ' : l[col]
    };

    cr.set = function(elem, caret, chr, enlarge) { // enlarge: don't overwrite content
        var row = caret.row
        var col = caret.col
        var lines = elem.value.split('\n');
        if (row < 0 || col < 0)
            return;
        while (row >= lines.length)
            lines.push('');
        
        var l = lines[row];
        if (col >= l.length)
            l += Array(col - l.length + 2).join(' ');
        lines[row] = enlarge ? l : l.substring(0,col) + chr[0] + l.substring(col+1);
    
        //  renew text content maintaining the same caret positon
    
        var caret = cr.getCaret(elem)
        elem.value = lines.join("\n")
        cr.setCaret(elem, caret)
    
        return chr
    };



    ////////////////////////////////////////////////////////////////////
    //
    //      Get/Set selection's caret position in elem
    // 
    //    - based on jQuery Caret Range plugin
    //    - caret position {row:0, col:0} is before the 1st character
    // 
    ////////////////////////////////////////////////////////////////////

    cr.getCaret = function(elem) {
    
        //  Get two caret' offset
    
        var offset = {};
        if ('selectionStart' in elem) {
            offset = {start:elem.selectionStart, end:elem.selectionEnd};
        }
        else if ('selection' in document) {
            var val = elem.value.replace(/\r\n/g, "\n");
    
            var range = document.selection.createRange().duplicate();
            range.moveEnd("character", val.length);
            var start = (range.text == "" ? val.length : val.lastIndexOf(range.text));
    
            range = document.selection.createRange().duplicate();
            range.moveStart("character", -val.length);
            var end = range.text.length;
            offset = {start:start, end:end};
        }
        else {
            offset = {start:undefined, end:undefined};
        }
    
        //  Convert offsets to {row,column}
        //    - syntax: result.(start|end).(row|col)
    
        var text = elem.value
        var locate = function(offset) {
            return {
                row : (text.substr(0, offset).match(/\n/g) || []).length,
                col : offset - 1 - text.lastIndexOf("\n", offset - 1)
            }
        }
        return {start: locate(offset.start), end : locate(offset.end)}
    };



    //  caret should have caret.(start|end).(row|col) methods

    cr.setCaret = function(elem, caret) {
        var text = elem.value;
        var lines = text.split('\n');
    
        //  Convert {row,column} to offsets
    
        var offset = function(caret) {
            var r = caret.row
            var c = caret.col
            return (lines.slice(0, r).join('') + (lines[r] ? lines[r] : '').substr(0,c)).length + r 
        }
        var start = offset(caret.start)
        var end = offset(caret.end)

        //  Set selection's position with two offsets

        elem.focus();

        if ('selectionStart' in elem) {
            elem.selectionStart = start;
            elem.selectionEnd = end;
        }
        else if ('selection' in document) {
            text = text.replace(/\r\n/g, "\n");
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveStart("character", start);
            range.moveEnd("character", end - start);
            range.select();
        }
        else {
            start = undefined;
            end = undefined;
        }

        return true;
    };

})(Caret);
