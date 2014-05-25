////////////////////////////////////////////////////////////////////////
//
//      Tool for comparing advanced keyCode
// 
//    - key is an array of [keyCode, shiftKey, altKey]
// 
////////////////////////////////////////////////////////////////////////

var Keys = Keys ? Keys : {};

(function(ky){
    
    
    
    ky.LEFT =         {keyCode: 37, metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.UP =           {keyCode: 38, metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.RIGHT =        {keyCode: 39, metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.DOWN =         {keyCode: 40, metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.SHIFT_LEFT =    {keyCode: 37, metaKey: false, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.SHIFT_UP =      {keyCode: 38, metaKey: false, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.SHIFT_RIGHT =   {keyCode: 39, metaKey: false, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.SHIFT_DOWN =    {keyCode: 40, metaKey: false, shiftKey: true,  ctrlKey:false, altKey:false}
    ky.ALT =          {keyCode: 18, metaKey: false, shiftKey: false, ctrlKey:false, altKey:true}
    ky.TAB =          {keyCode: 9,  metaKey: false, shiftKey: false, ctrlKey:false, altKey:false}
    ky.META_Z =         {keyCode: 90, metaKey: true,  shiftKey: false, ctrlKey:false, altKey:false}

    ky.equal = function(evt, key) {
        if (! key) return false
    
        var incr = true
        for (var attr in key) {
            incr = incr && evt[attr] !== undefined && evt[attr] == key[attr]
        }
        return incr
    }
})(Keys);