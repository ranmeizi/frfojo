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
    const OCR_PARAM_KEY = "prontera.card-collection.ocr-params.v6";
    const OCR_DEFAULTS = {
      engine: "paddle",
      psm: "4",
      scale: 4,
      contrast: 1.2,
      thresh: 0,
      score: 100,
      minLen: 2,
      fuzzy: 0,
      contain: 0,
      invert: false,
      sharp: false,
      onlyChi: true,
      matchId: false,
      strictShort: true,
      cropIcons: true,
      vocabRepair: false,
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
      engine: document.getElementById("ocrEngine"),
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
      cropIcons: document.getElementById("ocrCropIcons"),
      vocabRepair: document.getElementById("ocrVocabRepair"),
      rematch: document.getElementById("ocrRematch"),
      engineVal: document.getElementById("ocrEngineVal"),
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
    const ENGINE_LABEL = {
      paddle: "PaddleOCR",
      tesseract: "Tesseract",
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
        engine: (ocrEls.engine && ocrEls.engine.value) || "paddle",
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
        cropIcons: !!(ocrEls.cropIcons && ocrEls.cropIcons.checked),
        vocabRepair: !!(ocrEls.vocabRepair && ocrEls.vocabRepair.checked),
      };
    }

    function applyOcrParamsToUi(p) {
      if (ocrEls.engine) ocrEls.engine.value = p.engine || "paddle";
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
      if (ocrEls.cropIcons) ocrEls.cropIcons.checked = p.cropIcons !== false;
      if (ocrEls.vocabRepair) ocrEls.vocabRepair.checked = !!p.vocabRepair;
      syncOcrParamLabels();
    }

    function syncOcrParamLabels() {
      const p = readOcrParams();
      if (ocrEls.engineVal) ocrEls.engineVal.textContent = ENGINE_LABEL[p.engine] || p.engine;
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
        .replace(/[●・·•．.\s\-_—–|/\\()（）\[\]【】「」『』<>《》'"`~，,。!！?？:：;；×xX<>＜＞]/g, "")
        .replace(/^[0-9０-９]+/, "")
        .replace(/莉/g, "利")
        .replace(/波莉/g, "波利")
        .replace(/卡是|卡睛|卡且|卡上|卡后|卡呈|卡所|卡卢|卡拍/g, "卡片");
    }

    /** 仓库截图常见 OCR 形近字修正（只作用于识别文本） */
    function fixOcrConfusions(s) {
      let t = String(s || "");
      const pairs = [
        [/全属|等属|尘属|竺属/g, "金属"],
        [/沪利|淤利|闵刊|源刊|沪币/g, "波利"],
        [/金属波利/g, "金属波利"],
        [/波下利|波淤利|疲波利|流流利/g, "波波利"],
        [/吸血幅由|吸血幅幅|吸血蜗幅|吸血丹旺|吸血蝙申/g, "吸血蝙蝠"],
        [/菠青胰|节理胰|区青有|茅育荣|苦育荣|茅育菜/g, "茅膏菜"],
        [/蜗昌己前于|蜗甲己前许|蜗甲己前隆|蝴晴己简手|畅晶弓贡手|蝙蝠弓贡手|申幅己前手/g, "蝙蝠弓箭手"],
        [/旺旺|旺星|昱星|晨星/g, "螳螂"],
        [/那隘咪迟|那豚品仓|收豚咪迟|那通战怪|政通则俘|邪能战俘/g, "邪骸战俘"],
        [/卡利斯梧|卡刊其梧|卡刊斯局|卡利断格|卡刊斯格/g, "卡利斯格"],
        [/平贡特\s*6?|平贡特|衬贡特\s*下?|衬帝特|名节特飞杰/g, "毕帝特飞龙"],
        [/毕帝特飞龙飞龙/g, "毕帝特飞龙"],
        [/并受性|避受星|突变星|避芝星|突变芝/g, "突变蛙"],
        [/有区太|殖太|将及|梦帮|芭必|梦魔/g, "梦魇"],
        [/去间|圭间|等章|黑手|黑白/g, "黑狐"],
      ];
      for (const [re, to] of pairs) t = t.replace(re, to);
      return t;
    }

    function levenshtein(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      if (Math.abs(a.length - b.length) > 6) return 99;
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

    function lcsLen(a, b) {
      if (!a || !b) return 0;
      const m = a.length;
      const n = b.length;
      if (m * n > 4000) return 0;
      const dp = new Array(n + 1).fill(0);
      for (let i = 1; i <= m; i++) {
        let prev = 0;
        for (let j = 1; j <= n; j++) {
          const tmp = dp[j];
          dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
          prev = tmp;
        }
      }
      return dp[n];
    }

    function buildCatalogRows(minLen) {
      const matchNameOf = (name) => {
        const raw = String(name || "");
        return /卡片$/.test(raw) ? raw : `${raw}卡片`;
      };
      return DATA.cards
        .map((card) => {
          const displayName = matchNameOf(card.name);
          return {
            card,
            nName: normalizeCardText(displayName),
            nBase: normalizeCardText(card.name),
          };
        })
        .filter((c) => c.nName && c.nBase.length >= minLen);
    }

    /** 词表纠错：只在「唯一明显更像某一张卡」时采纳，避免近似卡互抢 */
    function repairTokenViaVocab(tokenNorm, catalog) {
      const tokenBase = tokenNorm.replace(/卡片$/u, "");
      if (tokenBase.length < 3) return null;
      let best = null;
      let secondRatio = 0;
      for (const row of catalog) {
        if (row.nBase.length < 3) continue;
        if (Math.abs(tokenBase.length - row.nBase.length) > 3) continue;
        const lcs = lcsLen(tokenBase, row.nBase);
        const ratio = lcs / Math.max(tokenBase.length, row.nBase.length);
        const dist = levenshtein(tokenBase, row.nBase);
        const score = ratio * 100 - dist * 3;
        if (!best || score > best.score) {
          secondRatio = best ? best.ratio : 0;
          best = { row, score, ratio, dist, lcs };
        } else if (ratio > secondRatio) {
          secondRatio = ratio;
        }
      }
      if (!best) return null;
      const unique = best.ratio - secondRatio >= 0.2;
      const strong =
        (best.dist <= 1 && best.ratio >= 0.6) ||
        (best.dist <= 2 && best.ratio >= 0.7 && unique) ||
        (best.lcs >= 3 && best.ratio >= 0.5 && unique);
      if (!strong) return null;
      return {
        card: best.row.card,
        score: Math.min(99, 80 + Math.round(best.ratio * 15) - best.dist),
        why: `词表纠错(${best.dist})`,
      };
    }

    function extractOcrTokens(text) {
      const fixed = fixOcrConfusions(text);
      const lines = String(fixed || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const tokens = new Set();
      const noise = /^(个人仓库|消耗|商城|防具|武器|时装|投掷|其它|卡片|仓库)$/;

      for (const line of lines) {
        if (noise.test(line)) continue;
        tokens.add(line);
        const cardHits = line.match(/[\u4e00-\u9fffA-Za-z0-9]{2,16}卡片/g);
        if (cardHits) for (const h of cardHits) tokens.add(h);
        for (const part of line.split(/[\s|｜、,，;；<>＜＞]+/)) {
          const p = part.trim().replace(/^[0-9０-９．.。]+/, "");
          if (p && !noise.test(p)) tokens.add(p);
        }
        const nameOnly = line
          .replace(/^[0-9０-９．.。\s]+/, "")
          .replace(/卡片$/u, "")
          .trim();
        if (nameOnly.length >= 2) tokens.add(nameOnly);
      }
      return [...tokens];
    }

    function scoreNameAgainstToken(nName, nBase, tokenNorm, params) {
      if (!tokenNorm) return { score: 0, why: "" };
      const tokenBase = tokenNorm.replace(/卡片$/u, "");
      // 默认只认全名 / 去「卡片」后缀后的全名，避免近似卡互相误伤
      if (
        tokenNorm === nName ||
        tokenNorm === nBase ||
        tokenBase === nBase ||
        tokenBase === nName.replace(/卡片$/u, "")
      ) {
        return { score: 100, why: "完全一致" };
      }

      // 部分重合：默认关闭（contain=0）；开启时也要求几乎整段重合
      if (params.contain > 0) {
        for (const [a, b, label] of [
          [tokenNorm, nName, "部分重合"],
          [tokenBase, nBase, "名称重合"],
        ]) {
          if (!a || !b) continue;
          if (!(a.includes(b) || b.includes(a))) continue;
          const shorter = Math.min(a.length, b.length);
          const longer = Math.max(a.length, b.length);
          if (shorter >= params.contain && shorter / longer >= 0.9) {
            return { score: 92, why: label };
          }
        }
      }

      // 模糊：默认 0；仅允许极少量字差，且长度必须接近
      const fuzzyLimit = Math.max(0, params.fuzzy | 0);
      if (fuzzyLimit > 0 && nBase.length >= 3 && tokenBase.length >= 3) {
        let best = { score: 0, why: "" };
        for (const target of [nName, nBase, nBase + "卡片"]) {
          const dist = levenshtein(tokenNorm, target);
          const distBase = levenshtein(tokenBase, target.replace(/卡片$/u, ""));
          const d = Math.min(dist, distBase);
          const maxLen = Math.max(tokenBase.length, target.replace(/卡片$/u, "").length);
          if (Math.abs(tokenBase.length - target.replace(/卡片$/u, "").length) > fuzzyLimit) {
            continue;
          }
          if (d > 0 && d <= fuzzyLimit && d / maxLen <= 0.25) {
            const s = 90 - d * 8;
            if (s > best.score) best = { score: s, why: `近似(${d})` };
          }
        }
        return best;
      }
      return { score: 0, why: "" };
    }

    function matchCardsFromOcrText(text, params) {
      const p = params || readOcrParams();
      const fixedText = fixOcrConfusions(text);
      const tokens = extractOcrTokens(fixedText);
      const normTokens = tokens
        .map((t) => ({ raw: t, norm: normalizeCardText(t) }))
        .filter((t) => t.norm.length >= p.minLen);
      const found = new Map();
      const catalog = buildCatalogRows(p.minLen);
      // 长名优先：避免短名「飞龙」抢在「毕帝特飞龙」之前被错误比较
      const catalogByLen = [...catalog].sort(
        (a, b) => b.nBase.length - a.nBase.length || Number(a.card.id) - Number(b.card.id),
      );

      // 只认完整卡名（token === 卡名 / 卡名卡片）。默认不做包含、模糊。
      for (const t of normTokens) {
        let best = null;
        let secondScore = 0;
        for (const row of catalogByLen) {
          const isShort = row.nBase.length <= 2;
          if (p.strictShort && isShort && t.norm !== row.nName && t.norm !== row.nBase) {
            continue;
          }
          const hit = scoreNameAgainstToken(row.nName, row.nBase, t.norm, p);
          if (hit.score <= 0) continue;
          if (!best || hit.score > best.score) {
            secondScore = best ? best.score : 0;
            best = { card: row.card, score: hit.score, why: hit.why };
          } else if (hit.score > secondScore) {
            secondScore = hit.score;
          }
        }

        if ((!best || best.score < p.score) && p.vocabRepair) {
          const repaired = repairTokenViaVocab(t.norm, catalogByLen);
          if (repaired && repaired.score >= Math.min(p.score, 90)) {
            best = repaired;
            secondScore = 0;
          }
        }

        if (!best || best.score < p.score) continue;
        if (best.score < 100 && secondScore >= best.score - 5) continue;
        const prev = found.get(best.card.id);
        if (!prev || best.score > prev.score) {
          found.set(best.card.id, best);
        }
      }

      // 不再用 blob.includes：否则「飞龙卡片」会误中「毕帝特飞龙卡片」

      if (p.matchId) {
        for (const row of catalog) {
          if (!new RegExp(`(?:^|\\D)${row.card.id}(?:\\D|$)`).test(fixedText)) continue;
          const prev = found.get(row.card.id);
          if (!prev || 95 > prev.score) {
            found.set(row.card.id, {
              card: row.card,
              score: 95,
              why: `编号 ${row.card.id}`,
            });
          }
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
      // 白底黑字图 Otsu 偶发得到 0，会导致整图洗白
      return Math.min(230, Math.max(40, thr));
    }

    function pickThreshold(gray, manual) {
      if (manual > 0) return manual;
      let sum = 0;
      for (let i = 0; i < gray.length; i++) sum += gray[i];
      const mean = sum / gray.length;
      // 已经很亮的仓库截图：用固定高阈值更稳，不走极端 Otsu
      if (mean >= 200) return 190;
      return otsuThreshold(gray);
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

    function detectIconCropX(gray, w, h) {
      // 找左侧图标列结束后的空隙，避免数量数字干扰 OCR
      const ink = new Float32Array(w);
      for (let x = 0; x < w; x++) {
        let n = 0;
        for (let y = 0; y < h; y++) {
          if (gray[y * w + x] < 200) n += 1;
        }
        ink[x] = n / h;
      }
      let start = -1;
      for (let x = 0; x < w; x++) {
        if (ink[x] > 0.04) {
          start = x;
          break;
        }
      }
      if (start < 0) return 0;
      let gap = -1;
      let gapRun = 0;
      for (let x = start + 4; x < Math.min(w, start + Math.floor(w * 0.55)); x++) {
        if (ink[x] < 0.015) {
          gapRun += 1;
          if (gapRun >= Math.max(3, Math.floor(w * 0.015))) {
            gap = x - gapRun + 1;
            break;
          }
        } else {
          gapRun = 0;
        }
      }
      if (gap < 0) return Math.min(Math.floor(w * 0.22), Math.floor(w * 0.4));
      return Math.min(w - 8, gap + 2);
    }

    async function preprocessImage(file, params, mode) {
      const p = params || readOcrParams();
      const forPaddle = mode === "paddle" || (!mode && p.engine === "paddle");
      const bmp = await loadImageSource(file);
      const srcW = bmp.width;
      const srcH = bmp.height;
      // Paddle 神经网络：轻度放大即可；Tesseract 需要更大放大 + 二值化
      const targetScale = forPaddle
        ? Math.max(1.5, Math.min(3, p.scale))
        : Math.max(1, p.scale);
      const maxW = forPaddle ? 1600 : 2400;
      let scale = targetScale;
      if (srcW * scale > maxW) scale = maxW / srcW;
      const w0 = Math.max(1, Math.round(srcW * scale));
      const h0 = Math.max(1, Math.round(srcH * scale));
      const full = document.createElement("canvas");
      full.width = w0;
      full.height = h0;
      const fctx = full.getContext("2d", { willReadFrequently: true });
      fctx.imageSmoothingEnabled = false;
      fctx.drawImage(bmp, 0, 0, w0, h0);
      if (typeof bmp.close === "function") bmp.close();

      const fullImg = fctx.getImageData(0, 0, w0, h0);
      const fd = fullImg.data;
      const gray0 = new Uint8ClampedArray(w0 * h0);
      const c = forPaddle ? Math.min(1.35, Math.max(1, p.contrast)) : p.contrast;
      for (let i = 0, j = 0; i < fd.length; i += 4, j++) {
        let g = 0.299 * fd[i] + 0.587 * fd[i + 1] + 0.114 * fd[i + 2];
        g = (g - 128) * c + 128;
        if (p.invert) g = 255 - g;
        gray0[j] = Math.max(0, Math.min(255, g));
      }

      let cropX = 0;
      if (p.cropIcons) {
        cropX = detectIconCropX(gray0, w0, h0);
      }
      const w = Math.max(1, w0 - cropX);
      const h = h0;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const img = ctx.createImageData(w, h);
      const d = img.data;
      const gray = new Uint8ClampedArray(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const src = y * w0 + (x + cropX);
          const dst = y * w + x;
          gray[dst] = gray0[src];
        }
      }

      if (!forPaddle && p.sharp) {
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

      if (forPaddle) {
        // 保留灰度层次，供神经网络识别
        for (let i = 0, j = 0; i < d.length; i += 4, j++) {
          const v = gray[j];
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
      } else {
        const thr = pickThreshold(gray, p.thresh);
        let black = 0;
        for (let i = 0, j = 0; i < d.length; i += 4, j++) {
          const v = gray[j] >= thr ? 255 : 0;
          if (v === 0) black += 1;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
        if (black / gray.length < 0.005) {
          const fallback = 200;
          for (let i = 0, j = 0; i < d.length; i += 4, j++) {
            const v = gray[j] >= fallback ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
          }
        }
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
    let paddleOcrService = null;
    let paddleOcrLoading = null;

    function paddleModelUrl(fileName) {
      return new URL(`paddle-ocr-models/${fileName}`, window.location.href).href;
    }

    async function ensurePaddleOcr(onStatus) {
      if (paddleOcrService) return paddleOcrService;
      if (paddleOcrLoading) return paddleOcrLoading;
      paddleOcrLoading = (async () => {
        if (onStatus) onStatus("加载 PaddleOCR 运行时…");
        const mod = await import(
          "https://cdn.jsdelivr.net/npm/ppu-paddle-ocr@6.5.1/web/+esm"
        );
        if (onStatus) onStatus("加载本地识别模型（约 15MB，首次稍慢）…");
        const service = new mod.PaddleOcrService({
          model: {
            detection: paddleModelUrl("PP-OCRv4_mobile_det.onnx"),
            recognition: paddleModelUrl("PP-OCRv4_mobile_rec.onnx"),
            charactersDictionary: paddleModelUrl("ppocrv4_dict.txt"),
          },
          recognition: {
            mainThreadYieldMs: 16,
          },
          session: {
            executionProviders: ["wasm"],
            graphOptimizationLevel: "all",
          },
        });
        await service.initialize();
        paddleOcrService = service;
        return service;
      })();
      try {
        return await paddleOcrLoading;
      } finally {
        paddleOcrLoading = null;
      }
    }

    async function recognizeWithPaddle(canvas, onStatus) {
      const service = await ensurePaddleOcr(onStatus);
      if (onStatus) onStatus("PaddleOCR 识别中…");
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("无法导出识别图"))),
          "image/png",
        );
      });
      const buf = await blob.arrayBuffer();
      const result = await service.recognize(buf, { flatten: true });
      if (result && typeof result.text === "string") return result.text;
      if (Array.isArray(result?.results)) {
        return result.results
          .map((r) => (r && (r.text || r.label)) || "")
          .filter(Boolean)
          .join("\n");
      }
      return "";
    }

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
      if (typeof Tesseract === "undefined") {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Tesseract 加载失败"));
          document.head.appendChild(s);
        });
      }
      ocrWorker = await Tesseract.createWorker(lang, 1, {
        logger: onProgress,
      });
      ocrWorkerLang = lang;
      return ocrWorker;
    }

    function buildOcrWhitelist() {
      const set = new Set("卡片");
      for (const card of DATA.cards || []) {
        for (const ch of String(card.name || "")) set.add(ch);
      }
      return [...set].join("");
    }

    async function recognizeOnce(canvas, lang, psm, onProgress) {
      const worker = await getOcrWorker(lang, onProgress);
      const params = {
        tessedit_pageseg_mode: String(psm),
        preserve_interword_spaces: "1",
      };
      const wl = buildOcrWhitelist();
      if (wl.length >= 8 && wl.length < 800) {
        params.tessedit_char_whitelist = wl;
      }
      await worker.setParameters(params);
      return worker.recognize(canvas);
    }

    function rematchFromRawText() {
      const params = readOcrParams();
      const text = ocrEls.raw && "value" in ocrEls.raw ? ocrEls.raw.value : ocrEls.raw.textContent;
      const matches = matchCardsFromOcrText(text || "", params);
      renderOcrMatches(matches);
      toast(
        matches.length
          ? `按修改后的文字找到 ${matches.length} 张`
          : "仍没有匹配到卡名，请检查原文是否写对",
      );
    }

    async function runOcr() {
      if (!ocrState.file || ocrState.running) return;
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
        const engine = params.engine === "tesseract" ? "tesseract" : "paddle";
        const canvas = await preprocessImage(ocrState.file, params, engine);
        showProcessedPreview(canvas);
        ocrEls.pct.textContent = "15%";
        ocrEls.bar.style.width = "15%";

        let text = "";
        if (engine === "paddle") {
          text = await recognizeWithPaddle(canvas, (msg) => {
            ocrEls.status.textContent = msg;
          });
          ocrEls.pct.textContent = "90%";
          ocrEls.bar.style.width = "90%";
        } else {
          if (typeof Tesseract === "undefined") {
            ocrEls.status.textContent = "加载 Tesseract…";
          }
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
                const pct = Math.round(20 + (base + m.progress / modes.length) * 70);
                ocrEls.pct.textContent = `${pct}%`;
                ocrEls.bar.style.width = `${pct}%`;
              }
            });
            const t = (result && result.data && result.data.text) || "";
            if (t.trim()) texts.push(t);
          }
          text = texts.join("\n");
        }

        if (ocrEls.raw && "value" in ocrEls.raw) {
          ocrEls.raw.value = text.trim() || "";
        } else {
          ocrEls.raw.textContent = text.trim() || "（没有读出文字）";
        }
        const matches = matchCardsFromOcrText(text, params);
        renderOcrMatches(matches);
        ocrEls.status.textContent = "识别完成";
        ocrEls.pct.textContent = "100%";
        ocrEls.bar.style.width = "100%";
        toast(
          matches.length
            ? `找到 ${matches.length} 张，请确认后加入`
            : "自动识别较差时：改上面原文后再点「重新匹配」",
        );
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        toast(
          /Failed to fetch|paddle-ocr-models|404/i.test(msg)
            ? "Paddle 模型未找到：请确认 paddle-ocr-models/ 已下载"
            : err instanceof Error
              ? `识别失败：${err.message}`
              : "识别失败",
        );
        ocrEls.status.textContent = "识别失败";
      } finally {
        ocrState.running = false;
        ocrEls.run.disabled = !ocrState.file;
      }
    }

    // 参数控件
    loadOcrParams();
    for (const el of [
      ocrEls.engine,
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
      ocrEls.cropIcons,
      ocrEls.vocabRepair,
    ].filter(Boolean)) {
      el.addEventListener("input", () => {
        syncOcrParamLabels();
        saveOcrParams();
      });
      el.addEventListener("change", () => {
        syncOcrParamLabels();
        saveOcrParams();
      });
    }
    if (ocrEls.rematch) {
      ocrEls.rematch.addEventListener("click", () => rematchFromRawText());
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
        const params = readOcrParams();
        const canvas = await preprocessImage(ocrState.file, params, params.engine);
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
