// Filters, paging and detail state use ordinary server navigation.
for (const form of document.querySelectorAll("form.filter-bar")) {
  const allFormats = form.querySelector("[data-format-all]");
  const formats = [...form.querySelectorAll('input[name="format"]')];
  if (!allFormats || !formats.length) continue;
  allFormats.hidden = false;
  const updateAll = () => {
    allFormats.setAttribute(
      "aria-pressed",
      String(formats.every((input) => !input.checked)),
    );
  };
  for (const input of formats) input.addEventListener("change", updateAll);
  allFormats.addEventListener("click", (event) => {
    event.preventDefault();
    for (const input of formats) input.checked = false;
    updateAll();
  });
}

document.addEventListener("error", (event) => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.closest(".artwork")) {
    image.hidden = true;
    image.closest(".artwork").classList.add("unavailable");
    image.previousElementSibling?.removeAttribute("aria-hidden");
  }
}, true);

for (const image of document.querySelectorAll(".artwork img")) {
  if (image.complete && image.naturalWidth === 0) {
    image.hidden = true;
    image.closest(".artwork").classList.add("unavailable");
  }
}

const stateKey = "stampchain-scroll:" + location.pathname + location.search;
try {
  const previous = sessionStorage.getItem(stateKey);
  if (
    previous &&
    performance.getEntriesByType("navigation")[0]?.type === "back_forward"
  ) {
    requestAnimationFrame(() => scrollTo(0, Number(previous) || 0));
  }
  addEventListener(
    "pagehide",
    () => sessionStorage.setItem(stateKey, String(scrollY)),
  );
} catch {
  // Browsing remains functional when storage is unavailable.
}

// Expose local lab observations as DOM attributes for browser verification.
// No metrics are transmitted or persisted.
if ("PerformanceObserver" in window) {
  try {
    let cls = 0;
    let windowScore = 0;
    let firstShift = 0;
    let lastShift = 0;
    document.documentElement.dataset.cls = "0";
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        document.documentElement.dataset.lcp = String(entry.startTime);
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        if (
          entry.startTime - lastShift < 1000 &&
          entry.startTime - firstShift < 5000
        ) {
          windowScore += entry.value;
        } else {
          firstShift = entry.startTime;
          windowScore = entry.value;
        }
        lastShift = entry.startTime;
        cls = Math.max(cls, windowScore);
      }
      document.documentElement.dataset.cls = String(cls);
    }).observe({ type: "layout-shift", buffered: true });
    addEventListener("load", () => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav) {
        document.documentElement.dataset.ttfb = String(nav.responseStart);
      }
      document.documentElement.dataset.resourceUrls = JSON.stringify(
        performance.getEntriesByType("resource").map((entry) => entry.name),
      );
    });
  } catch {
    // Unsupported browser measurement APIs do not affect browsing.
  }
}
