/**
 * LinkedTrust — ask someone for a recommendation, from your own page.
 *
 * Usage:
 *   <script src="https://live.linkedtrust.us/claim-request.js"></script>
 *   <linked-claim-request
 *     subject="https://act.example.org/campaigns/jreas"
 *     subject-name="JREAS Hub"
 *     api-base="/lt"></linked-claim-request>
 *
 * The visitor fills in who they are asking, gets back a short link, and sends
 * it themselves. The person they ask writes their words on that link and the
 * result is a claim about `subject`, renderable with <linked-badge>.
 *
 * Attributes:
 *   subject        — URI the recommendation is about (required)
 *   subject-name   — what to call it on screen (default: the host of subject)
 *   requester-name — prefill for "your name", when the page knows who is asking
 *   aspect         — optional aspect recorded on the claim, e.g. "quality:fundraising"
 *   api-base       — where to POST the invite (default: https://live.linkedtrust.us).
 *                    Point this at your own server to keep your client key off
 *                    the page: it forwards to LinkedTrust with the key attached.
 *   theme          — "light" (default) or "dark"
 *
 * Events:
 *   linked-claim-request  — detail { token, url, id }, once the link exists.
 */
(function () {
  'use strict'

  const DEFAULT_API = 'https://live.linkedtrust.us'

  function esc (str) {
    const d = document.createElement('div')
    d.textContent = String(str == null ? '' : str)
    return d.innerHTML
  }

  function hostOf (uri) {
    try { return new URL(uri).host.replace(/^www\./, '') } catch { return uri }
  }

  function styles (theme) {
    const dark = theme === 'dark'
    const ink = dark ? '#F2F4F7' : '#1B2430'
    const muted = dark ? '#98A2B3' : '#6B7684'
    const rule = dark ? '#2B3440' : '#E6E9EE'
    const ground = dark ? '#161C24' : '#FFFFFF'
    const field = dark ? '#1E2630' : '#FFFFFF'
    const accent = '#00b2e5'
    return `
      :host { display: block; }
      * { box-sizing: border-box; }
      .card {
        font: 15px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: ${ink};
        background: ${ground};
        border: 1px solid ${rule};
        border-radius: 14px;
        padding: 22px;
        max-width: 480px;
      }
      h2 { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; margin: 0 0 4px; }
      p.lede { color: ${muted}; font-size: 14.5px; margin: 0 0 18px; }
      label { display: block; font-size: 13px; font-weight: 600; margin: 0 0 5px; }
      .hint { display: block; font-weight: 400; color: ${muted}; font-size: 12.5px; margin-top: 2px; }
      input, textarea {
        width: 100%; font: inherit; font-size: 15px; color: ${ink}; background: ${field};
        border: 1px solid ${rule}; border-radius: 9px; padding: 10px 12px; margin: 0 0 14px;
      }
      input:focus, textarea:focus { outline: 2px solid ${accent}; outline-offset: -1px; border-color: ${accent}; }
      textarea { min-height: 72px; resize: vertical; }
      button {
        font: inherit; font-size: 15px; font-weight: 600; border-radius: 9px;
        padding: 11px 18px; border: 0; cursor: pointer;
      }
      button[disabled] { opacity: 0.55; cursor: default; }
      .primary { background: ${accent}; color: #062028; width: 100%; }
      .row { display: flex; gap: 8px; }
      .row button { flex: 1; }
      .ghost { background: transparent; color: ${ink}; border: 1px solid ${rule}; }
      .link {
        display: block; font-size: 15px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        background: ${dark ? '#0F141A' : '#F5F7FA'}; border: 1px solid ${rule}; border-radius: 9px;
        padding: 12px; margin: 0 0 12px; overflow-wrap: anywhere;
      }
      .err { color: #D0342C; font-size: 13.5px; margin: 0 0 12px; }
      .sent-mark { font-size: 28px; margin: 0 0 8px; }
      .asked { border-top: 1px solid ${rule}; margin-top: 18px; padding-top: 14px; }
      .asked h3 { font-size: 13px; font-weight: 600; color: ${muted}; margin: 0 0 8px; text-transform: none; }
      .asked ul { list-style: none; margin: 0; padding: 0; }
      .asked li { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; padding: 5px 0; font-size: 14px; }
      .asked .who { overflow-wrap: anywhere; }
      .asked .state { color: ${muted}; font-size: 12.5px; white-space: nowrap; }
      .asked .state.done { color: #1B806A; }
      a.state.done { text-decoration: none; }
      a.state.done:hover { text-decoration: underline; }
      .asked button.relink {
        background: none; border: 0; padding: 0; font-size: 12.5px; font-weight: 500;
        color: ${accent}; cursor: pointer; white-space: nowrap;
      }
    `
  }

  class LinkedClaimRequest extends HTMLElement {
    static get observedAttributes () {
      return ['subject', 'subject-name', 'requester-name', 'aspect', 'api-base', 'theme']
    }

    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      this._made = null
      this._busy = false
      this._error = null
      this._fatal = null
      // Kept across re-renders so a failed send never empties the boxes.
      this._form = { recipientName: '', recipientProfile: '', requesterName: '', note: '' }
    }

    connectedCallback () {
      this._asked = this._loadAsked()
      this._render()
      this._refreshAsked()
    }

    get _askedKey () { return `linkedtrust.asked.${this._subject}` }

    _loadAsked () {
      try { return JSON.parse(localStorage.getItem(this._askedKey) || '[]') } catch { return [] }
    }

    _saveAsked () {
      try { localStorage.setItem(this._askedKey, JSON.stringify(this._asked.slice(0, 25))) } catch { /* private mode */ }
    }

    // Whoever asked is the only one who can see this list; it lives in their
    // browser, not on the page, so a visitor never sees who was approached.
    async _refreshAsked () {
      const waiting = (this._asked || []).filter(a => !a.answered).slice(0, 10)
      if (!waiting.length) return
      let changed = false
      await Promise.all(waiting.map(async (a) => {
        try {
          const res = await fetch(`${this._apiBase}/api/testimonial-requests/${encodeURIComponent(a.token)}`)
          if (!res.ok) return
          const inv = await res.json()
          if (inv.responded) { a.answered = true; a.claimId = inv.claimId; changed = true }
        } catch { /* offline, try again next load */ }
      }))
      if (changed) { this._saveAsked(); this._render() }
    }

    attributeChangedCallback () { if (this.isConnected) this._render() }

    get _subject () { return this.getAttribute('subject') || '' }
    get _subjectName () { return this.getAttribute('subject-name') || hostOf(this._subject) }
    get _apiBase () { return (this.getAttribute('api-base') || DEFAULT_API).replace(/\/$/, '') }
    get _theme () { return this.getAttribute('theme') === 'dark' ? 'dark' : 'light' }

    _suggestedNote (name) {
      const who = name ? `Hi ${name}, ` : ''
      return `${who}we're raising money for ${this._subjectName} and your word would carry. Would you write a couple of lines?`
    }

    _readForm () {
      const val = (id) => (this.shadowRoot.getElementById(id) || {}).value || ''
      this._form = {
        recipientName: val('recipient-name').trim(),
        recipientProfile: val('recipient-profile').trim(),
        requesterName: val('requester-name').trim(),
        note: val('note').trim()
      }
    }

    async _create () {
      if (this._busy) return
      this._readForm()
      if (!this._subject) { this._error = 'This page has no subject set.'; return this._render() }
      if (!this._form.recipientName) {
        this._error = 'Who are you asking?'
        return this._render()
      }

      this._busy = true
      this._error = null
      this._render()

      try {
        const res = await fetch(`${this._apiBase}/api/testimonial-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectUri: this._subject,
            subjectName: this._subjectName,
            aspect: this.getAttribute('aspect') || undefined,
            ...this._form
          })
        })
        if (res.status === 401 || res.status === 403) {
          this._fatal = 'This page isn’t set up to send invites yet. Tell whoever runs the site — ' +
            'the widget needs to point at their server (api-base), not straight at LinkedTrust.'
          return
        }
        if (res.status === 429) {
          this._error = 'That’s a lot of links at once. Wait a couple of minutes and try again.'
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const made = await res.json()
        if (!made.url) throw new Error('No link returned')
        this._made = made
        this._asked = [{ token: made.token, url: made.url, name: this._form.recipientName, at: Date.now() }]
          .concat(this._asked || [])
        this._saveAsked()
        this.dispatchEvent(new CustomEvent('linked-claim-request', {
          detail: made, bubbles: true, composed: true
        }))
      } catch (e) {
        this._error = 'Could not make the link. Try again.'
      } finally {
        this._busy = false
        this._render()
      }
    }

    _message () {
      const note = this._form.note || this._suggestedNote(this._form.recipientName)
      return `${note}\n\n${this._made.url}`
    }

    async _share () {
      const text = this._message()
      if (navigator.share) {
        try { await navigator.share({ text }); return } catch { /* cancelled, fall through */ }
      }
      try {
        await navigator.clipboard.writeText(text)
        const b = this.shadowRoot.getElementById('share')
        if (b) { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy message' }, 2000) }
      } catch {
        this._error = 'Copy the link above by hand.'
        this._render()
      }
    }

    _askedHtml () {
      const list = this._asked || []
      if (!list.length) return ''
      return `
        <div class="asked">
          <h3>You asked</h3>
          <ul>${list.slice(0, 8).map((a, i) => `
            <li>
              <span class="who">${esc(a.name || 'someone')}</span>
              ${a.answered
                ? (a.claimId
                    ? `<a class="state done" href="${esc(DEFAULT_API)}/claims/${encodeURIComponent(a.claimId)}" target="_blank" rel="noopener">read what they wrote</a>`
                    : '<span class="state done">answered</span>')
                : `<button class="relink" data-i="${i}">send the link again</button>`}
            </li>`).join('')}
          </ul>
        </div>`
    }

    _wireAsked () {
      this.shadowRoot.querySelectorAll('button.relink').forEach((b) => {
        b.onclick = () => {
          const a = this._asked[Number(b.dataset.i)]
          this._made = { url: a.url, token: a.token }
          this._form = { ...this._form, recipientName: a.name || '' }
          this._render()
        }
      })
    }

    _render () {
      const s = `<style>${styles(this._theme)}</style>`

      if (this._fatal) {
        this.shadowRoot.innerHTML = `${s}
          <div class="card">
            <h2>Can’t make a link here</h2>
            <p class="lede" style="margin:0">${esc(this._fatal)}</p>
          </div>`
        return
      }

      if (this._made) {
        this.shadowRoot.innerHTML = `${s}
          <div class="card">
            <div class="sent-mark">✉️</div>
            <h2>Send ${esc(this._form.recipientName || 'them')} this link</h2>
            <p class="lede">They write a few words. No account, no sign-in.</p>
            <div class="link">${esc(this._made.url)}</div>
            <div class="row">
              <button class="primary" id="share">${navigator.share ? 'Share' : 'Copy message'}</button>
              <button class="ghost" id="again">Ask someone else</button>
            </div>
            ${this._error ? `<p class="err" style="margin-top:12px">${esc(this._error)}</p>` : ''}
            ${this._askedHtml()}
          </div>`
        this._wireAsked()
        this.shadowRoot.getElementById('share').onclick = () => this._share()
        this.shadowRoot.getElementById('again').onclick = () => {
          this._made = null
          this._noteEdited = false
          this._form = { recipientName: '', recipientProfile: '', requesterName: this._form.requesterName, note: '' }
          this._render()
        }
        return
      }

      const f = this._form
      const prefillRequester = f.requesterName || this.getAttribute('requester-name') || ''

      this.shadowRoot.innerHTML = `${s}
        <div class="card">
          <h2>Ask someone to vouch for ${esc(this._subjectName)}</h2>
          <p class="lede">Make a link, send it however you like.</p>
          ${this._error ? `<p class="err">${esc(this._error)}</p>` : ''}

          <label for="recipient-name">Who are you asking?
            <span class="hint">Their name, as you'd greet them.</span></label>
          <input id="recipient-name" type="text" autocomplete="off" value="${esc(f.recipientName)}" />

          <label for="recipient-profile">Their page, if you know it
            <span class="hint">Optional. A link to who they are — profile, org, anything.
            Saves them typing it and shows readers who is speaking.</span></label>
          <input id="recipient-profile" type="url" inputmode="url" autocomplete="off" placeholder="https://" value="${esc(f.recipientProfile)}" />

          <label for="requester-name">Your name
            <span class="hint">So they know who is asking.</span></label>
          <input id="requester-name" type="text" autocomplete="name" value="${esc(prefillRequester)}" />

          <label for="note">What to say to them
            <span class="hint">They'll read this on the page. Change it to sound like you.</span></label>
          <textarea id="note">${esc(f.note || this._suggestedNote(f.recipientName))}</textarea>

          <button class="primary" id="make" ${this._busy ? 'disabled' : ''}>
            ${this._busy ? 'Making the link…' : 'Make the link'}
          </button>
          ${this._askedHtml()}
        </div>`

      const make = this.shadowRoot.getElementById('make')
      make.onclick = () => this._create()

      // The suggested note greets them by name, so it follows the name field
      // until the volunteer types their own words into it.
      const note = this.shadowRoot.getElementById('note')
      const name = this.shadowRoot.getElementById('recipient-name')
      note.addEventListener('input', () => { this._noteEdited = true })
      name.addEventListener('input', () => {
        const next = name.value.trim()
        if (!this._noteEdited) {
          note.value = this._suggestedNote(next)
        } else if (this._greeted && note.value.includes(`Hi ${this._greeted},`)) {
          // They rewrote the note and then changed who it is for. Sending it
          // with the previous person's name is the one unrecoverable mistake.
          note.value = note.value.replace(`Hi ${this._greeted},`, next ? `Hi ${next},` : 'Hi,')
        }
        this._greeted = next
      })
      this._greeted = f.recipientName
      note.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) this._create()
      })
      this._wireAsked()
    }
  }

  if (!customElements.get('linked-claim-request')) {
    customElements.define('linked-claim-request', LinkedClaimRequest)
  }
})()
