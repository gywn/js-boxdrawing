var History = History ? History : {};

(function(ht,cr){
    var states = {}
    
    var current = -1

    states.update = function(state, amend) { // amend: rewrite last state
        if (! amend) states.stack.length =  (++current)
        states.stack[current] = state
        if (window.localStorage) {
            window.localStorage.setItem("history", JSON.stringify(states.current()))
        }   
    }

    states.current = function() {
        var state = states.stack[current]
        if (state) {
            return state
        } else {
            if (current >= states.stack.length) current = states.stack.length - 1
            if (current < 0) current = 0
            return false
        }
    }

    ////////////////////////////////////////////////////////////////////
    // 
    //    - init    : initialize history object, read from localStorage if possible
    //    - record  : record change occurred in elem
    //    - resume  : resume the final state recorded by history into elem
    //    - rewind  : rewind to previous history, write it into elem
    //    - redo    : redo canceled actions (if still in history)
    // 
    ////////////////////////////////////////////////////////////////////

    ht.init = function() {
        //  Enable HTML5 localStorage if there is any
        if (window.localStorage) {
            var storage = window.localStorage.getItem('history')
            try {
                var stack = [$.parseJSON(storage)]
            }catch(e){
                var stack = []
            }
        }
        states.stack = (stack[0] && stack[0].text) ? 
            stack : [{text:'',caret:{start:{row:0,col:0},end:{row:0,col:0}}}]
        current = 0
        return true
    }

    ht.record = function(elem) {
        var text = elem.val()
        var caret = cr.getCaret(elem)
        var state = states.current()
        
        if (text.replace(/\s*\n|[\s]*$/g,'') == state.text.replace(/\s*\n|[\s]*$/g,''))
            states.update({text:text, caret:caret}, true)
        else
            states.update({text:text, caret:caret}, false)
    }

    ht.resume = function(elem) {
        if (states.current()) {
            elem.val(states.current().text)
            cr.setCaret(elem, states.current().caret)      
        }
    }

    ht.rewind = function(elem) {
        current --
        ht.resume(elem)
        return false                            // stop propagation anyway
    }
    
    ht.redo = function(elem) {
        current ++
        ht.resume(elem)
        return false                            // stop propagation anyway
    }

})(History, Caret);