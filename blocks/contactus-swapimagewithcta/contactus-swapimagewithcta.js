/**
 * Contact Us - Swap Image with CTA block.
 *
 * An image beside a text panel (title, subtitle, CTA button). The image swaps
 * between authored desktop and mobile artwork via CSS. All content comes from
 * Document Authoring.
 *
 * Authoring model (rows, top to bottom):
 *   Row 1 (two cells) → | desktop image | mobile image |
 *   A row with only text (no link) → title first, then subtitle (in order)
 *   A row with a single link       → CTA button
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Row 1: desktop / mobile images.
  const imageRow = rows.shift();
  const imageCells = imageRow ? [...imageRow.children] : [];
  const desktopPic = imageCells[0] ? imageCells[0].querySelector('picture') : null;
  const mobilePic = imageCells[1] ? imageCells[1].querySelector('picture') : null;

  // Remaining rows: title, subtitle, CTA.
  let title = '';
  let subtitle = '';
  let cta = null;

  rows.forEach((row) => {
    const link = row.querySelector('a[href]');
    const text = row.textContent.trim();
    if (link) {
      cta = link;
    } else if (text && !title) {
      title = text;
    } else if (text) {
      subtitle = text;
    }
  });

  // --- Build the new structure --------------------------------------------
  block.textContent = '';

  // Media (image) side.
  const media = document.createElement('div');
  media.className = 'contactus-swapimagewithcta-media';
  if (desktopPic) {
    desktopPic.classList.add('contactus-swapimagewithcta-desktop');
    media.append(desktopPic);
  }
  if (mobilePic) {
    mobilePic.classList.add('contactus-swapimagewithcta-mobile');
    media.append(mobilePic);
  }

  // Text side.
  const textWrap = document.createElement('div');
  textWrap.className = 'contactus-swapimagewithcta-text';

  if (title) {
    const h = document.createElement('h2');
    h.className = 'contactus-swapimagewithcta-title';
    h.textContent = title;
    textWrap.append(h);
  }

  if (subtitle) {
    const p = document.createElement('p');
    p.className = 'contactus-swapimagewithcta-subtitle';
    p.textContent = subtitle;
    textWrap.append(p);
  }

  if (cta) {
    cta.classList.add('contactus-swapimagewithcta-cta');
    try {
      const url = new URL(cta.href, window.location.href);
      if (url.origin !== window.location.origin) {
        cta.target = '_blank';
        cta.rel = 'noopener noreferrer';
      }
    } catch (e) {
      // leave malformed hrefs as-is
    }
    const btnWrap = document.createElement('div');
    btnWrap.className = 'contactus-swapimagewithcta-button';
    btnWrap.append(cta);
    textWrap.append(btnWrap);
  }

  block.append(media, textWrap);
}
