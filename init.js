$(document).ready(function() {
    
    UI.t = $('#thearea')
    
    UI.t.updateStyle = function() {
        if (UI.t.mode == 'erase')
            UI.t.attr('class', 'erase')
        else if (UI.t.mode == 'nothing')
            UI.t.attr('class','')
        else if (UI.t.arrow == 'yes')
            UI.t.attr('class', 'arrow')
        else
            UI.t.attr('class', 'draw')
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
    
    //  Listen to keydown of #thearea
    
    UI.t.keydown(function(evt) {
        
        //  Save state 
           
        History.record(UI.t[0])
        
        //  Draw character

        var rel = [
           {key: Keys.SHIFT_LEFT,   direction: Draw.LEFT,     draw: true},
           {key: Keys.SHIFT_UP,     direction: Draw.UP,       draw: true},
           {key: Keys.SHIFT_RIGHT,  direction: Draw.RIGHT,    draw: true},
           {key: Keys.SHIFT_DOWN,   direction: Draw.DOWN,     draw: true},
           {key: Keys.LEFT,         direction: Draw.LEFT},
           {key: Keys.UP,           direction: Draw.UP},
           {key: Keys.RIGHT,        direction: Draw.RIGHT},
           {key: Keys.DOWN,         direction: Draw.DOWN},
        ]

        for (var i = 0; i < rel.length; i++) {
            if (Keys.equal(evt, rel[i].key)) {
                Draw.extendArea(UI.t[0], rel[i].direction)
                History.record(UI.t[0], true)
                //   if Drawbox.draw succeed, thant block event propagation.
                if (rel[i].draw && Draw.style.val != Draw.NOTHING)
                    return Draw.move(UI.t[0], rel[i].direction)                 
            }
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
        
        return true
    });
    
    $(window).unload(function(evt){
        History.record(UI.t[0])                 // save the last state (to localStorage) on unloading
    })
    
});
