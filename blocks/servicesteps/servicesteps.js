/**
 * Service Steps block.
 *
 * Authoring model (Document Authoring). The first row holds the logo with its
 * desktop and mobile variants; every following row is classified by what it
 * contains, so authors can reorder rows and add or remove steps freely.
 *
 *   Row 1 (two cells) → | desktop logo image | mobile logo image |
 *   A row with a link to an .mp4            → background video (authorable)
 *   A row with only text (no link, no image) → heading
 *   A row with a single link                 → CTA button (in author order)
 *   A row with an image AND text             → a step (icon + description)
 *
 * Renders a left container (logo + CTA buttons) and a right container
 * (heading + steps) over an authored background video.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // --- Row 1: logo (desktop | mobile) -------------------------------------
  const logoRow = rows.shift();
  const logoCells = logoRow ? [...logoRow.children] : [];
  const desktopLogo = logoCells[0] ? logoCells[0].querySelector('picture') : null;
  const mobileLogo = logoCells[1] ? logoCells[1].querySelector('picture') : null;

  // --- Classify remaining rows --------------------------------------------
  let heading = '';
  let videoSrc = '';
  const ctas = [];
  const steps = [];

  rows.forEach((row) => {
    const pic = row.querySelector('picture');
    const link = row.querySelector('a[href]');
    const text = row.textContent.trim();

    if (pic && text) {
      // image + text → a step (icon + description)
      steps.push({ pic, text });
    } else if (link && /\.mp4(\?|$)/i.test(link.href)) {
      // link to a video file → background video
      videoSrc = link.href;
    } else if (link) {
      // single link → CTA button
      ctas.push(link);
    } else if (text) {
      // text only → heading
      heading = text;
    }
  });

  // --- Build the new structure --------------------------------------------
  block.textContent = '';

  // Background video layer (authored). Falls back to the CSS gradient/color
  // when no video is provided.
  if (videoSrc) {
    const media = document.createElement('div');
    media.className = 'servicesteps-media';
    const video = document.createElement('video');
    video.className = 'servicesteps-video';
    video.src = videoSrc;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    media.append(video);
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'servicesteps-content';

  // Left: logo + CTA buttons
  const left = document.createElement('div');
  left.className = 'servicesteps-left';

  if (desktopLogo || mobileLogo) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'servicesteps-logo';
    if (desktopLogo) {
      desktopLogo.classList.add('servicesteps-logo-desktop');
      logoWrap.append(desktopLogo);
    }
    if (mobileLogo) {
      mobileLogo.classList.add('servicesteps-logo-mobile');
      logoWrap.append(mobileLogo);
    }
    left.append(logoWrap);
  }

  if (ctas.length) {
    const buttons = document.createElement('div');
    buttons.className = 'servicesteps-buttons';
    ctas.forEach((cta, i) => {
      // Downloadable links (PDFs / download attr) get the outlined + arrow-down
      // treatment; the first non-download CTA is the primary (yellow) button.
      const isDownload = cta.hasAttribute('download') || /\.pdf(\?|$)/i.test(cta.href);
      cta.classList.add('servicesteps-cta');
      if (isDownload) {
        cta.classList.add('servicesteps-cta-secondary', 'servicesteps-cta-download');
      } else {
        cta.classList.add(i === 0 ? 'servicesteps-cta-primary' : 'servicesteps-cta-secondary');
      }
      // Open external / download links in a new tab.
      try {
        const url = new URL(cta.href, window.location.href);
        if (url.origin !== window.location.origin) {
          cta.target = '_blank';
          cta.rel = 'noopener noreferrer';
        }
      } catch (e) {
        // leave malformed hrefs as-is
      }
      const wrap = document.createElement('div');
      wrap.className = 'servicesteps-button';
      wrap.append(cta);
      buttons.append(wrap);
    });
    left.append(buttons);
  }

  // Right: heading + steps
  const right = document.createElement('div');
  right.className = 'servicesteps-right';

  if (heading) {
    const h = document.createElement('div');
    h.className = 'servicesteps-heading';
    h.setAttribute('role', 'heading');
    h.setAttribute('aria-level', '2');
    h.textContent = heading;
    right.append(h);
  }

  if (steps.length) {
    const stepList = document.createElement('div');
    stepList.className = 'servicesteps-steps';
    steps.forEach(({ pic, text }, index) => {
      const step = document.createElement('div');
      step.className = 'servicesteps-step';
      step.setAttribute('role', 'figure');

      // Circular ring holding the icon, with a numbered badge on top.
      const ring = document.createElement('div');
      ring.className = 'servicesteps-step-ring';

      const badge = document.createElement('span');
      badge.className = 'servicesteps-step-number';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = index + 1;

      const icon = document.createElement('div');
      icon.className = 'servicesteps-step-icon';
      icon.append(pic);

      ring.append(badge, icon);

      const desc = document.createElement('div');
      desc.className = 'servicesteps-step-description';
      desc.textContent = text;

      step.append(ring, desc);
      stepList.append(step);
    });
    right.append(stepList);
  }

  content.append(left, right);
  block.append(content);
}
