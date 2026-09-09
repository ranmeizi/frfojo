/* Prontera card collection – shared by index.html & card-collection.html */
(function () {
  async function loadCardData() {
    const res = await fetch("card-groups.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("无法加载 card-groups.json");
    return res.json();
  }

  window.initPronteraCards = async function initPronteraCards() {
    if (window.__pronteraCardsInited) return;
    if (!document.getElementById("groups")) {
      throw new Error("集卡面板尚未挂载");
    }

    const STORAGE_KEY = "prontera.card-collection.owned.v1";
    const DATA = await loadCardData();
    window.__pronteraCardsInited = true;

    const state = {
      owned: loadOwned(),
      filter: "all",
      query: "",
      open: new Set(),
    };

    const els = {
      stats: document.getElementById("stats"),
      groups: document.getElementById("groups"),
      bonusRail: document.getElementById("bonusRail"),
      bonusDrawer: document.getElementById("bonusDrawer"),
      bonusDrawerMask: document.getElementById("bonusDrawerMask"),
      bonusDrawerBody: document.getElementById("bonusDrawerBody"),
      bonusDrawerSub: document.getElementById("bonusDrawerSub"),
      search: document.getElementById("search"),
      filters: document.getElementById("filters"),
      groupCountLabel: document.getElementById("groupCountLabel"),
      bonusCountLabel: document.getElementById("bonusCountLabel"),
      dataMeta: document.getElementById("dataMeta"),
      saveHint: document.getElementById("saveHint"),
      toast: document.getElementById("toast"),
      importFile: document.getElementById("importFile"),
    };

    const BONUS_PREVIEW_LIMIT = 6;

    els.dataMeta.textContent = `${DATA.groups.length} 组 / ${DATA.cards.length} 张卡`;

    function loadOwned() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed.map(String));
        if (parsed && Array.isArray(parsed.owned)) return new Set(parsed.owned.map(String));
        return new Set();
      } catch {
        return new Set();
      }
    }

    function buildProgressPayload() {
      return {
        version: 1,
        key: STORAGE_KEY,
        savedAt: new Date().toISOString(),
        owned: [...state.owned].sort((a, b) => Number(a) - Number(b)),
      };
    }

    function updateSaveHint(iso) {
      if (!els.saveHint) return;
      const when = iso ? new Date(iso) : null;
      const timeText =
        when && !Number.isNaN(when.getTime())
          ? when.toLocaleString()
          : "尚未保存";
      els.saveHint.innerHTML = `进度已自动保存在本机 · 最近保存 <strong>${timeText}</strong> · 已录入 <strong>${state.owned.size}</strong> 张`;
    }

    function saveOwned() {
      const payload = buildProgressPayload();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      updateSaveHint(payload.savedAt);
    }

    function applyOwnedList(list, sourceLabel) {
      if (!Array.isArray(list)) throw new Error("格式不对：需要 owned 数组");
      const validIds = new Set(DATA.cards.map((c) => c.id));
      const next = [];
      for (const id of list.map(String)) {
        if (validIds.has(id)) next.push(id);
      }
      state.owned = new Set(next);
      saveOwned();
      render();
      toast(`${sourceLabel}成功：${state.owned.size} 张有效卡片`);
    }

    function mergeOwnedIds(ids, sourceLabel) {
      const validIds = new Set(DATA.cards.map((c) => c.id));
      let added = 0;
      for (const id of ids.map(String)) {
        if (!validIds.has(id)) continue;
        if (!state.owned.has(id)) {
          state.owned.add(id);
          added += 1;
        }
      }
      saveOwned();
      render();
      toast(`${sourceLabel}：新增 ${added} 张（当前共 ${state.owned.size} 张）`);
      return added;
    }

    /* ---------- OCR + 匹配调参 ---------- */
    const OCR_PARAM_KEY = "prontera.card-collection.ocr-params.v1";
    const OCR_DEFAULTS = {
      psm: "6",
      scale: 2,
      contrast: 1.4,
      thresh: 0,
      score: 72,
      minLen: 2,
      fuzzy: 1,
      contain: 2,
      invert: false,
      sharp: true,
      onlyChi: false,
      matchId: true,
      strictShort: true,
    };

    const ocrState = {
      file: null,
      objectUrl: null,
      running: false,
      matches: [],
      lastCanvas: null,
    };

    const ocrEls = {
      modal: document.getElementById("ocrModal"),
      drop: document.getElementById("ocrDrop"),
      file: document.getElementById("ocrFile"),
      previewOrig: document.getElementById("ocrPreviewOrig"),
      previewProcBox: document.getElementById("ocrPreviewProcBox"),
      previewImg: document.getElementById("ocrPreviewImg"),
      procCanvas: document.getElementById("ocrProcCanvas"),
      progress: document.getElementById("ocrProgress"),
      status: document.getElementById("ocrStatus"),
      pct: document.getElementById("ocrPct"),
      bar: document.getElementById("ocrBar"),
      results: document.getElementById("ocrResults"),
      raw: document.getElementById("ocrRaw"),
      matchList: document.getElementById("ocrMatchList"),
      matchCount: document.getElementById("ocrMatchCount"),
      run: document.getElementById("ocrRun"),
      apply: document.getElementById("ocrApply"),
      close: document.getElementById("ocrClose"),
      closeX: document.getElementById("ocrCloseX"),
      changeImg: document.getElementById("ocrChangeImg"),
      dropTitle: document.getElementById("ocrDropTitle"),
      dropHint: document.getElementById("ocrDropHint"),
      selectAll: document.getElementById("ocrSelectAll"),
      selectNone: document.getElementById("ocrSelectNone"),
      steps: document.getElementById("ocrSteps"),
      previewProcBtn: document.getElementById("ocrPreviewProc"),
      resetParams: document.getElementById("ocrResetParams"),
      psm: document.getElementById("ocrPsm"),
      scale: document.getElementById("ocrScale"),
      contrast: document.getElementById("ocrContrast"),
      thresh: document.getElementById("ocrThresh"),
      score: document.getElementById("ocrScore"),
      minLen: document.getElementById("ocrMinLen"),
      fuzzy: document.getElementById("ocrFuzzy"),
      contain: document.getElementById("ocrContain"),
      invert: document.getElementById("ocrInvert"),
      sharp: document.getElementById("ocrSharp"),
      onlyChi: document.getElementById("ocrOnlyChi"),
      matchId: document.getElementById("ocrMatchId"),
      strictShort: document.getElementById("ocrStrictShort"),
      psmVal: document.getElementById("ocrPsmVal"),
      scaleVal: document.getElementById("ocrScaleVal"),
      contrastVal: document.getElementById("ocrContrastVal"),
      threshVal: document.getElementById("ocrThreshVal"),
      scoreVal: document.getElementById("ocrScoreVal"),
      minLenVal: document.getElementById("ocrMinLenVal"),
      fuzzyVal: document.getElementById("ocrFuzzyVal"),
      containVal: document.getElementById("ocrContainVal"),
    };

    const PSM_LABEL = {
      "6": "默认",
      "4": "单列",
      "3": "自动",
      "11": "较散",
      "12": "较散+",
      multi: "多模式",
    };

    function setOcrStep(step) {
      if (!ocrEls.steps) return;
      for (const el of ocrEls.steps.querySelectorAll(".ocr-step")) {
        const n = Number(el.getAttribute("data-step"));
        el.classList.toggle("on", n === step);
        el.classList.toggle("done", n < step);
      }
    }

    function syncApplyButton() {
      const checked = ocrEls.matchList.querySelectorAll("input[data-ocr-id]:checked").length;
      ocrEls.apply.disabled = checked === 0;
      ocrEls.apply.textContent = checked ? `加入已拥有（${checked}）` : "加入已拥有";
    }

    function readOcrParams() {
      return {
        psm: ocrEls.psm.value,
        scale: Number(ocrEls.scale.value),
        contrast: Number(ocrEls.contrast.value),
        thresh: Number(ocrEls.thresh.value),
        score: Number(ocrEls.score.value),
        minLen: Number(ocrEls.minLen.value),
        fuzzy: Number(ocrEls.fuzzy.value),
        contain: Number(ocrEls.contain.value),
        invert: ocrEls.invert.checked,
        sharp: ocrEls.sharp.checked,
        onlyChi: ocrEls.onlyChi.checked,
        matchId: ocrEls.matchId.checked,
        strictShort: ocrEls.strictShort.checked,
      };
    }

    function applyOcrParamsToUi(p) {
      ocrEls.psm.value = p.psm;
      ocrEls.scale.value = String(p.scale);
      ocrEls.contrast.value = String(p.contrast);
      ocrEls.thresh.value = String(p.thresh);
      ocrEls.score.value = String(p.score);
      ocrEls.minLen.value = String(p.minLen);
      ocrEls.fuzzy.value = String(p.fuzzy);
      ocrEls.contain.value = String(p.contain);
      ocrEls.invert.checked = !!p.invert;
      ocrEls.sharp.checked = !!p.sharp;
      ocrEls.onlyChi.checked = !!p.onlyChi;
      ocrEls.matchId.checked = !!p.matchId;
      ocrEls.strictShort.checked = !!p.strictShort;
      syncOcrParamLabels();
    }

    function syncOcrParamLabels() {
      const p = readOcrParams();
      ocrEls.psmVal.textContent = PSM_LABEL[p.psm] || p.psm;
      ocrEls.scaleVal.textContent = `${p.scale.toFixed(1)}x`;
      ocrEls.contrastVal.textContent = p.contrast.toFixed(1);
      ocrEls.threshVal.textContent = p.thresh <= 0 ? "自动" : String(p.thresh);
      ocrEls.scoreVal.textContent = String(p.score);
      ocrEls.minLenVal.textContent = String(p.minLen);
      ocrEls.fuzzyVal.textContent = String(p.fuzzy);
      ocrEls.containVal.textContent = String(p.contain);
    }

    function saveOcrParams() {
      try {
        localStorage.setItem(OCR_PARAM_KEY, JSON.stringify(readOcrParams()));
      } catch {}
    }

    function loadOcrParams() {
      try {
        const raw = localStorage.getItem(OCR_PARAM_KEY);
        if (!raw) {
          applyOcrParamsToUi(OCR_DEFAULTS);
          return;
        }
        applyOcrParamsToUi({ ...OCR_DEFAULTS, ...JSON.parse(raw) });
      } catch {
        applyOcrParamsToUi(OCR_DEFAULTS);
      }
    }

    function openOcrModal() {
      ocrEls.modal.classList.add("open");
      ocrEls.modal.setAttribute("aria-hidden", "false");
      if (!ocrState.file) setOcrStep(1);
      else if (ocrState.matches.length) setOcrStep(3);
      else setOcrStep(2);
    }

    function closeOcrModal() {
      ocrEls.modal.classList.remove("open");
      ocrEls.modal.setAttribute("aria-hidden", "true");
    }

    function setOcrImage(file) {
      if (!file || !file.type.startsWith("image/")) {
        toast("请选择图片文件");
        return;
      }
      ocrState.file = file;
      if (ocrState.objectUrl) URL.revokeObjectURL(ocrState.objectUrl);
      ocrState.objectUrl = URL.createObjectURL(file);
      ocrEls.previewImg.src = ocrState.objectUrl;
      ocrEls.previewOrig.classList.add("show");
      ocrEls.previewProcBox.classList.remove("show");
      ocrEls.drop.classList.add("has-file");
      if (ocrEls.dropTitle) ocrEls.dropTitle.textContent = file.name || "已放入截图";
      if (ocrEls.dropHint) ocrEls.dropHint.textContent = "可以直接开始识别，或点「更换图片」重选";
      if (ocrEls.changeImg) ocrEls.changeImg.style.display = "";
      ocrEls.run.disabled = false;
      ocrEls.previewProcBtn.disabled = false;
      ocrEls.apply.disabled = true;
      ocrEls.apply.textContent = "加入已拥有";
      ocrEls.results.classList.remove("open");
      ocrEls.matchList.innerHTML = "";
      ocrState.matches = [];
      setOcrStep(2);
      toast("截图已就绪，点「开始识别」");
    }

    function normalizeCardText(s) {
      return String(s || "")
        .toLowerCase()
        .replace(/[●・·•．.\s\-_—–|/\\()（）\[\]【】「」『』<>《》'"`~，,。!！?？:：;；×xX]/g, "")
        .replace(/莉/g, "利")
        .replace(/波莉/g, "波利");
    }

    function levenshtein(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let prev = i;
        for (let j = 1; j <= b.length; j++) {
          const cur =
            a[i - 1] === b[j - 1]
              ? row[j - 1]
              : 1 + Math.min(row[j - 1], prev, row[j]);
          row[j - 1] = prev;
          prev = cur;
        }
        row[b.length] = prev;
      }
      return row[b.length];
    }

    function extractOcrTokens(text) {
      const lines = String(text || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const tokens = new Set();
      for (const line of lines) {
        tokens.add(line);
        for (const part of line.split(/[\s|｜、,，;；]+/)) {
          const p = part.trim();
          if (p) tokens.add(p);
        }
        const idName = line.match(/^(\d{3,5})\s*[.．:：\-]?\s*(.+)$/);
        if (idName) tokens.add(idName[2].trim());
        const nameOnly = line.replace(/^\d{3,5}\s*/, "").trim();
        if (nameOnly) tokens.add(nameOnly);
      }
      return [...tokens];
    }

    function matchCardsFromOcrText(text, params) {
      const p = params || readOcrParams();
      const tokens = extractOcrTokens(text);
      const normTokens = tokens
        .map((t) => ({ raw: t, norm: normalizeCardText(t) }))
        .filter((t) => t.norm.length >= p.minLen);
      const blob = normalizeCardText(text);
      const found = new Map();

      // Excel 卡名无「卡片」后缀，游戏截图通常带；匹配时统一按「名称+卡片」比对
      const matchNameOf = (name) => {
        const raw = String(name || "");
        return /卡片$/.test(raw) ? raw : `${raw}卡片`;
      };

      // 长名优先，减少短名误伤
      const cards = [...DATA.cards].sort(
        (a, b) =>
          normalizeCardText(matchNameOf(b.name)).length -
          normalizeCardText(matchNameOf(a.name)).length,
      );

      for (const card of cards) {
        const displayName = matchNameOf(card.name);
        const nName = normalizeCardText(displayName);
        if (!nName || nName.length < p.minLen) continue;
        let score = 0;
        let why = "";
        const isShort = normalizeCardText(card.name).length <= 2;

                if (blob.includes(nName)) {
          score = Math.max(score, 100);
          why = "文中直接出现";
        }

        for (const t of normTokens) {
          if (!t.norm) continue;
          if (t.norm === nName) {
            score = Math.max(score, 100);
            why = `完全一致`;
            continue;
          }

          if (p.strictShort && isShort) continue;

          const shorter = Math.min(t.norm.length, nName.length);
          const longer = Math.max(t.norm.length, nName.length);
          if (
            shorter >= p.contain &&
            (t.norm.includes(nName) || nName.includes(t.norm))
          ) {
            // 包含比例过低时降权
            const ratio = shorter / longer;
            if (ratio >= 0.5 || nName.length >= 4) {
              const s = 68 + Math.min(25, shorter * 3);
              if (s > score) {
                score = s;
                why = `部分重合`;
              }
            }
          } else if (p.fuzzy > 0 && nName.length >= 3 && t.norm.length >= 3) {
            const dist = levenshtein(t.norm, nName);
            const maxLen = Math.max(t.norm.length, nName.length);
            if (dist <= p.fuzzy && dist / maxLen <= 0.34) {
              const s = 78 - dist * 8;
              if (s > score) {
                score = s;
                why = `近似匹配`;
              }
            }
          }
        }

        if (p.matchId && new RegExp(`(?:^|\\D)${card.id}(?:\\D|$)`).test(text)) {
          score = Math.max(score, 95);
          why = why || `编号 ${card.id}`;
        }

        if (score >= p.score) {
          found.set(card.id, { card, score, why });
        }
      }

      return [...found.values()].sort(
        (a, b) => b.score - a.score || Number(a.card.id) - Number(b.card.id),
      );
    }

    function otsuThreshold(gray) {
      const hist = new Array(256).fill(0);
      for (let i = 0; i < gray.length; i++) hist[gray[i]] += 1;
      const total = gray.length;
      let sum = 0;
      for (let i = 0; i < 256; i++) sum += i * hist[i];
      let sumB = 0;
      let wB = 0;
      let max = 0;
      let thr = 128;
      for (let i = 0; i < 256; i++) {
        wB += hist[i];
        if (!wB) continue;
        const wF = total - wB;
        if (!wF) break;
        sumB += i * hist[i];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) * (mB - mF);
        if (between > max) {
          max = between;
          thr = i;
        }
      }
      return thr;
    }

    async function loadImageSource(file) {
      if (typeof createImageBitmap === "function") {
        return createImageBitmap(file);
      }
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    async function preprocessImage(file, params) {
      const p = params || readOcrParams();
      const bmp = await loadImageSource(file);
      const srcW = bmp.width;
      const srcH = bmp.height;
      const targetScale = p.scale;
      const maxW = 2200;
      let scale = targetScale;
      if (srcW * scale > maxW) scale = maxW / srcW;
      const w = Math.max(1, Math.round(srcW * scale));
      const h = Math.max(1, Math.round(srcH * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bmp, 0, 0, w, h);
      if (typeof bmp.close === "function") bmp.close();

      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;
      const gray = new Uint8ClampedArray(w * h);
      const c = p.contrast;
      for (let i = 0, j = 0; i < d.length; i += 4, j++) {
        let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        g = (g - 128) * c + 128;
        if (p.invert) g = 255 - g;
        gray[j] = Math.max(0, Math.min(255, g));
      }

      if (p.sharp) {
        const copy = gray.slice();
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const v =
              copy[i] * 5 -
              copy[i - 1] -
              copy[i + 1] -
              copy[i - w] -
              copy[i + w];
            gray[i] = Math.max(0, Math.min(255, v));
          }
        }
      }

      const thr = p.thresh > 0 ? p.thresh : otsuThreshold(gray);
      for (let i = 0, j = 0; i < d.length; i += 4, j++) {
        const v = gray[j] >= thr ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      ocrState.lastCanvas = canvas;
      return canvas;
    }

    function showProcessedPreview(canvas) {
      const view = ocrEls.procCanvas;
      view.width = canvas.width;
      view.height = canvas.height;
      const ctx = view.getContext("2d");
      ctx.drawImage(canvas, 0, 0);
      ocrEls.previewProcBox.classList.add("show");
    }

    function renderOcrMatches(matches) {
      ocrState.matches = matches;
      ocrEls.matchCount.textContent = matches.length
        ? `${matches.length} 张待确认 · 可取消勾选`
        : "没有匹配到已知卡片";
      ocrEls.matchList.innerHTML = matches
        .map(
          (m) => `<label class="card owned">
            <input type="checkbox" data-ocr-id="${m.card.id}" checked />
            <img class="art" src="card-images/${m.card.id}.gif" alt="" loading="lazy" decoding="async" onerror="this.classList.add('missing');this.removeAttribute('src')" />
            <span class="meta-row">
              <div class="name">${escapeHtml(m.card.name)}</div>
              <div class="id">#${m.card.id} · ${escapeHtml(m.why)}</div>
            </span>
          </label>`,
        )
        .join("");
      syncApplyButton();
      ocrEls.results.classList.add("open");
      setOcrStep(matches.length ? 3 : 2);
    }

    let ocrWorker = null;
    let ocrWorkerLang = "";

    async function getOcrWorker(lang, onProgress) {
      if (ocrWorker && ocrWorkerLang === lang) {
        return ocrWorker;
      }
      if (ocrWorker) {
        try {
          await ocrWorker.terminate();
        } catch {}
        ocrWorker = null;
      }
      ocrWorker = await Tesseract.createWorker(lang, 1, {
        logger: onProgress,
      });
      ocrWorkerLang = lang;
      return ocrWorker;
    }

    async function recognizeOnce(canvas, lang, psm, onProgress) {
      const worker = await getOcrWorker(lang, onProgress);
      await worker.setParameters({
        tessedit_pageseg_mode: String(psm),
        preserve_interword_spaces: "1",
      });
      return worker.recognize(canvas);
    }

    async function runOcr() {
      if (!ocrState.file || ocrState.running) return;
      if (typeof Tesseract === "undefined") {
        toast("识别库未加载，请检查网络后刷新页面");
        return;
      }
      const params = readOcrParams();
      saveOcrParams();
      ocrState.running = true;
      ocrEls.run.disabled = true;
      ocrEls.apply.disabled = true;
      ocrEls.progress.style.display = "block";
      ocrEls.status.textContent = "正在优化图片…";
      ocrEls.pct.textContent = "0%";
      ocrEls.bar.style.width = "0%";
      setOcrStep(2);

      try {
        const canvas = await preprocessImage(ocrState.file, params);
        showProcessedPreview(canvas);
        const lang = params.onlyChi ? "chi_sim" : "chi_sim+eng";
        const modes =
          params.psm === "multi" ? ["6", "4", "11"] : [params.psm];
        const texts = [];
        for (let i = 0; i < modes.length; i++) {
          const mode = modes[i];
          ocrEls.status.textContent =
            modes.length > 1
              ? `正在识别文字（${i + 1}/${modes.length}）…`
              : "正在识别文字…";
          const result = await recognizeOnce(canvas, lang, mode, (m) => {
            if (m.status === "loading tesseract core") {
              ocrEls.status.textContent = "首次使用：加载识别引擎…";
            } else if (m.status === "loading language traineddata") {
              ocrEls.status.textContent = "首次使用：下载中文识别包…";
            } else if (m.status === "initializing api" || m.status === "initialized api") {
              ocrEls.status.textContent = "准备识别…";
            } else if (m.status === "recognizing text") {
              ocrEls.status.textContent =
                modes.length > 1
                  ? `正在识别文字（${i + 1}/${modes.length}）…`
                  : "正在识别文字…";
            } else if (m.status) {
              ocrEls.status.textContent = "识别进行中…";
            }
            if (typeof m.progress === "number") {
              const base = i / modes.length;
              const pct = Math.round((base + m.progress / modes.length) * 100);
              ocrEls.pct.textContent = `${pct}%`;
              ocrEls.bar.style.width = `${pct}%`;
            }
          });
          const t = (result && result.data && result.data.text) || "";
          if (t.trim()) texts.push(t);
        }
        const text = texts.join("\n");
        ocrEls.raw.textContent = text.trim() || "（没有读出文字，试试换排版模式或开反色）";
        const matches = matchCardsFromOcrText(text, params);
        renderOcrMatches(matches);
        ocrEls.status.textContent = "识别完成";
        ocrEls.pct.textContent = "100%";
        ocrEls.bar.style.width = "100%";
        toast(
          matches.length
            ? `找到 ${matches.length} 张，请确认后加入`
            : "没有匹配到卡名，可展开微调后再试",
        );
      } catch (err) {
        console.error(err);
        toast(err instanceof Error ? `识别失败：${err.message}` : "识别失败");
        ocrEls.status.textContent = "识别失败";
      } finally {
        ocrState.running = false;
        ocrEls.run.disabled = !ocrState.file;
      }
    }

    // 参数控件
    loadOcrParams();
    for (const el of [
      ocrEls.psm,
      ocrEls.scale,
      ocrEls.contrast,
      ocrEls.thresh,
      ocrEls.score,
      ocrEls.minLen,
      ocrEls.fuzzy,
      ocrEls.contain,
      ocrEls.invert,
      ocrEls.sharp,
      ocrEls.onlyChi,
      ocrEls.matchId,
      ocrEls.strictShort,
    ]) {
      el.addEventListener("input", () => {
        syncOcrParamLabels();
        saveOcrParams();
      });
      el.addEventListener("change", () => {
        syncOcrParamLabels();
        saveOcrParams();
      });
    }
    ocrEls.resetParams.addEventListener("click", () => {
      applyOcrParamsToUi(OCR_DEFAULTS);
      saveOcrParams();
      toast("已恢复默认设置");
    });
    ocrEls.previewProcBtn.addEventListener("click", async () => {
      if (!ocrState.file) return;
      try {
        ocrEls.status.textContent = "生成处理后预览…";
        ocrEls.progress.style.display = "block";
        const canvas = await preprocessImage(ocrState.file, readOcrParams());
        showProcessedPreview(canvas);
        ocrEls.status.textContent = "处理后预览已更新";
        toast("已更新处理后预览");
      } catch (err) {
        toast("预览失败");
      }
    });

    document.getElementById("btnOcr").addEventListener("click", openOcrModal);
    ocrEls.close.addEventListener("click", closeOcrModal);
    if (ocrEls.closeX) ocrEls.closeX.addEventListener("click", closeOcrModal);
    ocrEls.modal.addEventListener("click", (e) => {
      if (e.target === ocrEls.modal) closeOcrModal();
    });
    ocrEls.drop.addEventListener("click", (e) => {
      if (e.target.closest("#ocrChangeImg")) return;
      ocrEls.file.click();
    });
    if (ocrEls.changeImg) {
      ocrEls.changeImg.addEventListener("click", (e) => {
        e.stopPropagation();
        ocrEls.file.click();
      });
    }
    ocrEls.file.addEventListener("change", () => {
      const f = ocrEls.file.files && ocrEls.file.files[0];
      ocrEls.file.value = "";
      if (f) setOcrImage(f);
    });
    ocrEls.drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      ocrEls.drop.classList.add("drag");
    });
    ocrEls.drop.addEventListener("dragleave", () => ocrEls.drop.classList.remove("drag"));
    ocrEls.drop.addEventListener("drop", (e) => {
      e.preventDefault();
      ocrEls.drop.classList.remove("drag");
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setOcrImage(f);
    });
    window.addEventListener("paste", (e) => {
      if (!ocrEls.modal.classList.contains("open")) return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) {
            e.preventDefault();
            setOcrImage(f);
          }
          break;
        }
      }
    });
    ocrEls.run.addEventListener("click", () => void runOcr());
    ocrEls.matchList.addEventListener("change", syncApplyButton);
    if (ocrEls.selectAll) {
      ocrEls.selectAll.addEventListener("click", () => {
        for (const el of ocrEls.matchList.querySelectorAll("input[data-ocr-id]")) el.checked = true;
        syncApplyButton();
      });
    }
    if (ocrEls.selectNone) {
      ocrEls.selectNone.addEventListener("click", () => {
        for (const el of ocrEls.matchList.querySelectorAll("input[data-ocr-id]")) el.checked = false;
        syncApplyButton();
      });
    }
    ocrEls.apply.addEventListener("click", () => {
      const ids = [...ocrEls.matchList.querySelectorAll("input[data-ocr-id]:checked")].map(
        (el) => el.getAttribute("data-ocr-id"),
      );
      if (!ids.length) {
        toast("请至少勾选一张卡");
        return;
      }
      mergeOwnedIds(ids, "截图录入");
      closeOcrModal();
    });

    function toast(msg) {
      els.toast.textContent = msg;
      els.toast.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => els.toast.classList.remove("show"), 1800);
    }

    function groupProgress(group) {
      const total = group.cards.length;
      let owned = 0;
      for (const c of group.cards) if (state.owned.has(c.id)) owned += 1;
      return { owned, total, pct: total ? owned / total : 0, complete: owned === total && total > 0 };
    }

    function matchesQuery(group, q) {
      if (!q) return { groupHit: true, cardIds: null };
      const hitCards = new Set();
      let groupHit = group.effect.toLowerCase().includes(q) || group.id.toLowerCase().includes(q);
      for (const c of group.cards) {
        const hay = `${c.id} ${c.name}`.toLowerCase();
        if (hay.includes(q)) {
          hitCards.add(c.id);
          groupHit = true;
        }
      }
      return { groupHit, cardIds: hitCards };
    }

    function filterPass(progress) {
      if (state.filter === "all") return true;
      if (state.filter === "complete") return progress.complete;
      if (state.filter === "incomplete") return !progress.complete;
      if (state.filter === "almost") return !progress.complete && progress.pct >= 0.8;
      return true;
    }

    function renderStats() {
      let ownedCards = 0;
      for (const c of DATA.cards) if (state.owned.has(c.id)) ownedCards += 1;
      let doneGroups = 0;
      for (const g of DATA.groups) if (groupProgress(g).complete) doneGroups += 1;
      const cardPct = DATA.cards.length ? Math.round((ownedCards / DATA.cards.length) * 100) : 0;
      const groupPct = DATA.groups.length ? Math.round((doneGroups / DATA.groups.length) * 100) : 0;
      els.stats.innerHTML = `
        <div class="stat"><div class="k">已收集卡片</div><div class="v">${ownedCards}<span style="font-size:.9rem;color:var(--text-secondary)"> / ${DATA.cards.length}</span></div><div class="s">${cardPct}%</div></div>
        <div class="stat"><div class="k">完成卡组</div><div class="v">${doneGroups}<span style="font-size:.9rem;color:var(--text-secondary)"> / ${DATA.groups.length}</span></div><div class="s">${groupPct}%</div></div>
        <div class="stat"><div class="k">已解锁加成</div><div class="v">${doneGroups}</div><div class="s">凑齐一组即解锁</div></div>
        <div class="stat"><div class="k">接近完成</div><div class="v">${DATA.groups.filter(g => { const p = groupProgress(g); return !p.complete && p.pct >= 0.8; }).length}</div><div class="s">进度 ≥ 80%</div></div>
      `;
    }

    function renderGroups() {
      const q = state.query.trim().toLowerCase();
      let visible = 0;
      const parts = [];

      for (const group of DATA.groups) {
        const progress = groupProgress(group);
        const match = matchesQuery(group, q);
        const show = match.groupHit && filterPass(progress);
        if (show) visible += 1;
        const open = state.open.has(group.id) || (q && match.groupHit);
        const pct = Math.round(progress.pct * 100);
        const cardIds = match.cardIds;

        parts.push(`
          <article class="group ${progress.complete ? "complete" : ""} ${open ? "open" : ""} ${show ? "" : "hidden"}" data-gid="${group.id}">
            <button class="group-hd" type="button" data-toggle="${group.id}">
              <div class="group-top">
                <div class="group-title">${escapeHtml(group.effect)}</div>
                <span class="badge ${progress.complete ? "on" : ""}">${progress.complete ? "已解锁" : `卡组 ${group.index}`}</span>
              </div>
              <div class="bar"><i style="width:${pct}%"></i></div>
              <div class="meta"><span>${progress.owned} / ${progress.total} 张</span><span>${pct}%</span></div>
            </button>
            <div class="cards">
              <div class="card-actions">
                <button class="btn" type="button" data-own-all="${group.id}">本组全选</button>
                <button class="btn ghost" type="button" data-clear-all="${group.id}">本组清空</button>
              </div>
              <div class="card-list">
                ${group.cards.map(c => {
                  const owned = state.owned.has(c.id);
                  const hit = cardIds && cardIds.has(c.id);
                  return `<label class="card ${owned ? "owned" : ""} ${hit ? "hit" : ""}">
                    <input type="checkbox" data-card="${c.id}" ${owned ? "checked" : ""} />
                    <img class="art" src="card-images/${c.id}.gif" alt="" loading="lazy" decoding="async" onerror="this.classList.add('missing');this.removeAttribute('src')" />
                    <span class="meta-row"><div class="name">${escapeHtml(c.name)}</div><div class="id">#${c.id}</div></span>
                  </label>`;
                }).join("")}
              </div>
            </div>
          </article>
        `);
      }

      els.groups.innerHTML = parts.join("") || `<div class="empty">没有符合条件的卡组，试试换个筛选或搜索词</div>`;
      els.groupCountLabel.textContent = `显示 ${visible} / ${DATA.groups.length} 组`;
    }

    function collectBonusItems() {
      const unlocked = [];
      const near = [];
      for (const g of DATA.groups) {
        const p = groupProgress(g);
        if (p.complete) unlocked.push({ g, p, kind: "unlocked" });
        else if (p.pct >= 0.8) near.push({ g, p, kind: "near" });
      }
      unlocked.sort((a, b) => a.g.index - b.g.index);
      near.sort((a, b) => b.p.pct - a.p.pct);
      return { unlocked, near, all: [...unlocked, ...near] };
    }

    function bonusChipHtml(item) {
      const { g, p, kind } = item;
      const tag = kind === "unlocked" ? "已解锁" : "即将解锁";
      const meta =
        kind === "unlocked"
          ? `卡组 ${g.index} · 已凑齐 ${p.owned}/${p.total}`
          : `卡组 ${g.index} · 还差 ${p.total - p.owned} 张（${Math.round(p.pct * 100)}%）`;
      return `<article class="bonus-chip ${kind}">
        <span class="tag">${tag}</span>
        <div class="t">${escapeHtml(g.effect)}</div>
        <div class="p">${meta}</div>
      </article>`;
    }

    function bonusRowHtml(item) {
      const { g, p, kind } = item;
      const meta =
        kind === "unlocked"
          ? `卡组 ${g.index} · 已凑齐 ${p.owned}/${p.total}`
          : `卡组 ${g.index} · 还差 ${p.total - p.owned} 张（${Math.round(p.pct * 100)}%）`;
      return `<div class="bonus ${kind}">
        <div class="t">${escapeHtml(g.effect)}</div>
        <div class="p">${meta}</div>
      </div>`;
    }

    function openBonusDrawer() {
      els.bonusDrawer.classList.add("open");
      els.bonusDrawerMask.classList.add("open");
      els.bonusDrawer.setAttribute("aria-hidden", "false");
      els.bonusDrawerMask.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeBonusDrawer() {
      els.bonusDrawer.classList.remove("open");
      els.bonusDrawerMask.classList.remove("open");
      els.bonusDrawer.setAttribute("aria-hidden", "true");
      els.bonusDrawerMask.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    function renderBonuses() {
      const { unlocked, near, all } = collectBonusItems();
      els.bonusCountLabel.textContent = unlocked.length
        ? `已解锁 ${unlocked.length} 项${near.length ? ` · ${near.length} 项即将解锁` : ""}`
        : near.length
          ? `暂无解锁 · ${near.length} 项即将解锁`
          : "暂无解锁，完成卡组后会出现在这里";

      if (!all.length) {
        els.bonusRail.innerHTML = `<div class="empty" style="grid-column:1/-1">还没有加成。勾选下方卡片，或用「截图录入」快速开局。</div>`;
      } else {
        const preview = all.slice(0, BONUS_PREVIEW_LIMIT);
        els.bonusRail.innerHTML = preview.map(bonusChipHtml).join("");
      }

      const more = Math.max(0, all.length - BONUS_PREVIEW_LIMIT);
      const drawerBtn = document.getElementById("btnBonusDrawer");
      if (drawerBtn) {
        drawerBtn.textContent = more > 0 ? `查看全部（+${more}）` : "查看全部";
      }

      const drawerParts = [];
      if (!all.length) {
        drawerParts.push(`<div class="empty">还没有加成可展示</div>`);
      } else {
        if (unlocked.length) {
          drawerParts.push(`<div class="bonus-section-label">已解锁（${unlocked.length}）</div>`);
          drawerParts.push(...unlocked.map(bonusRowHtml));
        }
        if (near.length) {
          drawerParts.push(`<div class="bonus-section-label">即将解锁（${near.length}）</div>`);
          drawerParts.push(...near.map(bonusRowHtml));
        }
      }
      els.bonusDrawerBody.innerHTML = drawerParts.join("");
      els.bonusDrawerSub.textContent = unlocked.length
        ? `已解锁 ${unlocked.length} 项，接近解锁 ${near.length} 项`
        : `接近解锁 ${near.length} 项`;
    }

    function render() {
      renderStats();
      renderGroups();
      renderBonuses();
    }

    function escapeHtml(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function setOwned(id, on) {
      if (on) state.owned.add(String(id));
      else state.owned.delete(String(id));
      saveOwned();
      render();
    }

    els.groups.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const toggle = t.closest("[data-toggle]");
      if (toggle) {
        const id = toggle.getAttribute("data-toggle");
        if (state.open.has(id)) state.open.delete(id);
        else state.open.add(id);
        renderGroups();
        return;
      }
      const ownAll = t.closest("[data-own-all]");
      if (ownAll) {
        const g = DATA.groups.find(x => x.id === ownAll.getAttribute("data-own-all"));
        if (!g) return;
        for (const c of g.cards) state.owned.add(c.id);
        saveOwned();
        toast(`已勾选：${g.effect}`);
        render();
        return;
      }
      const clearAll = t.closest("[data-clear-all]");
      if (clearAll) {
        const g = DATA.groups.find(x => x.id === clearAll.getAttribute("data-clear-all"));
        if (!g) return;
        for (const c of g.cards) state.owned.delete(c.id);
        saveOwned();
        toast(`已清空本组`);
        render();
      }
    });

    els.groups.addEventListener("change", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || !t.dataset.card) return;
      setOwned(t.dataset.card, t.checked);
      if (t.checked) {
        const g = DATA.groups.find(gr => gr.cards.some(c => c.id === t.dataset.card));
        if (g && groupProgress(g).complete) toast(`卡组解锁：${g.effect}`);
      }
    });

    els.search.addEventListener("input", () => {
      state.query = els.search.value;
      renderGroups();
    });

    els.filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      state.filter = btn.getAttribute("data-filter");
      for (const c of els.filters.querySelectorAll(".chip")) c.classList.toggle("active", c === btn);
      renderGroups();
    });

    function parseProgressJson(text) {
      const json = JSON.parse(text);
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.owned)) return json.owned;
      throw new Error("格式不对");
    }

    document.getElementById("btnExport").addEventListener("click", () => {
      const payload = buildProgressPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `card-collection-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast(`已导出 ${payload.owned.length} 张卡进度`);
    });

    document.getElementById("btnCopy").addEventListener("click", async () => {
      const payload = buildProgressPayload();
      const text = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        toast("进度 JSON 已复制到剪贴板");
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        toast("进度 JSON 已复制到剪贴板");
      }
    });

    document.getElementById("btnImport").addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", async () => {
      const file = els.importFile.files && els.importFile.files[0];
      els.importFile.value = "";
      if (!file) return;
      try {
        const list = parseProgressJson(await file.text());
        applyOwnedList(list, "导入");
      } catch (err) {
        toast(err instanceof Error ? `导入失败：${err.message}` : "导入失败：JSON 无效");
      }
    });

    document.getElementById("btnReset").addEventListener("click", () => {
      if (!confirm("确定清空本机保存的全部集卡进度？")) return;
      state.owned = new Set();
      saveOwned();
      render();
      toast("已清空本机进度");
    });

    document.getElementById("btnBonusDrawer").addEventListener("click", openBonusDrawer);
    document.getElementById("bonusDrawerClose").addEventListener("click", closeBonusDrawer);
    document.getElementById("bonusDrawerClose2").addEventListener("click", closeBonusDrawer);
    els.bonusDrawerMask.addEventListener("click", closeBonusDrawer);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.bonusDrawer.classList.contains("open")) {
        closeBonusDrawer();
      }
    });

    // 启动时规范化写入（兼容旧版纯数组格式）
    {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) || !parsed || !parsed.savedAt) {
          saveOwned();
        } else {
          updateSaveHint(parsed.savedAt);
        }
      } catch {
        saveOwned();
      }
    }

    render();
  
  };
})();
