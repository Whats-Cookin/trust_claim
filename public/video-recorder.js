/**
 * <linked-video-recorder> — LinkedTrust video recorder web component.
 *
 * The reusable, embeddable version of the trust_claim VideoRecorder flow
 * (src/components/VideoRecorder): live mirrored self-view while recording,
 * timer with a max duration, retake, upload with progress to the LinkedTrust
 * backend (/api/video/upload), same response contract ({ videoUrl }).
 *
 * Usage:
 *   <script src="https://demos.linkedtrust.us/embed/video-recorder.js" defer></script>
 *   <linked-video-recorder api-base="https://live.linkedtrust.us" max-duration="60">
 *   </linked-video-recorder>
 *
 * Events (bubble, composed):
 *   video-uploaded  detail: { videoUrl }
 *   video-removed   detail: {}
 *
 * Attributes: api-base (required), max-duration (seconds, default 60).
 * Styling: system font, inherits currentColor for text; accent via
 * --lvr-accent (default #0d9488).
 */
(function () {
  'use strict';

  const tpl = document.createElement('template');
  tpl.innerHTML = `
    <style>
      :host { display: block; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      .stage { position: relative; width: 100%; border-radius: 12px; overflow: hidden;
               background: #0f172a; aspect-ratio: 16 / 9; display: none; }
      .stage.on { display: block; }
      video { width: 100%; height: 100%; object-fit: cover; display: block; background: #0f172a; }
      video.mirror { transform: scaleX(-1); }
      .timer { position: absolute; top: 10px; left: 10px; display: none; align-items: center; gap: 7px;
               background: rgba(15,23,42,.75); color: #fff; font-size: 13px; font-weight: 600;
               border-radius: 999px; padding: 4px 12px; }
      .timer.on { display: inline-flex; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: blink 1.2s infinite; }
      @keyframes blink { 50% { opacity: .25; } }
      .row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
      button { font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 999px;
               padding: 9px 18px; border: 1px solid rgba(15,23,42,.18); background: #fff; color: #0f172a; }
      button.primary { background: var(--lvr-accent, #0d9488); border-color: var(--lvr-accent, #0d9488); color: #fff; }
      button:disabled { opacity: .5; cursor: default; }
      .bar { height: 6px; border-radius: 3px; background: rgba(15,23,42,.12); overflow: hidden; flex: 1; min-width: 120px; display: none; }
      .bar.on { display: block; }
      .bar i { display: block; height: 100%; width: 0%; background: var(--lvr-accent, #0d9488); transition: width .2s; }
      .msg { font-size: 13px; color: rgba(15,23,42,.62); }
      .msg.err { color: #b91c1c; }
      .done { display: none; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #047857; }
      .done.on { display: inline-flex; }
    </style>
    <div class="stage"><video playsinline muted></video>
      <span class="timer"><span class="dot"></span><span class="t">0:00</span></span>
    </div>
    <div class="row">
      <button type="button" class="primary" data-a="start">Record a video</button>
      <button type="button" data-a="upload-file">Upload a file</button>
      <button type="button" class="primary" data-a="record" hidden>Start recording</button>
      <button type="button" data-a="cancel" hidden>Cancel</button>
      <button type="button" data-a="stop" hidden>Stop</button>
      <button type="button" data-a="use" hidden class="primary">Use this video</button>
      <button type="button" data-a="retake" hidden>Retake</button>
      <button type="button" data-a="remove" hidden>Remove</button>
      <span class="done">Video attached</span>
      <div class="bar"><i></i></div>
      <span class="msg"></span>
      <input type="file" accept="video/*" hidden>
    </div>`;

  class LinkedVideoRecorder extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
      this._stream = null; this._rec = null; this._chunks = []; this._blob = null;
      this._timerId = null; this._t = 0;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this.$ = {
        stage: $('.stage'), video: $('video'), timer: $('.timer'), t: $('.t'),
        start: $('[data-a=start]'), record: $('[data-a=record]'), cancel: $('[data-a=cancel]'),
        stop: $('[data-a=stop]'), use: $('[data-a=use]'),
        retake: $('[data-a=retake]'), remove: $('[data-a=remove]'), uploadFile: $('[data-a=upload-file]'),
        file: $('input[type=file]'), bar: $('.bar'), fill: $('.bar i'), msg: $('.msg'), done: $('.done'),
      };
      this.$.start.addEventListener('click', () => this._startCamera());
      this.$.record.addEventListener('click', () => this._startRecording());
      this.$.cancel.addEventListener('click', () => this._reset(false));
      this.$.stop.addEventListener('click', () => this._stopRecording());
      this.$.use.addEventListener('click', () => this._upload(this._blob, 'recording.webm'));
      this.$.retake.addEventListener('click', () => this._startCamera());
      this.$.remove.addEventListener('click', () => this._reset(true));
      this.$.uploadFile.addEventListener('click', () => this.$.file.click());
      this.$.file.addEventListener('change', () => {
        if (this.$.file.files.length) {
          const f = this.$.file.files[0];
          this._showPlayback(URL.createObjectURL(f));
          this._upload(f, f.name);
        }
      });
    }

    get maxDuration() { return parseInt(this.getAttribute('max-duration') || '60', 10); }
    get apiBase() { return (this.getAttribute('api-base') || '').replace(/\/$/, ''); }

    disconnectedCallback() { this._teardown(); }

    _say(text, err) { this.$.msg.textContent = text || ''; this.$.msg.classList.toggle('err', !!err); }

    _buttons(visible) {
      for (const k of ['start', 'record', 'cancel', 'stop', 'use', 'retake', 'remove', 'uploadFile']) {
        this.$[k].hidden = !visible.includes(k);
      }
    }

    async _startCamera() {
      this._reset(false);
      this._buttons([]);
      this._say('Starting your camera…');
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch (e) {
        this._say('Could not access the camera. Check permission, or upload a file instead.', true);
        this._buttons(['start', 'uploadFile']);
        return;
      }
      const v = this.$.video;
      v.srcObject = this._stream; v.muted = true; v.controls = false; v.classList.add('mirror');
      this.$.stage.classList.add('on');
      await v.play().catch(() => {});
      // Ready: the person watches themselves; nothing records until they say so.
      this._buttons(['record', 'cancel']);
      this._say('Camera on. Start when you are ready.');
    }

    _startRecording() {
      if (!this._stream) return;
      this._chunks = [];
      const mime = (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
        ? 'video/webm;codecs=vp9' : 'video/webm';
      this._rec = new MediaRecorder(this._stream, { mimeType: mime });
      this._rec.ondataavailable = (e) => { if (e.data.size) this._chunks.push(e.data); };
      this._rec.onstop = () => {
        this._blob = new Blob(this._chunks, { type: 'video/webm' });
        if (this._stream) { this._stream.getTracks().forEach((t) => t.stop()); this._stream = null; }
        this._showPlayback(URL.createObjectURL(this._blob));
      };
      this._rec.start(1000);
      this._t = 0; this.$.t.textContent = '0:00'; this.$.timer.classList.add('on');
      this._timerId = setInterval(() => {
        this._t += 1;
        this.$.t.textContent = `${Math.floor(this._t / 60)}:${String(this._t % 60).padStart(2, '0')}`;
        if (this._t >= this.maxDuration) this._stopRecording();
      }, 1000);
      this._buttons(['stop']);
      this._say(`Recording. Up to ${this.maxDuration} seconds; stop any time.`);
    }

    _stopRecording() {
      if (this._timerId) { clearInterval(this._timerId); this._timerId = null; }
      this.$.timer.classList.remove('on');
      if (this._rec && this._rec.state === 'recording') this._rec.stop();
    }

    _showPlayback(url) {
      const v = this.$.video;
      v.srcObject = null; v.src = url; v.muted = false; v.controls = true;
      v.classList.remove('mirror');
      this.$.stage.classList.add('on');
      this._buttons(['use', 'retake']);
      this._say('Look right? Use it, or retake.');
    }

    _upload(blob, name) {
      if (!blob) return;
      if (!this.apiBase) { this._say('api-base attribute is missing.', true); return; }
      this._buttons([]);
      this.$.bar.classList.add('on'); this.$.fill.style.width = '0%';
      this._say('Uploading…');
      const fd = new FormData();
      fd.append('video', blob, name || 'recording.webm');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.apiBase}/api/video/upload`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) this.$.fill.style.width = `${Math.round(100 * e.loaded / e.total)}%`;
      };
      xhr.onload = () => {
        this.$.bar.classList.remove('on');
        let d = {};
        try { d = JSON.parse(xhr.responseText); } catch (e) { /* fall through */ }
        const url = d.videoUrl || d.url || '';
        if (xhr.status >= 200 && xhr.status < 300 && url) {
          this._say('');
          this.$.done.classList.add('on');
          this._buttons(['remove']);
          this.dispatchEvent(new CustomEvent('video-uploaded', {
            detail: { videoUrl: url }, bubbles: true, composed: true,
          }));
        } else {
          this._say('Upload failed. Try again, or continue without video.', true);
          this._buttons(['use', 'retake']);
        }
      };
      xhr.onerror = () => {
        this.$.bar.classList.remove('on');
        this._say('Upload failed. Try again, or continue without video.', true);
        this._buttons(['use', 'retake']);
      };
      xhr.send(fd);
    }

    _reset(emit) {
      this._teardown();
      this.$.stage.classList.remove('on');
      this.$.done.classList.remove('on');
      this.$.video.removeAttribute('src'); this.$.video.srcObject = null; this.$.video.controls = false;
      this._blob = null; this.$.file.value = '';
      this._buttons(['start', 'uploadFile']);
      this._say('');
      if (emit) this.dispatchEvent(new CustomEvent('video-removed', { detail: {}, bubbles: true, composed: true }));
    }

    _teardown() {
      if (this._timerId) { clearInterval(this._timerId); this._timerId = null; }
      if (this._rec && this._rec.state === 'recording') { try { this._rec.stop(); } catch (e) { /* already stopped */ } }
      if (this._stream) { this._stream.getTracks().forEach((t) => t.stop()); this._stream = null; }
    }
  }

  if (!customElements.get('linked-video-recorder')) {
    customElements.define('linked-video-recorder', LinkedVideoRecorder);
  }
})();
