/// This file contains all the constants used in the project. It's imported in all the files where constants are used.

///////////////////////////////////////////////////////////
//////////////// COLOUR PALETTE CONSTANTS /////////////////

const COLOUR_CHARM_PINK = "#E18AAA";
const COLOUR_KOBI = "#E4A0B7";
const COLOUR_CAMEO_PINK = "#ECBDC4";
const COLOUR_QUEEN_PINK = "#EFCFFD4";
const COLOUR_PALE_PINK = "#F5DCE0";

///////////////////////////////////////////////////////////
/////////////// NAME TAG COLOUR CONSTANTS /////////////////

// since the optimum number of team members is 5, we have
// given 5 x 2 = 10 colours to choose from, so that each
// team member is more likely to have a unique colour.

const COLOURS_NAME_TAG = [
    ["#ff1f00"  ,   "red"           ],
    ["#ff6b00"  ,   "orange"        ],
    ["#21ee00"  ,   "light-green"   ],
    ["#ff00c7"  ,   "pink"          ],
    ["#b30076"  ,   "dark-pink"     ],
    ["#4800e3"  ,   "blue"          ],
    ["#00b0b0"  ,   "light-blue"    ],
    ["#e4da00"  ,   "yellow"        ],
    ["#780a0a"  ,   "maroon"        ],
    ["#ad00ff"  ,   "purple"        ],
    ["#00d656"  ,   "pale-green"    ],
];

///////////////////////////////////////////////////////////
//////////////// COLOUR PALETTE CONSTANTS /////////////////

// each row is [ substring of style name, display tag ]

const URGENCY_COLOUR_CODES = {
    "1": ["low"         , "Low"      ],
    "2": ["medium"      , "Medium"   ],
    "3": ["important"   , "Important"],
    "4": ["urgent"      , "Urgent"   ],
};


///////////////////////////////////////////////////////////
////////////////// FIREBASE CONSTANTS ////////////////////

const firebaseConfig = {
    apiKey: "AIzaSyCHbF-slUpV4d8h-UuE9UybW2h1gKIsV3M",
    authDomain: "fit2101-group-2-app.firebaseapp.com",
    projectId: "fit2101-group-2-app",
    storageBucket: "fit2101-group-2-app.appspot.com",
    messagingSenderId: "394581168160",
    appId: "1:394581168160:web:289b60066d0fc837e82c45",
};

///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

export { COLOUR_CHARM_PINK,
         COLOUR_KOBI,
         COLOUR_CAMEO_PINK,
         COLOUR_QUEEN_PINK,
         COLOUR_PALE_PINK,
         URGENCY_COLOUR_CODES,
         firebaseConfig};
