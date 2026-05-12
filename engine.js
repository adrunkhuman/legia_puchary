import { TEAMS, H2H, FIXTURES } from './data.js';

function applyResult(stats, gf, ga, isHome) {
  stats.gf += gf; stats.ga += ga;
  if (gf > ga)        { stats.pts += 3; stats.w++; if (!isHome) stats.awayW++; }
  else if (gf === ga) { stats.pts += 1; stats.d++; }
  else                { stats.l++; }
}

export function h2hStats(group, h2hMap) {
  const ids = group.map(t => t.id);
  const out = {};
  for (const id of ids) out[id] = { pts: 0, gf: 0, ga: 0 };
  for (const home of ids) {
    for (const away of ids) {
      if (home === away) continue;
      const r = h2hMap[`${home}_${away}`];
      if (!r) continue;
      const [hg, ag] = r;
      out[home].gf += hg; out[home].ga += ag;
      out[away].gf += ag; out[away].ga += hg;
      if (hg > ag)       out[home].pts += 3;
      else if (hg === ag) { out[home].pts += 1; out[away].pts += 1; }
      else               out[away].pts += 3;
    }
  }
  for (const id of ids) out[id].gd = out[id].gf - out[id].ga;
  return out;
}

function isH2HComplete(group, h2hMap) {
  const ids = group.map(t => t.id);
  for (const a of ids)
    for (const b of ids)
      if (a !== b && !h2hMap[`${a}_${b}`]) return false;
  return true;
}

function buildGrid(group, h2hMap) {
  const ids = group.map(t => t.id);
  const grid = {};
  for (const a of ids) {
    grid[a] = {};
    for (const b of ids)
      if (a !== b) grid[a][b] = h2hMap[`${a}_${b}`] ?? null;
  }
  return grid;
}

function sortTeams(teams, h2hMap) {
  let usedWins = false, usedAwayWins = false;
  const sorted = [...teams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const group = teams.filter(t => t.pts === a.pts);
    const hh = h2hStats(group, h2hMap);
    if (hh[b.id].pts !== hh[a.id].pts) return hh[b.id].pts - hh[a.id].pts;
    if (hh[b.id].gd  !== hh[a.id].gd)  return hh[b.id].gd  - hh[a.id].gd;
    if (group.length > 2 && hh[b.id].gf !== hh[a.id].gf) return hh[b.id].gf - hh[a.id].gf;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.w  !== a.w)  { usedWins = true; return b.w  - a.w; }
    if (b.awayW !== a.awayW) { usedAwayWins = true; return b.awayW - a.awayW; }
    return 0;
  });
  return { sorted, usedWins, usedAwayWins };
}

// fixtureState: { [id]: { hg: number, ag: number } | undefined }
export function computeStandings(fixtureState) {
  const stats = {};
  for (const [id, t] of Object.entries(TEAMS)) {
    stats[id] = {
      id, name: t.name, cup: !!t.cup,
      pts: t.pts, w: t.w, d: t.d, l: t.l,
      gf: t.gf, ga: t.ga,
      awayW: t.w - t.hw,
    };
  }

  const h2h = { ...H2H };

  for (const fix of FIXTURES) {
    const s = fixtureState[fix.id];
    if (!s || s.hg == null || s.ag == null) continue;
    const { hg, ag } = s;
    if (fix.homeIsTracked) applyResult(stats[fix.home], hg, ag, true);
    if (fix.awayIsTracked) applyResult(stats[fix.away], ag, hg, false);
    if (fix.isH2H) h2h[`${fix.home}_${fix.away}`] = [hg, ag];
  }

  for (const s of Object.values(stats)) s.gd = s.gf - s.ga;

  const { sorted, usedWins, usedAwayWins } = sortTeams(Object.values(stats), h2h);

  sorted.forEach((t, i) => {
    t.pos = i + 1;
  });

  const seenPts = new Set();
  const tiedGroups = [];
  for (const t of sorted) {
    if (seenPts.has(t.pts)) continue;
    const group = sorted.filter(x => x.pts === t.pts);
    if (group.length > 1) {
      const complete = isH2HComplete(group, h2h);
      tiedGroups.push({ pts: t.pts, teams: group, complete,
                        grid: buildGrid(group, h2h),
                        hh: h2hStats(group, h2h) });
      if (!complete) {
        const minPos = Math.min(...group.map(x => x.pos));
        group.forEach(x => { x.pos = minPos; x.exAequo = true; });
      }
    }
    seenPts.add(t.pts);
  }

  const legiaEntry = sorted.find(t => t.id === 'LEG');
  const europeanLabels = getEuropeanLabels(sorted);
  const legiaInEurope = europeanLabels.has('LEG') ? true : legiaEntry.exAequo ? null : false;

  sorted.forEach(t => { t.zone = europeanLabels.has(t.id) ? 'europe' : 'no-europe'; });

  return { standings: sorted, tiedGroups, legiaInEurope, usedWins, usedAwayWins };
}

function getEuropeanLabels(sorted) {
  const labels = new Map();
  if (sorted.some(team => team.exAequo && team.pos <= 6)) return labels;

  for (const team of sorted) {
    if (team.pos <= 2) labels.set(team.id, 'LM');
  }

  const gornik = sorted.find(team => team.id === 'GOR');
  if (gornik && !labels.has(gornik.id)) {
    labels.set(gornik.id, 'LE');
  } else {
    const leTeam = sorted.find(team => !labels.has(team.id));
    if (leTeam) labels.set(leTeam.id, 'LE');
  }

  let lkeCount = 0;
  for (const team of sorted) {
    if (labels.has(team.id) || team.id === 'RAD') continue;
    labels.set(team.id, 'LKE');
    lkeCount++;
    if (lkeCount === 2) break;
  }

  return labels;
}

export function canLegiaMakeIt() {
  const bestState = {};
  for (const fix of FIXTURES) {
    if (fix.tracked.includes('LEG')) {
      bestState[fix.id] = fix.home === 'LEG' ? { hg: 1, ag: 0 } : { hg: 0, ag: 1 };
    } else if (fix.isH2H) {
      bestState[fix.id] = { hg: 0, ag: 0 };
    } else {
      const rival = fix.tracked[0];
      bestState[fix.id] = fix.home === rival ? { hg: 0, ag: 1 } : { hg: 1, ag: 0 };
    }
  }
  const { legiaInEurope } = computeStandings(bestState);
  return legiaInEurope !== false;
}
