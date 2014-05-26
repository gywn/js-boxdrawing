var History = History ? History : {};

(function(ht,cr){
    var states = {}

    states.update = function(state) {
        states.stack.unshift(state)
        if (window.localStorage) {
            window.localStorage.setItem("history", JSON.stringify(states.current()))
        }   
    }

    states.current = function() {
        var state = states.stack[0]
        return state ? state : false
    }

    states.deleteCurrent = function() {
        var last = states.stack.shift()
        if (window.localStorage) 
            window.localStorage.setItem('history', JSON.stringify(last))
        return states.current()
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
            states.stack = stack
            return true
        } else {
            states.stack = []
            return false
        }
    }

    ht.record = function(elem, overwrite) {
        var text = elem.value

        //  overwrite: overwrite the most recent state
        if (overwrite || (states.current().text == text))
            states.deleteCurrent()
        states.update({text: text, caret: cr.getCaret(elem)})
    }

    ht.resume = function(elem) {
        if (states.current()) {
            elem.value = states.current().text
            cr.setCaret(elem, states.current().caret)      
        }
    }

    ht.rewind = function(elem) {
        var text = elem.value
        while (states.current() && states.current().text == text)
            states.deleteCurrent()
        ht.resume(elem)
        return false                                // stop propagation anyway
    }
})(History, Caret);