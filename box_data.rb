########################################################################
#
#     Javascript Data for Box Drawing Characters
#
#         E       - E : Endpoint Type : regular, bold, double, blank...
#     ┌───┴───┐   - H : Heart Type : arrow(RDLU), round-corner, dashed...
#     │       │
#   E╶┤   H   ├╴E
#     │       │                                              E1
#     └───┬───┘                                           ┌───┴───┐
#         E                                               │   ?   │
#                                                      E4╶┤?  ? E2├╴E2
#           - One of the edge's end type is imposed.      │   ?   │
#             we find out the other 4 "?" by minimizing   └───┬───┘
#             "end-type-difference" across all available     E3
#             glyphs.
#           - There is an imposed heart type to encourage glyph with
#             such heart type to be chosen.
#           - Also take into account the symmetry of glyph VS boundary.
#
# ----------------------------------------------------------------------
#
#     Index
#
#     A. Prepare data
#     B. Output to Javascript File
#
########################################################################



########################################################################
#
#     A. Prepare data
#
########################################################################

#   Font : Menlo or Courrier
#     - Menlo correctly implements round/dashed/bold/double characters

FONT = 'Menlo'

#   Direction

LEFT = 0
UP = 1
RIGHT = 2
DOWN = 3

#   Endpoint type

BLANK = 0
REGULAR = 1
BOLD = 2
DOUBLE = 3

END_TYPE_COUNT = 4 if FONT == 'Menlo'
END_TYPE_COUNT = 2 if FONT == 'Courrier'

#   Heart type

PLAIN = 0
ROUND = 1
DASHED = 2
ARROW = 3

HEART_TYPE_COUNT = 3 if FONT == 'Menlo'         # arrows participate in sorting, but not in outputing
HEART_TYPE_COUNT = 1 if FONT == 'Courrier'      # ...

require_relative 'glyphs'                       # imported AFTER constants are defined...
Glyphs.select!{|glyph,e_left,e_up,e_right,e_down,hrt,fonts|
  fonts.include? FONT
}



#   Some scale to handle penalities

s = 1
m = 3 * s                                       # > 2 to avoid two s(mall) compensate one h(arge)
h = 3 * m                                       # > 2 * 2
l = 3 * h                                       # level : level constructs priorities in compaison

########################################################################
#
#     Point-wise end point difference
#
#   - everything to itself                : small difference
#   - line (regular/bold/double) to line  : midium difference
#   - otherwise                           : huge difference
#
########################################################################

end_type_diff = proc {|end_1,end_2|
  case [end_1,end_2]
  when [BLANK,BLANK] then s
  when [BLANK,REGULAR] then h
  when [BLANK,BOLD] then h
  when [BLANK,DOUBLE] then h
  when [REGULAR,BLANK] then h
  when [REGULAR,REGULAR] then s
  when [REGULAR,BOLD] then m
  when [REGULAR,DOUBLE] then m
  when [BOLD,BLANK] then h
  when [BOLD,REGULAR] then m
  when [BOLD,BOLD] then s
  when [BOLD,DOUBLE] then m
  when [DOUBLE,BLANK] then h
  when [DOUBLE,REGULAR] then m
  when [DOUBLE,BOLD] then m
  when [DOUBLE,DOUBLE] then s
  end
}

########################################################################
#
#     Symmetry type
#
#   - In total 7 symmetries for a square
#   - superior_symmetry returns all symmetries matching the current,
#     result[0] must have the lowest symmetry
#
#     FULL_SYMM╶──┬─► PERIODIC_SYMM╶──┬─► HORIZONTAL_SYMM╶──┬─► UNKNOWN_SYMM
#                 ├─► POS_DIAG_SYMM╶─┐└─► VERTICAL_SYMM╶────┤
#                 └─► NEG_DIAG_SYMM╶─┴──►───────────────────┘
#
#     ───╴is╶──►
#
########################################################################

UNKNOWN_SYMM = 0
HORIZONTAL_SYMM = 1                             # axe: Y-axe
VERTICAL_SYMM = 2                               # axe: X-axe
PERIODIC_SYMM = 3                               # axe: X-axe and Y-axe
POS_DIAG_SYMM = 4                            # axe: (1,1) vector
NEG_DIAG_SYMM = 5                            # axe: (1,-1) vector
FULL_SYMM = 6                                   # all 4 edge equal

superior_symmetry = proc{|end_left,end_up,end_right,end_down|
  if end_left == end_up && end_up == end_right && end_right == end_down
    [FULL_SYMM]
  elsif end_left == end_up && end_right == end_down
    [NEG_DIAG_SYMM, FULL_SYMM]
  elsif end_left == end_down && end_right == end_up
    [POS_DIAG_SYMM, FULL_SYMM]
  elsif end_left == end_right && end_down == end_up
    [PERIODIC_SYMM, FULL_SYMM]
  elsif end_down == end_up
    [VERTICAL_SYMM, PERIODIC_SYMM, FULL_SYMM]
  elsif end_left == end_right
    [HORIZONTAL_SYMM, PERIODIC_SYMM, FULL_SYMM]
  else
    [
      UNKNOWN_SYMM, HORIZONTAL_SYMM, VERTICAL_SYMM, PERIODIC_SYMM,
      POS_DIAG_SYMM, NEG_DIAG_SYMM, FULL_SYMM
    ]
  end
}

########################################################################
#
#     Sort glyph according to given boundary/heart condition
#
########################################################################

best_glyph = proc{|fixed_edge,heart,end_left,end_up,end_right,end_down|
  Glyphs.min_by{|glyph,e_left,e_up,e_right,e_down,hrt,fonts|

    ext_edges = [end_left,end_up,end_right,end_down]
    int_edges = [e_left,e_up,e_right,e_down]

    #   - End types must be matched on the fixed edge
    #   - Symmetry of glyph and the boundary conditions must mathch each other

    if (ext_edges[fixed_edge] != int_edges[fixed_edge]) ||
        (! superior_symmetry[ext_edges].include? superior_symmetry[int_edges][0])
      next Float::INFINITY
    end

    #   Calculate sum of node-wise differences

    diff = (0..3).inject(0){|sum, i|
      sum + end_type_diff[ext_edges[i], int_edges[i]]
    }

    case hrt
    when heart then                             # if imposed heart is the same as considered glyph, down downgrade it.
    when PLAIN then diff = diff + s             # it's also important that OTHER_HEART > PLAIN > MATCHED_HEART
    else diff = diff + m                        # penalize all others
    end

    diff
  }[0]                                          # only return glyph itself
}

########################################################################
#
#     Find best arrow
# 
#     Arrows  : [[glyph, end_type, from_which_direction], ...]
#
########################################################################

Arrows = Glyphs
.select{|glyph,e_left,e_up,e_right,e_down,hrt|
  hrt == ARROW
}.map{|glyph,e_left,e_up,e_right,e_down|
  e_ts = [e_left,e_up,e_right,e_down]
  [
    glyph,
    e_ts.select{|e| e != BLANK}[0],
    (0..e_ts.size - 1).select{|i| e_ts[i] != BLANK}[0]
  ]
}

best_arrow = proc {|direction,end_type|
  arrows = Arrows.select{|glyph,e_t,d|
    e_t == end_type && d == direction
  }
  if arrows.length == 0                         # if no arrow is provided, try to search in normal glyphs
    best_glyph[
      direction,
      PLAIN,
      [end_type,BLANK,BLANK,BLANK][direction],
      [BLANK,end_type,BLANK,BLANK][direction],
      [BLANK,BLANK,end_type,BLANK][direction],
      [BLANK,BLANK,BLANK,end_type][direction],
    ]
  else
    arrows[0][0]
  end
}

########################################################################
#
#     B. Output to Javascript File
#
#   - dictionary version of Glyphs in ruby
#   - flatten version of best_glyph in ruby
#   - size ~12K
#
########################################################################

printf(<<JAVASCRIPT)
// Generated by box_data.rb

Draw.HeartCount = #{HEART_TYPE_COUNT}
Draw.StyleCount = #{END_TYPE_COUNT}

////////////////////////////////////////////////////////////////////////
//
//      Draw.GlyphEndType
//
//    - with item "glyph : str" where
//        + str[0~3] == end_type
//        + str[4] == heart_type
//
////////////////////////////////////////////////////////////////////////

JAVASCRIPT

print("Draw.GlyphEndType = {\n")
i = 0
Glyphs.each{|glyph,end_left,end_up,end_right,end_down,hrt|

  printf("'%s'\:'%s%s%s%s',",glyph,end_left,end_up,end_right,end_down)

  #   break line if too long

  i += 1
  if i == 8
    i = 0
    puts
  end

}
print("}\n")

printf(<<JAVASCRIPT)

////////////////////////////////////////////////////////////////////////
//
//      Draw.BestGlyph
//
//    - flatten version of row-major array
//
//      arr[
//          heart       : Draw.HeartCount
//          fixed_edge  : 4
//          end_left    : Draw.StyleCount
//          end_up      : ...
//          end_right   : ...
//          end_down    : ...
//      ]
//
////////////////////////////////////////////////////////////////////////

JAVASCRIPT

printf("Draw.BestGlyph = \n\"")
i = 0
(0..HEART_TYPE_COUNT - 1).each{|heart|
(0..3).each{|fixed_edge|
(0..END_TYPE_COUNT - 1).each{|end_left|
(0..END_TYPE_COUNT - 1).each{|end_up|
(0..END_TYPE_COUNT - 1).each{|end_right|
(0..END_TYPE_COUNT - 1).each{|end_down|

  printf(best_glyph[fixed_edge,heart,end_left,end_up,end_right,end_down])

  #   break line if too long

  i += 1
  if i == 128
    i = 0
    printf("\" + \n\"")
  end

}}}}}}
printf("\"\n")

printf(<<JAVASCRIPT)

////////////////////////////////////////////////////////////////////////
//
//      Draw.BestArrow
//
//    - flatten version of row-major array
//
//      arr[
//          direction : 4
//          end_type  : Draw.StyleCount
//      ]
//
////////////////////////////////////////////////////////////////////////

JAVASCRIPT

printf("Draw.BestArrow = [")
(0..3).each {|direction|
  printf("[")
  (0..3).each {|end_type|
    printf("'%s',",best_arrow[direction,end_type])
  }
  print("],")
}
printf("]\n")
