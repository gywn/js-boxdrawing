var Drag = Drag ? Drag : {};

////////////////////////////////////////////////////////////////////////
//
//                             ┌┄┄┄┄┄┄┬┄╴             ┏━━◀━━━┱┄┄┄┄┄┄┄┄┄┄┄┄┄┐ 
//                             ┊ othr ┊ BLANK         ┃      ┃             ┊ 
//                             ┊ char ┊ char ╷        ┃      ┃  othr chars ┊ 
//           ╶┄┰┄┄┄┄┄┄┐        └┄×◄┄┄┄╆━━━▶━━┥        ┠┄┄┄┄┄┄╄━━◀━━━╅┄╴    ╽ 
//       BLANK ┃ othr ┊               ▲ othr ┊        ┃    BLANK    ▲      ┃ BLANK
//       char  ▲ char ┊               ┃ char ┊        ┃      ┊      1      2 char  
//           ╶┄┸┄┄┄┄┄┄┘               ┖┄┄┄┄┄┄┘        ┗━━━▶━━┷━━━━━━┹┄┄┄┄┄┄┺━▶    
//                                                                                  
//      clockwise maximal         right-turn           If 1 results in a            
//   1.  other characters  ╺▶  2.  priority    ╺▶  3.  anti-clockwise contour,  ╺▶  4.  fill the contour
//           contour                                   try other edge (ie 2).      
//
//   Typical conditions: (╺▶drag direction)                                   
//                                           ┏━━━━┓                                ┏━━━━┓          
//     ┏━━━━┓          ┏━━━━┓           ┏━━━━┫    ┃       ┏━━━━┳━━━━┓         ┏━━━━╋▶   ┃   ┏━━┳━━┓ 
//    1┣▶2  ┃          ┃   1┣▶2         ┃   1┣▶━━━┛       ┃    ┣▶   ┃         ┃    ┣━━━━┛   ┣━━╋▶━┫   
//     ┗━━━━┛          ┗━━━━┛           ┗━━━━┛            ┗━━━━┻━━━━┛         ┗━━━━┛        ┗━━┻━━┛ 
//     1 is okay       1 failed         1 failed          both 1 & 2 fail     1 gives up    1 gives up                    
//                     2 is okay        2 isn't sibling   Oops..              2 failed      2 gives up
//                                      BLANK. Oops..                         Oops..        Oops..
//
////////////////////////////////////////////////////////////////////////

(function(dg,cr){
    
    ////////////////////////////////////////////////////////////////////
    //
    //      Character array handling
    //
    //    - arr     : rank-2 array | array of string
    //    - def     : default character
    //
    ////////////////////////////////////////////////////////////////////
    
    var valid = function(v){return v != undefined}
    
    var get = function(arr,i,j,def) {          //  only for rank 2 array
        
        return valid(arr[i]) ? 
            (valid(j) ? (valid(arr[i][j]) ? arr[i][j] : def) : arr[i])
            : (valid(j) ? def : [])
    }
    
    //      work only with rank-2 array, not with array of string
    
    var set = function(arr,i,j,val) {
        if (!valid(arr[i])) arr[i] = []
        arr[i][j] = val
    }
    
    //  faster get (without querying textarea)
    //  lines is [str,str, ...]
    //
    // var get = function(lines, caret) {
    //     var row = caret.row
    //     var col = caret.col
    //     var l = lines[row] ? lines[row] : ''
    //     return row < 0 || row >= lines.length || col < 0 || col >= l.length ? ' ' : l[col]
    // };
    
    //  return   1:non-space   0:space
    
    var type_of_glyph = function(lines, caret) {
        return get(lines, caret.row, caret.col, ' ') == ' ' ? 0 : 1
    }
    
    //  reutrn   -1:turn left   0:straigh   1:turn right
    
    var direction_incr = function(lines, caret, d){
        var row = caret.row
        var col = caret.col
        var left_ahead =  type_of_glyph(lines, {col: col + [-1,-1,0,0][d], row: row + [1,0,0,1][d]})
        var right_ahead = type_of_glyph(lines, {col: col + [-1,0,0,-1][d], row: row + [0,0,1,1][d]})
        return [[1,0],[1,-1]][left_ahead][right_ahead]
    }
    
    ////////////////////////////////////////////////////////////////////
    // 
    //      Find Closed Boundary (Polygone)
    // 
    //    - Returns [[char|null, ...], ...], where
    // 
    //      boundary == undefined:
    //        + result[i][j]         : row i & column j
    //        + result[i][j] == null : not inside polygone
    //        + result[i][j] != null : it's the content of UI.t included
    //                                 in polygone
    // 
    //      boundary == true
    //        + result[i][j]         : row i & column j
    //        + result[i][j] != null : out-boundary of polygone
    // 
    //    - xanadu & poly_text are only for debugging
    //
    ////////////////////////////////////////////////////////////////////
    
    var polygone = function(elem) {
        var current_caret = cr.getCaret(elem).start
        var orig_lines = elem.val().split('\n') // lines is [str,str, ...]
        var poly_lines = []                     // lines would by [[char|null|undefined, ...], ...]
        var LEFT_CHAR = 'L'
        var RIGHT_CHAR = 'R'
        
        //    - The character should be non-space
        
        if (type_of_glyph(orig_lines, current_caret) != 1) {
            return false
        }
        
        //    - Search clockwisely around character for bondary's beginning
        
        for (var d = 0; d < 4; d++) {
            
            poly_lines = []
            
            var sibling_caret = cr.side(current_caret, d)
            
            if (type_of_glyph(orig_lines, sibling_caret) != 0) continue 
            
            var b_point = {                     // boundary point
                col: current_caret.col + [0,1,1,0][d],
                row: current_caret.row + [-1,-1,0,0][d]
            }
            var initial_point_row = b_point.row
            var initial_point_col = b_point.col
            var b_direction = (d + 1)%4         // boundary direction
            var b_orientation = 0               // boundary orientation (+4/-4)
            var i = 0
            while (/*i < 9999 &&*/ (i < 1 
                    || b_point.row != initial_point_row 
                    || b_point.col != initial_point_col)) {
                var left_col = b_point.col + [0,-1,-1,0][b_direction]
                var left_row = b_point.row + [1,1,0,0][b_direction]
                var right_col = b_point.col + [0,0,-1,-1][b_direction]
                var right_row = b_point.row + [0,1,1,0][b_direction]
                
                if (!poly_lines[left_row])poly_lines[left_row] = []
                poly_lines[left_row][left_col] = LEFT_CHAR
                
                if (!poly_lines[right_row]) poly_lines[right_row] = []
                poly_lines[right_row][right_col] = RIGHT_CHAR
                
                var turn = direction_incr(orig_lines,b_point,b_direction)
                b_direction = (b_direction + turn + 4) % 4
                b_orientation += turn
                b_point = cr.side(b_point,b_direction)
                
                i++
            }
            
            if (b_orientation <= 0) continue
            
            //    - Orientation should be positive include de correst "side" of polygone
            //    - Domain is filled with line-scan algorithm
            
            var packed_poly_lines = new Array(poly_lines.length)
            
            for (var i = 0; i < poly_lines.length; i++) {
                var state = 0
                var line_length = get(poly_lines, i).length
                var new_line = new Array(line_length)  //  packed array -> fast
                
                for (var j = 0; j < line_length; j++) {
                    if (state && poly_lines[i][j] == LEFT_CHAR || ! state && poly_lines[i][j] == RIGHT_CHAR)
                        state = ! state
                                
                    new_line[j] = state ? orig_lines[i][j] : null
                    // poly_lines[i][j] = state ? orig_lines[i][j] : null
                }
                packed_poly_lines[i] = new_line
            }
            
            return packed_poly_lines
            // return poly_lines

        }                                       //  done searching around the character
        
        return false
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //    - Write polygone into local vairable so it can be used during
    //      moving
    //
    ////////////////////////////////////////////////////////////////////
    
    var orig_caret = {}
    var orig_lines = []
    var poly_lines = []
    var func_key = {}
    
    var released = true
    
    dg.remember = function(elem, keys) {
        keys && keys.forEach(function(k){func_key[k] = true})
        if (released) {
            orig_caret = cr.getCaret(elem).start
            orig_lines = elem.val().split('\n')
            poly_lines = polygone(elem)
            
            released = false
        }
    }
    
    dg.releaseFuncKey = function(key) {
        if (func_key[key]) {                    // release of one functional key is enough
            func_key = {}
            released = true
        }

    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //    - Shift region in orig_lines marked by poly_lines with a shift of
    //      (row_shift, col_shift)
    //    - if "fill" is presiced, fill the moved region with "fill_char"
    //
    ////////////////////////////////////////////////////////////////////
    
    var shift_region = function(orig_lines, poly_lines, row_shift, col_shift, fill, fill_char) {
        var length_arr = orig_lines.map(function(l){return l.length})
        
        //  calculate correct line length for future text
        
        for (var i = 0; i < poly_lines.length; i++) {
            length_arr[i + row_shift] = Math.max(
                get(length_arr, i + row_shift),
                get(poly_lines, i).length + col_shift)
        }
        
        //  create packed array for new_lines
        
        var new_lines = new Array(length_arr.length)
        
        for (var i = 0; i < length_arr.length; i++)
            new_lines[i] = new Array(length_arr[i] == null ? 0 : length_arr[i])
        
        //  copy orig_lines to new_lines, but leave a hole inside
        
        for (var i = 0; i < orig_lines.length; i++) {
            var line_length = get(orig_lines, i).length
            for (var j = 0; j < line_length; j++) {
                set(new_lines, i, j, get(poly_lines,i,j,null) == null ? orig_lines[i][j] : ' ') 
            }
        }
        
        //  overlay shifted poly_lines on new_lines       
                
        for (var i = 0; i < poly_lines.length; i++) {
            var line_length = get(poly_lines, i).length
            for (var j = 0; j < line_length; j++) {
                var sh_i = row_shift + i
                var sh_j = col_shift + j
                
                if (poly_lines[i][j] != null && sh_i >= 0 && sh_j >= 0) {
                    set(new_lines, sh_i, sh_j, fill ? fill_char : poly_lines[i][j])
                }
            }
        }
        
        //  fill the rest blank of new_lines & output to string
        
        for (var i = 0; i < new_lines.length; i++) {
            var t = ''
            for (var j = 0; j < get(new_lines, i).length; j++) {
                var item = get(new_lines, i, j)
                t += item == null ? ' ' : item
            }
            new_lines[i] = t
        }
        
        return new_lines
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //      Highlighting utilities
    // 
    //    - Highlighting itself is done automatically by .move(elem, direction, xanadu)
    //
    ////////////////////////////////////////////////////////////////////
    
    dg.HIGHLINE_CHAR = '█'
    
    var highlight = false                       //  true:highlighting   false:none
    
    dg.unhighlight = function(xanadu) {
        if (highlight) {
            xanadu.val('')
            xanadu.removeClass('highlight')
            highlight = false
        }
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //    - when xanadu is provided, "move" will also create a 'shadow' of
    //      the selected zone in xanadu
    //    - direction   : 0~3   : left-up-right-down
    //                    4     : still
    //                    -1    : delete
    //
    ////////////////////////////////////////////////////////////////////
    
    dg.move = function(elem, direction, xanadu) {        
        
        if (! poly_lines) return true
        
        var caret = cr.getCaret(elem, caret)
        
        if (caret.start.row != caret.end.row || 
                caret.start.col < caret.end.col - 1)
            return true
        
        if (caret.start.col == 0 && direction == 0 ||
                caret.start.row == 0 && direction == 1)
            return false;
        
        var del = false
        if (direction == -1) {
            direction = 4
            del = true
        }
        
        var row_shift = caret.start.row - orig_caret.row + [0,-1,0,1,0][direction]
        var col_shift = caret.start.col - orig_caret.col + [-1,0,1,0,0][direction]        

        var new_lines = shift_region(
            orig_lines, poly_lines, 
            row_shift, col_shift, 
            del, ' '
        )
        
        elem.val(new_lines.join('\n'))
        cr.setCaret(elem,{start:cr.side(caret.start,direction),end:cr.side(caret.end,direction)})
        
        //  Highlighting
        
        if (xanadu) {
            var highlight_lines = shift_region(
                new Array(orig_lines.length), poly_lines,
                row_shift, col_shift, 
                true, dg.HIGHLINE_CHAR
            )
            xanadu.val(highlight_lines.join('\n'))
            xanadu.addClass('highlight')
            xanadu.scrollTop(elem.scrollTop())
            xanadu.scrollLeft(elem.scrollLeft())
    
            highlight = true
        }
        
        return false        
    }

})(Drag,Caret);