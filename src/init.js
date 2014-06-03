////////////////////////////////////////////////////////////////////////
//
//                 ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐                                  
//                 ┊   ┏━━━━━━┓   ┊               ╺━━━━╸provoke╺━━━▶  
//            ┏━━━━┿━━━┫ Drag ┣━━━┿━━━━┓                              
//            ┃    ┊   ┗━━━┯━━┛   ┊    ┃                              
//            ┃    ┊      UI.x╶───┼─┐  ┃                              
//            ┃    ┊  ┏━━━━┷━━━┓  ┊ │  ┃  ┌──────╴UI.t                
//          ┏━╋━━━━┿━━┫ Shadow ┣━━┿━┿━━╋━┓│                           
//          ┃ ┃    ┊  ┗━━━━━━━━┛  ┊ │  ┃ ┃│                           
//      ┏━━━▼━▼━┓  ┊   ┏━━━━━━┳━━━┿━┿▶┏▼━▼┷┓     ┏━━━━━━┓             
//      ┃ Caret ┃◀━┿━━━┫ Draw ┃   ┊ └─┨ UI ┣━━━━▶┃ Keys ┃             
//      ┗━━━▲━━━┛  ┊   ┗━━━━━━┛◀━━┿━┯━┻▲━▲━┛     ┗━━━━━━┛             
//          ┃      ┊ ┏━━━━━━━━━┓  ┊ │  ┃ ┃                            
//          ┗━━━━━━┿━┫ History ┣━━┿━┿━━┛ ┃                                     
//                 ┊ ┗━━━━━━━━━┛  ┊ └────╂────╴Draw.style & Draw.heart        
//                 ┊              ┊      ┃                            
//                 ┊bound to events   handlers(HTML)                  
//                 └┄┄┄┄┄┄▲┄┄┄┄┄┄┄┘      ┃                            
//                      ┏━┻━━━━━━━━━━━━━━┻┓                           
//                      ┃      init       ┃                          
//                      ┗━━━━━━━━━━━━━━━━━┛ 
//
////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
    
    UI.t = $('#thearea')
    UI.x = $('#shadow')
    
    var resize = function () {
        UI.t.height($(window).height() - UI.t.offset().top)
        UI.x.height($(window).height() - UI.x.offset().top)
    };
    
    resize();
        
    UI.updateStyle = function() {
        var scenery = $("body")
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
    
    History.init() && History.resume(UI.t)
    
    UI.t.attr('spellcheck',false)
    UI.x.attr('spellcheck',false)
        
    //  Enable Shadow
    
    Shadow.init(UI.x)
    
    //  Listen to keydown of #thearea
    
    UI.t.keydown(function(evt) {
        
        //  Save state 
           
        
        
        //  Caret moving
        if (Keys.equal(evt, Keys.DIR) || Keys.equal(evt, Keys.SHIFT_DIR)) {
            Draw.extendArea(UI.t, evt.which - 37)
            
            //  Draw character

            if (Keys.equal(evt, Keys.SHIFT_DIR) && Draw.style.val != Draw.NOTHING)
                return Draw.move(UI.t, evt.which - 37)   
                
            return true
        }              
        
        // Backspacing
        
        if (Keys.equal(evt, Keys.BACKSPACE) && Draw.style.val != Draw.NOTHING) {
            return Draw.backspace(UI.t)
        }
        
        //  Highline continuous zone
        
        if (Keys.equal(evt, Keys.META_SHIFT)) {
            // $('#debug').html(JSON.stringify((new Date()).getTime()))
            Drag.remember(UI.t, [16, 91])       // keyCode for META + SHIFT
            Drag.move(UI.t, 4, UI.x)
            
            //  Move continuous zone
            
            if (Keys.equal(evt, Keys.META_SHIFT_DIR)) {
                return Drag.move(UI.t, evt.which - 37, UI.x)
            }
        
            //  Delete continuous zone
        
            if (Keys.equal(evt, Keys.META_SHIFT_BS)) {
                Drag.unhighlight(UI.x)
                return Drag.move(UI.t, -1)       // no more highlight
            }
            
            //  Redo
            
            if (Keys.equal(evt, Keys.META_SHIFT_Z)) {
                Drag.unhighlight(UI.x)
                return History.redo(UI.t)
            }
            
            
            return true
        }
                
        //  Switch arrow
        
        if (Keys.equal(evt, Keys.ALT)) {
            UI.arrow.next.click()
            return true
        }
    
        //  Switch mode (style/end_type)
        
        if (Keys.equal(evt, Keys.TAB)) {
            UI.mode.next.click()
            return false
        }
        
        //  Undo
        
        if (Keys.equal(evt, Keys.META_Z))
            return History.rewind(UI.t)
            
        //  Dream region 
        
        if ((Keys.equal(evt, Keys.NON_FUNC) || Keys.equal(evt, Keys.META_V)) && Draw.style.val != Draw.NOTHING)
            Shadow.dream(UI.t)
        
        return true
    });
    
    UI.t.keyup(function(evt){     
        // $("#debug").html((new Date()).getTime())   
        Shadow.wake(UI.t)                       // Shadow.dream ->
        Drag.releaseFuncKey(evt.which)          // Drag.move ->
        Drag.unhighlight(UI.x)                  // Keys.META_SHIFT ->
        History.record(UI.t)                    
    })
       
    $(window).resize(function(){
        resize();
    })   
        
    $(window).unload(function(evt){
        History.record(UI.t)                 // save the last state (to localStorage) on unloading
    });
    
});
