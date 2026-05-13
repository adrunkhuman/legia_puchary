import { FIXTURES } from './data.js';
import { computeStandings, canLegiaMakeIt } from './engine.js';

const state = {};

const LOGO_BASE = 'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/Poland%20-%20PKO%20BP%20Ekstraklasa';

const TEAM_META = {
  ARK: { code: 'ARK', logo: 'Arka%20Gdynia.png' },
  BBT: { code: 'BBT', logo: 'Bruk-Bet%20Termalica%20Nieciecza.png' },
  CRA: { code: 'CRA', logo: 'Cracovia.png' },
  GKS: { code: 'GKS', logo: 'GKS%20Katowice.png' },
  GOR: { code: 'GÓR', logo: 'G%C3%B3rnik%20Zabrze.png' },
  JAG: { code: 'JAG', logo: 'Jagiellonia%20Bialystok.png', fixtureName: 'Jaga' },
  KOR: { code: 'KOR', logo: 'Korona%20Kielce.png' },
  LEC: { code: 'LPO', logo: 'Lech%20Poznan.png' },
  LCH: { code: 'LGD', logo: 'Lechia%20Gdansk.png' },
  LEG: { code: 'LEG', logo: 'Legia%20Warszawa.png' },
  MOT: { code: 'MOT', logo: 'Motor%20Lublin.png' },
  PIR: { code: 'PIA', logo: 'Piast%20Gliwice.png' },
  POG: { code: 'POG', logo: 'Pogon%20Szczecin.png' },
  RAD: { code: 'RAD', logo: 'Radomiak%20Radom.png' },
  RAK: { code: 'RCZ', logo: 'Rak%C3%B3w%20Cz%C4%99stochowa.png' },
  WID: { code: 'WID', logo: 'Widzew%20Lodz.png' },
  WIS: { code: 'WPŁ', logo: 'Wisla%20Plock.png' },
  ZAG: { code: 'ZAG', logo: 'Zaglebie%20Lubin.png' },
};

function teamCode(teamId) {
  return TEAM_META[teamId]?.code ?? teamId;
}

function teamLogo(teamId) {
  const fileName = TEAM_META[teamId]?.logo;
  return fileName ? `${LOGO_BASE}/${fileName}` : null;
}

function fixtureTeamName(teamId, fallback) {
  return TEAM_META[teamId]?.fixtureName ?? fallback;
}

function renderStaticVerdict() {
  const possible = canLegiaMakeIt();
  const word = document.getElementById('verdict-word');
  const subline = document.getElementById('verdict-subline');
  if (possible) {
    word.className = 'verdict-word yes';
    word.textContent = 'TAK';
    subline.style.display = '';
  } else {
    word.className = 'verdict-word no';
    word.textContent = 'NIE';
    subline.style.display = 'none';
  }
}

export function init() {
  applyFinalScores();
  renderStaticVerdict();
  renderFixtures();
  updateSim();
}

function applyFinalScores() {
  for (const fix of FIXTURES) {
    if (fix.finalScore) state[fix.id] = { ...fix.finalScore };
  }
}

function applyGoal(fixId, side, val) {
  const s = state[fixId] ?? { hg: null, ag: null };
  s[side] = val;
  if (s.hg !== null && s.ag === null) s.ag = 0;
  if (s.ag !== null && s.hg === null) s.hg = 0;
  state[fixId] = s;
}

function isKeyFixture(fix) {
  if (fix.tracked.includes('LEG')) return true;
  if (fix.homeIsTracked && fix.awayIsTracked) return true;
  return false;
}

function orderSection(games) {
  const legia  = games.filter(f => f.tracked.includes('LEG'));
  const key    = games.filter(f => !f.tracked.includes('LEG') && isKeyFixture(f));
  const nonKey = games.filter(f => !isKeyFixture(f));
  return [...legia, ...key, ...nonKey];
}

function renderFixtures() {
  const container = document.getElementById('fixtures');

  const sections = [
    { label: '13 maja',              games: orderSection(FIXTURES.filter(f => f.round === 'K31')), cols: 2 },
    { label: 'Kolejka 33 · 15–17 maja', games: orderSection(FIXTURES.filter(f => f.round === 'R33')), cols: 3 },
    { label: 'Kolejka 34 · 23 maja',    games: orderSection(FIXTURES.filter(f => f.round === 'R34')), cols: 3 },
  ];

  for (const { label, games, cols } of sections) {
    const group = document.createElement('div');
    group.className = 'fixture-group';

    const lbl = document.createElement('p');
    lbl.className = 'fixture-group-lbl';
    lbl.textContent = label;
    group.appendChild(lbl);

    const list = document.createElement('div');
    list.className = cols === 2 ? 'fixture-list fixture-list-2' : 'fixture-list';

    for (const fix of games) {
      const cell = document.createElement('div');
      cell.className = getFixtureClass(fix);
      cell.appendChild(buildPicker(fix));
      list.appendChild(cell);
    }

    group.appendChild(list);
    container.appendChild(group);
  }
}

function getFixtureClass(fix) {
  const classes = ['fixture'];
  if (fix.round !== 'K31' && fix.tracked.includes('LEG')) classes.push('fixture--legia');
  if (fix.round !== 'K31' && fix.tracked.some(team => team === 'GKS' || team === 'ZAG')) classes.push('fixture--mid');
  return classes.join(' ');
}

function buildPicker(fix) {
  const wrap = document.createElement('div');
  wrap.className = 'score-picker';
  const isFinal = Boolean(fix.finalScore);

  const [homeLabel, awayLabel] = fix.label.split(' – ');

  const homeColumn = document.createElement('div');
  homeColumn.className = 'score-column score-column-home';

  const awayColumn = document.createElement('div');
  awayColumn.className = 'score-column score-column-away';

  const homeName = buildTeamName(fixtureTeamName(fix.home, homeLabel), fix.home, 'home');
  const awayName = buildTeamName(fixtureTeamName(fix.away, awayLabel), fix.away, 'away');

  const homeSide = document.createElement('div');
  homeSide.className = 'score-side';

  const awaySide = document.createElement('div');
  awaySide.className = 'score-side';

  for (const g of [3, 2, 1, 0]) {
    const btn = document.createElement('button');
    btn.className = 'sbtn';
    btn.textContent = g;
    btn.dataset.fix = fix.id;
    btn.dataset.side = 'hg';
    btn.dataset.val = g;
    btn.disabled = isFinal;
    if (!isFinal) btn.addEventListener('click', () => { applyGoal(fix.id, 'hg', g); refreshPicker(fix); updateSim(); });
    homeSide.appendChild(btn);
  }

  const dash = document.createElement('span');
  dash.className = 'score-dash';
  dash.textContent = '–';

  for (const g of [0, 1, 2, 3]) {
    const btn = document.createElement('button');
    btn.className = 'sbtn';
    btn.textContent = g;
    btn.dataset.fix = fix.id;
    btn.dataset.side = 'ag';
    btn.dataset.val = g;
    btn.disabled = isFinal;
    if (!isFinal) btn.addEventListener('click', () => { applyGoal(fix.id, 'ag', g); refreshPicker(fix); updateSim(); });
    awaySide.appendChild(btn);
  }

  const clearBtn = document.createElement('button');
  clearBtn.className = 'score-clear';
  clearBtn.textContent = '✕';
  clearBtn.disabled = isFinal;
  if (!isFinal) clearBtn.addEventListener('click', () => { delete state[fix.id]; refreshPicker(fix); updateSim(); });

  homeColumn.appendChild(homeName);
  homeColumn.appendChild(homeSide);
  awayColumn.appendChild(awayName);
  awayColumn.appendChild(awaySide);

  wrap.appendChild(homeColumn);
  wrap.appendChild(dash);
  wrap.appendChild(awayColumn);
  wrap.appendChild(clearBtn);

  fix._picker = wrap;
  refreshPicker(fix);
  return wrap;
}

function buildTeamName(label, teamId, side) {
  const name = document.createElement('div');
  name.className = `score-team score-team-${side}`;

  const text = document.createElement('span');
  text.className = 'score-team-name';
  text.textContent = label;

  const logoUrl = teamLogo(teamId);
  if (!logoUrl) {
    name.appendChild(text);
    return name;
  }

  const logo = document.createElement('img');
  logo.className = 'score-team-logo';
  logo.src = logoUrl;
  logo.alt = `${label} logo`;
  logo.loading = 'lazy';

  if (side === 'home') {
    name.appendChild(text);
    name.appendChild(logo);
  } else {
    name.appendChild(logo);
    name.appendChild(text);
  }

  return name;
}

function refreshPicker(fix) {
  const s = state[fix.id] ?? { hg: null, ag: null };
  for (const btn of fix._picker.querySelectorAll('.sbtn')) {
    btn.classList.toggle('sbtn-active', s[btn.dataset.side] === Number(btn.dataset.val));
  }
}

function updateSim() {
  const { standings, tiedGroups, legiaInEurope, europeanLabels, usedWins, usedAwayWins } = computeStandings(state);
  renderStandings(standings, europeanLabels, usedWins, usedAwayWins);
  renderH2HBlocks(tiedGroups);

  const keyPending = FIXTURES.filter(f => isKeyFixture(f)).filter(f => {
    const s = state[f.id];
    return !s || s.hg == null || s.ag == null;
  }).length;

  const badge = document.getElementById('sim-verdict');

  if (keyPending > 0) {
    badge.style.display = 'none';
    return;
  }

  badge.style.display = '';
  const legia = standings.find(t => t.id === 'LEG');

  if (legiaInEurope === true) {
    badge.textContent = `Legia w pucharach (${legia.pos}.)`;
    badge.className = 'sim-verdict sim-yes';
  } else if (legiaInEurope === null) {
    badge.textContent = `ex aequo — potrzebny tiebreaker (${legia.pos}.~)`;
    badge.className = 'sim-verdict sim-open';
  } else {
    badge.textContent = `Legia poza pucharami (${legia.pos}.)`;
    badge.className = 'sim-verdict sim-no';
  }
}

function renderStandings(sorted, europeanLabels, usedWins, usedAwayWins) {
  const thead = document.querySelector('.standings thead tr');
  thead.innerHTML =
    `<th>#</th><th>Zespół</th><th>pkt</th><th>bilans</th><th>BZ</th><th>BS</th>` +
    (usedWins     ? '<th>W</th>'  : '') +
    (usedAwayWins ? '<th>AW</th>' : '');

  const tbody = document.getElementById('standings-tbody');
  tbody.innerHTML = '';

  for (const t of sorted) {
    const tr = document.createElement('tr');
    const euroLabel = europeanLabels.get(t.id);
    tr.className = [t.id === 'LEG' ? 'legia' : '', euroLabel ? 'europe' : 'no-europe'].filter(Boolean).join(' ');

    const posStr = t.exAequo ? `${t.pos}~` : `${t.pos}`;
    const gdStr  = (t.gd >= 0 ? '+' : '') + t.gd;
    const gf = t.gf ?? '—';
    const ga = t.ga ?? '—';
    const extra =
      (usedWins     ? `<td>${t.w     ?? '—'}</td>` : '') +
      (usedAwayWins ? `<td>${t.awayW ?? '—'}</td>` : '');

    tr.innerHTML = `
      <td><span class="rank-pos">${posStr}</span>${euroLabel ? `<span class="euro-label euro-${euroLabel.toLowerCase()}">${euroLabel}</span>` : ''}</td>
      <td>${teamCellHtml(t)}</td>
      <td>${t.pts}</td>
      <td>${gdStr}</td>
      <td>${gf}</td>
      <td>${ga}</td>
      ${extra}
    `;
    tbody.appendChild(tr);
  }
}

function teamCellHtml(team) {
  const logoUrl = teamLogo(team.id);
  if (!logoUrl) return `<span class="standings-team"><span class="standings-team-name">${team.name}</span></span>`;

  return `<span class="standings-team"><img class="standings-team-logo" src="${logoUrl}" alt="${team.name} logo" loading="lazy"><span class="standings-team-name">${team.name}</span></span>`;
}

function renderH2HBlocks(tiedGroups) {
  const container = document.getElementById('h2h-blocks');
  container.innerHTML = '';
  if (!tiedGroups.length) return;

  for (const { pts, teams, complete, grid, hh } of tiedGroups) {
    const block = document.createElement('div');
    block.className = teams.length === 2 ? 'h2h-block h2h-block--duel' : 'h2h-block';

    const lbl = document.createElement('p');
    lbl.className = 'h2h-lbl';
    lbl.textContent = `${pts} pkt — H2H`;
    block.appendChild(lbl);

    if (teams.length === 2) {
      render2TeamH2H(block, teams, grid, hh, complete);
    } else {
      renderNTeamH2H(block, teams, hh, complete);
    }

    renderTieBreakerNote(block, teams, hh, complete);

    container.appendChild(block);
  }
}

function tieBreakerNote(teams, hh, complete) {
  if (!complete || teams.length < 2) return null;
  if (teams.some(team => team.exAequo)) return 'nierozstrzygnięte bez punktów za kartki';

  const [leader, runnerUp] = teams;
  if (hh[leader.id].pts !== hh[runnerUp.id].pts) return null;
  if (hh[leader.id].gd !== hh[runnerUp.id].gd) return null;
  if (leader.gd !== runnerUp.gd) return null;
  if (leader.gf !== runnerUp.gf) return null;

  if (leader.w !== runnerUp.w) {
    return `liczba zwycięstw: ${leader.name} ${leader.w}, ${runnerUp.name} ${runnerUp.w}`;
  }

  if (leader.awayW !== runnerUp.awayW) {
    return `zwycięstwa wyjazdowe: ${leader.name} ${leader.awayW}, ${runnerUp.name} ${runnerUp.awayW}`;
  }

  return 'nierozstrzygnięte bez punktów za kartki';
}

function renderTieBreakerNote(block, teams, hh, complete) {
  const text = tieBreakerNote(teams, hh, complete);
  if (!text) return;

  const note = document.createElement('p');
  note.className = 'h2h-note';
  note.textContent = text;
  block.appendChild(note);
}

function render2TeamH2H(block, teams, grid, hh, complete) {
  const [a, b] = teams;

  const aPts = hh[a.id].pts, bPts = hh[b.id].pts;
  const aGd  = hh[a.id].gd,  bGd  = hh[b.id].gd;
  const aLeads = complete && (aPts > bPts || (aPts === bPts && aGd > bGd));
  const bLeads = complete && (bPts > aPts || (bPts === aPts && bGd > aGd));

  const leg1 = grid[a.id][b.id];
  const leg2 = grid[b.id][a.id];
  const aggA = hh[a.id].gf, aggB = hh[b.id].gf;
  const hasAgg = leg1 || leg2;

  const duel = document.createElement('div');
  duel.className = 'h2h-duel';

  const aDiv = buildH2HTeam(a, aPts, 'home', aLeads ? 'h2h-leader' : bLeads ? 'h2h-trailer' : '');

  const center = document.createElement('div');
  center.className = 'h2h-duel-center';
  if (hasAgg) {
    center.innerHTML = `<span class="h2h-duel-agg">${aggA}–${aggB}</span>`;
  } else {
    center.innerHTML = `<span class="h2h-duel-agg-label">brak meczów</span>`;
  }

  const bDiv = buildH2HTeam(b, bPts, 'away', bLeads ? 'h2h-leader' : aLeads ? 'h2h-trailer' : '');

  duel.appendChild(aDiv);
  duel.appendChild(center);
  duel.appendChild(bDiv);
  block.appendChild(duel);

  const legs = document.createElement('p');
  legs.className = 'h2h-legs';
  const parts = [];
  for (const [home, away] of [[a, b], [b, a]]) {
    const r = grid[home.id][away.id];
    if (!r) {
      parts.push(`<span class="h2h-leg-result h2h-pending">${teamCode(home.id)} vs ${teamCode(away.id)}</span>`);
    } else {
      const [hg, ag] = r;
      const cls = hg > ag ? 'h2h-w' : hg < ag ? 'h2h-l' : 'h2h-d';
      parts.push(`<span class="h2h-leg-result"><span>${teamCode(home.id)}</span> <span class="${cls}">${hg}–${ag}</span> <span>${teamCode(away.id)}</span></span>`);
    }
  }
  legs.innerHTML = parts.join('');
  block.appendChild(legs);

  if (!complete) {
    const note = document.createElement('p');
    note.className = 'h2h-note';
    note.textContent = 'nie wszystkie mecze zostały rozegrane';
    block.appendChild(note);
  }
}

function buildH2HTeam(team, points, side, stateClass) {
  const teamDiv = document.createElement('div');
  teamDiv.className = ['h2h-duel-team', side === 'away' ? 'h2h-duel-team-r' : '', stateClass].filter(Boolean).join(' ');

  const text = document.createElement('div');
  text.className = 'h2h-duel-team-text';
  text.innerHTML = `<span class="h2h-duel-name">${team.name}</span><span class="h2h-duel-pts">${points} pkt</span>`;

  const logoUrl = teamLogo(team.id);
  if (!logoUrl) {
    teamDiv.appendChild(text);
    return teamDiv;
  }

  const logo = document.createElement('img');
  logo.className = 'h2h-duel-logo';
  logo.src = logoUrl;
  logo.alt = `${team.name} logo`;
  logo.loading = 'lazy';

  if (side === 'away') {
    teamDiv.appendChild(logo);
    teamDiv.appendChild(text);
  } else {
    teamDiv.appendChild(text);
    teamDiv.appendChild(logo);
  }

  return teamDiv;
}

function renderNTeamH2H(block, teams, hh, complete) {
  const sorted = [...teams].sort((a, b) => {
    if (hh[b.id].pts !== hh[a.id].pts) return hh[b.id].pts - hh[a.id].pts;
    if (hh[b.id].gd !== hh[a.id].gd) return hh[b.id].gd - hh[a.id].gd;
    return 0;
  });

  const table = document.createElement('table');
  table.className = 'h2h-summary-table';
  table.innerHTML = '<thead><tr><th>Zespół</th><th>pkt</th><th>bilans</th></tr></thead>';

  const tbody = document.createElement('tbody');
  for (const [i, t] of sorted.entries()) {
    const gd = hh[t.id].gd;
    const tr = document.createElement('tr');
    const next = sorted[1];
    const leadsH2H = i === 0 && (!next || hh[t.id].pts !== hh[next.id].pts || hh[t.id].gd !== hh[next.id].gd);
    if (complete && leadsH2H) tr.className = 'h2h-row-leader';
    tr.innerHTML = `<td class="h2h-team">${t.name}</td><td>${hh[t.id].pts}</td><td>${gd >= 0 ? '+' : ''}${gd}</td>`;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  block.appendChild(table);

  if (!complete) {
    const note = document.createElement('p');
    note.className = 'h2h-note';
    note.textContent = 'nie wszystkie mecze zostały rozegrane';
    block.appendChild(note);
  }
}
