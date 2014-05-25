var Draw = Draw ? Draw : {};

(function(dw,cr,ui){
    // Directions

    dw.LEFT = 0;
    dw.UP = 1;
    dw.RIGHT = 2;
    dw.DOWN = 3;

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
            caret.start.col == 0 && direction == dw.LEFT ||
            caret.start.row == 0 && direction == dw.UP)
            return true;
        
        //  Decide position of two carets
    
        var shift = [
            {row:0,col:-1}, {row:-1,col:0},
            {row:0,col:1}, {row:1,col:0}
        ]
        var next_caret = {start:{},end:{}}
        next_caret.start.row = caret.start.row + shift[direction].row
        next_caret.start.col = caret.start.col + shift[direction].col
        next_caret.end.row = caret.end.row + shift[direction].row
        next_caret.end.col = caret.end.col + shift[direction].col
    
        //  Method Logic 
    
        var opposite = [dw.RIGHT,dw.DOWN,dw.LEFT,dw.UP]
        var current_glyph = best_glyph(elem, caret.start, direction)
        var current_opposite_end = (function(glyph, end){
            var arr = dw.GlyphEndType[glyph]
            arr = arr ? arr : [dw.BLANK, dw.BLANK, dw.BLANK, dw.BLANK]
            return arr[end]
        })(current_glyph, opposite[direction])
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

        var getEnd = function(r,c,edge) {      // edge = 0:left, 1:up, 2:right, 3:down
            var arr = dw.GlyphEndType[cr.get(elem,{row:r,col:c})]
            arr = arr ? arr : [dw.BLANK, dw.BLANK, dw.BLANK, dw.BLANK]
            return parseInt(arr[edge])
        }

        var edge_left = fixed_edge == 0 ? dw.style.val : getEnd(row,col-1,2)
        var edge_up = fixed_edge == 1 ? dw.style.val : getEnd(row-1,col,3)
        var edge_right = fixed_edge == 2 ? dw.style.val : getEnd(row,col+1,0)
        var edge_down = fixed_edge == 3 ? dw.style.val : getEnd(row+1,col,1)
    
        var s = dw.StyleCount
        var h = dw.HeartCount
        var glyph = dw.BestGlyph[
            4 * Math.pow(s,4) * dw.heart.val + Math.pow(s,4) * fixed_edge + Math.pow(s,3) * edge_left
            + Math.pow(s,2) * edge_up + s * edge_right + edge_down
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
        
        var shift = [
            {row:0,col:-1}, {row:-1,col:0},
            {row:0,col:1}, {row:1,col:0}
        ]
        var next_caret = {start:{},end:{}}
        next_caret.start.row = caret.start.row + shift[direction].row
        next_caret.start.col = caret.start.col + shift[direction].col
        next_caret.end.row = caret.end.row + shift[direction].row
        next_caret.end.col = caret.end.col + shift[direction].col

        //  enlarge selection even outside of region
        //    - browser only move caret.end
    
        cr.set(elem, {row:next_caret.end.row, col:next_caret.end.col}, ' ', true)
    }
})(Draw, Caret, UI);
