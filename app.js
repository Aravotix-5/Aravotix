/* Aravotix — app.js
   Shared by every page. Builds content from businesses.js (window.ARAVOTIX_DATA) and adds behaviour:
   company cards with expandable details, hero links, About and contact content, social row,
   mobile menu, scroll effects, the animated hero background and the 3D digital business card.
   To change content, edit businesses.js, not this file. */
(function () {
  'use strict';

  var INFO_NEEDED = 'Information Needed';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var STATUS = {
    'live': { label: 'Live', tone: 'live' },
    'in-development': { label: 'In development', tone: 'progress' },
    'coming-soon': { label: 'Coming Soon', tone: 'soon' },
    'info-needed': { label: INFO_NEEDED, tone: 'info' }
  };

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helpers ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function text(value) {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
  }

  // Only http(s) links are ever rendered as links.
  function safeUrl(value) {
    if (typeof value !== 'string' || value === '') return null;
    try {
      var url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
    } catch (err) {
      return null;
    }
  }

  // Images: an http(s) address or a plain relative path such as images/photo.jpg.
  function safeAsset(value) {
    if (typeof value !== 'string') return null;
    var v = value.trim();
    if (/^https?:\/\/\S+$/i.test(v)) return v;
    if (/^[A-Za-z0-9_\-.\/]+$/.test(v) && v.indexOf('..') === -1 && v.charAt(0) !== '/') return v;
    return null;
  }

  function getData() {
    var data = window.ARAVOTIX_DATA;
    return data && typeof data === 'object' ? data : null;
  }

  function telHref(phone) {
    var digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return 'tel:+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return 'tel:+' + digits;
    return 'tel:' + digits;
  }

  /* ---------- Icons ---------- */
  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  var PLATFORMS = {
    youtube: {
      name: 'YouTube',
      draw: function (s) {
        s.appendChild(svgEl('rect', { x: 2.5, y: 5.5, width: 19, height: 13, rx: 4 }));
        s.appendChild(svgEl('path', { d: 'M10 9.2v5.6l4.8-2.8z', fill: 'currentColor' }));
      }
    },
    instagram: {
      name: 'Instagram',
      draw: function (s) {
        s.appendChild(svgEl('rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 5 }));
        s.appendChild(svgEl('circle', { cx: 12, cy: 12, r: 4 }));
        s.appendChild(svgEl('circle', { cx: 17, cy: 7, r: 0.6, fill: 'currentColor' }));
      }
    },
    facebook: {
      name: 'Facebook',
      draw: function (s) {
        s.appendChild(svgEl('path', { d: 'M14.5 8H16V5h-2.4C11.4 5 10 6.5 10 8.7V11H8v3h2v6h3v-6h2.3l.5-3H13V8.9c0-.6.4-.9 1.5-.9z' }));
      }
    },
    x: {
      name: 'X',
      draw: function (s) {
        s.appendChild(svgEl('path', { d: 'M5 5l14 14M19 5L5 19' }));
      }
    },
    linkedin: {
      name: 'LinkedIn',
      draw: function (s) {
        s.appendChild(svgEl('path', { d: 'M7.5 10v7M7.5 6.8v.01M11.5 17v-7M11.5 13a3 3 0 016 0v4' }));
      }
    },
    tiktok: {
      name: 'TikTok',
      draw: function (s) {
        s.appendChild(svgEl('path', { d: 'M14 4.5v10a3.5 3.5 0 11-3.5-3.5M14 4.5c.3 2.3 1.9 3.9 4.5 4' }));
      }
    },
    link: {
      name: 'Website',
      draw: function (s) {
        s.appendChild(svgEl('circle', { cx: 12, cy: 12, r: 8.5 }));
        s.appendChild(svgEl('path', { d: 'M3.5 12h17M12 3.5c2.5 2.5 3.5 5.4 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.4-3.5-8.5s1-6 3.5-8.5z' }));
      }
    }
  };

  function platformInfo(name) {
    return PLATFORMS[name] || PLATFORMS.link;
  }

  function socialIcon(platform) {
    var s = svgEl('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    s.setAttribute('class', 'icon');
    platformInfo(platform).draw(s);
    return s;
  }

  // Builds the social chips. With no link yet, the icon is shown but is not clickable.
  function renderSocial(list, items) {
    list.textContent = '';
    var count = 0;
    (Array.isArray(items) ? items : []).forEach(function (entry) {
      if (!entry || typeof entry !== 'object') return;
      var info = platformInfo(entry.platform);
      var label = text(entry.label);
      var name = info.name + (label && label !== info.name ? ' \u00B7 ' + label : '');
      var url = safeUrl(entry.url);

      var item = el('li');
      var chip;
      if (url) {
        chip = el('a', 'social__item');
        chip.href = url.href;
        chip.target = '_blank';
        chip.rel = 'noopener noreferrer';
      } else {
        chip = el('span', 'social__item');
      }
      chip.appendChild(socialIcon(entry.platform));
      chip.appendChild(el('span', '', name));
      item.appendChild(chip);
      list.appendChild(item);
      count += 1;
    });
    return count;
  }

  /* ---------- Scroll reveal ---------- */
  // Only things below the fold are hidden first, so nothing flashes on load.
  var revealObserver = null;

  function revealOnScroll(nodes) {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          var order = 0;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var node = entry.target;
            var delay = order * 80;
            order += 1;
            revealObserver.unobserve(node);
            node.style.transitionDelay = delay + 'ms';
            node.classList.add('is-in');
            // Hand transitions back to the element (hover effects) once revealed.
            window.setTimeout(function () {
              node.classList.remove('reveal', 'is-in');
              node.style.transitionDelay = '';
            }, 1000 + delay);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
    }

    each(nodes, function (node) {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      node.classList.add('reveal');
      revealObserver.observe(node);
    });
  }

  /* ---------- Business cards ---------- */
  function detailRow(list, label, value) {
    var row = el('div');
    row.appendChild(el('dt', '', label));
    var dd = el('dd', value ? '' : 'is-missing');
    if (value && value.nodeType) dd.appendChild(value);
    else dd.textContent = value || INFO_NEEDED;
    row.appendChild(dd);
    list.appendChild(row);
  }

  function contactNode(value) {
    var v = text(value);
    if (!v) return null;
    if (v.indexOf('@') > 0 && /^\S+@\S+\.\S+$/.test(v)) {
      var mail = el('a', '', v);
      mail.href = 'mailto:' + v;
      return mail;
    }
    if (/^[\d\s().+\-]{7,}$/.test(v)) {
      var call = el('a', '', v);
      call.href = telHref(v);
      return call;
    }
    return el('span', '', v);
  }

  function buildDetails(business, url) {
    var list = el('dl', 'biz__details');
    detailRow(list, 'Location', text(business.location));
    detailRow(list, 'Launched', text(business.launchYear));

    var site = null;
    if (url) {
      site = el('a', '', url.host);
      site.href = url.href;
      site.target = '_blank';
      site.rel = 'noopener noreferrer';
    }
    detailRow(list, 'Website / app', site);
    detailRow(list, 'Contact', contactNode(business.contact));

    var socialList = el('ul', 'social social--small');
    var hasSocial = renderSocial(socialList, business.social) > 0;
    detailRow(list, 'Social', hasSocial ? socialList : null);
    return list;
  }

  function renderCard(business, compact) {
    var status = STATUS[business.status] || STATUS['info-needed'];
    var url = safeUrl(business.url);
    var image = safeAsset(business.image);
    var logo = safeAsset(business.logo);

    var card = el(
      'article',
      'card biz' + (business.placeholder ? ' biz--placeholder' : '') + (compact ? ' biz--compact' : '')
    );
    if (!compact) card.id = business.id;

    if (image) {
      var media = el('div', 'biz__media');
      var photo = el('img');
      photo.src = image;
      photo.alt = text(business.imageAlt) || '';
      photo.loading = 'lazy';
      photo.decoding = 'async';
      media.appendChild(photo);
      card.appendChild(media);
    }

    var top = el('div', 'biz__top');
    var mark = el('div', 'biz__mark');
    if (logo) {
      var logoImg = el('img');
      logoImg.src = logo;
      logoImg.alt = business.name + ' logo';
      mark.appendChild(logoImg);
    } else {
      mark.textContent = business.monogram || business.name.charAt(0).toUpperCase();
      mark.setAttribute('aria-hidden', 'true');
    }
    top.appendChild(mark);
    top.appendChild(el('span', 'badge badge--' + status.tone, status.label));
    card.appendChild(top);

    card.appendChild(el('h3', 'biz__name', business.name));

    if (business.pronunciation) {
      card.appendChild(el('p', 'biz__say', 'Pronounced \u201C' + business.pronunciation + '\u201D'));
    }
    if (text(business.tagline)) {
      card.appendChild(el('p', 'biz__tagline', business.tagline));
    }

    if (compact) {
      // Home page: short card that links to the full Companies page.
      if (!text(business.tagline)) {
        card.appendChild(el('p', 'biz__desc', text(business.description) || INFO_NEEDED));
      }
      if (!business.placeholder) {
        var more = el('div', 'biz__cta');
        var moreLink = el('a', 'btn btn--glass btn--small', 'View details');
        moreLink.href = 'companies.html#' + business.id;
        moreLink.setAttribute('aria-label', 'View details for ' + business.name);
        more.appendChild(moreLink);
        card.appendChild(more);
      }
      return card;
    }

    card.appendChild(
      text(business.description)
        ? el('p', 'biz__desc', business.description)
        : el('p', 'biz__desc is-missing', INFO_NEEDED)
    );

    if (business.placeholder) return card;

    var cta = el('div', 'biz__cta');
    if (url) {
      var visit = el('a', 'btn btn--primary btn--small', business.linkLabel || 'Visit ' + business.name);
      visit.href = url.href;
      visit.target = '_blank';
      visit.rel = 'noopener noreferrer';
      cta.appendChild(visit);
    }

    var panelId = 'details-' + business.id;
    var toggle = el('button', 'btn btn--glass btn--small biz__toggle', 'Details');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', panelId);
    cta.appendChild(toggle);
    card.appendChild(cta);

    var panel = el('div', 'biz__panel');
    panel.id = panelId;
    var inner = el('div', 'biz__panel-inner');
    inner.appendChild(buildDetails(business, url));
    panel.appendChild(inner);
    card.appendChild(panel);

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.firstChild.nodeValue = open ? 'Hide details' : 'Details';
      panel.classList.toggle('is-open', open);
    });

    return card;
  }

  function renderBusinesses(data) {
    var businesses = Array.isArray(data.businesses)
      ? data.businesses.filter(function (b) {
          return b && typeof b.id === 'string' && typeof b.name === 'string';
        })
      : [];

    each(document.querySelectorAll('[data-business-grid]'), function (grid) {
      grid.textContent = '';
      grid.removeAttribute('aria-busy');
      if (!businesses.length) {
        grid.appendChild(el('p', 'grid__status', 'No businesses or projects have been listed yet.'));
        return;
      }
      var compact = grid.getAttribute('data-variant') === 'compact';
      var cards = businesses.map(function (business) {
        return renderCard(business, compact);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      revealOnScroll(cards);
      if (!compact) focusHashCard();
    });

    // Hero links, one per business.
    each(document.querySelectorAll('[data-business-chips]'), function (list) {
      list.textContent = '';
      businesses.forEach(function (business) {
        var status = STATUS[business.status] || STATUS['info-needed'];
        var item = el('li');
        var link = el('a', 'chip');
        link.href = 'companies.html#' + business.id;
        link.appendChild(el('span', 'chip__dot chip__dot--' + status.tone));
        link.appendChild(el('span', '', business.name));
        item.appendChild(link);
        list.appendChild(item);
      });
    });

    // Footer list.
    each(document.querySelectorAll('[data-business-list]'), function (list) {
      list.textContent = '';
      businesses.forEach(function (business) {
        var item = el('li');
        var link = el('a', '', business.name);
        link.href = 'companies.html#' + business.id;
        item.appendChild(link);
        list.appendChild(item);
      });
    });
  }

  // Cards are built after load, so scroll to (and highlight) the one named in the address.
  function focusHashCard() {
    if (!window.location.hash) return;
    try {
      var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target && target.classList.contains('biz')) {
        target.classList.add('is-target');
        window.setTimeout(function () {
          target.scrollIntoView({ block: 'center' });
        }, 60);
      }
    } catch (err) {
      /* ignore malformed hashes */
    }
  }

  /* ---------- Company: mission, details, contact, social ---------- */
  function renderCompany(data) {
    var company = data.company && typeof data.company === 'object' ? data.company : {};
    var email = text(company.contactEmail);
    var phone = text(company.contactPhone);
    var location = text(company.location);

    each(document.querySelectorAll('[data-company-mission]'), function (node) {
      var mission = text(company.mission);
      node.textContent = mission || INFO_NEEDED;
      node.classList.toggle('is-missing', !mission);
    });

    each(document.querySelectorAll('[data-company-pillars]'), function (list) {
      list.textContent = '';
      (Array.isArray(company.pillars) ? company.pillars : []).forEach(function (pillar) {
        if (!text(pillar)) return;
        var item = el('li', 'card pillar', pillar);
        list.appendChild(item);
      });
      revealOnScroll(list.children);
    });

    each(document.querySelectorAll('[data-company-details]'), function (list) {
      list.textContent = '';
      [['Founded', text(company.founded)], ['Location', location]].forEach(function (pair) {
        var row = el('div');
        row.appendChild(el('dt', '', pair[0]));
        row.appendChild(el('dd', pair[1] ? '' : 'is-missing', pair[1] || INFO_NEEDED));
        list.appendChild(row);
      });
    });

    // Fields shown as text (data-field) or used as links (data-link), across all pages.
    var founder = company.founder && typeof company.founder === 'object' ? company.founder : {};
    var website = safeUrl(company.website);
    var card = safeUrl(company.digitalCard);
    var values = {
      founderName: { text: text(founder.name) },
      founderTitle: { text: text(founder.title) },
      phone: { text: phone, href: phone ? telHref(phone) : null },
      email: { text: email, href: email ? 'mailto:' + email : null },
      website: {
        text: website ? website.host + (website.pathname === '/' ? '' : website.pathname) : null,
        href: website ? website.href : null
      },
      digitalCard: { text: card ? 'Digital card' : null, href: card ? card.href : null },
      location: { text: location }
    };

    each(document.querySelectorAll('[data-field], [data-link]'), function (node) {
      var fieldName = node.getAttribute('data-field');
      var linkName = node.getAttribute('data-link');
      var value = values[fieldName || linkName];
      var missing = !value || (fieldName && !value.text) || (linkName && !value.href);

      if (missing) {
        node.hidden = true;
        var row = node.closest('li');
        if (row) row.hidden = true;
        return;
      }
      if (fieldName) node.textContent = value.text;
      if (linkName) {
        node.setAttribute('href', value.href);
        if (/^https?:/i.test(value.href)) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });

    // Footer contact list.
    each(document.querySelectorAll('[data-footer-contact]'), function (list) {
      list.textContent = '';
      var entries = [
        [email, 'mailto:' + email],
        [phone, phone ? telHref(phone) : null],
        [values.website.text, values.website.href]
      ];
      entries.forEach(function (entry) {
        if (!entry[0] || !entry[1]) return;
        var item = el('li');
        var link = el('a', '', entry[0]);
        link.href = entry[1];
        if (/^https?:/i.test(entry[1])) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        item.appendChild(link);
        list.appendChild(item);
      });
      if (location) list.appendChild(el('li', 'footer__contact-text', location));
      if (!list.children.length) list.appendChild(el('li', 'footer__contact-text', INFO_NEEDED));
    });

    // "Follow us" rows only appear when there is at least one social account.
    each(document.querySelectorAll('[data-follow]'), function (wrap) {
      var list = wrap.querySelector('[data-social]');
      if (!list) return;
      wrap.hidden = renderSocial(list, company.social) === 0;
    });
  }

  function renderError() {
    each(document.querySelectorAll('[data-business-grid]'), function (grid) {
      grid.textContent = '';
      grid.removeAttribute('aria-busy');
      var box = el('p', 'grid__error', "Business information couldn't be loaded.");
      box.setAttribute('role', 'alert');
      grid.appendChild(box);
    });
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (isOpen() && !event.target.closest('.site-header')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 760px)');
    var onChange = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Header state and reading-progress line ---------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (header) {
      var ticking = false;
      var update = function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        header.style.setProperty('--progress', progress.toFixed(4));
        ticking = false;
      };
      window.addEventListener(
        'scroll',
        function () {
          if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
          }
        },
        { passive: true }
      );
      update();
    }
  }

  /* ---------- Pointer spotlight on glass cards (mouse devices only) ---------- */
  function initSpotlight() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

    document.addEventListener(
      'pointermove',
      function (event) {
        var card = event.target.closest && event.target.closest('.card');
        if (!card) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', event.clientX - rect.left + 'px');
        card.style.setProperty('--my', event.clientY - rect.top + 'px');
      },
      { passive: true }
    );
  }

  /* ---------- Animated hero background: drifting network of points ---------- */
  function initConstellation() {
    var canvas = document.querySelector('.hero__canvas');
    var hero = document.getElementById('top');
    if (!canvas || !hero || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var host = canvas.parentNode;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var nodes = [];
    var frameId = 0;
    var onScreen = true;
    var pointer = { x: -1000, y: -1000 };

    function seed() {
      var count = Math.max(22, Math.min(60, Math.round((width * height) / 20000)));
      nodes = [];
      for (var i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.2 + 0.7
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      var reach = Math.min(150, Math.max(96, width / 6));
      var i;
      var j;

      for (i = 0; i < nodes.length; i += 1) {
        var a = nodes[i];
        for (j = i + 1; j < nodes.length; j += 1) {
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < reach) {
            ctx.strokeStyle = 'rgba(110, 170, 255,' + ((1 - dist / reach) * 0.38).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        var px = a.x - pointer.x;
        var py = a.y - pointer.y;
        var pd = Math.sqrt(px * px + py * py);
        if (pd < reach * 1.3) {
          ctx.strokeStyle = 'rgba(123, 233, 255,' + ((1 - pd / (reach * 1.3)) * 0.6).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(165, 210, 255, 0.85)';
      for (i = 0; i < nodes.length; i += 1) {
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (var i = 0; i < nodes.length; i += 1) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = width + 10;
        else if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        else if (n.y > height + 10) n.y = -10;
      }
      draw();
      frameId = window.requestAnimationFrame(step);
    }

    function start() {
      if (reduceMotion || frameId || !onScreen || document.hidden) return;
      frameId = window.requestAnimationFrame(step);
    }

    function stop() {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    }

    function resize() {
      var rect = host.getBoundingClientRect();
      // Phones change height as the address bar moves; only rebuild when the width changes.
      if (width && Math.abs(rect.width - width) < 1) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) return; // a single still frame is enough

    hero.addEventListener(
      'pointermove',
      function (event) {
        var rect = host.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      },
      { passive: true }
    );
    hero.addEventListener('pointerleave', function () {
      pointer.x = -1000;
      pointer.y = -1000;
    });
    hero.addEventListener('pointerup', function () {
      pointer.x = -1000;
      pointer.y = -1000;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start();
        else stop();
      }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  /* ---------- Digital business card: drag / swipe / buttons ---------- */
  // The card only ever rests face-on (0 or 180 degrees). Nothing tilts it sideways when idle.
  function initBusinessCard() {
    var scene = document.querySelector('[data-card-scene]');
    var card = document.querySelector('[data-card]');
    if (!scene || !card) return;

    var shadow = document.querySelector('[data-card-shadow]');
    var faces = {
      front: card.querySelector('[data-face="front"]'),
      back: card.querySelector('[data-face="back"]')
    };
    var buttons = {
      front: document.querySelector('[data-card-view="front"]'),
      back: document.querySelector('[data-card-view="back"]')
    };

    var rotation = 0; // degrees around the vertical axis; multiples of 180 at rest
    var animation = 0;
    var dragging = false;
    var startX = 0;
    var startRotation = 0;
    var lastX = 0;
    var lastTime = 0;
    var velocity = 0; // pixels per millisecond
    var moved = 0;
    var downTime = 0;

    function radians(deg) {
      return (deg * Math.PI) / 180;
    }

    // Applies the turn, plus lighting: a highlight that slides across each face,
    // shading as a face turns away, and a floor shadow that narrows edge-on.
    function apply(deg) {
      rotation = deg;
      card.style.transform = 'rotateY(' + deg.toFixed(2) + 'deg)';

      var a = ((((deg + 180) % 360) + 360) % 360) - 180; // -180..180, 0 = front facing
      var b = a > 0 ? a - 180 : a + 180; // same idea for the back face
      card.style.setProperty('--sheen-f', (84 - a * 0.9).toFixed(1) + '%');
      card.style.setProperty('--sheen-b', (84 - b * 0.9).toFixed(1) + '%');
      card.style.setProperty('--shade', (Math.abs(Math.sin(radians(a))) * 0.5).toFixed(3));

      if (shadow) {
        var face = Math.abs(Math.cos(radians(a)));
        shadow.style.transform = 'scaleX(' + (0.3 + 0.7 * face).toFixed(3) + ')';
        shadow.style.opacity = (0.55 + 0.45 * face).toFixed(3);
      }
    }

    function side() {
      return ((Math.round(rotation / 180) % 2) + 2) % 2 === 0 ? 'front' : 'back';
    }

    function syncControls() {
      var current = side();
      ['front', 'back'].forEach(function (name) {
        if (buttons[name]) buttons[name].setAttribute('aria-pressed', name === current ? 'true' : 'false');
        if (faces[name]) faces[name].setAttribute('aria-hidden', name === current ? 'false' : 'true');
      });
    }

    function settle() {
      // Keep the numbers small; 360 degrees looks identical to 0.
      apply(((rotation % 360) + 360) % 360 === 0 ? 0 : rotation % 360);
      syncControls();
    }

    function animateTo(target) {
      window.cancelAnimationFrame(animation);
      var from = rotation;
      var delta = target - from;
      if (reduceMotion || Math.abs(delta) < 0.1) {
        apply(target);
        settle();
        return;
      }
      var duration = 420 + Math.min(1, Math.abs(delta) / 180) * 380;
      var start = null;

      function tick(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out
        apply(from + delta * eased);
        if (t < 1) {
          animation = window.requestAnimationFrame(tick);
        } else {
          settle();
        }
      }
      animation = window.requestAnimationFrame(tick);
    }

    function show(name) {
      var target;
      if (name === 'front') {
        target = Math.round(rotation / 360) * 360;
        if (Math.abs(target - rotation) < 0.5 && side() === 'front') return;
      } else {
        target = Math.round((rotation - 180) / 360) * 360 + 180;
        if (Math.abs(target - rotation) < 0.5 && side() === 'back') return;
      }
      animateTo(target);
      // Update the buttons straight away so the tap feels instant.
      ['front', 'back'].forEach(function (n) {
        if (buttons[n]) buttons[n].setAttribute('aria-pressed', n === name ? 'true' : 'false');
      });
    }

    function flip() {
      show(side() === 'front' ? 'back' : 'front');
    }

    if (buttons.front) buttons.front.addEventListener('click', function () { show('front'); });
    if (buttons.back) buttons.back.addEventListener('click', function () { show('back'); });

    scene.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      window.cancelAnimationFrame(animation);
      dragging = true;
      startX = lastX = event.clientX;
      startRotation = rotation;
      lastTime = event.timeStamp;
      downTime = event.timeStamp;
      velocity = 0;
      moved = 0;
      scene.classList.add('is-dragging');
      try {
        scene.setPointerCapture(event.pointerId);
      } catch (err) {
        /* not critical */
      }
    });

    scene.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var width = scene.getBoundingClientRect().width || 1;
      var dx = event.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      apply(startRotation + (dx / width) * 200); // dragging across the card turns it about 180 degrees

      var dt = event.timeStamp - lastTime;
      if (dt > 0) velocity = 0.75 * velocity + 0.25 * ((event.clientX - lastX) / dt);
      lastX = event.clientX;
      lastTime = event.timeStamp;
    });

    function release(event) {
      if (!dragging) return;
      dragging = false;
      scene.classList.remove('is-dragging');

      // A tap (no real drag) flips the card.
      if (event.type === 'pointerup' && moved < 6 && event.timeStamp - downTime < 350) {
        rotation = startRotation;
        apply(rotation);
        flip();
        return;
      }

      var width = scene.getBoundingClientRect().width || 1;
      var projected = rotation + ((velocity / width) * 200) * 160; // carry a flick a little further
      var target = Math.round(projected / 180) * 180;
      // Never spin more than one side past where the drag started.
      target = Math.max(startRotation - 180, Math.min(startRotation + 180, target));
      animateTo(target);
    }

    scene.addEventListener('pointerup', release);
    scene.addEventListener('pointercancel', release);

    scene.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flip();
      }
    });

    apply(0);
    syncControls();
  }

  /* ---------- Init ---------- */
  function init() {
    each(document.querySelectorAll('[data-year]'), function (node) {
      node.textContent = String(new Date().getFullYear());
    });

    var data = getData();
    if (data) {
      renderBusinesses(data);
      renderCompany(data);
    } else {
      renderError();
    }

    revealOnScroll(document.querySelectorAll('[data-reveal]'));
    initNav();
    initHeader();
    initSpotlight();
    initConstellation();
    initBusinessCard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
