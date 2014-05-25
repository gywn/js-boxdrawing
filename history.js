var History = History ? History : {};

(function(ht,cr){
    ht.states = {}
    
    

    ht.states.update = function(state) {
        ht.states.stack.unshift(state)
        if (window.localStorage) {
            window.localStorage.setItem("history", JSON.stringify(ht.states.current()))
        }   
    }

    ht.states.current = function() {
        var state = ht.states.stack[0]
        return state ? state : false
    }

    ht.states.deleteCurrent = function() {
        var last = ht.states.stack.shift()
        if (window.localStorage) 
            window.localStorage.setItem('history', JSON.stringify(last))
        return ht.states.current()
    }

    ////////////////////////////////////////////////////////////////////
    // 
    //    - init    : initialize history object, read from localStorage if possible
    //    - record  : record change occurred in elem
    //    - resume  : resume the final state recorded by history into elem
    //    - rewind  : rewind to previous history, write it into elem
    // 
    ////////////////////////////////////////////////////////////////////

    ht.init = function() {
        //  Enable HTML5 localStorage if there is any
        if (window.localStorage) {
            var storage = window.localStorage.getItem('history')
            try {
                var stack = [$.parseJSON(storage)]
            }catch(e){
                var stack = undefined
            }
        }
        if (stack) {
            ht.states.stack = stack
            return true
        } else {
            ht.states.stack = []
            return false
        }
    }

    ht.record = function(elem, overwrite) {
        var states = ht.states
        var text = elem.value

        //  overwrite: overwrite the most recent state
        if (overwrite || (states.current().text == text))
            states.deleteCurrent()
        states.update({text: text, caret: cr.getCaret(elem)})
    }

    ht.resume = function(elem) {
        var states = ht.states
        if (states.current()) {
            elem.value = states.current().text
            cr.setCaret(elem, states.current().caret)      
        }
    }

    ht.rewind = function(elem) {
        var states = ht.states
        var text = elem.value
        while (states.current() && states.current().text == text)
            states.deleteCurrent()
        ht.resume(elem)
        return false                                // stop propagation anyway
    }
})(History, Caret);