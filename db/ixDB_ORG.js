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
        ["主翼 参考面積(mm^2)、　％"   , ""                , ""            , ""            ],
        [""                            , "area_io"         , "ariap_i"     , "aria_str"    ],
        ["重量 (g)、　翼面荷重(g/dm^2)", ""                , ""            , 0             ],
        [""                            , "weight_i"        , "loading_i"   , "rect_pd"     ],
        ["アスペクト比(n=翼根：1=翼端)", ""                , ""            , ""            ],
        [""                            , "aspect_i"        , ""            , ""            ],
        ["面積(dm^2)"                  , ""                , ""            , 0             ],
        [""                            , "area_i"          , ""            , "area_pd"     ],
        ["半翼幅 (mm)、　翼弦 (mm)"    , ""                , ""            , 0             ],
        [""                            , "hspan_i"         , "chord_i"     , "span_pd"     ],
        ["テーパー比"                  , ""                , ""            , ""            ],
        [""                            , "taper_i"         , ""            , ""            ],
        ["後退角"                      , ""                , ""            , 0             ],
        [""                            , "sweep_i"         , ""            , "sweep_pd"    ],
        ["上反角　角度,　％"           , ""                , ""            , ""            ],
        [""                            , "dihedral_i"      , "dihedralP_i" , ""            ],
        ["上反角2段　角度,　％"        , ""                , ""            , 0             ],
        [""                            , "dihedral2_i"     , "dihedral2P_i", "dihedral2_pd"],
        ["重心(%)"                     , ""                , ""            , ""            ],
        [""                            , "centerGgravity_i", ""            , ""            ]
      ],
      "hs": [
        ["水平尾翼 参考面積(mm^2)、　％", ""        , ""       , 100       ],
        [""                             , "area_io" , "ariap_i", "aria_str"],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , ""        ],
        [""                             , "aspect_i", ""       , ""        ],
        ["面積(dm^2)"                   , ""        , ""       , 0         ],
        [""                             , "area_i"  , ""       , "area_pd" ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , 0         ],
        [""                             , "hspan_i" , "chord_i", "span_pd" ],
        ["テーパー比"                   , ""        , ""       , ""        ],
        [""                             , "taper_i" , ""       , ""        ],
        ["後退角"                       , ""        , ""       , 0         ],
        [""                             , "sweep_i" , ""       , "sweep_pd"]
      ],
      "vs": [
        ["垂直尾翼 参考面積(mm^2)、　％", ""        , ""       , 0          ],
        [""                             , "area_io" , "ariap_i", "vsType_pd"],
        ["アスペクト比(n=翼根：1=翼端)" , ""        , ""       , ""         ],
        [""                             , "aspect_i", ""       , ""         ],
        ["面積(dm^2)"                   , ""        , ""       , 0          ],
        [""                             , "area_i"  , ""       , "area_pd"  ],
        ["半翼幅 (mm)、　翼弦 (mm)"     , ""        , ""       , 0          ],
        [""                             , "hspan_i" , "chord_i", "span_pd"  ],
        ["テーパー比"                   , ""        , ""       , ""         ],
        [""                             , "taper_i" , ""       , ""         ],
        ["後退角"                       , ""        , ""       , 0          ],
        [""                             , "sweep_i" , ""       , "sweep_pd" ]
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
          "taper_i": 1,
          "taper_i_def": 0.1,
          "sweep_i": "",
          "sweep_i_def": 2,
          "dihedral_i": 10,
          "dihedral_i_def": 1,
          "dihedralP_i": 0,
          "dihedralP_i_def": 5,
          "dihedral2_i": "",
          "dihedral2_i_def": 1,
          "dihedral2P_i": "",
          "dihedral2P_i_def": 5,
          "centerGgravity_i": 80,
          "centerGgravity_i_def": 5,
          "aria_str": "",
          "rect_pd": 0,
          "area_pd": 0,
          "span_pd": 0,
          "sweep_pd": 0,
          "dihedral2_pd": 0
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
          "taper_i": 1,
          "taper_i_def": 0.1,
          "sweep_i": "",
          "sweep_i_def": 2,
          "aria_str": "",
          "area_pd": 0,
          "span_pd": 0,
          "sweep_pd": 0
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
          "taper_i": 1,
          "taper_i_def": 0.1,
          "sweep_i": "",
          "sweep_i_def": 2,
          "aria_str": "",
          "area_pd": 0,
          "span_pd": 0,
          "sweep_pd": 0,
          "vsType_pd": 1
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