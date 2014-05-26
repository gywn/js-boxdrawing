var Draw = Draw ? Draw : {};

(function(dw,cr,ui){

    // Style constants

    dw.NOTHING = -1
    dw.BLANK = 0
    dw.REGULAR = 1
    dw.BOLD = 2
    dw.DOUBLE = 3

    // Heart constants

    dw.PLAIN = 0                               
    dw.ROUND = 1
    dw.DASHED = 2
    
    // Arrow constants
    
    dw.NO_ARROW = 0
    dw.ARROW = 1

    // current style/heart, use object to enable referencing

    dw.style = {val:dw.REGULAR}                 // default style : regular
    dw.heart = {val:dw.ROUND}                   // default heart : round
    dw.arrow = {val:dw.NO_ARROW}                // default arrow : no arrow

    ////////////////////////////////////////////////////////////////////
    //  
    //      Draw new box character
    // 
    //      update "elem" with 
    //        + its beginning/ending caret (cr.getCaret)  
    //        + direction (0|1|2|3) 
    // 
    ////////////////////////////////////////////////////////////////////

    dw.move = function(elem, direction)
    {
        var caret = cr.getCaret(elem);
    
        //  Condition that Draw ignores caret movement:
        //    - null selection or selection longer than 1
        //    - multiple lines selection (even select only a "\n")
        //    - caret wants to move left/upper out of textarea
    
        if (caret.start.row != caret.end.row || 
            caret.start.col != caret.end.col - 1 ||
            caret.start.col == 0 && direction == 0 ||
            caret.start.row == 0 && direction == 1)
            return true;
        
        //  Decide position of two carets
    
        var next_caret = {}
        next_caret.start = cr.side(caret.start, direction)
        next_caret.end = cr.side(caret.end, direction)
        
        //  Method Logic 
    
        var opposite = [2,3,0,1]
        var current_glyph = best_glyph(elem, caret.start, direction)
        var current_opposite_end = getEnd(current_glyph, opposite[direction])
        var current_arrow = Draw.BestArrow[opposite[direction]][Draw.style.val]
        var next_glyph = best_glyph(elem, next_caret.start, opposite[direction])

        if (dw.arrow.val == dw.ARROW && current_opposite_end == dw.style.val) {
            cr.set(elem, caret.start, current_arrow)    // only update current postion
            ui.arrow.next.click()                       // toggle arrow-control state
        } else {
            cr.set(elem, caret.start, current_glyph)    // update current position
            cr.set(elem, next_caret.start, next_glyph)  // and next position
        }
       
        cr.setCaret(elem, next_caret)
    
        return false
    };
    
    //  Get end types frome glyph
    
    var getEnd = function(glyph, edge){
        var arr = dw.GlyphEndType[glyph]
        return arr ? parseInt(arr[edge]) : dw.BLANK
    }

    ////////////////////////////////////////////////////////////////////
    //  
    //      Find new glyph matching boundary condition
    // 
    //    - execpt direction "fixed_edge", glyph should match sibling glyphs
    //    - for direction "fixed_edge", glyph should match dw.style.val
    // 
    ////////////////////////////////////////////////////////////////////

    var best_glyph = function(elem, caret, fixed_edge) {
        var row = caret.row
        var col = caret.col
        var opposite = [2,3,0,1]
        var edge_to_match = []
        
        for (var i = 0; i < 4; i++)
            edge_to_match[i] = fixed_edge == i ? dw.style.val : getEnd(cr.get(elem,cr.side(caret,i)),opposite[i])
            
        var s = dw.StyleCount
        var h = dw.HeartCount
        var glyph = dw.BestGlyph[
            4 * Math.pow(s,4) * dw.heart.val + Math.pow(s,4) * fixed_edge + Math.pow(s,3) * edge_to_match[0]
            + Math.pow(s,2) * edge_to_match[1] + s * edge_to_match[2] + edge_to_match[3]
        ]
        
        return glyph ? glyph : ' '
    }

    ////////////////////////////////////////////////////////////////////
    //  
    //    - Response to moving caret, extend area so that it doesn't
    //      jump to newline or stop at the end
    // 
    ////////////////////////////////////////////////////////////////////

    dw.extendArea = function(elem, direction) {
        var caret = cr.getCaret(elem);
    
        //  Decide position of two carets
        
        var next_caret = {}
        next_caret.start = cr.side(caret.start, direction)
        next_caret.end = cr.side(caret.end, direction)

        //  enlarge selection even outside of region
        //    - browser only move caret.end
    
        cr.set(elem, next_caret.end, ' ', true)
    }
})(Draw, Caret, UI);
