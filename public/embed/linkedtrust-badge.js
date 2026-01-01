/**
 * LinkedTrust Badge Web Component
 *
 * Usage:
 *   <script src="https://live.linkedtrust.us/embed/linkedtrust-badge.js"></script>
 *   <linkedtrust-badge claim-id="123"></linkedtrust-badge>
 *
 * Attributes:
 *   claim-id: Required. The claim ID to display.
 *   theme: Optional. "light" (default) or "dark"
 *   show-video: Optional. "true" to show video testimonial if available (default: true)
 */

(function() {
  // Detect base URL from script src or default to production
  const scriptTag = document.currentScript;
  const scriptSrc = scriptTag ? scriptTag.src : '';
  const srcMatch = scriptSrc.match(/^(https?:\/\/[^\/]+)/);
  const detectedBase = srcMatch ? srcMatch[1] : 'https://live.linkedtrust.us';

  const API_BASE = detectedBase + '/api';
  const SITE_BASE = detectedBase;

  class LinkedTrustBadge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._videoExpanded = false;
    }

    static get observedAttributes() {
      return ['claim-id', 'theme', 'show-video'];
    }

    connectedCallback() {
      this.render();
      this.loadData();
    }

    attributeChangedCallback() {
      this.render();
      this.loadData();
    }

    get claimId() {
      return this.getAttribute('claim-id');
    }

    get theme() {
      return this.getAttribute('theme') || 'light';
    }

    get showVideo() {
      return this.getAttribute('show-video') !== 'false'; // Default true
    }

    async loadData() {
      if (!this.claimId) {
        this.renderError('No claim-id specified');
        return;
      }

      try {
        // Fetch claim data
        const claimRes = await fetch(`${API_BASE}/claims/${this.claimId}`);
        if (!claimRes.ok) throw new Error('Claim not found');
        const claimData = await claimRes.json();

        // Fetch validation count and videos
        let validationCount = 0;
        let videos = [];
        try {
          const reportRes = await fetch(`${API_BASE}/reports/claim/${this.claimId}`);
          if (reportRes.ok) {
            const reportData = await reportRes.json();
            validationCount = reportData.validations?.length || 0;
            // Get videos from images array
            videos = (reportData.images || []).filter(img =>
              img.metadata?.type === 'video' || img.url?.includes('.webm') || img.url?.includes('.mp4')
            );
          }
        } catch (e) {
          // No validations/videos
        }

        this.renderBadge(claimData.claim, validationCount, videos);
      } catch (error) {
        this.renderError('Could not load testimonial');
      }
    }

    renderError(message) {
      const isDark = this.theme === 'dark';
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          .badge {
            padding: 16px 24px;
            border-radius: 8px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${isDark ? '#2a2a2a' : '#f5f5f5'};
            color: ${isDark ? '#888' : '#666'};
            font-size: 14px;
          }
        </style>
        <div class="badge">${message}</div>
      `;
    }

    renderBadge(claim, validationCount, videos = []) {
      const isDark = this.theme === 'dark';
      const statement = claim.statement || 'Verified testimonial';
      const truncatedStatement = statement.length > 120
        ? statement.substring(0, 120).trim() + '...'
        : statement;
      const stars = claim.stars || 0;
      const certificateUrl = `${SITE_BASE}/certificate/${this.claimId}`;
      const hasVideo = this.showVideo && videos.length > 0;
      const videoUrl = hasVideo ? videos[0].url : null;

      // Generate star HTML
      const starHtml = stars > 0 ? `
        <div class="stars">
          ${Array(5).fill(0).map((_, i) => `
            <svg class="star ${i < stars ? 'filled' : ''}" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          `).join('')}
        </div>
      ` : '';

      // Video section HTML
      const videoHtml = hasVideo ? `
        <div class="video-section" id="video-section">
          <div class="video-preview" id="video-preview">
            <div class="play-button" id="play-btn">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.6)"/>
                <path d="M10 8l6 4-6 4V8z" fill="white"/>
              </svg>
            </div>
            <span class="video-label">Video Testimonial</span>
          </div>
          <div class="video-player" id="video-player" style="display: none;">
            <video id="video" controls playsinline>
              <source src="${videoUrl}" type="video/webm">
            </video>
            <button class="close-video" id="close-btn">×</button>
          </div>
        </div>
      ` : '';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          .badge-container {
            max-width: 360px;
          }
          .badge {
            background: ${isDark
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 20px 24px;
            border-radius: ${hasVideo ? '12px 12px 0 0' : '12px'};
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            text-decoration: none;
            display: block;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          .badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }
          .verified-icon {
            width: 18px;
            height: 18px;
            fill: currentColor;
            opacity: 0.9;
          }
          .verified-text {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.9;
          }
          .endorsements {
            margin-left: auto;
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
          }
          .statement {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 12px;
            font-weight: 500;
          }
          .stars {
            display: flex;
            gap: 2px;
            margin-bottom: 12px;
          }
          .star {
            fill: rgba(255,255,255,0.3);
          }
          .star.filled {
            fill: #ffc107;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            font-size: 12px;
            opacity: 0.8;
          }
          .footer svg {
            width: 14px;
            height: 14px;
            margin-left: 4px;
            fill: currentColor;
          }

          /* Video section styles */
          .video-section {
            background: ${isDark ? '#0d0d1a' : '#1a1a2e'};
            border-radius: 0 0 12px 12px;
            overflow: hidden;
          }
          .video-preview {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .video-preview:hover {
            background: rgba(255,255,255,0.05);
          }
          .play-button {
            flex-shrink: 0;
          }
          .play-button svg {
            display: block;
          }
          .video-label {
            color: rgba(255,255,255,0.9);
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
          }
          .video-player {
            position: relative;
            background: #000;
          }
          .video-player video {
            width: 100%;
            display: block;
            max-height: 240px;
          }
          .close-video {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: none;
            background: rgba(0,0,0,0.6);
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .close-video:hover {
            background: rgba(0,0,0,0.8);
          }
        </style>
        <div class="badge-container">
          <a href="${certificateUrl}" target="_blank" rel="noopener noreferrer" class="badge">
            <div class="header">
              <svg class="verified-icon" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span class="verified-text">Verified Testimonial</span>
              ${validationCount > 0 ? `<span class="endorsements">${validationCount} endorsement${validationCount > 1 ? 's' : ''}</span>` : ''}
            </div>
            <div class="statement">"${truncatedStatement}"</div>
            ${starHtml}
            <div class="footer">
              <span>View on LinkedTrust</span>
              <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          </a>
          ${videoHtml}
        </div>
      `;

      // Add video interaction handlers
      if (hasVideo) {
        const playBtn = this.shadowRoot.getElementById('play-btn');
        const videoPreview = this.shadowRoot.getElementById('video-preview');
        const videoPlayer = this.shadowRoot.getElementById('video-player');
        const video = this.shadowRoot.getElementById('video');
        const closeBtn = this.shadowRoot.getElementById('close-btn');

        const showVideo = (e) => {
          e.preventDefault();
          e.stopPropagation();
          videoPreview.style.display = 'none';
          videoPlayer.style.display = 'block';
          video.play();
        };

        const hideVideo = (e) => {
          e.preventDefault();
          e.stopPropagation();
          video.pause();
          videoPlayer.style.display = 'none';
          videoPreview.style.display = 'flex';
        };

        videoPreview.addEventListener('click', showVideo);
        closeBtn.addEventListener('click', hideVideo);
      }
    }

    render() {
      const isDark = this.theme === 'dark';
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          .loading {
            padding: 20px 24px;
            border-radius: 12px;
            background: ${isDark
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            max-width: 320px;
          }
        </style>
        <div class="loading">Loading testimonial...</div>
      `;
    }
  }

  // Register the custom element
  if (!customElements.get('linkedtrust-badge')) {
    customElements.define('linkedtrust-badge', LinkedTrustBadge);
  }
})();
