/**
 * <linked-claims-feed> Web Component
 *
 * Embeddable feed of LinkedClaims from ATProto (com.linkedclaims.claim).
 * Defaults to showing claims about the current page URL.
 *
 * Usage:
 *   <linked-claims-feed></linked-claims-feed>
 *   <linked-claims-feed subject="https://example.com"></linked-claims-feed>
 *   <linked-claims-feed subject="https://example.com" api="https://live.linkedtrust.us"></linked-claims-feed>
 *
 * Attributes:
 *   subject  — URI to filter claims by (default: current page URL)
 *   api      — LinkedTrust backend URL for DB lookups (optional)
 *   repo     — ATProto repo DID to browse (optional, shows all claims from that account)
 *   theme    — "light" or "dark" (default: light)
 *   limit    — max claims to show (default: 25)
 */
(function () {
  const ATPROTO_PUBLIC_API = 'https://public.api.bsky.app';
  const COLLECTION = 'com.linkedclaims.claim';

  class LinkedClaimsFeed extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._claims = [];
      this._subject = '';
      this._loading = false;
    }

    connectedCallback() {
      this._subject = this.getAttribute('subject') || window.location.href;
      this.render();
      this.fetchClaims();
    }

    static get observedAttributes() {
      return ['subject', 'repo', 'theme', 'limit'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'subject') {
        this._subject = newVal || window.location.href;
        this.fetchClaims();
      }
      this.render();
    }

    get theme() { return this.getAttribute('theme') || 'light'; }
    get limit() { return parseInt(this.getAttribute('limit') || '25', 10); }
    get api() { return this.getAttribute('api') || ''; }
    get repo() { return this.getAttribute('repo') || ''; }

    async fetchClaims() {
      this._loading = true;
      this.render();

      try {
        if (this.repo) {
          // Browse a specific repo
          await this.fetchFromRepo(this.repo);
        } else {
          // Search across all repos — need to use our backend or scan known repos
          await this.fetchBySubject(this._subject);
        }
      } catch (err) {
        console.error('linked-claims-feed: fetch error', err);
        this._claims = [];
      }

      this._loading = false;
      this.render();
    }

    async fetchFromRepo(repo) {
      const url = `${ATPROTO_PUBLIC_API}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(repo)}&collection=${COLLECTION}&limit=${this.limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ATProto API error: ${res.status}`);
      const data = await res.json();
      const records = (data.records || []).map(r => ({
        ...r.value,
        atUri: r.uri,
        cid: r.cid,
        repoDid: repo
      }));

      // If subject filter is set, filter client-side
      if (this._subject && this._subject !== window.location.href) {
        this._claims = records.filter(c => c.subject === this._subject);
      } else {
        this._claims = records;
      }
    }

    async fetchBySubject(subject) {
      // If we have a backend API, use it to search
      if (this.api) {
        try {
          const url = `${this.api}/api/claims/subject/${encodeURIComponent(subject)}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            this._claims = (data.claims || data || []).map(c => ({
              ...c,
              _fromDb: true
            }));
            return;
          }
        } catch (e) {
          // Fall through to ATProto direct
        }
      }

      // No backend or backend failed — if we have a known repo, search there
      // For now, show a message that subject search requires a backend or repo
      this._claims = [];
    }

    async checkInDb(claimUri) {
      if (!this.api) return null;
      try {
        const res = await fetch(`${this.api}/api/claims/subject/${encodeURIComponent(claimUri)}`);
        if (res.ok) {
          const data = await res.json();
          return (data.claims || data || [])[0] || null;
        }
      } catch (e) { /* ignore */ }
      return null;
    }

    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch { return dateStr; }
    }

    renderStars(n) {
      if (!n) return '';
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    isImageUrl(url) {
      if (!url) return false;
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
    }

    isVideoUrl(url) {
      if (!url) return false;
      return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
    }

    renderEvidence(evidence) {
      if (!evidence || !evidence.length) return '';
      return evidence.map(item => {
        const uri = item.uri || '';
        const desc = item.description ? `<div class="ev-desc">${this.esc(item.description)}</div>` : '';

        if (this.isImageUrl(uri) || (item.mediaType && item.mediaType.startsWith('image/'))) {
          return `<div class="evidence-item">${desc}<img src="${this.esc(uri)}" alt="${this.esc(item.description || 'evidence')}" loading="lazy"></div>`;
        }
        if (this.isVideoUrl(uri) || (item.mediaType && item.mediaType.startsWith('video/'))) {
          return `<div class="evidence-item">${desc}<video src="${this.esc(uri)}" controls preload="metadata"></video></div>`;
        }
        if (uri) {
          return `<div class="evidence-item">${desc}<a href="${this.esc(uri)}" target="_blank" rel="noopener">${this.esc(item.description || uri)}</a></div>`;
        }
        return desc ? `<div class="evidence-item">${desc}</div>` : '';
      }).join('');
    }

    renderClaim(claim) {
      const claimUri = claim.claimUri || claim.atUri || '';
      const subject = claim.subject || '';
      const type = claim.claimType || claim.claim || '';
      const statement = claim.statement || '';
      const confidence = claim.confidence != null ? `${Math.round(claim.confidence * 100)}%` : '';
      const stars = this.renderStars(claim.stars);
      const date = this.formatDate(claim.effectiveDate || claim.createdAt);
      const source = claim.source;
      const evidence = claim.evidence || [];
      const aspect = claim.aspect || '';
      const obj = claim.object || '';
      const dbId = claim._fromDb ? claim.id : null;

      // Header line: type + object + aspect
      let header = this.esc(type);
      if (obj) header += ` <span class="obj">· ${this.esc(obj)}</span>`;
      if (aspect) header += ` <span class="aspect">(${this.esc(aspect)})</span>`;

      // Source line
      let sourceLine = '';
      if (source && source.uri) {
        const howKnown = source.howKnown ? ` · ${this.esc(source.howKnown.replace(/_/g, ' ').toLowerCase())}` : '';
        sourceLine = `<div class="source">source: <a href="${this.esc(source.uri)}" target="_blank" rel="noopener">${this.esc(this.truncateUri(source.uri))}</a>${howKnown}</div>`;
      } else if (source && source.howKnown) {
        sourceLine = `<div class="source">${this.esc(source.howKnown.replace(/_/g, ' ').toLowerCase())}</div>`;
      }

      // Subject line
      const subjectLine = `<div class="subject">about: <a href="${this.esc(subject)}" target="_blank" rel="noopener">${this.esc(this.truncateUri(subject))}</a></div>`;

      // DB link
      const dbLink = dbId
        ? `<a href="${this.api}/claims/${dbId}" class="db-link" target="_blank">view in LinkedTrust</a>`
        : claimUri ? `<a href="${this.esc(claimUri)}" class="claim-link" target="_blank" rel="noopener">claim ↗</a>` : '';

      return `
        <div class="claim">
          <div class="claim-header">
            <span class="type">${header}</span>
            <span class="date">${this.esc(date)}</span>
          </div>
          ${statement ? `<div class="statement">${this.esc(statement)}</div>` : ''}
          ${stars ? `<div class="stars">${stars}</div>` : ''}
          ${confidence ? `<div class="confidence">confidence: ${confidence}</div>` : ''}
          ${subjectLine}
          ${sourceLine}
          ${this.renderEvidence(evidence)}
          <div class="claim-footer">
            ${dbLink}
          </div>
        </div>
      `;
    }

    truncateUri(uri) {
      if (!uri) return '';
      if (uri.length <= 60) return uri;
      // Show domain + end
      try {
        const u = new URL(uri);
        const path = u.pathname + u.search;
        if (path.length > 30) return u.host + path.slice(0, 15) + '…' + path.slice(-12);
        return u.host + path;
      } catch { return uri.slice(0, 30) + '…' + uri.slice(-20); }
    }

    esc(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    render() {
      const isDark = this.theme === 'dark';
      const bg = isDark ? '#1a1a2e' : '#ffffff';
      const text = isDark ? '#e0e0e0' : '#1a1a1a';
      const border = isDark ? '#333355' : '#e0e0e0';
      const cardBg = isDark ? '#16213e' : '#f8f9fa';
      const accent = isDark ? '#4ea8de' : '#1a6b3c';
      const muted = isDark ? '#888' : '#666';

      let content = '';

      if (this._loading) {
        content = '<div class="loading">Loading claims…</div>';
      } else if (this._claims.length === 0) {
        const subjectDisplay = this._subject ? this.esc(this.truncateUri(this._subject)) : 'this page';
        content = `<div class="empty">No claims found about ${subjectDisplay}</div>`;
      } else {
        content = this._claims.map(c => this.renderClaim(c)).join('');
      }

      // Control bar
      const controlBar = `
        <div class="controls">
          <input type="text" class="subject-input" value="${this.esc(this._subject)}" placeholder="Enter a URL to see claims about it">
          <button class="search-btn">Search</button>
        </div>
      `;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            color: ${text};
            background: ${bg};
            border: 1px solid ${border};
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            padding: 12px 16px;
            border-bottom: 1px solid ${border};
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header .title {
            font-weight: 600;
            font-size: 15px;
          }
          .header .powered {
            font-size: 11px;
            color: ${muted};
          }
          .header .powered a {
            color: ${accent};
            text-decoration: none;
          }
          .controls {
            padding: 8px 16px;
            border-bottom: 1px solid ${border};
            display: flex;
            gap: 8px;
          }
          .subject-input {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 4px;
            font-size: 13px;
            background: ${bg};
            color: ${text};
            outline: none;
          }
          .subject-input:focus {
            border-color: ${accent};
          }
          .search-btn {
            padding: 6px 14px;
            background: ${accent};
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          }
          .search-btn:hover {
            opacity: 0.85;
          }
          .feed {
            max-height: 600px;
            overflow-y: auto;
            padding: 8px;
          }
          .claim {
            background: ${cardBg};
            border: 1px solid ${border};
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
          }
          .claim:last-child {
            margin-bottom: 0;
          }
          .claim-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
          }
          .type {
            font-weight: 600;
            color: ${accent};
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          .obj, .aspect {
            font-weight: normal;
            text-transform: none;
            color: ${text};
          }
          .date {
            font-size: 12px;
            color: ${muted};
          }
          .statement {
            margin: 6px 0;
            line-height: 1.4;
          }
          .stars {
            color: #f5a623;
            font-size: 16px;
            margin: 4px 0;
          }
          .confidence {
            font-size: 12px;
            color: ${muted};
          }
          .subject, .source {
            font-size: 12px;
            color: ${muted};
            margin: 3px 0;
          }
          .subject a, .source a {
            color: ${accent};
            text-decoration: none;
          }
          .subject a:hover, .source a:hover {
            text-decoration: underline;
          }
          .evidence-item {
            margin: 8px 0;
          }
          .evidence-item img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
            display: block;
          }
          .evidence-item video {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
            display: block;
          }
          .evidence-item a {
            color: ${accent};
            text-decoration: none;
            font-size: 13px;
          }
          .ev-desc {
            font-size: 12px;
            color: ${muted};
            margin-bottom: 4px;
          }
          .claim-footer {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;
          }
          .db-link, .claim-link {
            font-size: 12px;
            color: ${accent};
            text-decoration: none;
          }
          .db-link:hover, .claim-link:hover {
            text-decoration: underline;
          }
          .loading, .empty {
            padding: 24px;
            text-align: center;
            color: ${muted};
          }
        </style>
        <div class="header">
          <span class="title">LinkedClaims</span>
          <span class="powered">powered by <a href="https://linkedclaims.com" target="_blank" rel="noopener">linkedclaims.com</a></span>
        </div>
        ${controlBar}
        <div class="feed">
          ${content}
        </div>
      `;

      // Wire up search
      const input = this.shadowRoot.querySelector('.subject-input');
      const btn = this.shadowRoot.querySelector('.search-btn');
      if (btn && input) {
        btn.addEventListener('click', () => {
          const val = input.value.trim();
          if (val) {
            this._subject = val;
            this.setAttribute('subject', val);
            this.fetchClaims();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') btn.click();
        });
      }
    }
  }

  if (!customElements.get('linked-claims-feed')) {
    customElements.define('linked-claims-feed', LinkedClaimsFeed);
  }
})();
