(function () {
  "use strict";
  // Native navigation and complete content never depend on this enhancement.
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  var media = gsap.matchMedia();

  media.add({
    desktop: "(min-width: 761px)",
    mobile: "(max-width: 760px)",
    reduce: "(prefers-reduced-motion: reduce)"
  }, function (context) {
    if (context.conditions.reduce) return;
    var desktop = context.conditions.desktop;
    var cleanups = [];

    if (desktop) {
      // A separate camera layer keeps the photograph's CSS intro independent.
      var hero = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: { id: "hero-depth", trigger: ".hero", start: "top top", end: "bottom top", scrub: .55 }
      });
      hero.fromTo(".hero-camera", { scale: 1.075, yPercent: 0 }, { scale: 1, yPercent: 7 }, 0);
      hero.fromTo(".hero-line > span", { y: 0, opacity: 1 }, {
        y: function (index) { return index ? -72 : -40; }, opacity: .25, stagger: .08, duration: .82
      }, .12);
    }

    // Reuse one timeline per item. Reset only beyond the actual viewport,
    // never while a visible image crosses an arbitrary percentage threshold.
    function replayOnVisit(host, animation, id) {
      var armed = true;
      var initializing = true;
      var hasFocus = function () { return host.contains(document.activeElement); };
      var outside = function () {
        var rect = host.getBoundingClientRect();
        return rect.bottom <= 0 || rect.top >= window.innerHeight;
      };
      var finish = function () {
        armed = false;
        animation.pause().progress(1, true);
      };
      var reset = function () {
        if (hasFocus() || !outside()) return;
        armed = true;
        animation.pause().progress(0, true);
      };
      var enter = function () {
        if (initializing) return;
        if (hasFocus()) { finish(); return; }
        if (armed) { armed = false; animation.restart(); }
      };
      ScrollTrigger.create({
        id: id, trigger: host, animation: animation,
        start: "top bottom", end: "bottom top",
        toggleActions: "none none none none",
        onEnter: enter, onEnterBack: enter,
        onLeave: reset, onLeaveBack: reset,
        onRefresh: function () {
          if (initializing) return;
          if (outside()) reset();
          else if (armed) finish();
        }
      });
      initializing = false;
      // Deep links and restored scroll positions start readable, yet can replay later.
      if (outside()) reset(); else finish();
      var blur = function (event) {
        if (!host.contains(event.relatedTarget)) reset();
      };
      host.addEventListener("focusin", finish);
      host.addEventListener("focusout", blur);
      cleanups.push(function () {
        host.removeEventListener("focusin", finish);
        host.removeEventListener("focusout", blur);
      });
    }

    function revealImage(host, frame, caption, index) {
      if (!frame || !caption) return;
      var curtain = document.createElement("span");
      curtain.className = "media-curtain";
      curtain.setAttribute("aria-hidden", "true");
      frame.appendChild(curtain);
      var animation = gsap.timeline({
        paused: true, defaults: { ease: "power3.out" }
      });
      animation.fromTo(curtain, { scaleY: 1 }, { scaleY: 0, duration: desktop ? .78 : .48 }, 0);
      animation.fromTo(frame, { scale: desktop ? .98 : 1 }, { scale: 1, duration: desktop ? .78 : .48 }, 0);
      animation.fromTo(caption, { y: 10, opacity: .25 }, { y: 0, opacity: 1, duration: .42 }, desktop ? .18 : .08);
      replayOnVisit(host, animation, "image-reveal-" + index);
      cleanups.push(function () { curtain.remove(); });
    }

    document.querySelectorAll(".project").forEach(function (host, index) {
      revealImage(host, host.querySelector(".project-media"), host.querySelector(".project-info"), "project-" + index);
    });

    document.querySelectorAll(".archive-grid figure").forEach(function (host, index) {
      var frame = host.querySelector(".archive-visual");
      if (!frame) return;
      var animation = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      var offset = desktop ? (index % 3) * .055 : 0;
      animation.fromTo(frame, { x: desktop ? 26 : 12, opacity: .28 }, {
        x: 0, opacity: 1, duration: desktop ? .64 : .42
      }, offset);
      animation.fromTo(host.querySelector("figcaption"), { opacity: .4 }, { opacity: 1, duration: .35 }, offset + .1);
      replayOnVisit(host, animation, "archive-reveal-" + index);
    });

    {
      // On phones the figure itself defines the range, not the much taller skills column.
      var drawing = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { id: "space-assembly", trigger: desktop ? ".approach-layout" : ".space-drawing", start: desktop ? "top 80%" : "top 85%", end: desktop ? "bottom 55%" : "bottom 35%", scrub: desktop ? .6 : .18 }
      });
      drawing.fromTo(".drawing-floor", { y: 0, opacity: .5 }, { y: desktop ? 18 : 12, opacity: 1, duration: .6 }, 0);
      drawing.fromTo(".drawing-columns", { opacity: .3 }, { opacity: 1, duration: .6 }, .2);
      drawing.fromTo(".drawing-roof", { y: 0 }, { y: desktop ? -42 : -32, duration: .9 }, .35);
      drawing.fromTo(".drawing-guides", { opacity: .12 }, { opacity: .4, duration: 1 }, 0);
    }
    if (desktop) {
      gsap.fromTo(".process i", { scaleX: 0, transformOrigin: "left center" }, {
        scaleX: 1, duration: .5, stagger: .12, ease: "power2.out",
        scrollTrigger: { trigger: ".process", start: "top 85%", once: true }
      });
    }

    document.querySelectorAll(".photo-grid figure").forEach(function (host, index) {
      var camera = host.querySelector(".photo-camera");
      if (!camera) return;
      // The frame, caption and anchor stay still. Only the inner camera reframes;
      // its own layer also keeps CSS hover transforms independent of scrolling.
      var direction = index % 2 ? -1 : 1;
      gsap.fromTo(camera, {
        scale: desktop ? 1.045 : 1.025,
        xPercent: direction * (desktop ? -.7 : -.3), yPercent: desktop ? .7 : .3
      }, {
        scale: desktop ? 1.11 : 1.055,
        xPercent: direction * (desktop ? .7 : .3), yPercent: desktop ? -.7 : -.3,
        ease: "none",
        scrollTrigger: { id: "photo-camera-" + index, trigger: host, start: "top bottom", end: "bottom top", scrub: desktop ? .45 : .25 }
      });
    });

    if (desktop) {
      gsap.fromTo(".contact-wordmark", { xPercent: 8 }, {
        xPercent: 0, ease: "none",
        scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom bottom", scrub: 1 }
      });
    }
    return function () { cleanups.forEach(function (cleanup) { cleanup(); }); };
  });

  // Images reserve their dimensions; only font/load/history changes need refresh.
  var refresh = function () { ScrollTrigger.refresh(); };
  window.addEventListener("load", refresh, { once: true });
  window.addEventListener("pageshow", refresh);
  if (document.fonts) document.fonts.ready.then(refresh);
})();
