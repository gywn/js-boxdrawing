var UI = UI ? UI : {};

(function(ui){

    ui.t = {};

    ui.t.updateStyle = function(){};

    ////////////////////////////////////////////////////////////////////
    // 
    //      groupInit
    // 
    //   -  Every option group is link to updatable vrbl
    //   -  Contorls' id convention: "prefix-ctrl_name"
    //   -  Selected control's class convention: "selected-prefix"
    //
    //          Parameters
    //  -------------------------------------------------------------------- 
    //  group   : Option group name
    //  prefix  : Id prefix for controls
    //  vrbl    : Name of expression to set with option value
    //  config  : {
    //              ctrl_name_1: {
    //                  val     : vrbl will be set to this value,
    //                  next    : next ctrl_name to be chosen in loop,
    //                  t       : message sent to ui.t for styling
    //              },
    //              ctrl_name_2: ...
    //            }
    // 
    //          Provide
    //  --------------------------------------------------------------------
    //  ui[group].ctrl(ctrl_name)   : JQuery object of the corresponding control
    //  ui[group].variable          : Name of expression to set with option value
    //  ui[group].previous
    //  ui[group].current
    //  ui[group].next
    // 
    ////////////////////////////////////////////////////////////////////

    ui.LAST_CTRL = -1;

    ui.groupInit = function(group, prefix, vrbl, config) {
        ui[group] = {}
        ui[group].ctrl = function(ctrl_name) {return $("#" + prefix + "-" + ctrl_name)}
        ui[group].variable = vrbl
    
        for (var ctrl_name in config) {
            var prmts = config[ctrl_name]
            var ctrl = ui[group].ctrl(ctrl_name)
        
            if (! ctrl) continue
        
            for (var p in prmts) ctrl.attr(p, prmts[p])
            ctrl.attr('group', group)
        
            ctrl.click(function(evt) {
                var ctrl = $(evt.target)
                var group_name = ctrl.attr('group')
                var next = ctrl.attr("next")
                var group = ui[group_name]
            
                //  configuration "next" == -1 means selecting previous control
            
                group.previous = group.current
                group.current = ctrl
                group.next = next == ui.LAST_CTRL ? group.previous : group.ctrl(next)
            
                group.variable.val = parseInt(ctrl.attr("val"))
            
                $(".selected-" + group_name).toggleClass("selected-" + group_name)
                ctrl.addClass("selected-" + group_name)
            
                ui.t[group_name] = ctrl.attr("t")
                ui.t.updateStyle()              // implementation of updateStyle can be overwritten
                ui.t.focus()
            })
        }
    };

})(UI);

