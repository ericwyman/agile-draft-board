import { load } from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Fangraphs positional power rankings URLs
const POSITION_URLS = {
  C: 'https://blogs.fangraphs.com/2026-positional-power-rankings-catcher/',
  '1B': 'https://blogs.fangraphs.com/2026-positional-power-rankings-first-base/',
  '2B': 'https://blogs.fangraphs.com/2026-positional-power-rankings-second-base/',
  SS: 'https://blogs.fangraphs.com/2026-positional-power-rankings-shortstop/',
  '3B': 'https://blogs.fangraphs.com/2026-positional-power-rankings-third-base/',
  LF: 'https://blogs.fangraphs.com/2026-positional-power-rankings-left-field/',
  CF: 'https://blogs.fangraphs.com/2026-positional-power-rankings-center-field/',
  RF: 'https://blogs.fangraphs.com/2026-positional-power-rankings-right-field/',
  DH: 'https://blogs.fangraphs.com/2026-positional-power-rankings-designated-hitter/',
};

const BULLPEN_URLS = [
  'https://blogs.fangraphs.com/2026-positional-power-rankings-bullpen-no-16-30/',
  'https://blogs.fangraphs.com/2026-positional-power-rankings-bullpen-no-1-15/',
];

const DELAY_MS = 1500; // polite delay between requests

async function fetchPage(url) {
  console.log(`  Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Parse a Fangraphs positional power rankings article.
 * The articles contain HTML tables with columns:
 * Name | PA | AVG | OBP | SLG | wOBA | Bat | BsR | Fld | WAR
 *
 * Returns an array of player objects.
 */
function parsePositionArticle(html, position) {
  const $ = load(html);
  const players = [];
  const seen = new Set();

  // Find all tables in the article content
  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    rows.each((i, row) => {
      if (i === 0) return; // skip header row
      const cells = $(row).find('td');
      if (cells.length < 9) return; // need at least Name through WAR

      const name = $(cells[0]).text().trim();
      if (!name || name === 'Name' || name === 'Total') return;

      const key = `${name}-${position}`;
      if (seen.has(key)) return;
      seen.add(key);

      const player = {
        name,
        pa: parseInt($(cells[1]).text().trim()) || 0,
        avg: $(cells[2]).text().trim(),
        obp: $(cells[3]).text().trim(),
        slg: $(cells[4]).text().trim(),
        woba: $(cells[5]).text().trim(),
        war: parseFloat($(cells[cells.length - 1]).text().trim()) || 0,
      };

      // Try to extract team from the article context
      // Tables are grouped by team sections
      players.push(player);
    });
  });

  return players;
}

/**
 * Parse a Fangraphs positional power rankings article.
 * Structure: div.table-depth-chart contains:
 *   - div.depth-chart-header with span.depth-chart-header-name (team name)
 *   - div.table-wrapper with the player data table
 */
function parsePositionArticleWithTeams(html, position) {
  const $ = load(html);
  const players = [];
  const seen = new Set();

  $('div.table-depth-chart').each((_, dc) => {
    const team = $(dc).find('.depth-chart-header-name').first().text().trim();
    const table = $(dc).find('div.table-wrapper table').first();
    if (!table.length) return;

    table.find('tr').each((i, row) => {
      if (i === 0) return; // skip header
      const cells = $(row).find('td');
      if (cells.length < 9) return;

      const name = $(cells[0]).text().trim();
      if (!name || name === 'Name' || name === 'Total') return;

      const key = `${name}-${position}`;
      if (seen.has(key)) return;
      seen.add(key);

      players.push({
        name,
        team,
        pa: parseInt($(cells[1]).text().trim()) || 0,
        avg: $(cells[2]).text().trim(),
        obp: $(cells[3]).text().trim(),
        slg: $(cells[4]).text().trim(),
        woba: $(cells[5]).text().trim(),
        war: parseFloat($(cells[cells.length - 1]).text().trim()) || 0,
      });
    });
  });

  return players;
}

/**
 * Parse bullpen articles to extract RP names.
 * Returns a Set of reliever names (normalized).
 */
function parseBullpenArticle(html) {
  const $ = load(html);
  const rpNames = new Set();

  $('div.table-depth-chart').each((_, dc) => {
    const table = $(dc).find('div.table-wrapper table').first();
    if (!table.length) return;

    table.find('tr').each((i, row) => {
      if (i === 0) return;
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const name = $(cells[0]).text().trim();
      if (!name || name === 'Name' || name === 'Total') return;

      rpNames.add(normalizeName(name));
    });
  });

  return rpNames;
}

/**
 * Parse the ADP TSV file.
 * Columns: Rank, Player ID, Player, Team, Position(s), ADP, Min Pick, Max Pick, Difference, # Picks, Team, Team Pick
 */
function parseTsv(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());
  const pitchers = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length < 6) continue;

    const positions = cols[4]?.trim() || '';
    if (!positions.includes('P')) continue;

    // Name is in "Last, First" format — convert to "First Last"
    const rawName = cols[2]?.trim() || '';
    const name = rawName.includes(',')
      ? rawName.split(',').map((s) => s.trim()).reverse().join(' ')
      : rawName;

    pitchers.push({
      name,
      normalizedName: normalizeName(name),
      team: cols[3]?.trim() || '',
      adp: parseFloat(cols[5]) || 999,
      rank: parseInt(cols[0]) || 999,
    });
  }

  return pitchers;
}

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (é→e, í→i, ñ→n, etc.)
    .toLowerCase()
    .replace(/[.,'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('Scraping Fangraphs Positional Power Rankings...\n');

  const positions = {};

  // 1. Scrape position player articles
  for (const [pos, url] of Object.entries(POSITION_URLS)) {
    console.log(`\n[${pos}]`);
    const html = await fetchPage(url);
    const players = parsePositionArticleWithTeams(html, pos);
    console.log(`  Found ${players.length} players`);

    if (['LF', 'CF', 'RF'].includes(pos)) {
      // Collapse into OF with subPosition badge
      if (!positions.OF) positions.OF = [];
      players.forEach((p) => {
        positions.OF.push({ ...p, subPosition: pos });
      });
    } else {
      positions[pos] = players;
    }

    await sleep(DELAY_MS);
  }

  // Sort OF by WAR descending
  if (positions.OF) {
    positions.OF.sort((a, b) => b.war - a.war);
  }

  // Sort all position player rows by WAR descending
  for (const pos of ['C', '1B', '2B', 'SS', '3B', 'DH']) {
    if (positions[pos]) {
      positions[pos].sort((a, b) => b.war - a.war);
    }
  }

  // 2. Scrape bullpen articles to get RP names
  console.log('\n[RP - building reliever name set]');
  const rpNameSet = new Set();

  for (const url of BULLPEN_URLS) {
    const html = await fetchPage(url);
    const names = parseBullpenArticle(html);
    names.forEach((n) => rpNameSet.add(n));
    console.log(`  Found ${names.size} relievers from ${url.split('/').slice(-2, -1)}`);
    await sleep(DELAY_MS);
  }

  console.log(`  Total unique RP names: ${rpNameSet.size}`);

  // 3. Parse ADP TSV and classify SP vs RP
  console.log('\n[SP/RP classification from ADP TSV]');
  const tsvPath = resolve(ROOT, 'docs', 'ADP(1).tsv');
  const allPitchers = parseTsv(tsvPath);
  console.log(`  Total pitchers in TSV: ${allPitchers.length}`);

  const spList = [];
  const rpList = [];

  for (const pitcher of allPitchers) {
    if (rpNameSet.has(pitcher.normalizedName)) {
      rpList.push({
        name: pitcher.name,
        team: pitcher.team,
        adp: pitcher.adp,
      });
    } else {
      spList.push({
        name: pitcher.name,
        team: pitcher.team,
        adp: pitcher.adp,
      });
    }
  }

  // Already sorted by ADP (TSV is ADP-ranked)
  positions.SP = spList;
  positions.RP = rpList;

  console.log(`  SP: ${spList.length} pitchers`);
  console.log(`  RP: ${rpList.length} pitchers`);

  // 4. Write output
  const output = {
    positions,
    lastScraped: new Date().toISOString().split('T')[0],
  };

  const outPath = resolve(ROOT, 'src', 'data', 'players.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);

  // Summary
  console.log('\n--- Summary ---');
  for (const [pos, players] of Object.entries(positions)) {
    const topPlayer = players[0];
    const sortField = ['SP', 'RP'].includes(pos) ? `ADP ${topPlayer?.adp}` : `WAR ${topPlayer?.war}`;
    console.log(`  ${pos}: ${players.length} players (top: ${topPlayer?.name} — ${sortField})`);
  }
}

main().catch((err) => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
