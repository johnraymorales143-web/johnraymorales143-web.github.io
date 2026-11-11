(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var CLIPS = window.CLIPS || {}, BEST = window.BEST || [], WORK = window.WORK || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function tc(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function metaLine(item) { return [item.format, item.lang].filter(Boolean).join(", "); }

  /* Reel */
  var best = $("#best");
  BEST.forEach(function (item) {
    var first = CLIPS[item.variants[0].file];
    var li = el("li", { "class": "best-item" });
    var btn = el("button", { "class": "best-btn", type: "button", "aria-label": "Play " + item.title });
    btn.innerHTML =
      '<div class="phone"><img loading="lazy" src="' + first.poster + '" alt="" width="360" height="640">' +
      '<span class="tc">' + tc(first.dur) + '</span>' +
      '<span class="play">' + (item.variants.length > 1 ? "Play \u00b7 " + item.variants.length + " versions" : "Play") + "</span></div>" +
      '<div class="best-cap"><div><h3>' + esc(item.title) + '</h3><p>' + esc(metaLine(item)) + '</p></div><span class="num">0' + (BEST.indexOf(item) + 1) + "</span></div>";
    btn.addEventListener("click", function () { openPlayer(item, btn); });
    li.appendChild(btn);
    best.appendChild(li);
  });

  /* Grid */
  var grid = $("#grid");
  WORK.forEach(function (item) {
    var first = CLIPS[item.variants[0].file];
    var li = el("li", { "data-cat": item.cat });
    var n = item.variants.length;
    var btn = el("button", { "class": "tile-btn", type: "button", "aria-label": "Play " + item.title });
    btn.innerHTML =
      '<div class="phone"><img loading="lazy" src="' + first.poster + '" alt="" width="360" height="640">' +
      '<span class="tc">' + tc(first.dur) + "</span>" +
      (n > 1 ? '<span class="badge">' + n + " hooks</span>" : "") + "</div>" +
      '<div class="tile-cap"><h3>' + esc(item.title) + "</h3><p>" + esc(metaLine(item)) + "</p></div>";
    btn.addEventListener("click", function () { openPlayer(item, btn); });
    li.appendChild(btn);
    grid.appendChild(li);
  });

  /* Hero featured ads */
  document.querySelectorAll(".feat-item, .proof-play").forEach(function (b) {
    var item = BEST.filter(function (x) { return x.id === b.dataset.best; })[0];
    if (item) b.addEventListener("click", function () { openPlayer(item, b, +(b.dataset.var || 0)); });
  });

  /* Filters */
  var tabs = document.querySelectorAll(".filters button");
  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      var cat = b.dataset.cat;
      grid.querySelectorAll("li").forEach(function (li) { li.hidden = cat !== "all" && li.dataset.cat !== cat; });
    });
  });

  /* Player (Google Drive preview, view-only) */
  var dlg = $("#player"), screen = $("#pl-screen"), opener = null;
  function load(item, idx) {
    var v = item.variants[idx], clip = CLIPS[v.file];
    screen.innerHTML = "";
    if (clip.driveId) {
      var f = el("iframe", {
        src: "https://drive.google.com/file/d/" + encodeURIComponent(clip.driveId) + "/preview",
        title: item.title + ", " + v.label,
        allow: "autoplay; fullscreen",
        allowfullscreen: "",
        referrerpolicy: "no-referrer",
        sandbox: "allow-scripts allow-same-origin allow-presentation"
      });
      screen.appendChild(f);
      screen.appendChild(el("div", { "class": "pl-shield", "aria-hidden": "true" }));
    } else {
      screen.appendChild(el("img", { src: clip.poster, alt: "" }));
      screen.appendChild(el("p", { "class": "pl-wait" }, "This video is still uploading. Check back soon."));
    }
    $("#pl-vars").querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-pressed", i === idx ? "true" : "false"); });
  }
  function openPlayer(item, from, start) {
    opener = from;
    $("#pl-title").textContent = item.title;
    $("#pl-meta").textContent = metaLine(item);
    $("#pl-note").textContent = item.note || "";
    $("#pl-note").hidden = !item.note;
    var vars = $("#pl-vars");
    vars.innerHTML = "";
    if (item.variants.length > 1) {
      item.variants.forEach(function (v, i) {
        var b = el("button", { type: "button", "aria-pressed": "false" }, esc(v.label) + '<span class="tcs">' + tc(CLIPS[v.file].dur) + "</span>");
        b.addEventListener("click", function () { load(item, i); });
        vars.appendChild(b);
      });
    }
    load(item, Math.min(start || 0, item.variants.length - 1));
    dlg.showModal();
  }
  function closePlayer() { dlg.close(); }
  dlg.addEventListener("close", function () { screen.innerHTML = ""; if (opener) opener.focus(); });
  $("#pl-close").addEventListener("click", closePlayer);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closePlayer(); });
  dlg.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* Claude session: reveal once when it scrolls into view */
  var lines = document.querySelectorAll("#log li");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reveal() { lines.forEach(function (li, i) { setTimeout(function () { li.classList.add("on"); }, reduce ? 0 : i * 520); }); }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { reveal(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe($("#log"));
  } else { reveal(); }

  /* Marquee */
  var fmts = ["UGC ads", "VSLs", "Pixar-style 3D", "Claymation", "Singing animation", "Skeleton explainers", "Localized ads", "Hook testing"];
  var track = $("#track");
  track.innerHTML = fmts.concat(fmts).map(function (f) { return "<span>" + f + "</span>"; }).join("");

  /* Contact */
  var u = "johnraymorales143", d = "gmail.com", addr = u + "@" + d;
  var mailto = "mailto:" + addr + "?subject=" + encodeURIComponent("Hi John Ray");
  $("#mail").href = mailto;
  $("#mail-plain").textContent = addr;
  $("#yr").textContent = new Date().getFullYear();
})();
