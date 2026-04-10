export const ixDB_UPDATE = {
  newBase: {
    "id": "aaa",
    "base": {
      "blockOrder": [
        "mw", "hs", "vs"
      ],
      "mw": [
        ["重量 (g)、　翼面荷重(g/dm^2)", 10         , 10        , "面積=翼面荷重/重量"],
        [""                            , "loading_i", "weight_i", ""                  ],
        ["主翼 参考面積(mm^2)、　％"   , ""         , ""        , ""                  ],
        [""                            , "area_io"  , "ariap_i" , ""                  ],
        ["アスペクト比(n=翼根：1=翼端)", 5          , 1         , "n=翼根：1=翼端"    ],
        [""                            , "aspect_i" , ""        , ""                  ],
        ["面積(dm^2)"                  , ""         , ""        , "面積 優先"         ],
        [""                            , "area_i"   , ""        , "area_pd"           ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""         , ""        , "翼幅/翼弦 優先"    ],
        [""                            , "span_i"   , "chord_i" , "span_pd"           ],
        ["翼面積(dm^2)"                , ""         , ""        , ""                  ],
        [""                            , "area_o"   , ""        , ""                  ],
        ["アスペクト比(n=翼根：1=翼端)", ""         , 1         , "n=翼根：1=翼端"    ],
        [""                            , "aspect_o" , ""        , ""                  ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""         , ""        , ""                  ],
        [""                            , "span_o"   , "chord_o" , ""                  ]
      ],
      "hs": [
        ["水平尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             , 1           , 1          ],
        [""                             , "area_io" , "ariap_i", ""              , "area_def"  , "ariap_def"],
        ["アスペクト比(n=翼根：1=翼端)" , 5         , 1        , "n=翼根：1=翼端", 1           , ""         ],
        [""                             , "aspect_i", ""       , ""              , "aspect_def", ""         ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     , 1           , ""         ],
        [""                             , "area_i"  , ""       , "area_pd"       , "area_def"  , ""         ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先", 1           , ""         ],
        [""                             , "span_i"  , "chord_i", "span_pd"       , "span_def"  , "chord_def"],
        ["翼面積(dm^2)"                 , ""        , ""       , ""              , ""          , ""         ],
        [""                             , "area_o"  , ""       , ""              , ""          , ""         ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , 1        , "n=翼根：1=翼端", ""          , ""         ],
        [""                             , "aspect_o", ""       , ""              , ""          , ""         ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , ""              , ""          , ""         ],
        [""                             , "span_o"  , "chord_o", ""              , ""          , ""         ]
      ],
      "vs": [
        ["垂直尾翼 参考面積(mm^2)、　％", ""        , ""       , 100             , 1           , 1          ],
        [""                             , "area_io" , "ariap_i", ""              , "area_def"  , "ariap_def"],
        ["アスペクト比(n=翼根：1=翼端)" , 5         , 1        , "n=翼根：1=翼端", 1           , ""         ],
        [""                             , "aspect_i", ""       , ""              , "aspect_def", ""         ],
        ["面積(dm^2)"                   , ""        , ""       , "面積 優先"     , 1           , ""         ],
        [""                             , "area_i"  , ""       , "area_pd"       , "area_def"  , ""         ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , "翼幅/翼弦 優先", 1           , ""         ],
        [""                             , "span_i"  , "chord_i", "span_pd"       , "span_def"  , "chord_def"],
        ["翼面積(dm^2)"                 , ""        , ""       , ""              , ""          , ""         ],
        [""                             , "area_o"  , ""       , ""              , ""          , ""         ],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , 1        , "n=翼根：1=翼端", ""          , ""         ],
        [""                             , "aspect_o", ""       , ""              , ""          , ""         ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , ""              , ""          , ""         ],
        [""                             , "span_o"  , "chord_o", ""              , ""          , ""         ]
      ]
    },
    "val": {
      "base": {
        "mw": {
          "loading_i": 10,
          "weight_i": 10,
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
          "span_i_def": 0.1,
          "chord_i_def": 0.1,
          "area_o": "",
          "span_o": "",
          "chord_o": ""
        },
        "hs": {
          "area_io": "",
          "ariap_i": 30,
          "ariap_i_def": 5,
          "aspect_i": 5,
          "aspect_i_def": 0.1,
          "area_i": "",
          "area_i_def": 100,
          "span_i": "",
          "chord_i": "",
          "span_i_def": 0.1,
          "chord_i_def": 0.1,
          "area_o": "",
          "span_o": "",
          "chord_o": ""
        },
        "vs": {
          "area_io": "",
          "ariap_i": 5,
          "ariap_i_def": 5,
          "aspect_i": 5,
          "aspect_i_def": 0.1,
          "area_i": "",
          "area_i_def": 100,
          "span_i": "",
          "chord_i": "",
          "span_i_def": 0.1,
          "chord_i_def": 0.1,
          "area_o": "",
          "span_o": "",
          "chord_o": ""
        }
      }
    }
  }
}; 

// end of file