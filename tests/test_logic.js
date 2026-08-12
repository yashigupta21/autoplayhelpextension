// tests/test_logic.js
// Unit tests for the pure logic in content.js (no DOM/Chrome deps).
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
// Mirrors of content.js logic
// ─────────────────────────────────────────────────────────────────

const playbackFraction = (v) => (v && v.duration ? v.currentTime / v.duration : 0);

// Mirrors tryClick's cooldown + pruning, minus the DOM lookup and click.
function makeCooldownTracker(cooldownMs) {
  const lastClicked = {};

  function tryClick(found, key) {
    if (!found) return false;
    const now = Date.now();
    if (now - (lastClicked[key] || 0) < cooldownMs) return false;

    lastClicked[key] = now;
    const cutoff = now - cooldownMs * 2;
    for (const k in lastClicked) if (lastClicked[k] < cutoff) delete lastClicked[k];
    return true;
  }

  return { tryClick, _store: lastClicked };
}

// ─────────────────────────────────────────────────────────────────
section('playbackFraction');

assert(playbackFraction(null) === 0, 'null video → 0');
assert(playbackFraction(undefined) === 0, 'undefined video → 0');
assert(playbackFraction({ currentTime: 0, duration: 0 }) === 0, 'zero duration → 0 (no divide-by-zero)');
assert(playbackFraction({ currentTime: 0, duration: 60 }) === 0, 'start of episode → 0');
assert(playbackFraction({ currentTime: 57, duration: 60 }) === 0.95, '95% through → 0.95');
assert(playbackFraction({ currentTime: 60, duration: 60 }) === 1.0, 'fully played → 1.0');
assert(playbackFraction({ currentTime: 47.5, duration: 50 }) === 0.95, 'fractional timestamps → correct fraction');

// ─────────────────────────────────────────────────────────────────
section('Cooldown');

const tc = makeCooldownTracker(10000);

assert( tc.tryClick(true,  '/watch/1:skipIntro'), 'first click succeeds when button found');
assert(!tc.tryClick(true,  '/watch/1:skipIntro'), 'second click blocked by cooldown');
assert(!tc.tryClick(false, '/watch/1:skipRecap'), 'no click when button not found');
assert( tc.tryClick(true,  '/watch/1:skipRecap'), 'a different action has its own cooldown');
assert( tc.tryClick(true,  '/watch/2:skipIntro'), 'a different episode has its own cooldown');

const expired = makeCooldownTracker(10000);
expired._store['/watch/old:skipIntro'] = Date.now() - 11000;
assert(expired.tryClick(true, '/watch/old:skipIntro'), 'click allowed once cooldown has elapsed');

// ─────────────────────────────────────────────────────────────────
section('Cooldown — memory pruning');

const prune = makeCooldownTracker(10000);
prune._store['/watch/ancient:skipIntro'] = Date.now() - 25000;
prune.tryClick(true, '/watch/fresh:skipIntro');
assert(!('/watch/ancient:skipIntro' in prune._store), 'entries older than 2× cooldown are pruned');
assert('/watch/fresh:skipIntro' in prune._store, 'fresh entry is retained after pruning');

// ─────────────────────────────────────────────────────────────────
section('Next-episode threshold');

const wouldClickNext = (fraction, threshold) => fraction >= threshold;

assert(!wouldClickNext(0.94, 0.95), '94% < 95% threshold → no click');
assert( wouldClickNext(0.95, 0.95), '95% = 95% threshold → click');
assert( wouldClickNext(1.00, 0.95), '100% ≥ 95% threshold → click');
assert(!wouldClickNext(0.49, 0.50), '49% < 50% threshold → no click');

// ─────────────────────────────────────────────────────────────────
section('Options — id derivation matches options.html');

const featId = (key) => 'feat-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

assert(featId('skipIntro')        === 'feat-skip-intro',        'skipIntro → feat-skip-intro');
assert(featId('skipRecap')        === 'feat-skip-recap',        'skipRecap → feat-skip-recap');
assert(featId('nextEpisode')      === 'feat-next-episode',      'nextEpisode → feat-next-episode');
assert(featId('continueWatching') === 'feat-continue-watching', 'continueWatching → feat-continue-watching');

// ─────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(40)}`);
console.log(`${total} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
