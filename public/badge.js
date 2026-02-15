/**
 * LinkedTrust Embeddable Badge Web Component
 *
 * Usage:
 *   <script src="badge.js"></script>
 *   <linked-badge claim-id="124445"></linked-badge>
 *   <linked-badge claim-id="124445" theme="dark" compact></linked-badge>
 *
 * Attributes:
 *   claim-id  — numeric claim ID (required)
 *   theme     — "light" (default) or "dark"
 *   compact   — flag for smaller 320px variant
 *   api-base  — override API base URL (default: https://live.linkedtrust.us)
 */
(function () {
  'use strict'

  const DEFAULT_API = 'https://live.linkedtrust.us'
  const SITE_BASE = 'https://linkedtrust.us'

  class LinkedBadge extends HTMLElement {
    static get observedAttributes () {
      return ['claim-id', 'theme', 'compact', 'api-base']
    }

    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      this._data = null
      this._playing = false
    }

    connectedCallback () {
      this._render()
      this._fetchClaim()
    }

    attributeChangedCallback () {
      if (this.isConnected) {
        this._data = null
        this._playing = false
        this._render()
        this._fetchClaim()
      }
    }

    get _claimId () { return this.getAttribute('claim-id') }
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

    // Extract subject info from edges
    _getSubject () {
      const claim = this._data.claim
      const edges = claim.edges || []

      // Find subject edge — endNode is the subject entity
      const subjectEdge = edges.find(e => e.label === 'subject')
      if (subjectEdge && subjectEdge.endNode) {
        return {
          name: subjectEdge.endNode.name || null,
          uri: subjectEdge.endNode.nodeUri || claim.sourceURI || null,
          image: subjectEdge.endNode.image || subjectEdge.endNode.thumbnail || null,
          type: subjectEdge.endNode.entType || null
        }
      }

      // Fallback: use claim.subject if it's a string URI
      return {
        name: null,
        uri: typeof claim.subject === 'string' ? claim.subject : claim.sourceURI,
        image: null,
        type: null
      }
    }

    // Find video URL from images array
    _getVideoUrl () {
      const images = this._data.images || []
      const video = images.find(i =>
        i.type === 'video' ||
        (i.contentType && i.contentType.startsWith('video/')) ||
        (i.url && /\.(mp4|webm|ogg)(\?|$)/i.test(i.url))
      )
      return video ? video.url : null
    }

    // Find image URL from images array
    _getImageUrl () {
      const images = this._data.images || []
      const img = images.find(i =>
        i.type === 'image' ||
        (i.contentType && i.contentType.startsWith('image/'))
      )
      return img ? img.url : null
    }

    _renderError (msg) {
      this.shadowRoot.innerHTML = `
        <style>${this._baseStyles()}</style>
        <div class="badge-card ${this._theme}" style="text-align:center;padding:24px;">
          <span style="color:#999;font-size:14px;">${msg}</span>
        </div>
      `
    }

    _render () {
      if (!this._data) {
        // Loading skeleton
        this.shadowRoot.innerHTML = `
          <style>${this._baseStyles()}</style>
          <div class="badge-card ${this._theme} ${this._compact ? 'compact' : ''}">
            <div class="skeleton-media"></div>
            <div class="badge-body">
              <div class="skeleton-line" style="width:60%"></div>
              <div class="skeleton-line" style="width:90%"></div>
              <div class="skeleton-line" style="width:40%"></div>
            </div>
          </div>
        `
        return
      }

      const claim = this._data.claim
      const subject = this._getSubject()
      const videoUrl = this._getVideoUrl()
      const imageUrl = this._getImageUrl()
      const hasMedia = videoUrl || imageUrl
      const isRated = claim.claim === 'RATED' && claim.stars != null && claim.stars > 0
      const date = claim.effectiveDate ? new Date(claim.effectiveDate).toLocaleDateString() : ''
      const claimUrl = `${SITE_BASE}/claims/${claim.id}`

      // Build star HTML
      let starsHtml = ''
      if (isRated) {
        const stars = Math.round(claim.stars * 2) / 2 // round to 0.5
        starsHtml = '<div class="rating">'
        for (let i = 1; i <= 5; i++) {
          if (i <= Math.floor(stars)) {
            starsHtml += '<span class="star full">★</span>'
          } else if (i - 0.5 === stars) {
            starsHtml += '<span class="star half">★</span>'
          } else {
            starsHtml += '<span class="star empty">★</span>'
          }
        }
        starsHtml += `<span class="rating-num">${Number(claim.stars).toFixed(1)}</span></div>`
      }

      // Subject initial for avatar fallback
      const initial = subject.name ? subject.name.charAt(0).toUpperCase() : '?'

      // Subject link — prefer sourceURI, fall back to subject URI
      const subjectLink = claim.sourceURI || subject.uri || null

      // Media section
      let mediaHtml = ''
      if (videoUrl) {
        mediaHtml = `
          <div class="media-wrap" id="media">
            <video src="${this._esc(videoUrl)}" preload="metadata" playsinline></video>
            <div class="play-overlay" id="playBtn">
              <svg viewBox="0 0 48 48" width="56" height="56"><circle cx="24" cy="24" r="23" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="1.5"/><polygon points="19,14 19,34 35,24" fill="white"/></svg>
            </div>
          </div>
        `
      } else if (imageUrl) {
        mediaHtml = `
          <div class="media-wrap">
            <img src="${this._esc(imageUrl)}" alt="" class="media-img" />
          </div>
        `
      }

      this.shadowRoot.innerHTML = `
        <style>${this._baseStyles()}</style>
        <div class="badge-card ${this._theme} ${this._compact ? 'compact' : ''}">
          ${mediaHtml}
          <div class="badge-body">
            ${starsHtml}
            ${claim.statement ? `<p class="statement">${this._esc(claim.statement)}</p>` : ''}
            <div class="issuer-row">
              ${subject.image
                ? `<img class="avatar" src="${this._esc(subject.image)}" alt="" />`
                : `<div class="avatar avatar-fallback">${initial}</div>`
              }
              <div class="issuer-info">
                ${subject.name
                  ? (subjectLink
                    ? `<a class="issuer-name" href="${this._esc(subjectLink)}" target="_blank" rel="noopener">${this._esc(subject.name)}</a>`
                    : `<span class="issuer-name">${this._esc(subject.name)}</span>`)
                  : (subjectLink
                    ? `<a class="issuer-name" href="${this._esc(subjectLink)}" target="_blank" rel="noopener">${this._truncUri(subjectLink)}</a>`
                    : '')
                }
                ${date ? `<span class="date">${date}</span>` : ''}
              </div>
            </div>
            ${claim.aspect ? `<span class="aspect-chip">${this._esc(claim.aspect.includes(':') ? claim.aspect.split(':')[1] : claim.aspect)}</span>` : ''}
            <div class="footer">
              <span class="verified-label">
                <svg viewBox="0 0 20 20" width="14" height="14" style="vertical-align:-2px;margin-right:4px;"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z" fill="#10B981"/></svg>
                Verified on LinkedTrust
              </span>
              <a class="view-link" href="${this._esc(claimUrl)}" target="_blank" rel="noopener">View Full Claim →</a>
            </div>
          </div>
        </div>
      `

      // Wire up video play
      if (videoUrl) {
        const media = this.shadowRoot.getElementById('media')
        const playBtn = this.shadowRoot.getElementById('playBtn')
        if (media && playBtn) {
          playBtn.addEventListener('click', () => {
            const vid = media.querySelector('video')
            if (vid) {
              vid.controls = true
              vid.play()
              playBtn.style.display = 'none'
            }
          })
        }
      }
    }

    _esc (str) {
      const d = document.createElement('div')
      d.textContent = String(str)
      return d.innerHTML
    }

    _truncUri (uri) {
      try {
        const u = new URL(uri)
        let display = u.hostname + u.pathname
        if (display.length > 40) display = display.slice(0, 37) + '...'
        return this._esc(display)
      } catch { return this._esc(uri.slice(0, 40)) }
    }

    _baseStyles () {
      return `
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .badge-card {
          max-width: 480px;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .badge-card:hover {
          transform: translateY(-2px);
        }

        /* Light theme */
        .badge-card.light {
          background: #ffffff;
          color: #1a1a1a;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
        }
        .badge-card.light:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05);
        }

        /* Dark theme */
        .badge-card.dark {
          background: #1e1e1e;
          color: #e0e0e0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
        }
        .badge-card.dark:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
        }

        .badge-card.compact { max-width: 320px; }

        /* Media */
        .media-wrap {
          position: relative;
          width: 100%;
          background: #000;
          overflow: hidden;
        }
        .media-wrap video, .media-wrap .media-img {
          display: block;
          width: 100%;
          max-height: 280px;
          object-fit: cover;
        }
        .compact .media-wrap video, .compact .media-wrap .media-img {
          max-height: 180px;
        }
        .play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(0,0,0,0.2);
          transition: background 0.2s;
        }
        .play-overlay:hover {
          background: rgba(0,0,0,0.4);
        }

        /* Body */
        .badge-body {
          padding: 16px 20px 14px;
        }
        .compact .badge-body {
          padding: 12px 14px 10px;
        }

        /* Rating */
        .rating {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .star { font-size: 20px; line-height: 1; }
        .compact .star { font-size: 16px; }
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
        .rating-num {
          margin-left: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }
        .dark .rating-num { color: #aaa; }

        /* Statement */
        .statement {
          margin: 0 0 12px;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: inherit;
        }
        .compact .statement { font-size: 13px; }

        /* Issuer row */
        .issuer-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: #6366f1;
        }
        .issuer-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .issuer-name {
          font-size: 14px;
          font-weight: 600;
          color: inherit;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        a.issuer-name:hover {
          text-decoration: underline;
        }
        .date {
          font-size: 12px;
          color: #888;
        }
        .dark .date { color: #777; }

        /* Aspect chip */
        .aspect-chip {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 12px;
          margin-bottom: 10px;
          background: #f0f0f0;
          color: #555;
        }
        .dark .aspect-chip {
          background: #333;
          color: #aaa;
        }

        /* Footer */
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.08);
          flex-wrap: wrap;
          gap: 6px;
        }
        .dark .footer {
          border-top-color: rgba(255,255,255,0.1);
        }
        .verified-label {
          font-size: 12px;
          color: #10B981;
          font-weight: 500;
        }
        .view-link {
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          text-decoration: none;
        }
        .view-link:hover {
          text-decoration: underline;
        }

        /* Skeleton loading */
        .skeleton-media {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .dark .skeleton-media {
          background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
          background-size: 200% 100%;
        }
        .skeleton-line {
          height: 14px;
          border-radius: 4px;
          margin-bottom: 10px;
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .dark .skeleton-line {
          background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `
    }
  }

  if (!customElements.get('linked-badge')) {
    customElements.define('linked-badge', LinkedBadge)
  }
})()
