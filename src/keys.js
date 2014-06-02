////////////////////////////////////////////////////////////////////////
//
//      Tool for comparing advanced which
// 
//    - key is an array of [which, shiftKey, altKey]
//    - "which" can a closure
// 
////////////////////////////////////////////////////////////////////////

var Keys = Keys ? Keys : {};

(function(ky){
    
    var direction = function(code) {return code > 36 && code < 41}
    var non_functional = function(code){
        //  they are: return, space, alphanumeric and symbol zones
        return code == 13 || code == 32 || code > 47 && code < 112 || code > 145 && code < 229
    }
    
    ky.DIR =         {which: direction, metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.SHIFT_DIR =   {which: direction, metaKey: false, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.META_SHIFT_DIR =    
                    {which: direction, metaKey: true, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.META_SHIFT_BS =    
                    {which: 8, metaKey: true, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.ALT =          {which: 18, metaKey: false, shiftKey: false, ctrlKey:false, altKey:true}
    // ky.CTRL =         {which: 17, metaKey: false, shiftKey: false, ctrlKey:false, altKey:true}
    ky.TAB =          {which: 9,  metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.META_SHIFT =   {metaKey: true,  shiftKey: true, ctrlKey:false, altKey:false}
    ky.META_Z =       {which: 90, metaKey: true,  shiftKey: false, ctrlKey:false, altKey:false}
    ky.META_V =       {which: 86, metaKey: true,  shiftKey: false, ctrlKey:false, altKey:false}
    ky.META_SHIFT_Z = {which: 90, metaKey: true,  shiftKey: true, ctrlKey:false, altKey:false}
    ky.BACKSPACE =    {which: 8, metaKey: false,  shiftKey: false, ctrlKey:false, altKey:false}
    // ky.DELETE =       {which: 46, metaKey: false,  shiftKey: false, ctrlKey:false, altKey:false}
    ky.NON_FUNC =     {which: non_functional, metaKey: false, ctrlKey:false, altKey:false}

    ky.equal = function(evt, key) {
        if (! key) return false
    
        var incr = true
        for (var attr in key) {
            var to_check = evt[attr]
            var checking = key[attr]
            incr = incr && to_check != undefined && 
                (to_check == checking || $.isFunction(checking) && checking(to_check))
        }
        return incr
    }
})(Keys);