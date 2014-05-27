////////////////////////////////////////////////////////////////////////
//
//           xanadu           - the correct transparencity of background
//      ╭───────────────╮       is crucial            
//      │ ┏━━━━━━━━━━━━━┿━┓ 
//      │ ┃      UI.t   ┊ ┃ 
//      │ ┃             ┊ ┃ 
//      │ ┃             ┊ ┃ 
//      ╰─╂┄┄┄┄┄┄┄┄┄┄┄┄┄┘ ┃ 
//        ┗━━━━━━━━━━━━━━━┛ 
//
////////////////////////////////////////////////////////////////////////
  

var Shadow = Shadow ? Shadow : {};

(function(sw, cr){
    
    var dreaming = false
    
    //  Place to store fake overlay layer text
    
    var xanadu
    
    //  A space (non-adjustable) that can be distinguished with \u0020
    
    var space ='\u00A0'        
    
    sw.init = function(x) {
        xanadu = x
        x.val('')
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //    - Write every thing from elem into xanadu
    //    - Clear elem with "space" so that it capture pure input
    //
    //////////////////////////////////////////////////////////////////////  
    
    sw.dream = function(elem) {
        if (xanadu && ! dreaming) {
            var caret = cr.getCaret(elem)
            var text = elem.value
            var lines = text.split('\n')
            for (var i = 0; i < lines.length; i++)
                lines[i] = Array(lines[i].length + 1).join(space)
            
            xanadu.val(text)
            xanadu.scrollTop(elem.scrollTop)
            xanadu.scrollLeft(elem.scrollLeft)
            
            elem.value = lines.join('\n')
            cr.setCaret(elem, caret)
            
            dreaming = true
        }
    }
    
    ////////////////////////////////////////////////////////////////////
    //
    //    - Write xanadu into elem in a way that most of the information
    //      are conserved
    //    - Clear xanadu
    //
    //////////////////////////////////////////////////////////////////////  
    
    sw.wake = function(elem) {
        if (xanadu && dreaming) {
            var caret = cr.getCaret(elem)
            
            elem.value = merge(
                xanadu.val().split("\n"),
                elem.value.split("\n")
            ).join("\n")
            cr.setCaret(elem, caret)
            
            xanadu.val('')
            
            dreaming = false
        }
    }
    
    var merge = function (rl_lines, dm_lines){
        for (var i = 0; i < dm_lines.length; i++){
            var rl = rl_lines[i]
            rl = rl ? rl : []
            
            //  If line is expanded
            
            var dm = dm_lines[i].replace(new RegExp(space + "+$"),'')
            if (dm.length > rl.length)
                rl += Array(dm.length - rl.length + 1).join(' ');   // \u0020 used for non-xanadu text
            
            //  If line is changed
                
            if (! dm.match(new RegExp("^" + space + "*$"))) {
                var new_line = Array(rl.length)
                for (var j = 0; j < rl.length; j++)
                    new_line[j] = dm[j] && dm[j] != space ? dm[j] : rl[j]
                rl = new_line.join('')
            }
            
            rl_lines[i] = rl
        }
        return rl_lines
    }
    
})(Shadow, Caret);