$(document).ready(function() {
    
    UI.t = $('#thearea')
    UI.x = $('#shadow')
        
    UI.updateStyle = function() {
        var scenery = $("#t-wrapper")
        if (UI.t.mode == 'erase')
            scenery.attr('class', 'erase')
        else if (UI.t.mode == 'nothing')
            scenery.attr('class','')
        else if (UI.t.arrow == 'yes')
            scenery.attr('class', 'arrow')
        else
            scenery.attr('class', 'draw')
    };
    
    UI.groupInit('mode','mode',Draw.style,{
        regular :   {val:Draw.REGULAR, next:'erase', t:''},
        bold :      {val:Draw.BOLD, next:'erase', t:''},
        "double" :    {val:Draw.DOUBLE, next:'erase', t:''},
        erase :     {val:Draw.BLANK, next: UI.LAST_CTRL, t:'erase'},
        nothing:    {val:Draw.NOTHING, next:'nothing', t:'nothing'}
    })
    
    UI.groupInit('heart','heart',Draw.heart,{
        plain :     {val:Draw.PLAIN, next:'round', t:''},
        round :     {val:Draw.ROUND, next:'dashed', t:''},
        dashed :    {val:Draw.DASHED, next:'plain', t:''}
    })
    
    UI.groupInit('arrow','arrow',Draw.arrow,{
        yes :   {val:Draw.ARROW, next:'no', t:'yes'},
        no :    {val:Draw.NO_ARROW, next: 'yes', t:''},
    })
    
    UI.mode.ctrl('regular').click()
    UI.heart.ctrl('round').click()
    UI.arrow.ctrl('no').click()
    
    History.init() && History.resume(UI.t[0])
    
    UI.t.attr('spellcheck',false)
    UI.x.attr('spellcheck',false)
        
    //  Enable Shadow
    
    Shadow.init(UI.x)
    
    //  Listen to keydown of #thearea
    
    UI.t.keydown(function(evt) {
        
        //  Save state 
           
        History.record(UI.t[0])
        
        //  Caret moving
        if (Keys.equal(evt, Keys.DIR) || Keys.equal(evt, Keys.SHIFT_DIR))
            Draw.extendArea(UI.t[0], evt.which - 37)
        
        //  Draw character

        if (Keys.equal(evt, Keys.SHIFT_DIR) && Draw.style.val != Draw.NOTHING)
            return Draw.move(UI.t[0], evt.which - 37)                 
        
        // Backspacing
        
        if (Keys.equal(evt, Keys.BACKSPACE) && Draw.style.val != Draw.NOTHING) {
            return Draw.backspace(UI.t[0])
        }
        
        //  Highline continuous zone
        
        if (Keys.equal(evt, Keys.META_SHIFT)) {
            // $('#debug').html(JSON.stringify((new Date()).getTime()))
            Drag.remember(UI.t[0],[16,91])
            Drag.move(UI.t[0], 4, UI.x)
        }
        
        //  Move continuous zone
        if (Keys.equal(evt, Keys.META_SHIFT_DIR)) {
            return Drag.move(UI.t[0], evt.which - 37, UI.x)
        }
        
        //  Delete continuous zone
        
        if (Keys.equal(evt, Keys.META_SHIFT_BS)) {
            Drag.unhighlight(UI.x)
            return Drag.move(UI.t[0], -1)       // no more highlight
        }
        
        //  Switch arrow
        
        if (Keys.equal(evt, Keys.ALT)) UI.arrow.next.click()
    
        //  Switch mode (style/end_type)
        
        if (Keys.equal(evt, Keys.TAB)) {
            UI.mode.next.click()
            return false
        }
        
        //  Undo
        
        if (Keys.equal(evt, Keys.META_Z))
            return History.rewind(UI.t[0])
            
        //  Dream region 
        
        if ((Keys.equal(evt, Keys.NON_FUNC) || Keys.equal(evt, Keys.META_V)) && Draw.style.val != Draw.NOTHING)
            Shadow.dream(UI.t[0])
        
        return true
    });
    
    UI.t.keyup(function(evt){        
        Shadow.wake(UI.t[0])    
        Drag.releaseFuncKey(evt.which)
        Drag.unhighlight(UI.x)
    })
        
    $(window).unload(function(evt){
        History.record(UI.t[0])                 // save the last state (to localStorage) on unloading
    });
    
});
