var Caret = Caret ? Caret : {};

(function(cr){
    
    var valid = function(v){return v != undefined}
    
    var set_val = function(elem, val) {
        if (valid(elem.val)) {
            elem.val(val)
        } else if (valid(elem.value)) {
            elem.value = val
        } else if (valid(elem.textContent)) {
            elem.textContent = val
        } else 
            return false
            
        return true
    }
    
    var get_val = function(elem) {
        if (valid(elem.val)) {
            return elem.val()
        } else if (valid(elem.value)) {
            return elem.value
        } else if (valid(elem.textContent)) {
            return elem.textContent
        } else 
            return null            
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //      return the next caret in direction d
    // 
    //  caret   : {row:, col:}
    //
    ////////////////////////////////////////////////////////////////////
    
    cr.side = function(caret, d) {
        var shift = [
            [0,-1], [-1,0], [0,1], [1,0], [0,0]
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
        var lines = get_val(elem).split('\n');
        var l = lines[row] ? lines[row] : ''
        return row < 0 || row >= lines.length || col < 0 || col >= l.length ? ' ' : l[col]
    };
    
    ////////////////////////////////////////////////////////////////////
    // 
    //      type    : - undefined : write character & reset caret
    //                - "enlarge" : doesn't write character (but enlarge space) & reset caret
    //                - "no focus": write character & doesn't reset caret
    // 
    //    - everything outside of textflow is space
    //    - set() should handle
    //        + space/newline padding issue
    // 
    ////////////////////////////////////////////////////////////////////

    cr.ENLARGE = 0
    cr.NO_FOCUS = 1

    cr.set = function(elem, caret, chr, type) { // enlarge: don't overwrite content
        var row = caret.row
        var col = caret.col
        var lines = get_val(elem).split('\n');
        if (row < 0 || col < 0)
            return;
        while (row >= lines.length)
            lines.push('');
        
        var l = lines[row];
        if (col >= l.length)
            l += Array(col - l.length + 2).join(' ');
        lines[row] = type == cr.ENLARGE ? l : l.substring(0,col) + chr[0] + l.substring(col+1);
    
        //  renew text content maintaining the same caret positon
    
        var caret = cr.getCaret(elem)
        set_val(elem, lines.join("\n"))
        if (type != cr.NO_FOCUS) cr.setCaret(elem, caret)
    
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
    
        var text = get_val(elem)
        var locate = function(offset) {
            return {
                row : (text.substr(0, offset).match(/\n/g) || []).length,
                col : offset - 1 - text.substr(0,offset).lastIndexOf("\n")
            }
        }
        return {start: locate(offset.start), end : locate(offset.end)}
    };



    //  caret should have caret.(start|end).(row|col) methods
    //  caret.start should be before caret.end

    cr.setCaret = function(elem, caret) {
        var text = get_val(elem);
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

        // elem.focus();

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
