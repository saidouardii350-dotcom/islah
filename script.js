/* ============================================================
   Sla7ha — script.js
   All logic runs in the browser. No backend, no accounts.
   Honesty rules baked in:
   - No fabricated shops, ratings, or contact details.
   - Prices are either marked "Indicative (unverified)" or shown
     as "Price not available yet" — never presented as verified.
   - User-added shops and admin price edits persist only in
     localStorage, on the user's own device.
   ============================================================ */

(function () {
  'use strict';

  /* ============================ DATA ============================ */

  var BRANDS = {
    iphone:  { name: 'Apple iPhone', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone XR', 'iPhone SE (2022)'] },
    samsung: { name: 'Samsung',      models: ['Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy S22', 'Galaxy A55', 'Galaxy A35', 'Galaxy A15', 'Galaxy Note 20'] },
    xiaomi:  { name: 'Xiaomi',       models: ['Xiaomi 14', 'Xiaomi 13T', 'Redmi Note 13 Pro', 'Redmi Note 12', 'Redmi 13C', 'Poco X6 Pro'] },
    oppo:    { name: 'Oppo',         models: ['Find X7 Ultra', 'Reno 11', 'Reno 10', 'A98', 'A78'] },
    huawei:  { name: 'Huawei',       models: ['P60 Pro', 'nova 12', 'nova 11', 'Y9 Prime'] },
    realme:  { name: 'Realme',       models: ['Realme 12 Pro+', 'Realme 11 Pro', 'Realme C67', 'Realme C53'] }
  };

  var PROBLEMS = [
    {
      id: 'screen', title: 'Broken screen',
      icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5l3 4-2 3 4 3"/>',
      causes: [
        'Dropped phone with impact on a corner or edge',
        'Pressure in a pocket or bag (sitting on the phone)',
        'Previous small cracks that spread with daily use'
      ],
      tips: [
        'If the display still works, back up your data immediately — cracks spread.',
        'Apply a temporary screen protector to hold glass fragments in place.',
        'Note whether the touch layer still responds before visiting a technician.'
      ]
    },
    {
      id: 'battery', title: 'Battery replacement',
      icon: '<rect x="2" y="8" width="17" height="8" rx="2"/><path d="M22 11v2M6 10.5v3M10 10.5v3"/>',
      causes: [
        'Battery naturally worn out after 2–3 years of charge cycles',
        'Phone shutting down suddenly at 20–30% charge',
        'Battery swelling (case separating, screen lifting) — urgent'
      ],
      tips: [
        'Check battery health in settings (iPhone: Battery Health; Android: dial *#*#4636#*#* on some models).',
        'A swollen battery is a safety risk — stop charging and see a technician immediately.',
        'After replacement, charge cycles of 20–80% extend the new battery life.'
      ]
    },
    {
      id: 'charging', title: 'Charging port problems',
      icon: '<path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 01-10 0V8zM12 17v5"/>',
      causes: [
        'Dust and lint packed inside the port',
        'Corrosion from humidity or liquid exposure',
        'Physical wear or broken solder joints from rough cable use'
      ],
      tips: [
        'Gently clean the port with a wooden toothpick or compressed air — never metal.',
        'Try a different certified cable and charger adapter before concluding the port is dead.',
        'If the phone charges only at certain angles, the port connector likely needs replacement.'
      ]
    },
    {
      id: 'camera', title: 'Camera problems',
      icon: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
      causes: [
        'Scratched or cracked lens glass',
        'Damaged camera module from a drop',
        'Software glitch after an update (black screen, shaking image)'
      ],
      tips: [
        'Test both front and back cameras, and record a short video with sound.',
        'Wipe the lens gently; a blurry spot that stays in the same place is often internal dust or damage.',
        'Restart the phone and update the OS — a software cause is cheaper than a hardware fix.'
      ]
    },
    {
      id: 'audio', title: 'Speaker & microphone problems',
      icon: '<path d="M4 10v4h3l5 4V6l-5 4H4z"/><path d="M15 9a4 4 0 010 6M17.5 6.5a8 8 0 010 11"/>',
      causes: [
        'Dust or debris blocking the speaker mesh or mic hole',
        'Water residue inside the speaker after rain or humidity',
        'Damaged audio module or flex cable from a drop'
      ],
      tips: [
        'Play a ringtone at full volume and a voice note recording to test both directions.',
        'Clean the mesh with a soft dry brush — liquids can push debris deeper.',
        'If callers hear you but you hear nothing (or the reverse), tell the technician exactly which side fails.'
      ]
    },
    {
      id: 'water', title: 'Water damage',
      icon: '<path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z"/>',
      causes: [
        'Dropped in water, tea, or seawater (seawater is the most corrosive)',
        'Rain exposure or very humid environments over time',
        'Condensation from moving between hot and cold places'
      ],
      tips: [
        'Power off immediately — do not charge it or press buttons.',
        'Do NOT put it in rice; rice does not reach the corrosion. Silica gel is slightly better but not a fix.',
        'Get it to a technician within 24–48 hours — corrosion keeps spreading even when the phone seems fine.'
      ],
      urgent: true
    },
    {
      id: 'power', title: 'Phone not turning on',
      icon: '<path d="M12 3v8M6.3 6.5a8 8 0 1011.4 0"/>',
      causes: [
        'Completely drained or dead battery',
        'Failed software update or corrupted system',
        'Hardware failure: motherboard, power button, or water damage'
      ],
      tips: [
        'Charge with a known-good cable for at least 30 minutes, then try again.',
        'Try a force restart (iPhone: volume up, volume down, hold side button; Android varies by brand).',
        'If it vibrates or the logo appears briefly, tell the technician — that narrows the diagnosis a lot.'
      ]
    },
    {
      id: 'software', title: 'Software problems',
      icon: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
      causes: [
        'Buggy app or corrupted cache',
        'Failed or interrupted system update',
        'Malware from installing apps outside official stores'
      ],
      tips: [
        'Restart, then update apps and the system from official stores only.',
        'Free up storage — phones behave badly below ~10% free space.',
        'Back up before any reset. A factory reset erases everything and is a last resort, not a first step.'
      ]
    }
  ];

  var CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Mohammedia', 'El Jadida', 'Béni Mellal', 'Nador'];

  /*
   * Price data. A small set of widely-quoted ballpark ranges is included so
   * the estimator is demonstrable — each is explicitly flagged
   * verified:false ("Indicative, unverified"). Everything else shows
   * "Price not available yet". Admin demo edits are merged on top and
   * marked "Added locally".
   * Key format: brandId + '|' + model + '|' + problemId
   */
  var PRICE_DATA = {
    'iphone|iPhone 11|screen':          { min: 500, max: 900,  verified: false, note: 'Indicative range: original vs compatible screen makes a big difference.' },
    'iphone|iPhone 12|screen':          { min: 600, max: 1100, verified: false, note: 'Indicative range: OLED screens cost more.' },
    'iphone|iPhone 11|battery':         { min: 150, max: 300,  verified: false, note: 'Indicative range: depends on battery cell quality.' },
    'samsung|Galaxy A55|screen':        { min: 400, max: 750,  verified: false, note: 'Indicative range: Super AMOLED panel.' },
    'samsung|Galaxy A15|screen':        { min: 250, max: 500,  verified: false, note: 'Indicative range.' },
    'xiaomi|Redmi Note 12|screen':      { min: 250, max: 500,  verified: false, note: 'Indicative range: AMOLED variant costs more than LCD.' },
    'xiaomi|Redmi Note 12|battery':     { min: 100, max: 200,  verified: false, note: 'Indicative range.' },
    'realme|Realme C67|screen':         { min: 200, max: 400,  verified: false, note: 'Indicative range.' }
  };

  /* ======================== STATE & STORAGE ======================== */

  var LS_PRICES = 'sla7ha_prices_v1';
  var LS_SHOPS  = 'sla7ha_shops_v1';

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  var priceOverrides = readJSON(LS_PRICES, {});   // admin demo edits
  var userShops      = readJSON(LS_SHOPS, []);    // shop listings added by users

  var state = {
    brandId: null,
    model: null,
    problemId: null
  };

  /* =========================== HELPERS =========================== */

  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function esc(s) {
    var div = document.createElement('div');
    div.textContent = String(s == null ? '' : s);
    return div.innerHTML;
  }

  function priceKey(brandId, model, problemId) {
    return brandId + '|' + model + '|' + problemId;
  }

  function getPrice(brandId, model, problemId) {
    var key = priceKey(brandId, model, problemId);
    if (Object.prototype.hasOwnProperty.call(priceOverrides, key)) {
      var o = priceOverrides[key];
      return { min: o.min, max: o.max, verified: false, note: 'Added locally on this device (demo admin).' };
    }
    if (Object.prototype.hasOwnProperty.call(PRICE_DATA, key)) {
      return PRICE_DATA[key];
    }
    return null;
  }

  function formatMAD(n) {
    return Number(n).toLocaleString('fr-MA') + ' MAD';
  }

  /* Moroccan mobile numbers: 06XXXXXXXX / 07XXXXXXXX / +212 6/7 XXXXXXXX */
  function normalizeMAPhone(raw) {
    var digits = String(raw || '').replace(/[^0-9+]/g, '');
    digits = digits.replace(/^\+?212/, '');
    if (/^0[67]\d{8}$/.test(digits)) digits = digits.slice(1);
    if (/^[67]\d{8}$/.test(digits)) return '212' + digits;
    return null;
  }

  /* ===================== BRAND & MODEL SELECTION ===================== */

  function renderBrandGrid() {
    var grid = $('brand-grid');
    grid.innerHTML = '';
    Object.keys(BRANDS).forEach(function (brandId) {
      var card = el('button', 'brand-card');
      card.type = 'button';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-pressed', String(state.brandId === brandId));
      card.dataset.brand = brandId;
      card.innerHTML =
        '<svg class="brand-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 5h3"/><circle cx="12" cy="18.2" r="0.6" fill="currentColor"/></svg>' +
        '<span>' + esc(BRANDS[brandId].name) + '</span>';
      card.addEventListener('click', function () { selectBrand(brandId, true); });
      grid.appendChild(card);
    });
  }

  function selectBrand(brandId, scroll) {
    state.brandId = brandId;
    state.model = null;

    document.querySelectorAll('.brand-card').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.brand === brandId));
    });

    var panel = $('model-panel');
    var chips = $('model-chips');
    $('model-panel-title').textContent = BRANDS[brandId].name + ' — choose a model';
    chips.innerHTML = '';

    BRANDS[brandId].models.forEach(function (model) {
      var chip = el('button', 'chip', model);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', function () { selectModel(brandId, model); });
      chips.appendChild(chip);
    });

    updateSelectedLabel();
    syncEstimatorSelects();
    panel.hidden = false;
    if (scroll) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function selectModel(brandId, model) {
    state.brandId = brandId;
    state.model = model;
    document.querySelectorAll('#model-chips .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.textContent === model));
    });
    updateSelectedLabel();
    syncEstimatorSelects();
    renderEstimate();
  }

  function updateSelectedLabel() {
    var label = $('selected-model-label');
    if (state.brandId && state.model) {
      label.textContent = 'Selected: ' + BRANDS[state.brandId].name + ' — ' + state.model;
      label.hidden = false;
    } else {
      label.hidden = true;
    }
  }

  /* ========================== PROBLEM SELECTOR ========================== */

  function renderProblemGrid() {
    var grid = $('problem-grid');
    grid.innerHTML = '';
    PROBLEMS.forEach(function (p) {
      var card = el('button', 'problem-card');
      card.type = 'button';
      card.setAttribute('aria-pressed', 'false');
      card.dataset.problem = p.id;
      card.innerHTML =
        '<svg class="problem-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        p.icon + '</svg><span>' + esc(p.title) + '</span>';
      card.addEventListener('click', function () { showProblem(p.id, true); });
      grid.appendChild(card);
    });
  }

  function showProblem(problemId, scroll) {
    state.problemId = problemId;
    document.querySelectorAll('.problem-card').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.problem === problemId));
    });

    var p = PROBLEMS.find(function (x) { return x.id === problemId; });
    if (!p) return;

    var detail = $('problem-detail');
    var causes = p.causes.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
    var tips = p.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    detail.innerHTML =
      '<h3>' + esc(p.title) + '</h3>' +
      '<h4>Possible causes</h4><ul>' + causes + '</ul>' +
      '<h4>Basic troubleshooting</h4><ul>' + tips + '</ul>' +
      (p.urgent ? '<p class="detail-note"><strong>Urgent:</strong> with water damage, every hour counts. Power off and see a technician as soon as possible.</p>' : '') +
      '<p class="detail-note">This guide is general information, not a diagnosis. Only a qualified technician who inspects the device can tell you what is really wrong — and what it will cost.</p>' +
      '<div class="detail-actions">' +
      '<button type="button" class="btn btn-primary" id="detail-estimate-btn">Estimate price for this repair</button>' +
      '<a class="btn btn-outline" href="#shops">Find a shop</a>' +
      '</div>';

    $('detail-estimate-btn').addEventListener('click', function () {
      if (state.brandId && state.model) {
        syncEstimatorSelects();
        renderEstimate();
        document.getElementById('estimator').scrollIntoView({ behavior: 'smooth' });
      } else {
        document.getElementById('brands').scrollIntoView({ behavior: 'smooth' });
      }
    });

    detail.hidden = false;
    if (scroll) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    syncEstimatorProblem();
  }

  /* ========================= PRICE ESTIMATOR ========================= */

  function fillBrandSelect(select) {
    select.innerHTML = '<option value="">Select brand…</option>';
    Object.keys(BRANDS).forEach(function (brandId) {
      var opt = el('option', '', BRANDS[brandId].name);
      opt.value = brandId;
      select.appendChild(opt);
    });
  }

  function fillModelSelect(select, brandId, placeholder) {
    select.innerHTML = '';
    var ph = el('option', '', placeholder || 'Select brand first…');
    ph.value = '';
    select.appendChild(ph);
    if (brandId && BRANDS[brandId]) {
      BRANDS[brandId].models.forEach(function (m) {
        var opt = el('option', '', m);
        opt.value = m;
        select.appendChild(opt);
      });
      select.disabled = false;
    } else {
      select.disabled = true;
    }
  }

  function fillProblemSelect(select, placeholder) {
    select.innerHTML = '';
    var ph = el('option', '', placeholder || 'Select…');
    ph.value = '';
    select.appendChild(ph);
    PROBLEMS.forEach(function (p) {
      var opt = el('option', '', p.title);
      opt.value = p.id;
      select.appendChild(opt);
    });
  }

  function syncEstimatorSelects() {
    var b = $('est-brand'), m = $('est-model');
    b.value = state.brandId || '';
    fillModelSelect(m, state.brandId, state.brandId ? 'Select model…' : 'Select brand first…');
    m.value = state.model || '';
  }

  function syncEstimatorProblem() {
    $('est-problem').value = state.problemId || '';
  }

  function renderEstimate() {
    var card = $('est-result');
    var brandId = state.brandId, model = state.model, problemId = state.problemId;

    if (!brandId || !model || !problemId) {
      card.hidden = true;
      return;
    }

    var problem = PROBLEMS.find(function (p) { return p.id === problemId; });
    var data = getPrice(brandId, model, problemId);

    if (!data) {
      card.className = 'price-card na';
      card.innerHTML =
        '<span class="price-badge">Not available yet</span>' +
        '<p class="price-range">Price not available yet</p>' +
        '<p class="price-note">We do not have reliable pricing data for a <strong>' + esc(problem.title.toLowerCase()) +
        '</strong> on the ' + esc(BRANDS[brandId].name) + ' ' + esc(model) +
        ' yet. We would rather say so than invent a number. Ask a local technician for a written quote — and if you are a technician, you can add real data via the demo admin.</p>';
    } else {
      card.className = 'price-card';
      card.innerHTML =
        '<span class="price-badge' + (data.verified ? ' verified' : '') + '">' +
        (data.verified ? 'Verified range' : 'Indicative — unverified') + '</span>' +
        '<p class="price-range">' + formatMAD(data.min) + ' – ' + formatMAD(data.max) + '</p>' +
        '<p class="price-note">' + esc(BRANDS[brandId].name) + ' ' + esc(model) + ' — ' + esc(problem.title) + '</p>' +
        (data.note ? '<p class="price-note">' + esc(data.note) + '</p>' : '') +
        '<p class="price-note">Real prices depend on parts quality (original vs compatible), parts availability in Morocco, and the technician. Always confirm the final quote after inspection.</p>';
    }
    card.hidden = false;
  }

  /* ========================= MODEL SEARCH BAR ========================= */

  function flattenModels() {
    var list = [];
    Object.keys(BRANDS).forEach(function (brandId) {
      BRANDS[brandId].models.forEach(function (m) {
        list.push({ brandId: brandId, brand: BRANDS[brandId].name, model: m });
      });
    });
    return list;
  }

  var ALL_MODELS = flattenModels();

  function renderSuggestions(query) {
    var box = $('search-suggestions');
    var q = query.trim().toLowerCase();
    box.innerHTML = '';
    if (!q) { box.hidden = true; return; }

    var matches = ALL_MODELS.filter(function (item) {
      return item.model.toLowerCase().indexOf(q) !== -1 ||
             item.brand.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);

    if (matches.length === 0) {
      box.appendChild(el('div', 'suggestion-empty', 'No matching model yet — try another name, or pick from the brand list below.'));
    } else {
      matches.forEach(function (item) {
        var btn = el('button', 'suggestion-item');
        btn.type = 'button';
        btn.innerHTML = '<span>' + esc(item.model) + '</span><span class="sug-brand">' + esc(item.brand) + '</span>';
        btn.addEventListener('click', function () {
          $('model-search').value = item.brand + ' ' + item.model;
          box.hidden = true;
          selectBrand(item.brandId, true);
          selectModel(item.brandId, item.model);
          document.getElementById('problems').scrollIntoView({ behavior: 'smooth' });
        });
        box.appendChild(btn);
      });
    }
    box.hidden = false;
  }

  /* ========================= SHOP DIRECTORY ========================= */

  /*
   * Shop object shape (reserved fields for future monetization):
   * { id, name, city, area, phone, whatsapp, hours, brands[], services[],
   *   verified:false, featured:false, plan:'free' }
   * No shops are shipped pre-made. Listings come only from the add-shop
   * form (stored locally) or — once the backend exists — reviewed submissions.
   */

  function allShops() {
    return userShops.slice().sort(function (a, b) {
      if (!!a.featured === !!b.featured) return a.name.localeCompare(b.name);
      return a.featured ? -1 : 1;
    });
  }

  function renderCitiesDatalist() {
    var dl = $('city-list');
    dl.innerHTML = '';
    CITIES.forEach(function (c) {
      var opt = el('option');
      opt.value = c;
      dl.appendChild(opt);
    });
  }

  function renderDirectory() {
    var results = $('shop-results');
    var count = $('shop-count');
    var city = $('shop-city').value.trim().toLowerCase();
    var area = $('shop-area').value.trim().toLowerCase();
    var brand = $('shop-brand-filter').value;
    var service = $('shop-service-filter').value;

    var shops = allShops().filter(function (s) {
      if (city && s.city.toLowerCase().indexOf(city) === -1) return false;
      if (area && s.area.toLowerCase().indexOf(area) === -1) return false;
      if (brand && s.brands.indexOf(brand) === -1) return false;
      if (service && s.services.indexOf(service) === -1) return false;
      return true;
    });

    results.innerHTML = '';
    count.textContent = shops.length + (shops.length === 1 ? ' shop found' : ' shops found');

    if (shops.length === 0) {
      var empty = el('div', 'empty-state');
      var cityVal = $('shop-city').value.trim();
      empty.innerHTML = '<p><strong>No repair shops listed' +
        (cityVal ? ' in ' + esc(cityVal) : ' yet') + '.</strong></p>' +
        '<p>Sla7ha never invents listings. If you own a repair shop, add yours for free below — or check back soon as we onboard shops city by city.</p>';
      results.appendChild(empty);
      return;
    }

    shops.forEach(function (s) {
      var card = el('article', 'shop-card' + (s.featured ? ' featured' : ''));
      var badges =
        (s.verified ? '<span class="badge badge-verified">Verified</span>' : '<span class="badge badge-unverified">Unverified</span>') +
        (s.featured ? ' <span class="badge badge-featured">Featured</span>' : '');
      var tags = s.services.concat(s.brands).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var waText = encodeURIComponent('Hello ' + s.name + ', I found you on Sla7ha. I need a repair for my phone.');

      card.innerHTML =
        '<div class="shop-head"><h3>' + esc(s.name) + '</h3><div>' + badges + '</div></div>' +
        '<p class="shop-meta">' + esc(s.area) + ', ' + esc(s.city) +
        (s.hours ? ' · ' + esc(s.hours) : '') + '</p>' +
        '<p class="shop-meta">Phone: <a href="tel:+' + esc(s.phone) + '">+' + esc(s.phone) + '</a></p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '<div class="shop-actions">' +
        '<a class="btn btn-wa" href="https://wa.me/' + esc(s.whatsapp || s.phone) + '?text=' + waText + '" target="_blank" rel="noopener">WhatsApp</a>' +
        '<a class="btn btn-ghost" href="tel:+' + esc(s.phone) + '">Call</a>' +
        '</div>';
      results.appendChild(card);
    });
  }

  function renderShopFilterOptions() {
    var bf = $('shop-brand-filter');
    Object.keys(BRANDS).forEach(function (brandId) {
      var opt = el('option', '', BRANDS[brandId].name);
      opt.value = brandId;
      bf.appendChild(opt);
    });
    var sf = $('shop-service-filter');
    PROBLEMS.forEach(function (p) {
      var opt = el('option', '', p.title);
      opt.value = p.id;
      sf.appendChild(opt);
    });
  }

  function renderShopFormChecks() {
    var bc = $('s-brands');
    Object.keys(BRANDS).forEach(function (brandId) {
      var label = el('label');
      label.innerHTML = '<input type="checkbox" name="s-brand" value="' + brandId + '"> <span>' + esc(BRANDS[brandId].name) + '</span>';
      bc.appendChild(label);
    });
    var sc = $('s-services');
    PROBLEMS.forEach(function (p) {
      var label = el('label');
      label.innerHTML = '<input type="checkbox" name="s-service" value="' + p.id + '"> <span>' + esc(p.title) + '</span>';
      sc.appendChild(label);
    });
  }

  function checkedValues(name) {
    return Array.prototype.map.call(
      document.querySelectorAll('input[name="' + name + '"]:checked'),
      function (cb) { return cb.value; }
    );
  }

  function setMsg(node, text, kind) {
    node.textContent = text || '';
    node.className = 'form-msg' + (kind ? ' ' + kind : '');
  }

  function onShopSubmit(event) {
    event.preventDefault();
    var msg = $('shop-form-msg');

    var name = $('s-name').value.trim();
    var city = $('s-city').value.trim();
    var area = $('s-area').value.trim();
    var hours = $('s-hours').value.trim();
    var phone = normalizeMAPhone($('s-phone').value);
    var whatsapp = normalizeMAPhone($('s-whatsapp').value);
    var brands = checkedValues('s-brand');
    var services = checkedValues('s-service');
    var consent = $('s-consent').checked;

    if (name.length < 2) return setMsg(msg, 'Please enter the shop name.', 'error');
    if (!city) return setMsg(msg, 'Please enter the city.', 'error');
    if (!area) return setMsg(msg, 'Please enter the neighborhood.', 'error');
    if (!phone) return setMsg(msg, 'Please enter a valid Moroccan phone number (e.g. 06 12 34 56 78).', 'error');
    if (brands.length === 0) return setMsg(msg, 'Select at least one brand you service.', 'error');
    if (services.length === 0) return setMsg(msg, 'Select at least one service you offer.', 'error');
    if (!consent) return setMsg(msg, 'Please confirm the information is accurate.', 'error');

    var shop = {
      id: 'local-' + Date.now(),
      name: name, city: city, area: area, hours: hours,
      phone: phone, whatsapp: whatsapp || phone,
      brands: brands, services: services,
      verified: false, featured: false, plan: 'free'
    };

    userShops.push(shop);
    if (!writeJSON(LS_SHOPS, userShops)) {
      userShops.pop();
      return setMsg(msg, 'Could not save on this device (storage full or blocked). Your listing was not stored.', 'error');
    }

    setMsg(msg, 'Listing saved on this device and shown below as Unverified. It appears for everyone once our backend and review process launch.', 'success');
    document.getElementById('add-shop-form').reset();
    renderDirectory();
    document.getElementById('shops').scrollIntoView({ behavior: 'smooth' });
  }

  /* ========================== ADMIN DEMO ========================== */

  function renderAdminList() {
    var list = $('adm-list');
    list.innerHTML = '';
    var keys = Object.keys(priceOverrides);
    if (keys.length === 0) {
      list.appendChild(el('p', 'fine-print', 'No local price edits yet. Edits made here appear in the estimator and stay on this device only.'));
      return;
    }
    keys.forEach(function (key) {
      var parts = key.split('|');
      var brandName = BRANDS[parts[0]] ? BRANDS[parts[0]].name : parts[0];
      var p = priceOverrides[key];
      var row = el('div', 'admin-row');
      row.innerHTML =
        '<span><strong>' + esc(brandName) + ' ' + esc(parts[1]) + '</strong> — ' + esc(parts[2]) +
        ': ' + formatMAD(p.min) + ' – ' + formatMAD(p.max) + '</span>';
      var del = el('button', 'btn btn-ghost', 'Delete');
      del.type = 'button';
      del.addEventListener('click', function () {
        delete priceOverrides[key];
        writeJSON(LS_PRICES, priceOverrides);
        renderAdminList();
        renderEstimate();
      });
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function onAdminSave() {
    var msg = $('adm-msg');
    var brandId = $('adm-brand').value;
    var model = $('adm-model').value;
    var problemId = $('adm-problem').value;
    var min = parseInt($('adm-min').value, 10);
    var max = parseInt($('adm-max').value, 10);

    if (!brandId || !model || !problemId) return setMsg(msg, 'Select brand, model, and repair type.', 'error');
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0) return setMsg(msg, 'Enter valid min and max prices in MAD.', 'error');
    if (min > max) return setMsg(msg, 'Min price cannot be higher than max price.', 'error');

    priceOverrides[priceKey(brandId, model, problemId)] = { min: min, max: max };
    if (!writeJSON(LS_PRICES, priceOverrides)) {
      return setMsg(msg, 'Could not save — browser storage is unavailable.', 'error');
    }
    setMsg(msg, 'Saved. It now appears in the estimator on this device only.', 'success');
    $('adm-min').value = '';
    $('adm-max').value = '';
    renderAdminList();
    renderEstimate();
  }

  /* ============================ WIRING ============================ */

  function init() {
    renderBrandGrid();
    renderProblemGrid();
    renderCitiesDatalist();
    renderShopFilterOptions();
    renderShopFormChecks();

    fillBrandSelect($('est-brand'));
    fillBrandSelect($('adm-brand'));
    fillProblemSelect($('est-problem'));
    fillProblemSelect($('adm-problem'), 'Select…');
    syncEstimatorSelects();

    // Estimator selects
    $('est-brand').addEventListener('change', function () {
      state.brandId = this.value || null;
      state.model = null;
      fillModelSelect($('est-model'), state.brandId, state.brandId ? 'Select model…' : 'Select brand first…');
      updateSelectedLabel();
      renderEstimate();
    });
    $('est-model').addEventListener('change', function () {
      state.model = this.value || null;
      updateSelectedLabel();
      renderEstimate();
    });
    $('est-problem').addEventListener('change', function () {
      state.problemId = this.value || null;
      renderEstimate();
    });

    // Search
    $('model-search').addEventListener('input', function () { renderSuggestions(this.value); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) $('search-suggestions').hidden = true;
    });

    // Directory
    ['shop-city', 'shop-area', 'shop-brand-filter', 'shop-service-filter'].forEach(function (id) {
      $(id).addEventListener('input', renderDirectory);
      $(id).addEventListener('change', renderDirectory);
    });
    $('shop-clear').addEventListener('click', function () {
      $('shop-city').value = '';
      $('shop-area').value = '';
      $('shop-brand-filter').value = '';
      $('shop-service-filter').value = '';
      renderDirectory();
    });
    $('add-shop-form').addEventListener('submit', onShopSubmit);
    renderDirectory();

    // Admin demo
    $('adm-brand').addEventListener('change', function () {
      fillModelSelect($('adm-model'), this.value || null, this.value ? 'Select model…' : 'Select brand…');
    });
    $('adm-save').addEventListener('click', onAdminSave);
    $('adm-reset').addEventListener('click', function () {
      localStorage.removeItem(LS_PRICES);
      localStorage.removeItem(LS_SHOPS);
      priceOverrides = {};
      userShops = [];
      renderAdminList();
      renderDirectory();
      renderEstimate();
      setMsg($('adm-msg'), 'All demo data cleared from this device.', 'success');
    });
    function openAdmin() {
      $('admin').hidden = false;
      renderAdminList();
      $('admin').scrollIntoView({ behavior: 'smooth' });
    }
    $('admin-link').addEventListener('click', function (e) { e.preventDefault(); openAdmin(); });
    $('admin-jump').addEventListener('click', function (e) { e.preventDefault(); openAdmin(); });

    document.getElementById('year').textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
