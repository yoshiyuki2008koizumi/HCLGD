export const ixDB_ORG = {
  apInfo: {
    "id": 0,
    "ver": "１",
    "tagetName": "sd",
    "extInfo": ""
  },
  prototype: {
    "id": 0,
    "base": {
      "order": [
        "mw", "hs", "vs"
      ],
      "mw": [
        ["重量 (g)、　翼面荷重(g/dm^2)", ""        , ""         , "矩形翼"        ],
        [""                            , "weight_i", "loading_i", "rect_pd"       ],
        ["主翼 参考面積(mm^2)、　％"   , ""        , ""         , ""              ],
        [""                            , "area_io" , "ariap_i"  , ""              ],
        ["アスペクト比(n=翼根：1=翼端)", ""        , ""         , "n=翼根：1=翼端"],
        [""                            , "aspect_i", ""         , ""              ],
        ["面積(dm^2)"                  , ""        , ""         , "面積 優先"     ],
        [""                            , "area_i"  , ""         , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""        , ""         , "翼幅/翼弦 優先"],
        [""                            , "hspan_i" , "chord_i"  , "span_pd"       ],
        ["テーパー比"                  , ""        , ""         , ""              ],
        [""                            , "taper_i" , ""         , ""              ],
        ["後退角"                      , ""        , ""         , "後退角(0度)"   ],
        [""                            , "sweep_i" , ""         , "sweep_pd"      ]
      ],
      "hs": [
        ["水平尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             ],
        [""                             , "area_io" , "ariap_i", ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , "n=翼根：1=翼端"],
        [""                             , "aspect_i", ""       , ""              ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     ],
        [""                             , "area_i"  , ""       , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先"],
        [""                             , "hspan_i" , "chord_i", "span_pd"       ],
        ["テーパー比"                   , ""        , ""       , ""              ],
        [""                             , "taper_i" , ""       , ""              ],
        ["後退角"                       , ""        , ""       , "後退角(0度)"   ],
        [""                             , "sweep_i" , ""       , "sweep_pd"      ]
      ],
      "vs": [
        ["垂直尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             ],
        [""                             , "area_io" , "ariap_i", ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , "n=翼根：1=翼端"],
        [""                             , "aspect_i", ""       , ""              ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     ],
        [""                             , "area_i"  , ""       , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先"],
        [""                             , "hspan_i" , "chord_i", "span_pd"       ],
        ["テーパー比"                   , ""        , ""       , ""              ],
        [""                             , "taper_i" , ""       , ""              ],
        ["後退角"                       , ""        , ""       , "後退角(0度)"   ],
        [""                             , "sweep_i" , ""       , "sweep_pd"      ]
      ]
    },
    "val": {
      "base": {
        "mw": {
          "loading_i": 10,
          "weight_i": 7,
          "loading_i_def": 1,
          "weight_i_def": 1,
          "area_io": "",
          "ariap_i": 100,
          "ariap_i_def": 5,
          "aspect_i": 5,
          "aspect_i_def": 0.1,
          "area_i": "",
          "area_i_def": 100,
          "hspan_i": "",
          "chord_i": "",
          "hspan_i_def": 10,
          "chord_i_def": 10,
          "taper_i": "",
          "taper_i_def": 0.2,
          "sweep_i": "",
          "sweep_i_def": 2,
          "area_o": "",
          "span_o": "",
          "chord_o": "",
          "rootChord_o": "",
          "tipCord_o": "",
          "tipDiff_o": "",
          "sweepDiff_o": ""
        },
        "hs": {
          "area_io": "",
          "ariap_i": 30,
          "ariap_i_def": 5,
          "aspect_i": 3,
          "aspect_i_def": 0.1,
          "area_i": "",
          "area_i_def": 100,
          "hspan_i": "",
          "chord_i": "",
          "hspan_i_def": 0.1,
          "chord_i_def": 0.1,
          "taper_i": "",
          "taper_i_def": 0.2,
          "sweep_i": "",
          "sweep_i_def": 2,
          "area_o": "",
          "span_o": "",
          "chord_o": "",
          "rootChord_o": "",
          "tipCord_o": "",
          "tipDiff_o": "",
          "sweepDiff_o": ""
        },
        "vs": {
          "area_io": "",
          "ariap_i": 10,
          "ariap_i_def": 5,
          "aspect_i": 5,
          "aspect_i_def": 0.1,
          "area_i": "",
          "area_i_def": 100,
          "hspan_i": "",
          "chord_i": "",
          "hspan_i_def": 0.1,
          "chord_i_def": 0.1,
          "taper_i": "",
          "taper_i_def": 0.2,
          "sweep_i": "",
          "sweep_i_def": 2,
          "area_o": "",
          "span_o": "",
          "chord_o": "",
          "rootChord_o": "",
          "tipCord_o": "",
          "tipDiff_o": "",
          "sweepDiff_o": ""
        }
      }
    }
  },
  base: {
    "id": 0
  },
  baseList: {
    "id": 0,
    "exc": "aa",
    "apList": [
      
    ]
  }
}; 

// end of file