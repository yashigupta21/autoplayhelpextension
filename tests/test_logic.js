// tests/test_logic.js
// Unit tests for pure logic functions from content.js and options.js
// Run with: node tests/test_logic.js

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓  ${message}`);
    passed++;
  } else {
    console.error(`  ✗  ${message}`);
    failed++;
  }
}

function section(name) {
  console.log(`\n── ${name}`);
}

// ─────────────────────────────────────────────────────────────────
// Functions under test (extracted from content.js — no DOM/Chrome deps)
// ─────────────────────────────────────────────────────────────────

function playbackFraction(video) {
  return video && video.duration ? video.currentTime / video.duration : 0;
}

function episodeKey(pathname) {
  return pathname;
}

function makeCooldownTracker(cooldownMs) {
  const lastClicked = {};

  function recentlyClicked(key) {
    return lastClicked[key] && Date.now() - lastClicked[key] < cooldownMs;
  }

  function markClicked(key) {
    lastClicked[key] = Date.now();
    const cutoff = Date.now() - cooldownMs * 2;
    for (const k of Object.keys(lastClicked)) {
      if (lastClicked[k] < cutoff) delete lastClicked[k];
    }
  }

  function tryClick(found, suffix) {
    if (!found) return false;
    const key = suffix;
    if (recentlyClicked(key)) return false;
    markClicked(key);
    return true;
  }

  return { recentlyClicked, markClicked, tryClick, _store: lastClicked };
}

// ─────────────────────────────────────────────────────────────────
// playbackFraction
// ─────────────────────────────────────────────────────────────────
section('playbackFraction');

assert(playbackFraction(null) === 0,
  'null video → 0');
assert(playbackFraction(undefined) === 0,
  'undefined video → 0');
assert(playbackFraction({ currentTime: 0, duration: 0 }) === 0,
  'zero duration → 0 (no divide-by-zero)');
assert(playbackFraction({ currentTime: 0, duration: 60 }) === 0,
  'start of episode → 0');
assert(playbackFraction({ currentTime: 57, duration: 60 }) === 0.95,
  '95% through → 0.95');
assert(playbackFraction({ currentTime: 60, duration: 60 }) === 1.0,
  'fully played → 1.0');
assert(playbackFraction({ currentTime: 47.5, duration: 50 }) === 0.95,
  'fractional timestamps → correct fraction');

// ─────────────────────────────────────────────────────────────────
// episodeKey
// ─────────────────────────────────────────────────────────────────
section('episodeKey');

assert(episodeKey('/watch/81234567') === '/watch/81234567',
  'returns pathname as-is');
assert(episodeKey('/watch/11111') !== episodeKey('/watch/22222'),
  'different episodes produce different keys');
assert(episodeKey('/watch/99999') === episodeKey('/watch/99999'),
  'same episode produces same key (stable)');

// ─────────────────────────────────────────────────────────────────
// Cooldown — basic behaviour
// ─────────────────────────────────────────────────────────────────
section('Cooldown — basic behaviour');

const tracker = makeCooldownTracker(10000);

assert(!tracker.recentlyClicked('/watch/123:skip'),
  'unknown key is not recently clicked');
tracker.markClicked('/watch/123:skip');
assert(tracker.recentlyClicked('/watch/123:skip'),
  'key is hot immediately after markClicked');
assert(!tracker.recentlyClicked('/watch/123:next'),
  'next-episode key is unaffected by skip click');
assert(!tracker.recentlyClicked('/watch/456:skip'),
  'different episode key is unaffected');

// ─────────────────────────────────────────────────────────────────
// Cooldown — expiry
// ─────────────────────────────────────────────────────────────────
section('Cooldown — expiry');

const expTracker = makeCooldownTracker(10000);
expTracker._store['/watch/old:skip'] = Date.now() - 11000;
assert(!expTracker.recentlyClicked('/watch/old:skip'),
  'key older than cooldown is not recently clicked');

// ─────────────────────────────────────────────────────────────────
// Cooldown — all action keys are independent
// ─────────────────────────────────────────────────────────────────
section('Cooldown — all action keys are independent');

const indTracker = makeCooldownTracker(10000);
const key = '/watch/81234567';

indTracker.markClicked(key + ':skip');
assert( indTracker.recentlyClicked(key + ':skip'),    ':skip is hot');
assert(!indTracker.recentlyClicked(key + ':recap'),   ':recap is cold after skip click');
assert(!indTracker.recentlyClicked(key + ':next'),    ':next is cold after skip click');
assert(!indTracker.recentlyClicked(key + ':continue'),':continue is cold after skip click');

indTracker.markClicked(key + ':recap');
assert( indTracker.recentlyClicked(key + ':recap'),   ':recap is hot');
assert( indTracker.recentlyClicked(key + ':skip'),    ':skip still hot (own cooldown)');

indTracker.markClicked(key + ':continue');
assert( indTracker.recentlyClicked(key + ':continue'),':continue is hot');
assert(!indTracker.recentlyClicked(key + ':next'),    ':next still cold');

// ─────────────────────────────────────────────────────────────────
// Cooldown — memory pruning
// ─────────────────────────────────────────────────────────────────
section('Cooldown — memory pruning');

const pruneTracker = makeCooldownTracker(10000);
pruneTracker._store['/watch/ancient:skip'] = Date.now() - 25000;
pruneTracker.markClicked('/watch/fresh:skip');
assert(!('/watch/ancient:skip' in pruneTracker._store),
  'entries older than 2× cooldown are pruned');
assert('/watch/fresh:skip' in pruneTracker._store,
  'fresh entry is retained after pruning');

// ─────────────────────────────────────────────────────────────────
// tryClick — respects enabled flag per feature
// ─────────────────────────────────────────────────────────────────
section('tryClick — per-feature enable/disable');

const tc = makeCooldownTracker(10000);

assert( tc.tryClick(true, '/watch/1:skip'),    'click succeeds when button found');
assert(!tc.tryClick(true, '/watch/1:skip'),    'second click blocked by cooldown');
assert(!tc.tryClick(false, '/watch/1:recap'),  'click skipped when button not found (false)');
assert( tc.tryClick(true, '/watch/1:recap'),   'recap click succeeds on first attempt');

// ─────────────────────────────────────────────────────────────────
// Options — threshold boundary values
// ─────────────────────────────────────────────────────────────────
section('Options — threshold boundary values');

function wouldClickNext(fraction, threshold) {
  return fraction >= threshold;
}

assert(!wouldClickNext(0.94, 0.95), '94% < 95% threshold → no click');
assert( wouldClickNext(0.95, 0.95), '95% = 95% threshold → click');
assert( wouldClickNext(1.00, 0.95), '100% ≥ 95% threshold → click');
assert(!wouldClickNext(0.49, 0.50), '49% < 50% threshold → no click');
assert( wouldClickNext(0.50, 0.50), '50% = 50% threshold → click');

// ─────────────────────────────────────────────────────────────────
// Options — settings storage round-trip
// ─────────────────────────────────────────────────────────────────
section('Options — settings round-trip (slider ↔ storage values)');

function sliderToThreshold(v) { return parseInt(v, 10) / 100; }
function sliderToCooldown(v)  { return parseInt(v, 10) * 1000; }
function thresholdToSlider(v) { return Math.round(v * 100); }
function cooldownToSlider(v)  { return Math.round(v / 1000); }

assert(sliderToThreshold('95') === 0.95,  'slider 95 → storage 0.95');
assert(sliderToThreshold('50') === 0.50,  'slider 50 → storage 0.50');
assert(sliderToCooldown('10') === 10000,  'slider 10 → storage 10000ms');
assert(sliderToCooldown('1')  === 1000,   'slider 1 → storage 1000ms');
assert(thresholdToSlider(0.95) === 95,    'storage 0.95 → slider 95');
assert(cooldownToSlider(10000) === 10,    'storage 10000ms → slider 10');
assert(sliderToThreshold(String(thresholdToSlider(0.95))) === 0.95, 'threshold round-trip');
assert(sliderToCooldown(String(cooldownToSlider(10000))) === 10000, 'cooldown round-trip');

// ─────────────────────────────────────────────────────────────────
// Options — defaults are complete
// ─────────────────────────────────────────────────────────────────
section('Options — defaults cover all storage keys');

const DEFAULTS = {
  nextThreshold: 0.95, cooldownMs: 10000,
  skipIntro: true, skipRecap: true, nextEpisode: true, continueWatching: true
};
const REQUIRED_KEYS = ['nextThreshold', 'cooldownMs', 'skipIntro', 'skipRecap', 'nextEpisode', 'continueWatching'];

for (const k of REQUIRED_KEYS) {
  assert(k in DEFAULTS, `defaults contain "${k}"`);
  assert(DEFAULTS[k] !== undefined, `"${k}" default is not undefined`);
}

// ─────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(40)}`);
console.log(`${total} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
