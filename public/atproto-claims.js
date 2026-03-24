/**
 * <linked-claims-atproto> Web Component
 *
 * Embeddable feed of LinkedClaims from the AT Protocol.
 * Shows com.linkedclaims.claim records from any ATProto repository.
 * Defaults to showing claims where subject matches the current page URL.
 *
 * Usage:
 *   <!-- Show claims about this page -->
 *   <linked-claims-atproto></linked-claims-atproto>
 *
 *   <!-- Show claims about a specific URL -->
 *   <linked-claims-atproto subject="https://example.com"></linked-claims-atproto>
 *
 *   <!-- Browse a specific user's claims -->
 *   <linked-claims-atproto repo="did:plc:xztctnvt5ycnsippd3orwqk7"></linked-claims-atproto>
 *
 *   <!-- Show ALL claims from a repo (no subject filter) -->
 *   <linked-claims-atproto repo="did:plc:xztctnvt5ycnsippd3orwqk7" subject="*"></linked-claims-atproto>
 *
 * Attributes:
 *   subject  — URI to filter claims by (default: current page URL, "*" for all)
 *   repo     — ATProto DID to fetch claims from (can be comma-separated for multiple)
 *   theme    — "light" or "dark" (default: light)
 *   limit    — max claims to show (default: 50)
 *   compact  — flag for smaller cards
 *
 * No backend required — reads directly from ATProto public API.
 * Links to LinkedTrust when a claim has a respondAt pointing there.
 */
;(function () {
  'use strict'

  const ATPROTO_API = 'https://public.api.bsky.app'
  const COLLECTION = 'com.linkedclaims.claim'

  // ── Helpers ──────────────────────────────────────────────

  function esc (str) {
    if (!str) return ''
    const d = document.createElement('div')
    d.textContent = String(str)
    return d.innerHTML
  }

  function truncUri (uri, max) {
    max = max || 50
    if (!uri) return ''
    if (uri.length <= max) return esc(uri)
    try {
      const u = new URL(uri)
      const path = u.pathname + u.search
      if (path.length > 30) return esc(u.host + path.slice(0, 15) + '\u2026' + path.slice(-12))
      return esc(u.host + path)
    } catch (e) {
      return esc(uri.slice(0, max - 3) + '\u2026')
    }
  }

  function formatDate (dateStr) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) { return dateStr }
  }

  function isImageUrl (url) {
    return url && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
  }

  function isVideoUrl (url) {
    return url && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)
  }

  function isLinkedTrustUrl (url) {
    if (!url) return false
    try {
      const h = new URL(url).hostname
      return h === 'live.linkedtrust.us' || h === 'dev.linkedtrust.us' || h.endsWith('.linkedtrust.us')
    } catch (e) { return false }
  }

  // ── Fetch from ATProto ──────────────────────────────────

  async function listRecords (repo, limit) {
    const url = ATPROTO_API + '/xrpc/com.atproto.repo.listRecords?repo=' +
      encodeURIComponent(repo) + '&collection=' + COLLECTION + '&limit=' + limit
    const res = await fetch(url)
    if (!res.ok) throw new Error('ATProto API ' + res.status)
    const data = await res.json()
    return (data.records || []).map(function (r) {
      return Object.assign({}, r.value, { _atUri: r.uri, _cid: r.cid, _repo: repo })
    })
  }

  // ── Rendering ───────────────────────────────────────────

  function renderEvidence (items) {
    if (!items || !items.length) return ''
    var html = '<div class="evidence">'
    items.forEach(function (item) {
      var uri = item.uri || ''
      var desc = item.description || ''
      if (isVideoUrl(uri) || (item.mediaType && item.mediaType.indexOf('video/') === 0)) {
        html += '<div class="ev-item"><video src="' + esc(uri) + '" controls preload="metadata" playsinline></video>'
        if (desc) html += '<div class="ev-desc">' + esc(desc) + '</div>'
        html += '</div>'
      } else if (isImageUrl(uri) || (item.mediaType && item.mediaType.indexOf('image/') === 0)) {
        html += '<div class="ev-item"><img src="' + esc(uri) + '" alt="' + esc(desc || 'evidence') + '" loading="lazy">'
        if (desc) html += '<div class="ev-desc">' + esc(desc) + '</div>'
        html += '</div>'
      } else if (uri) {
        html += '<div class="ev-item"><a href="' + esc(uri) + '" target="_blank" rel="noopener">' + esc(desc || uri) + '</a></div>'
      } else if (desc) {
        html += '<div class="ev-item"><div class="ev-desc">' + esc(desc) + '</div></div>'
      }
    })
    html += '</div>'
    return html
  }

  function renderStars (n) {
    if (!n) return ''
    var s = ''
    for (var i = 1; i <= 5; i++) {
      s += i <= n ? '<span class="star full">\u2605</span>' : '<span class="star empty">\u2605</span>'
    }
    return '<span class="stars">' + s + ' <span class="star-num">' + Number(n).toFixed(1) + '</span></span>'
  }

  function renderClaim (claim) {
    var type = claim.claimType || ''
    var subject = claim.subject || ''
    var statement = claim.statement || ''
    var stars = claim.stars ? renderStars(claim.stars) : ''
    var aspect = claim.aspect || ''
    var confidence = (claim.confidence != null) ? Math.round(claim.confidence * 100) + '%' : ''
    var date = formatDate(claim.effectiveDate || claim.createdAt)
    var source = claim.source
    var evidence = claim.evidence || []
    var respondAt = claim.respondAt || ''
    var claimUri = claim.claimUri || claim._atUri || ''

    // Header: type + object + aspect
    var header = esc(type)
    if (claim.object) header += ' <span class="obj">\u00b7 ' + esc(claim.object) + '</span>'
    if (aspect) header += ' <span class="aspect">(' + esc(aspect) + ')</span>'

    // Subject line
    var subjectLine = '<div class="subject">about: <a href="' + esc(subject) + '" target="_blank" rel="noopener">' + truncUri(subject) + '</a></div>'

    // Source
    var sourceLine = ''
    if (source && source.uri) {
      var how = source.howKnown ? ' \u00b7 ' + esc(source.howKnown.replace(/_/g, ' ').toLowerCase()) : ''
      sourceLine = '<div class="source">source: <a href="' + esc(source.uri) + '" target="_blank" rel="noopener">' + truncUri(source.uri, 40) + '</a>' + how + '</div>'
    } else if (source && source.howKnown) {
      sourceLine = '<div class="source">' + esc(source.howKnown.replace(/_/g, ' ').toLowerCase()) + '</div>'
    }

    // Evidence (use evidence URIs for media)
    var evidenceHtml = renderEvidence(evidence)

    // Footer: link to LinkedTrust if we have a DB ID or respondAt points there
    var footer = ''
    var dbId = claim._dbId
    if (dbId) {
      footer = '<a class="lt-link" href="/claims/' + dbId + '" target="_blank" rel="noopener">\u2714 View in LinkedTrust</a>'
    } else if (respondAt && isLinkedTrustUrl(respondAt)) {
      var ltMatch = respondAt.match(/\/api\/claim\/(\d+)/)
      if (ltMatch) {
        var ltBase = new URL(respondAt).origin
        footer = '<a class="lt-link" href="' + esc(ltBase + '/claims/' + ltMatch[1]) + '" target="_blank" rel="noopener">\u2714 View in LinkedTrust</a>'
      }
    }
    if (!footer && claimUri) {
      // Show AT-URI as a link (resolve via bsky)
      footer = '<span class="at-uri" title="' + esc(claimUri) + '">at://' + esc((claimUri.split('/').slice(2, 4).join('/') + '/\u2026').slice(0, 40)) + '</span>'
    }

    // Publisher DID
    var publisher = claim._repo ? '<span class="publisher" title="' + esc(claim._repo) + '">by ' + esc(claim._repo.slice(0, 20) + '\u2026') + '</span>' : ''

    return '<div class="claim">' +
      '<div class="claim-head"><span class="type">' + header + '</span><span class="date">' + esc(date) + '</span></div>' +
      (statement ? '<div class="statement">\u201c' + esc(statement) + '\u201d</div>' : '') +
      (stars ? '<div class="rating">' + stars + '</div>' : '') +
      (confidence ? '<div class="confidence">confidence: ' + confidence + '</div>' : '') +
      subjectLine +
      sourceLine +
      evidenceHtml +
      '<div class="claim-foot">' + publisher + footer + '</div>' +
      '</div>'
  }

  // ── Styles ──────────────────────────────────────────────

  function buildStyles (theme) {
    var isDark = theme === 'dark'
    var bg = isDark ? '#1a1a2e' : '#ffffff'
    var text = isDark ? '#e0e0e0' : '#1a1a1a'
    var border = isDark ? '#333355' : '#e0e0e0'
    var cardBg = isDark ? '#16213e' : '#f8f9fa'
    var accent = isDark ? '#4ea8de' : '#1a6b3c'
    var muted = isDark ? '#888' : '#666'
    var ltGreen = '#10B981'

    return ':host{display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;color:' + text + ';background:' + bg + ';border:1px solid ' + border + ';border-radius:8px;overflow:hidden}' +
      '.header{padding:12px 16px;border-bottom:1px solid ' + border + ';display:flex;align-items:center;justify-content:space-between}' +
      '.header .title{font-weight:600;font-size:15px}' +
      '.header .powered{font-size:11px;color:' + muted + '}' +
      '.header .powered a{color:' + accent + ';text-decoration:none}' +
      '.controls{padding:8px 16px;border-bottom:1px solid ' + border + ';display:flex;gap:8px}' +
      '.subject-input{flex:1;padding:6px 10px;border:1px solid ' + border + ';border-radius:4px;font-size:13px;background:' + bg + ';color:' + text + ';outline:none}' +
      '.subject-input:focus{border-color:' + accent + '}' +
      '.search-btn{padding:6px 14px;background:' + accent + ';color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px}' +
      '.search-btn:hover{opacity:0.85}' +
      '.feed{max-height:600px;overflow-y:auto;padding:8px}' +
      '.claim{background:' + cardBg + ';border:1px solid ' + border + ';border-radius:6px;padding:12px;margin-bottom:8px}' +
      '.claim:last-child{margin-bottom:0}' +
      '.claim-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}' +
      '.type{font-weight:600;color:' + accent + ';text-transform:uppercase;font-size:12px;letter-spacing:0.5px}' +
      '.obj,.aspect{font-weight:normal;text-transform:none;color:' + text + '}' +
      '.date{font-size:12px;color:' + muted + '}' +
      '.statement{margin:6px 0;line-height:1.4;font-style:italic}' +
      '.rating{margin:4px 0}' +
      '.stars{font-size:16px}' +
      '.star.full{color:#FFC107}' +
      '.star.empty{color:' + (isDark ? '#555' : '#ccc') + '}' +
      '.star-num{font-size:13px;font-weight:600;color:' + muted + '}' +
      '.confidence{font-size:12px;color:' + muted + '}' +
      '.subject,.source{font-size:12px;color:' + muted + ';margin:3px 0}' +
      '.subject a,.source a{color:' + accent + ';text-decoration:none}' +
      '.subject a:hover,.source a:hover{text-decoration:underline}' +
      '.evidence{margin:8px 0}' +
      '.ev-item{margin:6px 0}' +
      '.ev-item img{max-width:100%;max-height:300px;border-radius:4px;display:block}' +
      '.ev-item video{max-width:100%;max-height:300px;border-radius:4px;display:block}' +
      '.ev-item a{color:' + accent + ';text-decoration:none;font-size:13px}' +
      '.ev-desc{font-size:12px;color:' + muted + ';margin-top:4px}' +
      '.claim-foot{margin-top:8px;display:flex;justify-content:space-between;align-items:center}' +
      '.lt-link{font-size:12px;color:' + ltGreen + ';text-decoration:none;font-weight:500}' +
      '.lt-link:hover{text-decoration:underline}' +
      '.at-uri{font-size:11px;color:' + muted + ';font-family:monospace}' +
      '.publisher{font-size:11px;color:' + muted + ';font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}' +
      '.loading,.empty{padding:24px;text-align:center;color:' + muted + '}' +
      '.error{padding:16px;text-align:center;color:#e74c3c;font-size:13px}'
  }

  // ── Web Component ───────────────────────────────────────

  class LinkedClaimsAtproto extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      this._claims = []
      this._subject = ''
      this._loading = false
      this._error = null
    }

    connectedCallback () {
      this._subject = this.getAttribute('subject') || window.location.href
      this._render()
      this._fetchClaims()
    }

    static get observedAttributes () {
      return ['subject', 'repo', 'theme', 'limit']
    }

    attributeChangedCallback (name, oldVal, newVal) {
      if (oldVal === newVal) return
      if (name === 'subject') {
        this._subject = newVal || window.location.href
      }
      if (this.isConnected) this._fetchClaims()
    }

    get theme () { return this.getAttribute('theme') || 'light' }
    get limit () { return parseInt(this.getAttribute('limit') || '50', 10) }
    get api () { return this.getAttribute('api') || '' }
    get repos () {
      var r = this.getAttribute('repo') || ''
      return r ? r.split(',').map(function (s) { return s.trim() }).filter(Boolean) : []
    }
    get showAll () { return this._subject === '*' }

    async _fetchClaims () {
      this._loading = true
      this._error = null
      this._render()

      try {
        var allClaims = []
        var limit = this.limit
        var self = this

        // Strategy 1: If we have a backend API, use it (can search by subject across all repos)
        if (this.api) {
          allClaims = await this._fetchFromBackend()
        }
        // Strategy 2: If we have repo DIDs, fetch directly from ATProto public API
        else if (this.repos.length > 0) {
          allClaims = await this._fetchFromRepos()
        }
        // Strategy 3: No api and no repo — try same-origin backend
        else {
          try {
            this._apiBase = window.location.origin
            allClaims = await this._fetchFromBackend()
          } catch (e) {
            this._claims = []
            this._error = 'Set an api or repo attribute. Example: api="https://live.linkedtrust.us" or repo="did:plc:..."'
            this._loading = false
            this._render()
            return
          }
        }

        // Sort by date descending
        allClaims.sort(function (a, b) {
          var da = a.effectiveDate || a.createdAt || ''
          var db = b.effectiveDate || b.createdAt || ''
          return da > db ? -1 : da < db ? 1 : 0
        })

        this._claims = allClaims.slice(0, limit)
      } catch (err) {
        console.error('linked-claims-atproto: fetch error', err)
        this._error = 'Failed to load claims: ' + err.message
        this._claims = []
      }

      this._loading = false
      this._render()
    }

    async _fetchFromBackend () {
      var base = this.api || this._apiBase || ''
      var subject = this.showAll ? '*' : this._subject
      var url = base + '/api/atproto/claims?subject=' + encodeURIComponent(subject) + '&limit=' + this.limit
      var res = await fetch(url)
      if (!res.ok) throw new Error('Backend API ' + res.status)
      var data = await res.json()
      // Map backend Claim format to our render format
      return (data.claims || []).map(function (c) {
        return {
          claimType: c.claim,
          subject: c.subject,
          object: c.object,
          statement: c.statement,
          confidence: c.confidence,
          stars: c.stars,
          aspect: c.aspect,
          effectiveDate: c.effectiveDate,
          createdAt: c.createdAt,
          respondAt: c.respondAt,
          claimUri: c.claimAddress,
          _atUri: c.claimAddress,
          _repo: c.issuerId,
          _dbId: c.id,
          source: c.sourceURI ? {
            uri: c.sourceURI,
            howKnown: c.howKnown,
            digestMultibase: c.digestMultibase,
            dateObserved: c.dateObserved,
            author: c.author,
            curator: c.curator
          } : null,
          evidence: (c.images || []).map(function (img) {
            var meta = img.metadata || {}
            return {
              uri: img.url,
              digestMultibase: img.digestMultibase,
              mediaType: meta.contentType || (meta.type === 'video' ? 'video/mp4' : null),
              description: meta.description || null
            }
          })
        }
      })
    }

    async _fetchFromRepos () {
      var repos = this.repos
      var limit = this.limit
      var self = this
      var allClaims = []

      var fetches = repos.map(function (repo) {
        return listRecords(repo, limit).catch(function (err) {
          console.warn('linked-claims-atproto: error fetching ' + repo, err)
          return []
        })
      })

      var results = await Promise.all(fetches)
      results.forEach(function (records) {
        allClaims = allClaims.concat(records)
      })

      // Filter by subject unless showing all
      if (!self.showAll && self._subject) {
        var norm = function (u) { return u.replace(/\/+$/, '') }
        var target = norm(self._subject)
        allClaims = allClaims.filter(function (c) {
          return c.subject && norm(c.subject) === target
        })
      }

      return allClaims
    }

    _render () {
      var content = ''
      var subjectDisplay = ''

      if (this._loading) {
        content = '<div class="loading">Loading claims from ATProto\u2026</div>'
      } else if (this._error) {
        content = '<div class="error">' + esc(this._error) + '</div>'
      } else if (this._claims.length === 0) {
        subjectDisplay = this.showAll ? 'any subject' : truncUri(this._subject)
        content = '<div class="empty">No claims found' + (subjectDisplay ? ' about ' + subjectDisplay : '') + '</div>'
      } else {
        content = this._claims.map(renderClaim).join('')
      }

      // Control bar with subject search
      var controlBar = '<div class="controls">' +
        '<input type="text" class="subject-input" value="' + esc(this._subject) + '" placeholder="Enter a URL to see claims about it">' +
        '<button class="search-btn">Search</button>' +
        '</div>'

      this.shadowRoot.innerHTML = '<style>' + buildStyles(this.theme) + '</style>' +
        '<div class="header">' +
        '<span class="title">LinkedClaims <small style="font-weight:normal;font-size:11px;opacity:0.6">via ATProto</small></span>' +
        '<span class="powered">powered by <a href="https://linkedclaims.com" target="_blank" rel="noopener">linkedclaims.com</a></span>' +
        '</div>' +
        controlBar +
        '<div class="feed">' + content + '</div>'

      // Wire up search
      var input = this.shadowRoot.querySelector('.subject-input')
      var btn = this.shadowRoot.querySelector('.search-btn')
      var self = this
      if (btn && input) {
        btn.addEventListener('click', function () {
          var val = input.value.trim()
          if (val) {
            self._subject = val
            self.setAttribute('subject', val)
            self._fetchClaims()
          }
        })
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') btn.click()
        })
      }
    }
  }

  if (!customElements.get('linked-claims-atproto')) {
    customElements.define('linked-claims-atproto', LinkedClaimsAtproto)
  }
})()
