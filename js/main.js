const STORAGE_STYLE = "htmlNitoriSelectedStyle";
const STORAGE_LAYOUT = "htmlNitoriSelectedLayout";
const STORAGE_SITE_BRIEF = "htmlNitoriSiteBrief";
const STORAGE_THEME = "htmlNitoriTheme";
const STORAGE_COMPARE = "htmlNitoriCompareStyles";
const STORAGE_PROMPT_OPTIONS = "htmlNitoriPromptOptions";

const state = {
  templates: [],
  layouts: [],
  query: "",
  category: "すべて",
  mood: "すべて",
  favoriteOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem("htmlNitoriFavorites") || "[]")),
  compareIds: new Set(JSON.parse(localStorage.getItem(STORAGE_COMPARE) || "[]")),
  currentTemplate: null,
  layoutQuery: "",
  layoutType: "すべて",
  currentLayout: null,
  spotlightTemplate: null,
};

const page = document.body.dataset.page || "styles";
const $ = (id) => document.getElementById(id);

const els = {
  totalCount: $("totalCount"),
  resultCount: $("resultCount"),
  searchInput: $("searchInput"),
  categoryChips: $("categoryChips"),
  moodChips: $("moodChips"),
  templateGrid: $("templateGrid"),
  emptyMessage: $("emptyMessage"),
  favoriteOnlyBtn: $("favoriteOnlyBtn"),
  resetBtn: $("resetBtn"),
  randomBtn: $("randomBtn"),
  copyStarterBtn: $("copyStarterBtn"),
  allColorsTab: $("allColorsTab"),
  dailySpotlight: $("dailySpotlight"),
  selectedColorDock: $("selectedColorDock"),
  compareShelf: $("compareShelf"),
  compareList: $("compareList"),
  clearCompareBtn: $("clearCompareBtn"),
  themeToggleBtn: $("themeToggleBtn"),
  modal: $("templateModal"),
  closeModalBtn: $("closeModalBtn"),
  modalPreview: $("modalPreview"),
  modalCategory: $("modalCategory"),
  modalTitle: $("modalTitle"),
  modalDescription: $("modalDescription"),
  modalTags: $("modalTags"),
  modalTarget: $("modalTarget"),
  modalSections: $("modalSections"),
  modalFeatures: $("modalFeatures"),
  promptText: $("promptText"),
  copyPromptBtn: $("copyPromptBtn"),
  chooseStyleBtn: $("chooseStyleBtn"),
  selectedStylePanel: $("selectedStylePanel"),
  layoutSearchInput: $("layoutSearchInput"),
  layoutTypeChips: $("layoutTypeChips"),
  layoutResultCount: $("layoutResultCount"),
  layoutResetBtn: $("layoutResetBtn"),
  layoutGrid: $("layoutGrid"),
  layoutEmptyMessage: $("layoutEmptyMessage"),
  randomLayoutBtn: $("randomLayoutBtn"),
  layoutModal: $("layoutModal"),
  closeLayoutModalBtn: $("closeLayoutModalBtn"),
  layoutModalPreview: $("layoutModalPreview"),
  layoutModalType: $("layoutModalType"),
  layoutModalTitle: $("layoutModalTitle"),
  layoutModalDescription: $("layoutModalDescription"),
  layoutModalBestFor: $("layoutModalBestFor"),
  layoutModalStructure: $("layoutModalStructure"),
  layoutModalFeatures: $("layoutModalFeatures"),
  layoutPromptText: $("layoutPromptText"),
  chooseLayoutBtn: $("chooseLayoutBtn"),
  styleSummaryCard: $("styleSummaryCard"),
  layoutSummaryCard: $("layoutSummaryCard"),
  combinedPromptText: $("combinedPromptText"),
  sitePurposeInput: $("sitePurposeInput"),
  copyCombinedPromptBtn: $("copyCombinedPromptBtn"),
  copyCombinedPromptBtn2: $("copyCombinedPromptBtn2"),
  clearSelectionBtn: $("clearSelectionBtn"),
  finalPreview: $("finalPreview"),
  promptFormatSelect: $("promptFormatSelect"),
  optionCssVars: $("optionCssVars"),
  optionNoImages: $("optionNoImages"),
  optionReadme: $("optionReadme"),
  downloadPromptBtn: $("downloadPromptBtn"),
  resultSection: $("resultSection"),
  missingSelection: $("missingSelection"),
  toast: $("toast"),
};

const starterPrompt = `HTML/CSS/JavaScriptでWebサイトを作ってください。
配色テンプレは「色の比率」だけの参考にしてください。配色名からサイトの題材を決めないでください。
3色は同じ量で使わず、ベース色70〜80%、主アクセント15〜25%、少量アクセント5%以下を目安にしてください。
背景全体をグラデーションにせず、単色の面・余白・カード・ボタン・下線などへ役割を分けて使ってください。
レイアウトテンプレは「骨組み」だけの参考にしてください。
作りたいサイトの内容は、別途こちらが指定する内容を最優先してください。
出力は index.html / style.css / script.js に分け、初心者でも編集しやすい構成にしてください。`;

async function loadData() {
  state.templates = Array.isArray(window.HTML_NITORI_TEMPLATES) ? window.HTML_NITORI_TEMPLATES : [];
  state.layouts = Array.isArray(window.HTML_NITORI_LAYOUTS) ? window.HTML_NITORI_LAYOUTS : [];

  await Promise.all([
    fetchJson("data/templates.json", (json) => { if (Array.isArray(json) && json.length) state.templates = json; }),
    fetchJson("data/layouts.json", (json) => { if (Array.isArray(json) && json.length) state.layouts = json; }),
  ]);
}

async function fetchJson(path, onSuccess) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    onSuccess(json);
  } catch (error) {
    console.info(`${path} fetch failed. Using bundled fallback data.`, error);
  }
}

function init() {
  applyStoredTheme();
  bindGlobalEvents();
  loadData().then(() => {
    if (page === "layouts") initLayoutPage();
    else if (page === "result") initResultPage();
    else initStylePage();
  });
}

function initStylePage() {
  if (els.totalCount) els.totalCount.textContent = state.templates.length;
  renderFilters();
  renderTemplates();
  renderDailySpotlight();
  renderSelectedColorDock();
  renderCompareShelf();
  bindStyleEvents();
}

function bindStyleEvents() {
  els.searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderTemplates();
  });

  els.categoryChips?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-kind='category']");
    if (!btn) return;
    state.category = btn.dataset.value;
    renderFilters();
    renderTemplates();
  });

  els.moodChips?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-kind='mood']");
    if (!btn) return;
    state.mood = btn.dataset.value;
    renderFilters();
    renderTemplates();
  });

  els.templateGrid?.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl || !els.templateGrid.contains(actionEl)) return;
    const tpl = state.templates.find((item) => item.id === actionEl.dataset.id);
    if (!tpl) return;

    if (actionEl.dataset.action === "open") openTemplate(tpl.id);
    if (actionEl.dataset.action === "copy") copyText(buildStylePrompt(tpl));
    if (actionEl.dataset.action === "favorite") toggleFavorite(tpl.id);
    if (actionEl.dataset.action === "compare-style") toggleCompare(tpl.id);
    if (actionEl.dataset.action === "choose-style") chooseStyle(tpl.id);
  });

  els.templateGrid?.addEventListener("keydown", (event) => {
    const actionEl = event.target.closest(".preview-open-trigger[data-action='open']");
    if (!actionEl || !els.templateGrid.contains(actionEl)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openTemplate(actionEl.dataset.id);
  });

  els.copyPromptBtn?.addEventListener("click", () => {
    if (state.currentTemplate) copyText(buildStylePrompt(state.currentTemplate));
  });

  els.chooseStyleBtn?.addEventListener("click", () => {
    if (state.currentTemplate) chooseStyle(state.currentTemplate.id);
  });

  els.closeModalBtn?.addEventListener("click", () => els.modal.close());
  els.modal?.addEventListener("click", (event) => {
    if (event.target === els.modal) els.modal.close();
  });

  els.allColorsTab?.addEventListener("click", () => {
    state.favoriteOnly = false;
    updateFavoriteTabs();
    renderTemplates();
  });

  els.favoriteOnlyBtn?.addEventListener("click", () => {
    state.favoriteOnly = true;
    updateFavoriteTabs();
    renderTemplates();
  });

  els.resetBtn?.addEventListener("click", () => {
    state.query = "";
    state.category = "すべて";
    state.mood = "すべて";
    state.favoriteOnly = false;
    els.searchInput.value = "";
    updateFavoriteTabs();
    renderFilters();
    renderTemplates();
  });

  els.randomBtn?.addEventListener("click", () => {
    const list = getFilteredTemplates();
    const source = list.length ? list : state.templates;
    const tpl = source[Math.floor(Math.random() * source.length)];
    if (!tpl) return;
    state.spotlightTemplate = tpl;
    renderDailySpotlight(tpl, true);
    els.dailySpotlight?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("ランダム配色を表示しました");
  });

  els.copyStarterBtn?.addEventListener("click", () => copyText(starterPrompt));

  els.compareList?.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl || !els.compareList.contains(actionEl)) return;
    const id = actionEl.dataset.id;
    const tpl = state.templates.find((item) => item.id === id);
    if (!tpl) return;
    if (actionEl.dataset.action === "open") openTemplate(id);
    if (actionEl.dataset.action === "choose-style") chooseStyle(id);
    if (actionEl.dataset.action === "remove-compare") toggleCompare(id, true);
  });

  els.clearCompareBtn?.addEventListener("click", () => {
    state.compareIds.clear();
    saveCompareIds();
    renderTemplates();
    renderCompareShelf();
    showToast("比較リストを空にしました");
  });
}

function unique(list) {
  return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}

function renderFilters() {
  if (!els.categoryChips || !els.moodChips) return;
  const categories = ["すべて", ...unique(state.templates.map((tpl) => tpl.category))];
  const moods = ["すべて", ...unique(state.templates.flatMap((tpl) => tpl.mood || []))];
  els.categoryChips.innerHTML = categories.map((category) => chipHtml(category, state.category, "category")).join("");
  els.moodChips.innerHTML = moods.map((mood) => chipHtml(mood, state.mood, "mood")).join("");
}

function chipHtml(value, activeValue, kind) {
  const active = value === activeValue ? " active" : "";
  return `<button class="chip${active}" type="button" data-kind="${kind}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`;
}

function getFilteredTemplates() {
  const q = state.query.trim().toLowerCase();
  return state.templates.filter((tpl) => {
    const text = [
      tpl.title,
      tpl.category,
      tpl.target,
      tpl.description,
      ...(tpl.mood || []),
      ...(tpl.colors || []),
      ...(tpl.sections || []),
    ].join(" ").toLowerCase();

    const matchQuery = !q || text.includes(q);
    const matchCategory = state.category === "すべて" || tpl.category === state.category;
    const matchMood = state.mood === "すべて" || (tpl.mood || []).includes(state.mood);
    const matchFavorite = !state.favoriteOnly || state.favorites.has(tpl.id);
    return matchQuery && matchCategory && matchMood && matchFavorite;
  });
}

function renderTemplates() {
  if (!els.templateGrid) return;
  const filtered = getFilteredTemplates();
  if (els.resultCount) els.resultCount.textContent = filtered.length;
  if (els.emptyMessage) els.emptyMessage.hidden = filtered.length !== 0;

  els.templateGrid.innerHTML = filtered.map((tpl) => {
    const isFavorite = state.favorites.has(tpl.id);
    const isCompare = state.compareIds.has(tpl.id);
    return `
      <article class="template-card palette-card">
        ${renderCardPreview(tpl)}
        <div class="card-body compact-card-body">
          <div class="card-meta">
            <span>${tpl.icon || "□"} ${escapeHtml(tpl.category)}</span>
            <span>No.${String(tpl.number).padStart(3, "0")}</span>
          </div>
          <h3>${escapeHtml(tpl.title)}</h3>
          <p class="card-description">${escapeHtml(tpl.description)}</p>
          ${renderColorCodes(tpl.colors)}
          <div class="tags compact-tags">${(tpl.mood || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="card-actions stack-actions">
            <button class="primary-btn" type="button" data-action="choose-style" data-id="${escapeHtml(tpl.id)}">この色を選ぶ</button>
            <button class="secondary-btn" type="button" data-action="open" data-id="${escapeHtml(tpl.id)}">詳細</button>
            <button class="secondary-btn compare-btn ${isCompare ? "active" : ""}" type="button" data-action="compare-style" data-id="${escapeHtml(tpl.id)}">比較</button>
            <button class="secondary-btn favorite-btn ${isFavorite ? "active" : ""}" type="button" data-action="favorite" data-id="${escapeHtml(tpl.id)}" aria-label="お気に入り">${isFavorite ? "★" : "☆"}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function saveCompareIds() {
  localStorage.setItem(STORAGE_COMPARE, JSON.stringify([...state.compareIds]));
}

function toggleCompare(id, forceRemove = false) {
  if (!id) return;
  if (state.compareIds.has(id) || forceRemove) {
    state.compareIds.delete(id);
    saveCompareIds();
    renderTemplates();
    renderCompareShelf();
    showToast("比較から外しました");
    return;
  }
  if (state.compareIds.size >= 3) {
    showToast("比較できる配色は最大3件です");
    return;
  }
  state.compareIds.add(id);
  saveCompareIds();
  renderTemplates();
  renderCompareShelf();
  showToast("比較に追加しました");
}

function renderCompareShelf() {
  if (!els.compareShelf || !els.compareList) return;
  const items = [...state.compareIds]
    .map((id) => state.templates.find((tpl) => tpl.id === id))
    .filter(Boolean);

  if (!items.length) {
    els.compareShelf.hidden = true;
    els.compareList.innerHTML = "";
    return;
  }

  els.compareShelf.hidden = false;
  els.compareList.innerHTML = items.map((tpl) => `
    <article class="compare-card">
      <div class="compare-card-preview">${renderColorUsageBar(tpl.colors, false)}</div>
      <div class="compare-card-body">
        <p>No.${String(tpl.number).padStart(3, "0")} / ${escapeHtml(tpl.category)}</p>
        <h3>${escapeHtml(tpl.title)}</h3>
        ${renderColorCodes(tpl.colors)}
        <div class="tags compact-tags">${(tpl.mood || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
      <div class="compare-card-actions">
        <button class="primary-btn small" type="button" data-action="choose-style" data-id="${escapeHtml(tpl.id)}">この色にする</button>
        <button class="secondary-btn small" type="button" data-action="open" data-id="${escapeHtml(tpl.id)}">詳細</button>
        <button class="secondary-btn small" type="button" data-action="remove-compare" data-id="${escapeHtml(tpl.id)}">外す</button>
      </div>
    </article>
  `).join("");
}

function chooseStyle(id) {
  const tpl = state.templates.find((item) => item.id === id);
  if (!tpl) return;
  localStorage.setItem(STORAGE_STYLE, JSON.stringify(tpl));
  renderSelectedColorDock();
  els.modal?.open && els.modal.close();
  showToast("配色をキープしました");
}

function openTemplate(id) {
  const tpl = state.templates.find((item) => item.id === id);
  if (!tpl) return;
  state.currentTemplate = tpl;

  if (els.modalPreview) els.modalPreview.innerHTML = renderPseudoSitePreview(tpl);
  if (els.modalCategory) els.modalCategory.textContent = `${tpl.category || "配色"} / No.${String(tpl.number).padStart(3, "0")}`;
  if (els.modalTitle) els.modalTitle.textContent = tpl.title;
  if (els.modalDescription) els.modalDescription.textContent = tpl.description;
  if (els.modalTags) els.modalTags.innerHTML = `${renderColorCodes(tpl.colors, true)}<div class="modal-mood-tags">${(tpl.mood || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
  if (els.modalTarget) els.modalTarget.textContent = "このテンプレはサイト内容を指定しません。3色の役割と使用比率だけをAIへ渡します。";
  if (els.modalSections) els.modalSections.innerHTML = colorRoleList(tpl).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (els.modalFeatures) els.modalFeatures.innerHTML = ["3色を同じ量で使わない", "ベース70〜80%、主アクセント15〜25%、少量アクセント5%以下", "背景全体をグラデーションにしない", "文字の読みやすさを優先", "作るサイト内容は別で指定する"].map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (els.promptText) els.promptText.value = buildStylePrompt(tpl);

  if (typeof els.modal?.showModal === "function") els.modal.showModal();
}

function initLayoutPage() {
  renderSelectedStylePanel();
  renderLayoutFilters();
  renderLayouts();
  bindLayoutEvents();
}

function bindLayoutEvents() {
  els.layoutSearchInput?.addEventListener("input", (event) => {
    state.layoutQuery = event.target.value;
    renderLayouts();
  });

  els.layoutTypeChips?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-kind='layoutType']");
    if (!btn) return;
    state.layoutType = btn.dataset.value;
    renderLayoutFilters();
    renderLayouts();
  });

  els.layoutGrid?.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl || !els.layoutGrid.contains(actionEl)) return;
    const layout = state.layouts.find((item) => item.id === actionEl.dataset.id);
    if (!layout) return;

    if (actionEl.dataset.action === "open-layout") openLayout(layout.id);
    if (actionEl.dataset.action === "choose-layout") chooseLayout(layout.id);
  });

  els.layoutGrid?.addEventListener("keydown", (event) => {
    const actionEl = event.target.closest(".layout-preview-trigger[data-action='open-layout']");
    if (!actionEl || !els.layoutGrid.contains(actionEl)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openLayout(actionEl.dataset.id);
  });

  els.closeLayoutModalBtn?.addEventListener("click", () => els.layoutModal.close());
  els.layoutModal?.addEventListener("click", (event) => {
    if (event.target === els.layoutModal) els.layoutModal.close();
  });

  els.chooseLayoutBtn?.addEventListener("click", () => {
    if (state.currentLayout) chooseLayout(state.currentLayout.id);
  });

  els.randomLayoutBtn?.addEventListener("click", () => {
    const list = getFilteredLayouts();
    const source = list.length ? list : state.layouts;
    const layout = source[Math.floor(Math.random() * source.length)];
    if (layout) openLayout(layout.id);
  });

  els.layoutResetBtn?.addEventListener("click", () => {
    state.layoutQuery = "";
    state.layoutType = "すべて";
    if (els.layoutSearchInput) els.layoutSearchInput.value = "";
    renderLayoutFilters();
    renderLayouts();
  });
}

function getSelectedStyle() {
  return readStoredObject(STORAGE_STYLE);
}

function getSelectedLayout() {
  return readStoredObject(STORAGE_LAYOUT);
}

function readStoredObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" ? value : null;
  } catch (error) {
    return null;
  }
}

function renderSelectedStylePanel() {
  if (!els.selectedStylePanel) return;
  const style = getSelectedStyle();
  if (!style) {
    els.selectedStylePanel.innerHTML = `
      <div class="selection-warning">
        <strong>色が未選択です</strong>
        <p>先に配色テンプレを選ぶと、ここに選択内容が表示されます。</p>
        <a class="primary-btn" href="index.html">色を選ぶ</a>
      </div>
    `;
    return;
  }
  const [base, panel, accent] = safeColors(style.colors);
  els.selectedStylePanel.innerHTML = `
    <p class="eyebrow">selected color</p>
    <h2>${escapeHtml(style.title)}</h2>
    <p>${escapeHtml(style.description)}</p>
    ${renderColorUsageBar(style.colors, true)}
    <div class="tags">${(style.mood || []).slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
    <a class="secondary-btn" href="index.html">色を変更する</a>
  `;
}

function renderLayoutFilters() {
  if (!els.layoutTypeChips) return;
  const types = ["すべて", ...unique(state.layouts.map((layout) => layout.type))];
  els.layoutTypeChips.innerHTML = types.map((type) => chipHtml(type, state.layoutType, "layoutType")).join("");
}

function getFilteredLayouts() {
  const q = state.layoutQuery.trim().toLowerCase();
  return state.layouts.filter((layout) => {
    const text = [
      layout.title,
      layout.type,
      layout.description,
      layout.bestFor,
      layout.variant,
      ...(layout.structure || []),
      ...(layout.features || []),
    ].join(" ").toLowerCase();
    const matchQuery = !q || text.includes(q);
    const matchType = state.layoutType === "すべて" || layout.type === state.layoutType;
    return matchQuery && matchType;
  });
}

function renderLayouts() {
  if (!els.layoutGrid) return;
  const filtered = getFilteredLayouts();
  const selectedStyle = getSelectedStyle();
  if (els.layoutResultCount) els.layoutResultCount.textContent = filtered.length;
  if (els.layoutEmptyMessage) els.layoutEmptyMessage.hidden = filtered.length !== 0;

  els.layoutGrid.innerHTML = filtered.map((layout) => `
    <article class="layout-card">
      ${renderLayoutPreview(layout, selectedStyle)}
      <div class="card-body layout-card-body">
        <div class="card-meta">
          <span>${layout.icon || "□"} ${escapeHtml(layout.type)}</span>
          <span>No.${String(layout.number).padStart(3, "0")}</span>
        </div>
        <h3>${escapeHtml(layout.title)}</h3>
        <p>${escapeHtml(layout.description)}</p>
        ${renderLayoutGuide(layout)}
        <div class="card-actions stack-actions">
          <button class="primary-btn layout-pick-btn" type="button" data-action="choose-layout" data-id="${escapeHtml(layout.id)}">この構造を選ぶ</button>
          <button class="secondary-btn" type="button" data-action="open-layout" data-id="${escapeHtml(layout.id)}">詳細</button>
        </div>
      </div>
    </article>
  `).join("");
}

function chooseLayout(id) {
  const layout = state.layouts.find((item) => item.id === id);
  if (!layout) return;
  const style = getSelectedStyle();
  if (!style) {
    showToast("先に色・雰囲気を選んでください");
    window.setTimeout(() => { window.location.href = "index.html"; }, 700);
    return;
  }
  localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(layout));
  showToast("レイアウトを選びました");
  window.setTimeout(() => { window.location.href = "result.html"; }, 250);
}

function openLayout(id) {
  const layout = state.layouts.find((item) => item.id === id);
  if (!layout) return;
  state.currentLayout = layout;
  if (els.layoutModalPreview) els.layoutModalPreview.innerHTML = renderLargeLayoutPreview(layout, getSelectedStyle());
  if (els.layoutModalType) els.layoutModalType.textContent = `${layout.icon || ""} ${layout.type} / No.${String(layout.number).padStart(3, "0")}`;
  if (els.layoutModalTitle) els.layoutModalTitle.textContent = layout.title;
  if (els.layoutModalDescription) els.layoutModalDescription.textContent = layout.description;
  if (els.layoutModalBestFor) els.layoutModalBestFor.textContent = layout.bestFor;
  if (els.layoutModalStructure) els.layoutModalStructure.innerHTML = (layout.structure || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (els.layoutModalFeatures) els.layoutModalFeatures.innerHTML = (layout.features || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (els.layoutPromptText) els.layoutPromptText.value = layout.layoutPrompt;
  if (typeof els.layoutModal?.showModal === "function") els.layoutModal.showModal();
}

function initResultPage() {
  const style = getSelectedStyle();
  const layout = getSelectedLayout();
  bindResultEvents();
  if (!style || !layout) {
    if (els.resultSection) els.resultSection.hidden = true;
    if (els.missingSelection) els.missingSelection.hidden = false;
    return;
  }

  if (els.styleSummaryCard) els.styleSummaryCard.innerHTML = renderStyleSummary(style);
  if (els.layoutSummaryCard) els.layoutSummaryCard.innerHTML = renderLayoutSummary(layout);
  if (els.finalPreview) els.finalPreview.innerHTML = renderLargeLayoutPreview(layout, style);

  loadPromptOptions();

  if (els.sitePurposeInput) {
    els.sitePurposeInput.value = localStorage.getItem(STORAGE_SITE_BRIEF) || "";
    els.sitePurposeInput.addEventListener("input", () => {
      localStorage.setItem(STORAGE_SITE_BRIEF, els.sitePurposeInput.value);
      updateCombinedPrompt(style, layout);
    });
  }

  [els.promptFormatSelect, els.optionCssVars, els.optionNoImages, els.optionReadme].forEach((control) => {
    control?.addEventListener("change", () => {
      savePromptOptions();
      updateCombinedPrompt(style, layout);
    });
  });

  updateCombinedPrompt(style, layout);
}

function updateCombinedPrompt(style, layout) {
  if (!els.combinedPromptText) return;
  const siteBrief = els.sitePurposeInput?.value || "";
  els.combinedPromptText.value = buildCombinedPrompt(style, layout, siteBrief, getPromptOptions());
}

function getPromptOptions() {
  return {
    format: els.promptFormatSelect?.value || "split",
    cssVars: Boolean(els.optionCssVars?.checked),
    noImages: Boolean(els.optionNoImages?.checked),
    readme: Boolean(els.optionReadme?.checked),
  };
}

function loadPromptOptions() {
  let options = {};
  try { options = JSON.parse(localStorage.getItem(STORAGE_PROMPT_OPTIONS) || "{}"); } catch (error) { options = {}; }
  if (els.promptFormatSelect && options.format) els.promptFormatSelect.value = options.format;
  if (els.optionCssVars && typeof options.cssVars === "boolean") els.optionCssVars.checked = options.cssVars;
  if (els.optionNoImages && typeof options.noImages === "boolean") els.optionNoImages.checked = options.noImages;
  if (els.optionReadme && typeof options.readme === "boolean") els.optionReadme.checked = options.readme;
}

function savePromptOptions() {
  localStorage.setItem(STORAGE_PROMPT_OPTIONS, JSON.stringify(getPromptOptions()));
}

function bindResultEvents() {
  const copyCombined = async (button) => {
    if (!els.combinedPromptText?.value) return;
    await copyText(els.combinedPromptText.value, "完成プロンプトをコピーしました");
    flashCopyButton(button);
  };
  els.copyCombinedPromptBtn?.addEventListener("click", (event) => copyCombined(event.currentTarget));
  els.copyCombinedPromptBtn2?.addEventListener("click", (event) => copyCombined(event.currentTarget));
  els.downloadPromptBtn?.addEventListener("click", () => downloadPrompt());

  els.clearSelectionBtn?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_STYLE);
    localStorage.removeItem(STORAGE_LAYOUT);
    localStorage.removeItem(STORAGE_SITE_BRIEF);
    showToast("選択をリセットしました");
    window.setTimeout(() => { window.location.href = "index.html"; }, 400);
  });
}

function downloadPrompt() {
  if (!els.combinedPromptText?.value) return;
  const blob = new Blob([els.combinedPromptText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  link.href = url;
  link.download = `html-nitori-prompt-${date}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("プロンプトtxtを保存しました");
}

function renderStyleSummary(style) {
  return `
    <p class="eyebrow">selected color</p>
    <h3>${escapeHtml(style.icon || "□")} ${escapeHtml(style.title)}</h3>
    <p>${escapeHtml(style.description)}</p>
    ${renderColorUsageBar(style.colors, true)}
    <div class="tags">${(style.mood || []).slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
  `;
}

function renderLayoutSummary(layout) {
  return `
    <p class="eyebrow">selected structure</p>
    <h3>${escapeHtml(layout.icon || "□")} ${escapeHtml(layout.title)}</h3>
    <p>${escapeHtml(layout.description)}</p>
    ${renderLayoutGuide(layout)}
  `;
}


function updateFavoriteTabs() {
  els.allColorsTab?.classList.toggle("active", !state.favoriteOnly);
  els.favoriteOnlyBtn?.classList.toggle("active", state.favoriteOnly);
}

function bindGlobalEvents() {
  document.addEventListener("click", (event) => {
    const colorBtn = event.target.closest("[data-action='copy-color']");
    if (colorBtn) {
      event.preventDefault();
      copyText(colorBtn.dataset.color || "", `${colorBtn.dataset.color || "カラーコード"}をコピーしました`);
      colorBtn.classList.add("copied");
      window.clearTimeout(colorBtn._copyTimer);
      colorBtn._copyTimer = window.setTimeout(() => colorBtn.classList.remove("copied"), 850);
      return;
    }

    const dockClose = event.target.closest("[data-action='clear-style-dock']");
    if (dockClose) {
      event.preventDefault();
      localStorage.removeItem(STORAGE_STYLE);
      renderSelectedColorDock();
      showToast("選択中の配色を外しました");
      return;
    }

    const spotlightAction = event.target.closest("#dailySpotlight [data-action]");
    if (spotlightAction) {
      const tpl = state.templates.find((item) => item.id === spotlightAction.dataset.id);
      if (!tpl) return;
      if (spotlightAction.dataset.action === "open") openTemplate(tpl.id);
      if (spotlightAction.dataset.action === "choose-style") chooseStyle(tpl.id);
      if (spotlightAction.dataset.action === "favorite") toggleFavorite(tpl.id);
    }
  });

  els.themeToggleBtn?.addEventListener("click", toggleTheme);
}

function applyStoredTheme() {
  const theme = localStorage.getItem(STORAGE_THEME) || document.documentElement.dataset.theme || "light";
  document.documentElement.dataset.theme = theme;
  if (document.body) document.body.dataset.theme = theme;
  updateThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_THEME, next);
  document.documentElement.dataset.theme = next;
  document.body.dataset.theme = next;
  updateThemeButton(next);
  showToast(next === "dark" ? "ダーク表示にしました" : "ライト表示にしました");
}

function updateThemeButton(theme) {
  if (!els.themeToggleBtn) return;
  const isDark = theme === "dark";
  els.themeToggleBtn.textContent = isDark ? "ライト" : "ダーク";
  els.themeToggleBtn.setAttribute("aria-pressed", String(isDark));
}

function getDailyTemplate() {
  if (!state.templates.length) return null;
  const d = new Date();
  const seed = Number(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`);
  return state.templates[seed % state.templates.length];
}

function renderDailySpotlight(template = null, fromRandom = false) {
  if (!els.dailySpotlight) return;
  const tpl = template || state.spotlightTemplate || getDailyTemplate();
  if (!tpl) return;
  state.spotlightTemplate = tpl;
  const isFavorite = state.favorites.has(tpl.id);
  els.dailySpotlight.innerHTML = `
    <div class="spotlight-copy">
      <p class="eyebrow">${fromRandom ? "random pick" : "today's pick"}</p>
      <h2>${fromRandom ? "ランダム配色" : "本日のおすすめ配色"}</h2>
      <p>100件から迷うときは、まずこの1色を候補にできます。配色だけをキープして、次にレイアウトを選びます。</p>
      <div class="spotlight-actions">
        <button class="primary-btn" type="button" data-action="choose-style" data-id="${escapeHtml(tpl.id)}">この色をキープ</button>
        <button class="secondary-btn" type="button" data-action="open" data-id="${escapeHtml(tpl.id)}">詳細</button>
        <button class="secondary-btn favorite-btn ${isFavorite ? "active" : ""}" type="button" data-action="favorite" data-id="${escapeHtml(tpl.id)}">${isFavorite ? "★" : "☆"}</button>
      </div>
    </div>
    <div class="spotlight-palette">
      ${renderCardPreview(tpl)}
      <h3>${escapeHtml(tpl.title)}</h3>
      ${renderColorCodes(tpl.colors)}
    </div>
  `;
}

function renderSelectedColorDock() {
  if (!els.selectedColorDock) return;
  const style = getSelectedStyle();
  if (!style) {
    els.selectedColorDock.classList.remove("show");
    els.selectedColorDock.innerHTML = "";
    return;
  }
  els.selectedColorDock.classList.add("show");
  els.selectedColorDock.innerHTML = `
    <div class="dock-palette">${renderColorUsageBar(style.colors)}</div>
    <div class="dock-copy">
      <span>選択中の色</span>
      <strong>${escapeHtml(style.title)}</strong>
    </div>
    <div class="dock-actions">
      <a class="primary-btn small" href="layouts.html">STEP 2へ</a>
      <button class="secondary-btn small" type="button" data-action="clear-style-dock">外す</button>
    </div>
  `;
}

function renderColorCodes(colors, showRole = false) {
  const labels = showRole ? ["ベース", "主アクセント", "少量"] : ["Base", "Main", "Tiny"];
  return `<div class="color-code-row" aria-label="カラーコード">${safeColors(colors).map((color, index) => `
    <button class="color-code-pill" type="button" data-action="copy-color" data-color="${escapeHtml(color)}" title="${escapeHtml(color)}をコピー">
      <span style="background:${color}"></span><b>${escapeHtml(labels[index])}</b><code>${escapeHtml(color)}</code>
    </button>
  `).join("")}</div>`;
}

function colorRoleList(style) {
  const [base, mainAccent, tinyAccent] = safeColors(style.colors);
  return [
    `ベース色 ${base}: 画面の70〜80%。背景・余白・大きな面に使う`,
    `主アクセント ${mainAccent}: 15〜25%。見出し・重要ボタン・ナビの一部に使う`,
    `少量アクセント ${tinyAccent}: 5%以下。バッジ・下線・小アイコンなど小さい差し色だけに使う`,
  ];
}

function renderColorUsageBar(colors, showLabels = false) {
  const [base, mainAccent, tinyAccent] = safeColors(colors);
  return `
    <div class="color-ratio-box" aria-label="配色比率">
      <div class="color-ratio-bar" aria-hidden="true">
        <span class="ratio-base" style="background:${base}"></span>
        <span class="ratio-main" style="background:${mainAccent}"></span>
        <span class="ratio-tiny" style="background:${tinyAccent}"></span>
      </div>
      ${showLabels ? `
        <div class="color-ratio-labels">
          <span>ベース 70〜80%</span>
          <span>アクセント 15〜25%</span>
          <span>少量 5%以下</span>
        </div>` : ""}
    </div>
  `;
}

function buildStylePrompt(style) {
  const [base, mainAccent, tinyAccent] = safeColors(style.colors);
  const moods = (style.mood || []).join("、") || "指定なし";

  return `【配色メモ】
配色名: ${style.title}
ベース色: ${base}（70〜80%）
主アクセント: ${mainAccent}（15〜25%）
少量アクセント: ${tinyAccent}（5%以下）
雰囲気: ${moods}

【使い方】
- ベース色を画面全体の大部分に使ってください。
- 主アクセントは、見出し・重要ボタン・ナビの一部・強調カードなどに限定してください。
- 少量アクセントは、バッジ・下線・小さいアイコン・通知・ホバー表現だけに使ってください。
- 3色を同じ量で使わないでください。特にアクセント2色を両方たくさん使わないでください。
- 背景全体をグラデーションにせず、単色の面として使ってください。
- 文字の読みやすさのために、白・黒・薄いグレーは補助色として使って構いません。
- 配色名からサイトの題材、文章、機能、ページ内容を決めないでください。`;
}

function buildCombinedPrompt(style, layout, siteBrief = "", options = {}) {
  const [base, mainAccent, tinyAccent] = safeColors(style.colors);
  const moods = (style.mood || []).join("、") || "指定なし";
  const layoutSections = (layout.structure || []).join("、") || "指定なし";
  const userBrief = String(siteBrief || "").trim();
  const siteBriefText = userBrief || "作りたいサイトの内容はあとから指定します。現時点では、配色名やレイアウト名から勝手に題材を決めず、仮の中立テキストで構成してください。";
  const outputText = buildOutputInstruction(options);
  const optionText = buildOptionInstruction(options);

  return `以下の条件でWebサイトを作ってください。
配色名と画面構造名は、サイトの題材ではありません。
作る内容は「作りたいサイトの内容」を最優先してください。

━━━━━━━━━━━━━━━━━━━━
【1. 作りたいサイトの内容】
━━━━━━━━━━━━━━━━━━━━
${siteBriefText}

━━━━━━━━━━━━━━━━━━━━
【2. 配色ルール】
━━━━━━━━━━━━━━━━━━━━
配色名: ${style.title}
ベース色: ${base}（70〜80%）
主アクセント: ${mainAccent}（15〜25%）
少量アクセント: ${tinyAccent}（5%以下）
雰囲気: ${moods}

使い方:
- ベース色を背景・余白・大きな面に使い、画面の大部分を占めるようにする。
- 主アクセントは見出し、重要ボタン、ナビの一部、強調カードなどに限定する。
- 少量アクセントはバッジ、下線、小アイコン、通知、ホバーなど小さい要素だけに使う。
- 3色を同じ量で使わない。アクセント2色を両方たくさん使わない。
- 背景全体をグラデーションにしない。基本は単色の面として使う。
- 文字の読みやすさのために、白・黒・薄いグレーは補助色として使ってよい。
- 配色名からサイトの題材や文章を決めない。

━━━━━━━━━━━━━━━━━━━━
【3. 画面構造】
━━━━━━━━━━━━━━━━━━━━
構造名: ${layout.title}
構造タイプ: ${layout.type}
配置順: ${layoutSections}
構造方針: ${layout.description}

具体的な並べ方:
${layout.layoutPrompt}

注意:
- ここで指定しているのは、ヘッダー・カラム・カード・表・リストなどの並べ方だけです。
- 構造名やサンプル名から、作るサイトの題材・文章・機能を勝手に決めないでください。

━━━━━━━━━━━━━━━━━━━━
【4. 実装条件】
━━━━━━━━━━━━━━━━━━━━
- HTML/CSS/JavaScriptで作成する。
- 外部ライブラリは使わない。
- 初心者でも編集しやすいclass名にする。
- コメントを少し入れる。
- レスポンシブ対応にする。
${optionText}

━━━━━━━━━━━━━━━━━━━━
【5. 出力してほしいもの】
━━━━━━━━━━━━━━━━━━━━
${outputText}`;
}

function buildOutputInstruction(options = {}) {
  if (options.format === "single") {
    return "1. 1つのHTMLファイル\n2. <style> と <script> をHTML内に含める\n3. 使い方の短い説明";
  }
  if (options.format === "project") {
    return "1. index.html\n2. css/style.css\n3. js/script.js\n4. README.md\n5. docs/作業報告書.md\n6. 使い方の短い説明";
  }
  return "1. index.html\n2. style.css\n3. script.js\n4. 使い方の短い説明";
}

function buildOptionInstruction(options = {}) {
  const lines = [];
  if (options.cssVars) lines.push("- CSSの:rootに --color-base / --color-main / --color-tiny のような変数を作り、3色を管理する。");
  if (options.noImages) lines.push("- 画像がなくても成立するように、図形・カード・余白・文字組みで見た目を作る。");
  if (options.readme) lines.push("- 最後に、編集場所と色の変え方が分かる短い使い方メモを付ける。");
  return lines.length ? lines.join("\n") : "- 追加オプション指定なし。";
}

function renderCardPreview(tpl) {
  const [base, mainAccent, tinyAccent] = safeColors(tpl.colors);
  const title = escapeHtml(tpl.title || "配色テンプレ");

  return `
    <div class="preview palette-preview preview-open-trigger" data-action="open" data-id="${escapeHtml(tpl.id || "")}" role="button" tabindex="0" aria-label="${title}の詳細を開く" style="--palette-base:${base}; --palette-main:${mainAccent}; --palette-tiny:${tinyAccent}; --text-on-base:${textOnColor(base)}; --text-on-main:${textOnColor(mainAccent)}; --text-on-tiny:${textOnColor(tinyAccent)};">
      <div class="palette-stage">
        <div class="palette-base-area">
          <div class="palette-topline"><i></i><i></i><i></i></div>
          <div class="palette-content-block">
            <span></span>
            <b></b>
            <b class="short"></b>
            <em></em>
          </div>
          <div class="palette-card-row"><i></i><i></i><i></i></div>
          <div class="palette-tiny-dots"><i></i><i></i><i></i></div>
        </div>
        <div class="palette-ratio-strip" aria-hidden="true">
          <span style="background:${base}"></span>
          <span style="background:${mainAccent}"></span>
          <span style="background:${tinyAccent}"></span>
        </div>
      </div>
    </div>
  `;
}

function renderPseudoSitePreview(tpl) {
  const [base, mainAccent, tinyAccent] = safeColors(tpl.colors);
  const title = escapeHtml(tpl.title || "配色テンプレ");
  const moods = (tpl.mood || []).slice(0, 3);

  return `
    <section class="preview-shell" style="--preview-bg:${base}; --preview-main:${mainAccent}; --preview-tiny:${tinyAccent}; --preview-panel:${base}; --preview-accent:${mainAccent}; --text-on-base:${textOnColor(base)}; --text-on-main:${textOnColor(mainAccent)}; --text-on-tiny:${textOnColor(tinyAccent)};">
      <div class="preview-title-row">
        <div><p class="preview-label">color ratio</p><h3>${title}</h3></div>
        <span class="preview-size-label">80 / 15 / 5</span>
      </div>
      <div class="site-preview-window color-only-window">
        <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><em>color.ratio/${escapeHtml(tpl.id || "template")}</em></div>
        <div class="color-board ratio-board">
          <div class="ratio-large-base">
            <div class="color-board-header"><b>Base area</b><span>余白</span><span>背景</span></div>
            <div class="ratio-hero-sample">
              <div>
                <p>主アクセントは控えめ</p>
                <h4>${title}</h4>
                <small>この小窓は、3色を同じ量で使わず、ベース色を広く使う比率見本です。</small>
              </div>
              <i>Main CTA</i>
            </div>
            <div class="ratio-card-row"><article>Card</article><article>Panel</article><article>Block</article></div>
            <div class="ratio-tiny-samples"><span></span><span></span><span></span><b>少量アクセントは線・点・バッジ程度</b></div>
          </div>
          <div class="color-role-panel ratio-role-panel">
            ${colorRoleList(tpl).map((item, index) => `<div><span style="background:${[base, mainAccent, tinyAccent][index]}"></span><p>${escapeHtml(item)}</p></div>`).join("")}
          </div>
          <div class="pseudo-mood-row">${moods.map((mood) => `<span>${escapeHtml(mood)}</span>`).join("")}</div>
        </div>
      </div>
    </section>
  `;
}

function renderLayoutPreview(layout, style = null) {
  const [base, mainAccent, tinyAccent] = style ? safeColors(style.colors) : ["#f8f1e7", "#8b6f47", "#c4472d"];
  return `
    <div class="layout-preview layout-preview-trigger" data-action="open-layout" data-id="${escapeHtml(layout.id)}" role="button" tabindex="0" aria-label="${escapeHtml(layout.title)}の詳細を開く" style="--layout-base:${base}; --layout-main:${mainAccent}; --layout-tiny:${tinyAccent}; --layout-text:${textOnColor(base)}; --layout-text-main:${textOnColor(mainAccent)}; --layout-text-tiny:${textOnColor(tinyAccent)};">
      <div class="layout-color-note" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="wireframe ${escapeHtml(layout.wireframe || "hero-split")}">
        ${wireframeHtml(layout.wireframe)}
      </div>
      <span class="layout-badge">${escapeHtml(layout.icon || "□")} ${escapeHtml(layout.type)}</span>
    </div>
  `;
}

function renderLayoutGuide(layout) {
  const items = (layout.structure || []).slice(0, 4);
  if (!items.length) return "";
  return `<div class="layout-guide" aria-label="配置メモ">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderLargeLayoutPreview(layout, style) {
  const colors = style ? safeColors(style.colors) : ["#f8f1e7", "#8b6f47", "#c4472d"];
  const [base, mainAccent, tinyAccent] = colors;
  return `
    <section class="preview-shell layout-preview-shell" style="--preview-bg:${base}; --preview-panel:${mainAccent}; --preview-accent:${mainAccent}; --preview-main:${mainAccent}; --preview-tiny:${tinyAccent}; --text-on-base:${textOnColor(base)}; --text-on-main:${textOnColor(mainAccent)}; --text-on-tiny:${textOnColor(tinyAccent)};">
      <div class="preview-title-row">
        <div><p class="preview-label">画面構造プレビュー</p><h3>${escapeHtml(layout.title)}</h3></div>
        <span class="preview-size-label">base / main / tiny</span>
      </div>
      <div class="layout-large-window">
        <div class="browser-bar"><span></span><span></span><span></span><em>layout.local/${escapeHtml(layout.id)}</em></div>
        <div class="large-wireframe ${escapeHtml(layout.wireframe || "hero-split")}">${wireframeHtml(layout.wireframe, true)}</div>
      </div>
      <div class="layout-color-help">
        <span><i style="background:${base}"></i>ベース色は背景の大きな面</span>
        <span><i style="background:${mainAccent}"></i>主アクセントは重要枠</span>
        <span><i style="background:${tinyAccent}"></i>少量アクセントは点・線・ボタンの一部</span>
      </div>
    </section>
  `;
}

function wireframeHtml(kind, large = false) {
  const lines = large ? 5 : 3;
  if (kind === "dashboard-sidebar") return `<div class="wf-sidebar"></div><div class="wf-main"><div class="wf-stats"><i></i><i></i><i></i></div><div class="wf-chart"></div><div class="wf-table"></div></div>`;
  if (kind === "ec-product-grid") return `<div class="wf-top"></div><div class="wf-products"><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  if (kind === "magazine-grid") return `<div class="wf-feature"></div><div class="wf-list">${Array(lines).fill("<i></i>").join("")}</div>`;
  if (kind === "portfolio-gallery") return `<div class="wf-gallery"><i></i><i></i><i></i><i></i></div><div class="wf-line"></div>`;
  if (kind === "reservation-flow") return `<div class="wf-hero"></div><div class="wf-booking"><i></i><i></i><i></i></div><div class="wf-button"></div>`;
  if (kind === "one-page-story") return `<div class="wf-story">${Array(5).fill("<i></i>").join("")}</div>`;
  if (kind === "card-catalog") return `<div class="wf-search"></div><div class="wf-products"><i></i><i></i><i></i><i></i></div>`;
  if (kind === "landing-pricing") return `<div class="wf-hero small"></div><div class="wf-pricing"><i></i><i></i><i></i></div>`;
  if (kind === "split-scroll") return `<div class="wf-split"><i></i><b></b></div>`;
  if (kind === "faq-help") return `<div class="wf-search"></div><div class="wf-faq">${Array(lines).fill("<i></i>").join("")}</div>`;
  if (kind === "timeline-event") return `<div class="wf-timeline">${Array(4).fill("<i></i>").join("")}</div>`;
  if (kind === "app-showcase") return `<div class="wf-phone"></div><div class="wf-main"><div class="wf-line"></div><div class="wf-line short"></div><div class="wf-button"></div></div>`;
  if (kind === "map-store") return `<div class="wf-map"></div><div class="wf-info"><i></i><i></i><i></i></div>`;
  if (kind === "comparison-table") return `<div class="wf-table compare"></div><div class="wf-pricing"><i></i><i></i></div>`;
  if (kind === "center-hero") return `<div class="wf-center"><i></i><b></b><span></span></div><div class="wf-cards"><i></i><i></i><i></i></div>`;
  return `<div class="wf-split"><b></b><i></i></div><div class="wf-cards"><i></i><i></i><i></i></div>`;
}

function buildPreviewCatch(tpl) {
  const category = tpl.category || "サイト";
  const firstMood = (tpl.mood || [])[0] || "使いやすい";
  const map = {
    "飲食店": "来店したくなる空気感を、最初の画面で伝える。",
    "美容・健康": "清潔感と安心感で、予約まで迷わせない。",
    "会社・サービス": "信頼感と強みを、短時間で伝える。",
    "ポートフォリオ": "作品と人物像が自然に伝わる見せ方。",
    "商品LP": "商品の魅力を1ページで強く見せる。",
    "学習・教材": "情報を整理して、学びやすく見せる。",
    "ゲーム・趣味": "世界観を強く出して、見ていて楽しい構成にする。",
    "投資・管理": "数字を見やすく、判断しやすく整理する。",
    "ブログ・メディア": "記事を探しやすく、読み続けやすくする。",
    "イベント": "日時・場所・参加方法をすぐ分かる形にする。",
    "アプリ・SaaS": "機能と導入メリットを分かりやすく見せる。",
    "EC・ショップ": "商品を選びやすく、購入まで迷わせない。",
    "ダッシュボード": "重要な情報を一画面で把握できるようにする。",
  };
  return escapeHtml(map[category] || `${firstMood}雰囲気で、目的がすぐ伝わるサイト。`);
}

function buildSectionCopy(section, tpl) {
  const mood = (tpl.mood || [])[0] || "見やすい";
  return escapeHtml(`${mood}印象を保ちながら「${section}」を分かりやすく配置。`);
}

function choosePreviewLayout(tpl) {
  const category = tpl.category || "";
  const moodText = (tpl.mood || []).join(" ");
  if (category.includes("ダッシュボード") || category.includes("投資")) return "layout-dashboard";
  if (category.includes("EC") || category.includes("商品")) return "layout-shop";
  if (category.includes("ブログ") || category.includes("学習")) return "layout-media";
  if (moodText.includes("高級") || moodText.includes("黒")) return "layout-premium";
  return "layout-standard";
}


function textOnColor(color) {
  const hex = String(color || "").replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#18181b";
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.52 ? "#ffffff" : "#18181b";
}

function safeColors(colors = []) {
  const defaults = ["#f7efe3", "#ffffff", "#2f6f56"];
  return defaults.map((fallback, index) => safeColor(colors[index], fallback));
}

function safeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : fallback;
}

function shortenText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

async function copyText(text, message = "コピーしました") {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  showToast(message);
}

function flashCopyButton(button) {
  if (!button) return;
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = "✓ コピーしました";
  button.classList.add("copied");
  window.clearTimeout(button._copyTimer);
  button._copyTimer = window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, 1600);
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  localStorage.setItem("htmlNitoriFavorites", JSON.stringify([...state.favorites]));
  renderTemplates();
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1500);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
