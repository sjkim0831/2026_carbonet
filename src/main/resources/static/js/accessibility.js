(function () {
  function readCsrfMeta() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const headerName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');
    if (token && headerName) {
      return { token: token, headerName: headerName };
    }
    return null;
  }

  function readCsrfHidden() {
    const adminToken = document.getElementById('admin-csrf-token')?.value;
    const adminHeader = document.getElementById('admin-csrf-header')?.value;
    if (adminToken && adminHeader) {
      return { token: adminToken, headerName: adminHeader };
    }

    const siteToken = document.getElementById('site-csrf-token')?.value;
    const siteHeader = document.getElementById('site-csrf-header')?.value;
    if (siteToken && siteHeader) {
      return { token: siteToken, headerName: siteHeader };
    }

    const formToken = document.querySelector('input[type="hidden"][name="_csrf"]')?.value;
    if (formToken) {
      return { token: formToken, headerName: 'X-CSRF-TOKEN' };
    }

    return null;
  }

  function getCsrfInfo() {
    return readCsrfMeta() || readCsrfHidden();
  }

  function shouldAttachCsrf(method, url) {
    const normalizedMethod = (method || 'GET').toUpperCase();
    if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD' || normalizedMethod === 'OPTIONS' || normalizedMethod === 'TRACE') {
      return false;
    }

    if (!url) {
      return true;
    }

    try {
      const target = new URL(url, window.location.origin);
      return target.origin === window.location.origin;
    } catch (e) {
      return true;
    }
  }

  function toHeaders(headers) {
    return new Headers(headers || {});
  }

  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  if (nativeFetch && !window.__csrfFetchWrapped) {
    window.fetch = function (input, init) {
      const request = input instanceof Request ? input : null;
      const method = (init && init.method) || (request && request.method) || 'GET';
      const url = typeof input === 'string' ? input : (request ? request.url : '');
      if (!shouldAttachCsrf(method, url)) {
        return nativeFetch(input, init);
      }

      const csrf = getCsrfInfo();
      if (!csrf || !csrf.token || !csrf.headerName) {
        return nativeFetch(input, init);
      }

      const headers = toHeaders((init && init.headers) || (request && request.headers) || undefined);
      if (!headers.has(csrf.headerName)) {
        headers.set(csrf.headerName, csrf.token);
      }
      if (!headers.has('X-Requested-With')) {
        headers.set('X-Requested-With', 'XMLHttpRequest');
      }

      if (request) {
        const nextRequest = new Request(request, {
          headers: headers,
          credentials: (init && init.credentials) || request.credentials || 'same-origin'
        });
        return nativeFetch(nextRequest);
      }

      const nextInit = Object.assign({}, init || {}, {
        headers: headers,
        credentials: (init && init.credentials) || 'same-origin'
      });
      return nativeFetch(input, nextInit);
    };
    window.__csrfFetchWrapped = true;
  }

  window.getCsrfHeaders = function (headers) {
    const merged = toHeaders(headers);
    const csrf = getCsrfInfo();
    if (csrf && csrf.token && csrf.headerName && !merged.has(csrf.headerName)) {
      merged.set(csrf.headerName, csrf.token);
    }
    if (!merged.has('X-Requested-With')) {
      merged.set('X-Requested-With', 'XMLHttpRequest');
    }
    return merged;
  };

  window.performLogout = function (logoutUrl, nextLocation) {
    return window.fetch(logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    }).then(function (response) {
      return response.json();
    }).then(function (payload) {
      if (payload && payload.status === 'success') {
        if (nextLocation === 'reload') {
          window.location.reload();
        } else if (nextLocation) {
          window.location.href = nextLocation;
        }
        return payload;
      }
      throw new Error((payload && payload.errors) || 'LOGOUT_FAILED');
    });
  };

  function isIconOnlyButton(el) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const hasIcon = !!el.querySelector('.material-symbols-outlined, svg, img');
    return hasIcon && text.length === 0;
  }

  function setupPlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
      if (!a.hasAttribute('aria-label') && (a.textContent || '').trim().length === 0) {
        a.setAttribute('aria-label', 'placeholder link');
      }
      a.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });
  }

  function setupExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      const rel = (a.getAttribute('rel') || '').toLowerCase();
      const tokens = rel.split(/\s+/).filter(Boolean);
      if (!tokens.includes('noopener')) tokens.push('noopener');
      if (!tokens.includes('noreferrer')) tokens.push('noreferrer');
      a.setAttribute('rel', tokens.join(' ').trim());
    });
  }

  function setupButtons() {
    document.querySelectorAll('button').forEach(function (btn) {
      if (!btn.getAttribute('type')) {
        btn.setAttribute('type', 'button');
      }
      if (isIconOnlyButton(btn) && !btn.hasAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'icon button');
      }
    });
  }

  function setupTabsKeyboard() {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') {
          return;
        }
        e.preventDefault();
        let next = idx;
        if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        tabs[next].focus();
        tabs[next].click();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupPlaceholderLinks();
      setupExternalLinks();
      setupButtons();
      setupTabsKeyboard();
    });
  } else {
    setupPlaceholderLinks();
    setupExternalLinks();
    setupButtons();
    setupTabsKeyboard();
  }
})();
