/**
 * Weather Page - Temperature ring animation & sync
 * Runs after script.js populates weather data
 */
(function() {
  const RING_CIRCUMFERENCE = 327;
  const TEMP_MIN = -10;
  const TEMP_MAX = 45;

  function updateTempRing() {
    const ringEl = document.getElementById('temp-ring-fill');
    const tempEl = document.getElementById('weather-temp');
    if (!ringEl || !tempEl) return;

    const temp = parseInt(tempEl.textContent, 10);
    if (isNaN(temp)) return;

    const progress = Math.min(1, Math.max(0, (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    ringEl.style.strokeDashoffset = offset;
  }

  // Observe when weather data is populated
  const observer = new MutationObserver(() => {
    const tempEl = document.getElementById('weather-temp');
    if (tempEl && tempEl.textContent !== '--' && !isNaN(parseInt(tempEl.textContent, 10))) {
      updateTempRing();
    }
  });

  const dataEl = document.getElementById('weather-data');
  if (dataEl) {
    observer.observe(dataEl, { childList: true, subtree: true, characterData: true });
  }

  // Also run on load in case data is already there (e.g. from cache)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(updateTempRing, 100);
    });
  } else {
    setTimeout(updateTempRing, 100);
  }
})();
