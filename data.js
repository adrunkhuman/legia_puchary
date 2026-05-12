export const TEAMS = {
  LEC: { name: "Lech Poznań",  pts: 56, w: 15, d: 11, l:  6, gf: 57, ga: 42, hw: 7, hd: 6, hl: 3, hgf: 37, hga: 27 },
  JAG: { name: "Jagiellonia",  pts: 49, w: 13, d: 10, l:  8, gf: 51, ga: 39, hw: 8, hd: 3, hl: 5, hgf: 33, hga: 24 },
  RAK: { name: "Raków",        pts: 49, w: 14, d:  7, l: 10, gf: 45, ga: 37, hw: 7, hd: 4, hl: 4, hgf: 20, hga: 13 },
  GOR: { name: "Górnik",       pts: 49, w: 14, d:  7, l: 10, gf: 43, ga: 36, hw:10, hd: 1, hl: 5, hgf: 28, hga: 15, cup: true },
  GKS: { name: "GKS Katowice", pts: 48, w: 14, d:  6, l: 12, gf: 48, ga: 42, hw:10, hd: 2, hl: 4, hgf: 29, hga: 18 },
  ZAG: { name: "Zagłębie",     pts: 48, w: 13, d:  9, l: 10, gf: 45, ga: 36, hw: 7, hd: 6, hl: 3, hgf: 26, hga: 14 },
  WIS: { name: "Wisła Płock",  pts: 45, w: 12, d:  9, l: 11, gf: 32, ga: 35, hw: 8, hd: 3, hl: 5, hgf: 16, hga: 15 },
  RAD: { name: "Radomiak",     pts: 44, w: 11, d: 11, l: 10, gf: 49, ga: 44, hw: 9, hd: 4, hl: 3, hgf: 32, hga: 15 },
  LEG: { name: "Legia",        pts: 43, w: 10, d: 13, l:  9, gf: 36, ga: 36, hw: 7, hd: 6, hl: 3, hgf: 19, hga: 12 },
};

export const H2H = {
  LEC_JAG: [2,2],  LEC_RAK: [4,3],  LEC_GOR: [2,1],
  LEC_GKS: [3,3],  LEC_ZAG: [1,2],  LEC_RAD: [4,1],
  LEC_LEG: [4,0],
  JAG_LEC: [0,0],  RAK_LEC: [2,2],  GOR_LEC: [0,1],
  GKS_LEC: [0,1],  ZAG_LEC: [0,1],  WIS_LEC: [0,0],
  LEG_LEC: [0,0],

  GOR_JAG: [2,1],  GOR_RAK: [3,1],  GOR_GKS: [3,0],
  GOR_ZAG: [0,2],  GOR_WIS: [1,1],  GOR_LEG: [3,1],
  JAG_GOR: [1,2],  RAK_GOR: [0,1],  GKS_GOR: [3,1],
  ZAG_GOR: [2,0],
  LEG_GOR: [1,1],  RAD_GOR: [4,0],

  JAG_RAK: [1,2],
  JAG_GKS: [2,1],  JAG_ZAG: null,
  JAG_WIS: [1,2],  JAG_RAD: [1,1],  JAG_LEG: [2,2],
  GKS_JAG: null,
  ZAG_JAG: [0,0],  WIS_JAG: [0,1],  RAD_JAG: [1,2],  LEG_JAG: [0,0],

  RAK_GKS: [1,0],  RAK_ZAG: [0,1],  RAK_WIS: [1,2],
  RAK_RAD: [0,0],  RAK_LEG: [1,1],
  GKS_RAK: [0,1],  ZAG_RAK: [0,0],  WIS_RAK: [2,1],
  RAD_RAK: [3,1],  LEG_RAK: [1,1],

  GKS_ZAG: [2,2],  GKS_WIS: [1,0],  GKS_RAD: [3,2],  GKS_LEG: [1,1],
  ZAG_GKS: [0,2],  WIS_GKS: [1,1],  RAD_GKS: [0,1],  LEG_GKS: [3,1],

  ZAG_WIS: [2,0],  ZAG_RAD: [1,0],  ZAG_LEG: [3,1],
  WIS_ZAG: [2,1],  RAD_ZAG: [3,1],  LEG_ZAG: [1,0],

  WIS_RAD: [0,1],  WIS_LEG: [1,0],
  RAD_WIS: [1,1],  LEG_WIS: [2,1],

  RAD_LEG: [1,1],
  LEG_RAD: [4,1],
};

export const FIXTURES = [
  { id:"m01", home:"ARK", away:"GOR", date:"13 May", round:"K31",  label:"Arka – Górnik",           tracked:["GOR"], homeIsTracked:false, awayIsTracked:true  },
  { id:"m02", home:"RAK", away:"JAG", date:"13 May", round:"K31",  label:"Raków – Jagiellonia",     tracked:["RAK","JAG"], homeIsTracked:true, awayIsTracked:true, isH2H:true },

  { id:"m03", home:"ZAG", away:"POG", date:"15 May", round:"R33",  label:"Zagłębie – Pogoń",        tracked:["ZAG"], homeIsTracked:true, awayIsTracked:false },
  { id:"m04", home:"WIS", away:"GOR", date:"16 May", round:"R33",  label:"Wisła – Górnik",          tracked:["WIS","GOR"], homeIsTracked:true, awayIsTracked:true, isH2H:true },
  { id:"m05", home:"RAD", away:"LEC", date:"16 May", round:"R33",  label:"Radomiak – Lech",         tracked:["RAD","LEC"], homeIsTracked:true, awayIsTracked:true, isH2H:true },
  { id:"m06", home:"PIR", away:"RAK", date:"17 May", round:"R33",  label:"Piast – Raków",           tracked:["RAK"], homeIsTracked:false, awayIsTracked:true  },
  { id:"m07", home:"GKS", away:"JAG", date:"17 May", round:"R33",  label:"GKS – Jagiellonia",       tracked:["GKS","JAG"], homeIsTracked:true, awayIsTracked:true, isH2H:true },
  { id:"m08", home:"LCH", away:"LEG", date:"17 May", round:"R33",  label:"Lechia – Legia",          tracked:["LEG"], homeIsTracked:false, awayIsTracked:true  },

  { id:"m09", home:"LEG", away:"MOT", date:"23 May", round:"R34",  label:"Legia – Motor",           tracked:["LEG"], homeIsTracked:true, awayIsTracked:false },
  { id:"m10", home:"GOR", away:"RAD", date:"23 May", round:"R34",  label:"Górnik – Radomiak",       tracked:["GOR","RAD"], homeIsTracked:true, awayIsTracked:true, isH2H:true },
  { id:"m11", home:"POG", away:"GKS", date:"23 May", round:"R34",  label:"Pogoń – GKS",             tracked:["GKS"], homeIsTracked:false, awayIsTracked:true  },
  { id:"m12", home:"LEC", away:"WIS", date:"23 May", round:"R34",  label:"Lech – Wisła",            tracked:["LEC","WIS"], homeIsTracked:true, awayIsTracked:true, isH2H:true  },
  { id:"m13", home:"RAK", away:"ARK", date:"23 May", round:"R34",  label:"Raków – Arka",            tracked:["RAK"], homeIsTracked:true, awayIsTracked:false },
  { id:"m14", home:"JAG", away:"ZAG", date:"23 May", round:"R34",  label:"Jagiellonia – Zagłębie",  tracked:["JAG","ZAG"], homeIsTracked:true, awayIsTracked:true, isH2H:true },
];
