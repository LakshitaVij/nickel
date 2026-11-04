(function () {
  var UNIT = 'fl oz';
  var rows = [
    { id: 'a', name: 'Store-brand oat milk', size: 32, label: '32 fl oz carton', price: 4.49 },
    { id: 'b', name: 'Store-brand oat milk', size: 64, label: '64 fl oz jug', price: 7.99 },
    { id: 'c', name: 'Oat milk multipack', size: 50.4, label: '6 × 8.4 fl oz', price: 6.99 }
  ].map(function (r) { r.unit = r.price / r.size; return r; });
  var best = rows.reduce(function (m, r) { return r.unit < m.unit ? r : m; });
  var cheapest = rows.reduce(function (m, r) { return r.price < m.price ? r : m; });
  var cents = function (u) { return (u * 100).toFixed(1) + '¢'; };
  var money = function (p) { return '$' + p.toFixed(2); };

  var $ = function (id) { return document.getElementById(id); };
  var track = $('track'), slide1 = $('slide1'), slide2 = $('slide2'), video = $('video');
  var msg = $('msg'), eyebrow = $('eyebrow'), title = $('demo-title');
  var dot1 = $('dot1'), dot2 = $('dot2');
  var autoT, swipeT, state = { slide: 0, revealed: false, picked: null };

  function clear() { clearTimeout(autoT); clearTimeout(swipeT); }

  function renderGame() {
    slide1.innerHTML = '';
    rows.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      var cls = 'opt', tag = '', sub = r.label, big = money(r.price), lbl = 'sticker price';
      if (state.revealed) {
        var isBest = r.id === best.id, mine = state.picked === r.id;
        cls += (isBest ? ' good' : ' bad') + ' done' + (mine ? ' mine' : '');
        tag = '<span class="tag">' + (isBest ? '✓ Best value' : '✕ Not the best') + '</span>';
        sub = r.label + ' · ' + money(r.price) + (mine ? ' · your pick' : '');
        big = cents(r.unit); lbl = 'per ' + UNIT;
        b.tabIndex = -1;
      }
      b.className = cls;
      b.innerHTML = '<span class="row"><span class="l"><span class="name">' + r.name + ' ' + tag +
        '</span><span class="sub2">' + sub + '</span></span><span class="r"><span class="big">' + big +
        '</span><span class="lbl">' + lbl + '</span></span></span>';
      b.addEventListener('click', function () { reveal(r.id); });
      slide1.appendChild(b);
    });
  }

  function renderMsg() {
    if (state.slide === 1) {
      msg.innerHTML = '<p class="v">Escrape does this on the page while you shop.</p><p class="d">Screen recording of the extension on a grocery site.</p>';
    } else if (!state.revealed) {
      msg.innerHTML = '<p class="p1">Tap the one you think is cheapest per ' + UNIT + '. No tap? We\'ll answer in a few seconds.</p>';
    } else {
      var v;
      if (state.picked === null) v = 'Escrape picks the ' + best.label + ': ' + cents(best.unit) + ' per ' + UNIT + '.';
      else if (state.picked === best.id) v = 'Good eye. The ' + best.label + ' is the cheapest per ' + UNIT + '.';
      else {
        var p = rows.filter(function (r) { return r.id === state.picked; })[0];
        v = 'Close, but the ' + best.label + ' wins, ' + cents(p.unit - best.unit) + ' less per ' + UNIT + ' than your pick.';
      }
      var d = best.id !== cheapest.id ? 'The lowest sticker price (' + money(cheapest.price) + ') was not the best value.' : '';
      msg.innerHTML = '<p class="v">' + v + '</p><p class="d">' + d + '</p>';
    }
  }

  function renderChrome() {
    track.classList.toggle('on-video', state.slide === 1);
    slide1.setAttribute('aria-hidden', state.slide !== 0);
    slide2.setAttribute('aria-hidden', state.slide !== 1);
    dot1.setAttribute('aria-current', state.slide === 0);
    dot2.setAttribute('aria-current', state.slide === 1);
    eyebrow.textContent = state.slide === 0 ? 'Try it · Oat milk' : 'Escrape in action';
    title.textContent = state.slide === 0 ? 'Which one is the best value?' : 'Now watch Escrape do it.';
  }

  function render() { renderGame(); renderMsg(); renderChrome(); }

  function reveal(id) {
    if (state.revealed || state.slide !== 0) return;
    clear();
    state.revealed = true; state.picked = id;
    render();
    swipeT = setTimeout(goVideo, 2000);
  }

  function goVideo() {
    clear();
    state.slide = 1;
    render();
    setTimeout(function () {
      try { video.currentTime = 0; var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }, 150);
  }

  function startGame() {
    clear();
    try { video.pause(); } catch (e) {}
    state = { slide: 0, revealed: false, picked: null };
    render();
    autoT = setTimeout(function () { reveal(null); }, 3000);
  }

  dot1.addEventListener('click', startGame);
  dot2.addEventListener('click', goVideo);
  $('replay').addEventListener('click', startGame);

  var tx = null, vp = $('viewport');
  vp.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  vp.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (dx < -50 && state.slide === 0) goVideo();
    else if (dx > 50 && state.slide === 1) startGame();
  });

  startGame();
})();
