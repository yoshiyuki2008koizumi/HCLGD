export const ixDB_ORG = {
  common: {
    "id": 0,
    "tagetName": "sd",
    "extInfo": ""
  },
  target: {
    "id": 0,
    "exc": "aa",
    "apList": [
      
    ]
  },
  dataID: {
    "id": 0,
    "dataIDx": {
      "mw_rect": [
        "mw_rect_i", "mw_rect_o", "hs_rect_i", "hs_rect_o", "vs_rect_i", "vs_rect_o"
      ],
      "mw_rect_XX": [
        "mw_rect_i", "mw_rect_o", "area_pd", "span_pd", "linePens"
      ],
      "mw_rect_A": [
        "mw_rect_i", "mw_rect_o", "mw_etc", "mw_etc2"
      ],
      "mw_rect_S": [
        "mw_rect_i", "aaa", "", "dddd", "cccc", "bbbb"
      ],
      "mw_rect_1": "mw_etc",
      "mw_rect_2": "mw_etc2",
      "hs_rect": [
        "hs_rect_i", "hs_rect_o", "area_pd", "span_pd"
      ],
      "base": [
        "mw_rect_i", "mw_rect_o", "hs_rect_i", "hs_rect_o", "vs_rect_i", "vs_rect_o"
      ]
    }
  },
  design: {
    "id": 0,
    "ret": "design",
    "new_design": {
      "dataId": "base",
      "targetName": "sd",
      "mw_rect_i": [
        ["重量 (g)、　翼面荷重(g/dm^2)", 10      , 10      , "面積=翼面荷重/重量", ""              , ""      , "loading_i", "weight_i", ""       , "rect_pd", "0x16"  , 3       , 1       ],
        ["主翼 参考面積(mm^2)、　％"   , ""      , ""      , 100                 , ""              , ""      , "area_io"  , "ariap_i" , ""       , ""       , "0x14"  , 1       , ""      ],
        ["アスペクト比(n=翼根：1=翼端)", 5       , 1       , "n=翼根：1=翼端"    , ""              , ""      , "aspect_i" , ""        , ""       , ""       , "0x14"  , 0.2     , ""      ],
        ["面積(dm^2)"                  , ""      , ""      , ""                  , "面積 優先"     , ""      , ""         , "area_i"  , ""       , "area_pd", "0x15"  , 500     , 1       ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""      , ""      , ""                  , "翼幅/翼弦 優先", ""      , ""         , "span_i"  , "chord_i", "span_pd", "0x17"  , 3       , 1       ]
      ],
      "hs_rect_i": [
        ["水平尾翼 参考面積(mm^2)、　％", ""      , ""      , 25              , ""              , ""      , "area_io" , "ariap_i", ""       , ""       , "0x13"   , 0.3     , ""      ],
        ["アスペクト比(n=翼根：1=翼端)" , 4       , 1       , "n=翼根：1=翼端", ""              , ""      , "aspect_i", ""       , ""       , ""       , "0x11"   , 0.2     , ""      ],
        ["面積(dm^2)"                   , ""      , ""      , ""              , "面積 優先"     , ""      , ""        , "area_i" , ""       , ""       , "area_pd", "0x15"  , 100     ],
        ["翼幅 (mm)、　翼弦 (mm)"       , ""      , ""      , ""              , "翼幅/翼弦 優先", ""      , ""        , "span_i" , "chord_i", "span_pd", "0x17"   , 3       , 1       ]
      ],
      "vs_rect_i": [
        ["垂直尾翼 参考面積(mm^2)、　％", ""      , ""      , 30              , ""              , ""      , "area_io" , "ariap_i", ""       , ""       , "0x11"   , 0.3     , ""      ],
        ["アスペクト比(n=翼根：1=翼端)" , 3       , 1       , "n=翼根：1=翼端", ""              , ""      , "aspect_i", ""       , ""       , ""       , "0x11"   , 0.2     , ""      ],
        ["面積(dm^2)"                   , ""      , ""      , ""              , "面積 優先"     , ""      , ""        , "area_i" , ""       , ""       , "area_pd", "0x15"  , 50      ],
        ["翼幅 (mm)、　翼弦 (mm)"       , ""      , ""      , ""              , "翼幅/翼弦 優先", ""      , ""        , "span_i" , "chord_i", "span_pd", "0x17"   , 3       , 1       ]
      ]
    }
  },
  newBase: {
    "id": 0,
    "base": {
      "order": [
        "mw", "hs", "vs"
      ],
      "mw": [
        ["重量 (g)、　翼面荷重(g/dm^2)", ""         , ""        , "矩形翼"        ],
        [""                            , "loading_i", "weight_i", "rect_pd"       ],
        ["主翼 参考面積(mm^2)、　％"   , ""         , ""        , ""              ],
        [""                            , "area_io"  , "ariap_i" , ""              ],
        ["アスペクト比(n=翼根：1=翼端)", ""         , ""        , "n=翼根：1=翼端"],
        [""                            , "aspect_i" , ""        , ""              ],
        ["面積(dm^2)"                  , ""         , ""        , "面積 優先"     ],
        [""                            , "area_i"   , ""        , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""         , ""        , "翼幅/翼弦 優先"],
        [""                            , "span_i"   , "chord_i" , "span_pd"       ],
        ["テーパー比"                  , ""         , ""        , ""              ],
        [""                            , "taper_i"  , ""        , ""              ],
        ["後退角"                      , ""         , ""        , "後退角(0度)"   ],
        [""                            , "sweep_i"  , ""        , "sweep_pd"      ],
        ["翼面積(dm^2)"                , ""         , ""        , ""              ],
        [""                            , "area_o"   , ""        , ""              ],
        ["アスペクト比(n=翼根：1=翼端)", ""         , ""        , "n=翼根：1=翼端"],
        [""                            , "aspect_o" , ""        , ""              ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""         , ""        , ""              ],
        [""                            , "span_o"   , "chord_o" , ""              ]
      ],
      "hs": [
        ["水平尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             ],
        [""                             , "area_io" , "ariap_i", ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , "n=翼根：1=翼端"],
        [""                             , "aspect_i", ""       , ""              ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     ],
        [""                             , "area_i"  , ""       , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先"],
        [""                             , "span_i"  , "chord_i", "span_pd"       ],
        ["テーパー比"                   , ""        , ""       , ""              ],
        [""                             , "taper_i" , ""       , ""              ],
        ["後退角"                       , ""        , ""       , "後退角(0度)"   ],
        [""                             , "sweep_i" , ""       , "sweep_pd"      ],
        ["翼面積(dm^2)"                 , ""        , ""       , ""              ],
        [""                             , "area_o"  , ""       , ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , 1        , "n=翼根：1=翼端"],
        [""                             , "aspect_o", ""       , ""              ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , ""              ],
        [""                             , "span_o"  , "chord_o", ""              ]
      ],
      "vs": [
        ["垂直尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             ],
        [""                             , "area_io" , "ariap_i", ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , "n=翼根：1=翼端"],
        [""                             , "aspect_i", ""       , ""              ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     ],
        [""                             , "area_i"  , ""       , "area_pd"       ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先"],
        [""                             , "span_i"  , "chord_i", "span_pd"       ],
        ["テーパー比"                   , ""        , ""       , ""              ],
        [""                             , "taper_i" , ""       , ""              ],
        ["後退角"                       , ""        , ""       , "後退角(0度)"   ],
        [""                             , "sweep_i" , ""       , "sweep_pd"      ],
        ["翼面積(dm^2)"                 , ""        , ""       , ""              ],
        [""                             , "area_o"  , ""       , ""              ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , "n=翼根：1=翼端"],
        [""                             , "aspect_o", ""       , ""              ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , ""              ],
        [""                             , "span_o"  , "chord_o", ""              ]
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
          "span_i": "",
          "chord_i": "",
          "span_i_def": 10,
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
          "span_i": "",
          "chord_i": "",
          "span_i_def": 0.1,
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
          "span_i": "",
          "chord_i": "",
          "span_i_def": 0.1,
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
  design2: {
    "id": 0
  }
}; 
//import { ixDB_ORG } from "./ixDB_ORG.js";
// end of file