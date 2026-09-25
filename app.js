(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-nav]");
  var copyButton = document.querySelector("[data-copy]");
  var copyStatus = document.querySelector("[data-copy-status]");

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 24 || nav.classList.contains("is-open"));
    var scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
    header.style.setProperty("--scroll-progress", String(progress));
  }

  var headerFrame = 0;
  function scheduleHeaderUpdate() {
    if (headerFrame) return;
    headerFrame = window.requestAnimationFrame(function () {
      headerFrame = 0;
      updateHeader();
    });
  }

  window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
  window.addEventListener("resize", scheduleHeaderUpdate, { passive: true });
  updateHeader();

  window.addEventListener("load", function () {
    if (!window.location.hash) return;
    var target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
    catch (_) { return; }
    if (!target) return;
    var previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    document.documentElement.style.scrollBehavior = previousBehavior;
  });

  function setMenu(open) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    nav.classList.toggle("is-open", open);
    updateHeader();
  }
  menuButton.addEventListener("click", function () {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("click", function (event) {
    if (nav.classList.contains("is-open") && !header.contains(event.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", function (event) {
    if (event.matches) setMenu(false);
  });

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px" });

    revealItems.forEach(function (item) {
      if (item.getBoundingClientRect().top > window.innerHeight) item.classList.add("will-reveal");
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
    if (event.matches) revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  });

  var certificateStage = document.querySelector("[data-certificate-stage]");
  if (certificateStage) {
    var certificateCards = Array.from(certificateStage.querySelectorAll("img"));
    var certificateMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var certificateIndex = 0;
    var certificateTimer = null;
    var certificateVisible = !("IntersectionObserver" in window);
    var certificateHovered = false;
    var certificateManual = false;
    var certificateWheelAt = 0;
    var certificateWheelSum = 0;
    var certificateSection = certificateStage.parentElement;
    var certificateStatus = document.querySelector("[data-certificate-status]");

    function stepCertificate(direction) {
      certificateManual = true;
      certificateStage.classList.add("is-manual");
      certificateIndex = (certificateIndex + direction + certificateCards.length) % certificateCards.length;
      positionCertificates();
      if (certificateStatus) certificateStatus.textContent = "证书 " + (certificateIndex + 1) + " / " + certificateCards.length;
      updateCertificatePlayback();
    }
    document.querySelectorAll("[data-certificate-step]").forEach(function (button) {
      button.addEventListener("click", function () { stepCertificate(Number(button.dataset.certificateStep)); });
    });
    certificateSection.addEventListener("wheel", function (event) {
      if (event.ctrlKey) return;
      var bounds = certificateStage.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      if (event.target.closest("[data-certificate-step]")) event.preventDefault();
      var now = Date.now();
      if (now - certificateWheelAt < 220) return;
      var delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (now - certificateWheelAt > 600 || Math.sign(delta) !== Math.sign(certificateWheelSum)) certificateWheelSum = 0;
      certificateWheelSum += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(certificateWheelSum) < 18) return;
      stepCertificate(certificateWheelSum > 0 ? 1 : -1);
      certificateWheelSum = 0;
      certificateWheelAt = now;
    }, { passive: false });

    function positionCertificates() {
      certificateCards.forEach(function (card, index) {
        var slot = (index - certificateIndex + certificateCards.length) % certificateCards.length;
        if (slot > Math.floor(certificateCards.length / 2)) slot -= certificateCards.length;
        card.dataset.slot = String(slot);
      });
    }

    function updateCertificatePlayback() {
      var shouldPlay = certificateVisible && !certificateHovered && !certificateManual && !certificateMotion.matches && !document.hidden;
      if (certificateTimer) window.clearInterval(certificateTimer);
      certificateTimer = shouldPlay ? window.setInterval(function () {
        certificateIndex = (certificateIndex + 1) % certificateCards.length;
        positionCertificates();
      }, 5600) : null;
    }

    positionCertificates();
    if ("IntersectionObserver" in window) {
      var certificateObserver = new IntersectionObserver(function (entries) {
        certificateVisible = entries[0].isIntersecting;
        updateCertificatePlayback();
      }, { threshold: 0.08 });
      certificateObserver.observe(certificateStage);
    }
    certificateStage.parentElement.addEventListener("mouseenter", function () {
      certificateHovered = true;
      updateCertificatePlayback();
    });
    certificateStage.parentElement.addEventListener("mouseleave", function () {
      certificateHovered = false;
      updateCertificatePlayback();
    });
    document.addEventListener("visibilitychange", updateCertificatePlayback);
    certificateMotion.addEventListener("change", updateCertificatePlayback);
    updateCertificatePlayback();
  }

  // Native anchors own all project navigation, even if optional scripts fail.
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll("a").forEach(function (link) {
          if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-20% 0px -60% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function fallbackCopy(text) {
    var previousFocus = document.activeElement;
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try { copied = document.execCommand("copy"); }
    finally {
      textarea.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
    if (!copied) throw new Error("Copy unavailable");
  }

  var copyTimeout;
  if (copyButton && copyStatus) copyButton.addEventListener("click", async function () {
    var value = copyButton.getAttribute("data-copy");
    window.clearTimeout(copyTimeout);
    try {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(value);
      } catch (_) { fallbackCopy(value); }
      copyStatus.textContent = "微信号已复制。";
      copyTimeout = window.setTimeout(function () { copyStatus.textContent = ""; }, 2600);
    } catch (_) {
      copyStatus.textContent = "复制失败，请手动复制：" + value;
    }
  });
})();
