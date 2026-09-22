/**
 * Wide image block.
 *
 * Authoring model (Document Authoring):
 *   Row 1 (two cells) → | desktop image | mobile image |
 *   Row 2 (one cell)  → | link URL      |
 *
 * The block renders a full-width image that swaps between the desktop and
 * mobile artwork via CSS, and — when a link is provided — wraps the image in
 * an anchor so clicking it navigates to the target page.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First row holds the desktop / mobile pictures (authors may omit a cell).
  const [imageRow, linkRow] = rows;
  const pictures = imageRow ? [...imageRow.querySelectorAll('picture')] : [];
  const [desktopPic, mobilePic] = pictures;

  if (desktopPic) {
    desktopPic.classList.add('wideimage-desktop');
  }
  if (mobilePic) {
    mobilePic.classList.add('wideimage-mobile');
  }

  // Resolve the link URL. Authors can provide it as a link or as plain text.
  let href = '';
  if (linkRow) {
    const anchor = linkRow.querySelector('a[href]');
    if (anchor) {
      href = anchor.href;
    } else {
      const text = linkRow.textContent.trim();
      if (text) href = text;
    }
  }

  // Rebuild the block with just the pictures so styling stays predictable.
  block.textContent = '';
  const media = document.createElement('div');
  media.className = 'wideimage-media';
  if (desktopPic) media.append(desktopPic);
  if (mobilePic) media.append(mobilePic);

  if (href) {
    const link = document.createElement('a');
    link.className = 'wideimage-link';
    link.href = href;
    // Open external links in a new tab.
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    } catch (e) {
      // Ignore malformed URLs; leave as a same-tab link.
    }
    link.append(media);
    block.append(link);
  } else {
    block.append(media);
  }
}
