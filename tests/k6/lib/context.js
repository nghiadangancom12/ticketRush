import { SharedArray } from 'k6/data';

function uniqueNonEmpty(values) {
  const seen = new Set();
  const out = [];
  for (const v of values) {
    if (!v || typeof v !== 'string') continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function mapRepoRelativeK6Path(path) {
  const normalized = path.replace(/\\/g, '/');
  const prefix = 'tests/k6/';
  if (normalized.startsWith(prefix)) {
    return `../${normalized.slice(prefix.length)}`;
  }
  return normalized;
}

function readJsonFromFirstFound(label, candidates) {
  let lastError;
  for (const candidate of candidates) {
    try {
      return { path: candidate, value: JSON.parse(open(candidate)) };
    } catch (e) {
      lastError = e;
    }
  }
  const tried = candidates.length > 0 ? candidates.join(', ') : '(no candidates)';
  const suffix = lastError ? ` Last error: ${String(lastError)}` : '';
  throw new Error(`Unable to load ${label}. Tried: ${tried}.${suffix}`);
}

const configCandidates = uniqueNonEmpty([
  __ENV.K6_CONFIG,
  __ENV.K6_CONFIG ? mapRepoRelativeK6Path(__ENV.K6_CONFIG) : null,
  'tests/k6/config.local.json',
  mapRepoRelativeK6Path('tests/k6/config.local.json'),
  '../config.local.json'
]);

const { value: config } = readJsonFromFirstFound('k6 config JSON', configCandidates);

const tokens = new SharedArray('k6_tokens', function () {
  const tokenFile = __ENV.K6_TOKENS_FILE || config.tokensFile;
  const tokenCandidates = uniqueNonEmpty([
    tokenFile,
    typeof tokenFile === 'string' ? mapRepoRelativeK6Path(tokenFile) : null,
    '../artifacts/k6-tokens.json'
  ]);

  const { value: parsed } = readJsonFromFirstFound('k6 token pool JSON', tokenCandidates);
  if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
    throw new Error(`Token pool is empty`);
  }
  return parsed.users;
});

export function getConfig() {
  return config;
}

export function getUserByVu(vu) {
  return tokens[(vu - 1) % tokens.length];
}

export function getAdminToken() {
  const cfgAdmin = config.fixtures.adminEmail;
  const admin = tokens.find((u) => u.email === cfgAdmin || u.role === 'ADMIN');
  if (!admin) throw new Error('Admin token missing in token pool');
  return admin.token;
}

export function getSeatByIteration(iteration) {
  const seats = config.fixtures.seatIds;
  return seats[iteration % seats.length];
}

export function baseUrl() {
  return __ENV.BASE_URL || config.baseUrl;
}
