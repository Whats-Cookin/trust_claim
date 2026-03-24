/**
 * LinkedTrust Embeddable Badge Web Component
 *
 * Usage:
 *   <script src="badge.js"></script>
 *   <linked-badge claim-id="124419"></linked-badge>
 *   <linked-badge claim-id="124419" layout="row"></linked-badge>
 *   <linked-badge claim-id="124419" theme="dark" compact></linked-badge>
 *
 * Attributes:
 *   claim-id  — numeric claim ID (required)
 *   layout    — "card" (default, vertical) or "row" (horizontal)
 *   theme     — "light" (default) or "dark"
 *   compact   — flag for smaller variant
 *   api-base  — override API base URL (default: https://live.linkedtrust.us)
 */
(function () {
  'use strict'

  const DEFAULT_API = 'https://live.linkedtrust.us'

  // ── Shared helpers ──────────────────────────────────────────────

  function esc (str) {
    const d = document.createElement('div')
    d.textContent = String(str)
    return d.innerHTML
  }

  function truncUri (uri) {
    try {
      const u = new URL(uri)
      let display = u.hostname + u.pathname
      if (display.length > 40) display = display.slice(0, 37) + '...'
      return esc(display)
    } catch { return esc(uri.slice(0, 40)) }
  }

  function getSource (claim) {
    const edges = claim.edges || []
    const sourceEdge = edges.find(e => e.label === 'source')
    if (sourceEdge && sourceEdge.endNode) {
      return {
        name: sourceEdge.endNode.name || null,
        uri: sourceEdge.endNode.nodeUri || claim.sourceURI || null,
        image: sourceEdge.endNode.image || sourceEdge.endNode.thumbnail || null
      }
    }
    return { name: null, uri: claim.sourceURI || null, image: null }
  }

  function resolveUrl (url, apiBase) {
    if (!url) return null
    if (url.startsWith('/')) return apiBase + url
    return url
  }

  function getVideoUrl (images, apiBase) {
    const v = (images || []).find(i =>
      i.type === 'video' ||
      (i.contentType && i.contentType.startsWith('video/')) ||
      (i.url && /\.(mp4|webm|ogg)(\?|$)/i.test(i.url))
    )
    return v ? resolveUrl(v.url, apiBase) : null
  }

  function getImageUrl (images, apiBase) {
    const img = (images || []).find(i =>
      i.type === 'image' ||
      (i.contentType && i.contentType.startsWith('image/'))
    )
    if (!img) return null
    const url = resolveUrl(img.url, apiBase)
    // If it's an API endpoint, we'll need to resolve it async later
    return { url, needsResolve: /\/api\/images\//.test(url) }
  }

  // Parse claim into a flat context object for templates
  function parseClaimData (data, apiBase) {
    const claim = data.claim
    const source = getSource(claim)
    const videoUrl = getVideoUrl(data.images, apiBase)
    const imageResult = getImageUrl(data.images, apiBase)
    const imageUrl = imageResult ? imageResult.url : null
    const imageNeedsResolve = imageResult ? imageResult.needsResolve : false
    const isRated = claim.claim && claim.claim.toLowerCase() === 'rated' && claim.stars != null && claim.stars > 0
    const date = claim.effectiveDate ? new Date(claim.effectiveDate).toLocaleDateString() : ''
    const claimUrl = `${apiBase}/explore/${claim.id}`
    const sourceLink = source.uri || claim.sourceURI || null
    const aspect = claim.aspect ? (claim.aspect.includes(':') ? claim.aspect.split(':')[1] : claim.aspect) : ''

    return { claim, source, videoUrl, imageUrl, imageNeedsResolve, isRated, date, claimUrl, sourceLink, aspect }
  }

  // ── Shared HTML fragments ───────────────────────────────────────

  // Compact logo SVG for inline use
  const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 442.38 437.51" width="16" height="16" style="vertical-align:-2px;"><ellipse cx="221.19" cy="221.65" rx="220.57" ry="215.85" fill="#fff"/><path d="M79.78,391.27c23.36,18,53.18,32.8,81.7,32.38,47-.7,42.88-46,42.3-50.82-26.4-101.56-93.35-130-93.35-130,50,18.26,80.58,57.34,99.3,99.13-1-124.16-72.68-169.32-72.68-169.32,40.22,22.54,63.56,58.14,76.75,96l7.39-147.87,7.39,147.86c13.19-37.86,36.53-73.46,76.75-96,0,0-71.69,45.16-72.68,169.32,18.71-41.79,49.3-80.87,99.3-99.13,0,0-67,28.46-93.35,130-.58,4.81-4.71,50.12,42.3,50.82,28.52.42,58.35-14.39,81.71-32.39A220.7,220.7,0,0,0,442.38,221.2C442.38,99,343.35,0,221.19,0S0,99,0,221.2A220.7,220.7,0,0,0,79.78,391.27Z" fill="#3f2534"/><path d="M176.64,294.05c-8.22-27.27-19.87-60.3-43.21-75.52-25-16.3-61-16.35-90.53-11.95,7.92,28.75,22.51,61.65,47.53,77.95C113.54,299.57,148.61,297.4,176.64,294.05Z" fill="#00b2e5"/><path d="M95.49,101.06c-1.48,27.65-1.74,61.71,14.59,83.33,17.51,23.17,50.4,35.1,78.83,40.83,2.24-28.91-.23-63.82-17.72-87C155,116.86,122.23,107.25,95.49,101.06Z" fill="#00d0db"/><path d="M266,294.05c8.22-27.27,19.87-60.3,43.21-75.52,25-16.3,61-16.35,90.53-11.95-7.93,28.75-22.51,61.65-47.53,77.95C329.06,299.57,294,297.4,266,294.05Z" fill="#ff6872"/><path d="M222.06,28.22c-20.17,22.31-40.27,52.53-40.59,82.64-.28,27.82,20.55,56.49,38.59,78.52,18.73-21.76,40.54-49.56,40.85-77.67C261.21,81.59,241.78,50.94,222.06,28.22Z" fill="#8dc63f"/></svg>'

  function starsHtml (ctx) {
    if (!ctx.isRated) return ''
    const stars = Math.round(ctx.claim.stars * 2) / 2
    let s = ''
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(stars)) s += '<span class="star full">★</span>'
      else if (i - 0.5 === stars) s += '<span class="star half">★</span>'
      else s += '<span class="star empty">★</span>'
    }
    return s + ` <span class="rating-num">${Number(ctx.claim.stars).toFixed(1)}</span>`
  }

  function ratingHtml (ctx) {
    if (!ctx.isRated) return ''
    return `<div class="rating-line">${starsHtml(ctx)}${ctx.aspect ? ` <span class="rating-sep">:</span> <span class="rating-aspect">${esc(ctx.aspect)}</span>` : ''}</div>`
  }

  function ratingHtmlCompact (ctx) {
    if (!ctx.isRated) return ''
    return `<div class="rating-line">${starsHtml(ctx)}</div>`
  }

  function statementHtml (ctx) {
    if (!ctx.claim.statement) return ''
    return `<p class="statement" id="stmt">\u201C${esc(ctx.claim.statement)}\u201D</p>`
  }

  function sourceRowHtml (ctx) {
    let sourceHtml = ''
    const nameMatchesUrl = ctx.source.name && ctx.sourceLink &&
      ctx.source.name.replace(/^https?:\/\//, '').replace(/\/$/, '') ===
      ctx.sourceLink.replace(/^https?:\/\//, '').replace(/\/$/, '')

    if (ctx.source.name && ctx.sourceLink && !nameMatchesUrl) {
      // Name + separate URL — URL hides via CSS overflow if too long
      sourceHtml = `<a class="source-name-link" href="${esc(ctx.sourceLink)}" target="_blank" rel="noopener">${esc(ctx.source.name)}</a><a class="source-link" href="${esc(ctx.sourceLink)}" target="_blank" rel="noopener">${truncUri(ctx.sourceLink)}</a>`
    } else if (ctx.source.name && ctx.sourceLink) {
      // Name IS the URL — just show name as link
      sourceHtml = `<a class="source-name-link" href="${esc(ctx.sourceLink)}" target="_blank" rel="noopener">${esc(ctx.source.name)}</a>`
    } else if (ctx.source.name) {
      sourceHtml = `<span class="source-name">${esc(ctx.source.name)}</span>`
    } else if (ctx.sourceLink) {
      sourceHtml = `<a class="source-name-link" href="${esc(ctx.sourceLink)}" target="_blank" rel="noopener">${truncUri(ctx.sourceLink)}</a>`
    }
    return `<div class="source-row">
      ${sourceHtml}
      ${ctx.date ? `<span class="date">${ctx.date}</span>` : ''}
    </div>`
  }


  function videoMediaHtml (ctx) {
    if (!ctx.videoUrl) return ''
    return `<div class="media-wrap" id="media">
      <video src="${esc(ctx.videoUrl)}" preload="metadata" playsinline></video>
      <div class="play-overlay" id="playBtn">
        <svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="24" r="23" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="1.5"/><polygon points="19,14 19,34 35,24" fill="white"/></svg>
      </div>
    </div>`
  }

  function imageMediaHtml (ctx) {
    if (!ctx.imageUrl) return ''
    return `<div class="media-wrap">
      <img src="${esc(ctx.imageUrl)}" alt="" class="media-img" />
    </div>`
  }

  // ── Template: Card (vertical) ───────────────────────────────────

  function renderCard (ctx, theme, compact) {
    let media = ''
    if (ctx.videoUrl) media = videoMediaHtml(ctx)
    else if (ctx.imageUrl) media = imageMediaHtml(ctx)

    return `<div class="badge card ${theme} ${compact ? 'compact' : ''}">
      ${media}
      <div class="badge-body">
        <div class="topline">
          ${ratingHtml(ctx)}
          <a class="verified-badge" href="${esc(ctx.claimUrl)}" target="_blank" rel="noopener">${LOGO_SVG} Verified</a>
        </div>
        ${statementHtml(ctx)}
        ${sourceRowHtml(ctx)}
      </div>
    </div>`
  }

  // ── Template: Row (horizontal) ──────────────────────────────────

  function renderRow (ctx, theme, compact) {
    let media = ''
    if (ctx.videoUrl) media = videoMediaHtml(ctx)
    else if (ctx.imageUrl) media = imageMediaHtml(ctx)

    return `<div class="badge row ${theme} ${compact ? 'compact' : ''}">
      ${media ? `<div class="row-media">${media}</div>` : ''}
      <div class="badge-body">
        <div class="topline">
          ${ratingHtmlCompact(ctx)}
          <a class="verified-badge" href="${esc(ctx.claimUrl)}" target="_blank" rel="noopener">${LOGO_SVG} Verified</a>
        </div>
        ${statementHtml(ctx)}
        ${sourceRowHtml(ctx)}
      </div>
    </div>`
  }

  // ── Shared styles ───────────────────────────────────────────────

  function sharedStyles () {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;1,400&family=Nunito:ital,wght@0,400;1,400&display=swap');
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
      }
      *, *::before, *::after { box-sizing: border-box; }

      .badge {
        border-radius: 12px;
        overflow: hidden;
      }

      /* Light theme */
      .badge.light {
        background: #ffffff;
        color: #1a1a1a;
        box-shadow: 0 2px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
      }
      .badge.light:hover {
        box-shadow: 0 6px 24px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05);
      }

      /* Dark theme */
      .badge.dark {
        background: #1e1e1e;
        color: #e0e0e0;
        box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
      }
      .badge.dark:hover {
        box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
      }

      /* Media */
      .media-wrap {
        position: relative;
        background: #000;
        overflow: hidden;
      }
      .media-wrap video, .media-wrap .media-img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .play-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: rgba(0,0,0,0.2);
      }
      .play-overlay:hover { background: rgba(0,0,0,0.4); }

      /* Body */
      .badge-body { padding: 16px 20px 14px; }

      /* Rating */
      .rating-line {
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.4;
      }
      .star { font-size: 18px; }
      .star.full { color: #FFC107; }
      .star.half {
        color: #FFC107;
        position: relative;
        overflow: hidden;
        display: inline-block;
        width: 0.5em;
      }
      .star.empty { color: #ccc; }
      .dark .star.empty { color: #555; }
      .rating-num { font-weight: 600; color: #666; }
      .dark .rating-num { color: #aaa; }
      .rating-sep { color: #ccc; }
      .rating-aspect { color: #888; }
      .dark .rating-aspect { color: #999; }

      /* Statement */
      .statement {
        margin: 0 0 12px;
        font-size: 14px;
        font-family: Raleway, Nunito, Quicksand, sans-serif;
        font-style: italic;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: inherit;
        cursor: pointer;
      }
      .statement:hover { color: #444; }
      .dark .statement:hover { color: #f0f0f0; }
      .statement.expanded {
        display: block;
        -webkit-line-clamp: unset;
        max-height: 120px;
        overflow-y: auto;
      }

      /* Source row */
      .source-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 10px;
      }
      .source-name {
        font-size: 14px;
        font-weight: 600;
        color: inherit;
        white-space: nowrap;
      }
      .source-link {
        font-size: 12px;
        color: #aaa;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 1;
        min-width: 0;
      }
      .source-link:hover { text-decoration: underline; }
      .dark .source-link { color: #666; }
      .source-name-link {
        font-size: 14px;
        font-weight: 600;
        color: inherit;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .source-name-link:hover { text-decoration: underline; }
      .date {
        font-size: 12px;
        color: #888;
        margin-left: auto;
        white-space: nowrap;
      }
      .dark .date { color: #777; }

      /* Top line — rating left, verified right */
      .topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .topline .rating-line { margin-bottom: 0; }
      .verified-badge {
        font-size: 11px;
        color: #10B981;
        font-weight: 500;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        margin-left: auto;
      }
      .verified-badge:hover { text-decoration: underline; }

      /* Skeleton — mimics final badge layout so load is less jarring */
      .skeleton-media {
        width: 100%;
        height: 200px;
        background: #eee;
      }
      .dark .skeleton-media {
        background: #2a2a2a;
      }
      .skeleton-topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .skeleton-pill {
        height: 12px;
        width: 70px;
        border-radius: 6px;
        background: #eee;
      }
      .dark .skeleton-pill {
        background: #2a2a2a;
      }
      .skeleton-line {
        height: 13px;
        border-radius: 4px;
        margin-bottom: 8px;
        background: #eee;
      }
      .dark .skeleton-line {
        background: #2a2a2a;
      }
      .skeleton-source {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid #eee;
      }
      .dark .skeleton-source {
        border-top-color: #333;
      }
      .skeleton-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #eee;
        flex-shrink: 0;
      }
      .dark .skeleton-avatar {
        background: #2a2a2a;
      }
    `
  }

  // ── Card-specific styles ────────────────────────────────────────

  function cardStyles () {
    return `
      .badge.card { max-width: 480px; }
      .badge.card.compact { max-width: 320px; }
      .badge.card .media-wrap video,
      .badge.card .media-wrap .media-img {
        max-height: 280px;
      }
      .badge.card.compact .media-wrap video,
      .badge.card.compact .media-wrap .media-img {
        max-height: 180px;
      }
      .badge.card.compact .badge-body { padding: 12px 14px 10px; }
      .badge.card.compact .star { font-size: 15px; }
      .badge.card.compact .statement { font-size: 13px; }
    `
  }

  // ── Row-specific styles ─────────────────────────────────────────

  function rowStyles () {
    return `
      .badge.row {
        display: flex;
        flex-direction: row;
        max-width: 600px;
        height: 180px;
      }
      .badge.row.compact {
        max-width: 480px;
        height: 150px;
      }
      .badge.row .row-media {
        width: 35%;
        min-width: 35%;
        height: 100%;
      }
      .badge.row .row-media .media-wrap {
        height: 100%;
      }
      .badge.row .badge-body {
        flex: 1;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
        overflow: hidden;
      }
      .badge.row .statement {
        -webkit-line-clamp: 4;
        font-size: 13px;
        margin: 0;
      }
      .badge.row .source-row { margin: 0; }
      .badge.row .play-overlay svg { width: 40px; height: 40px; }
      .badge.row .star { font-size: 15px; }
      .badge.row .rating-line { margin-bottom: 4px; }
      .badge.row .topline { margin-bottom: 0; }
    `
  }

  // ── Web Component ───────────────────────────────────────────────

  class LinkedBadge extends HTMLElement {
    static get observedAttributes () {
      return ['claim-id', 'layout', 'theme', 'compact', 'api-base']
    }

    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      this._data = null
    }

    connectedCallback () {
      this._render()
      this._fetchClaim()
    }

    attributeChangedCallback () {
      if (this.isConnected) {
        this._data = null
        this._render()
        this._fetchClaim()
      }
    }

    get _claimId () { return this.getAttribute('claim-id') }
    get _layout () { return this.getAttribute('layout') || 'card' }
    get _theme () { return this.getAttribute('theme') || 'light' }
    get _compact () { return this.hasAttribute('compact') }
    get _apiBase () { return this.getAttribute('api-base') || DEFAULT_API }

    async _fetchClaim () {
      const id = this._claimId
      if (!id) { this._renderError('No claim-id specified'); return }
      try {
        const res = await fetch(`${this._apiBase}/api/v4/claims/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success || !json.claim) throw new Error('Invalid response')
        this._data = { claim: json.claim, images: json.images || [] }
        this._render()
      } catch (e) {
        this._renderError('Failed to load claim')
      }
    }

    _renderError (msg) {
      this.shadowRoot.innerHTML = `
        <style>${sharedStyles()}</style>
        <div class="badge ${this._layout} ${this._theme}" style="text-align:center;padding:24px;">
          <span style="color:#999;font-size:14px;">${msg}</span>
        </div>
      `
    }

    _render () {
      const layout = this._layout
      const theme = this._theme
      const compact = this._compact

      if (!this._data) {
        const skelBody = `
          <div class="badge-body">
            <div class="skeleton-topline">
              <div class="skeleton-pill"></div>
              <div class="skeleton-pill" style="width:55px"></div>
            </div>
            <div class="skeleton-line" style="width:85%"></div>
            <div class="skeleton-line" style="width:65%"></div>
            <div class="skeleton-source">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-line" style="width:40%;margin:0"></div>
            </div>
          </div>`
        const skelMedia = layout === 'row'
          ? `<div class="row-media"><div class="skeleton-media" style="height:100%"></div></div>`
          : `<div class="skeleton-media"></div>`
        this.shadowRoot.innerHTML = `
          <style>${sharedStyles()}${layout === 'row' ? rowStyles() : cardStyles()}</style>
          <div class="badge ${layout} ${theme} ${compact ? 'compact' : ''}">
            ${skelMedia}${skelBody}
          </div>
        `
        return
      }

      const ctx = parseClaimData(this._data, this._apiBase)
      const styles = sharedStyles() + (layout === 'row' ? rowStyles() : cardStyles())
      const html = layout === 'row' ? renderRow(ctx, theme, compact) : renderCard(ctx, theme, compact)

      this.shadowRoot.innerHTML = `<style>${styles}</style>${html}`

      // Wire up video play
      if (ctx.videoUrl) {
        const playBtn = this.shadowRoot.getElementById('playBtn')
        const media = this.shadowRoot.getElementById('media')
        if (playBtn && media) {
          playBtn.addEventListener('click', () => {
            const vid = media.querySelector('video')
            if (vid) { vid.controls = true; vid.play(); playBtn.style.display = 'none' }
          })
        }
      }

      // Resolve API image URLs
      if (ctx.imageNeedsResolve && ctx.imageUrl) {
        const img = this.shadowRoot.querySelector('.media-img')
        if (img) {
          fetch(ctx.imageUrl).then(r => r.json()).then(j => {
            if (j.imageUrl) img.src = j.imageUrl
          }).catch(() => {})
        }
      }

      // Wire up statement expand
      const stmt = this.shadowRoot.getElementById('stmt')
      if (stmt) {
        stmt.addEventListener('click', () => stmt.classList.toggle('expanded'))
      }
    }
  }

  if (!customElements.get('linked-badge')) {
    customElements.define('linked-badge', LinkedBadge)
  }
})()
