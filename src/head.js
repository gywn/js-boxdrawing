////////////////////////////////////////////////////////////////////////
// 
//    - Full support for dashed/arrow/round-corner character
//      Copyright (c) 2014 Guangyang Wen <guangyang.wen@polytechnique.edu>
//      Released under the MIT license.
// 
//    - Add box drawing capability to textareas.
//      Copyright (c) 2010 Mark Lodato <lodatom@gmail.com>
//      Released under the Expat (aka MIT) license.
// 
//    - getCaret() and setCaret() based on jQuery Caret Range plugin
//      Copyright (c) 2009 Matt Zabriskie
// 
//      TODO
// 
//    - better UI
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
