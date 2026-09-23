/**
 * Get in Touch block.
 *
 * A contact banner with a background image, an eyebrow label, a heading, and
 * two information columns (e.g. Head Office and Helpline). Every piece of
 * content comes from Document Authoring so authors can edit it freely.
 *
 * Authoring model (rows, top to bottom):
 *   Row 1 → background image (a single picture)
 *   Row 2 → eyebrow label (short text, e.g. "Get in Touch")
 *   Row 3 → heading (e.g. "We'd love to hear from you")
 *   Row 4 → two cells: | left info column | right info column |
 *           Each column holds its own bold label, paragraph(s) and an
 *           optional link (rendered as an underlined CTA).
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Row 1: background image.
  const bgRow = rows.shift();
  const bgPic = bgRow ? bgRow.querySelector('picture') : null;

  // Row 2: eyebrow. Row 3: heading. (Both plain text.)
  const eyebrowRow = rows.shift();
  const headingRow = rows.shift();
  const eyebrow = eyebrowRow ? eyebrowRow.textContent.trim() : '';
  const heading = headingRow ? headingRow.textContent.trim() : '';

  // Row 4 (and any following): info columns.
  const columnCells = [];
  rows.forEach((row) => {
    [...row.children].forEach((cell) => columnCells.push(cell));
  });

  // --- Build the new structure --------------------------------------------
  block.textContent = '';

  // Background image layer.
  if (bgPic) {
    const media = document.createElement('div');
    media.className = 'getintouch-media';
    media.append(bgPic);
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'getintouch-content';

  if (eyebrow) {
    const eb = document.createElement('p');
    eb.className = 'getintouch-eyebrow';
    eb.textContent = eyebrow;
    content.append(eb);
  }

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'getintouch-heading';
    h.textContent = heading;
    content.append(h);
  }

  if (columnCells.length) {
    const cols = document.createElement('div');
    cols.className = 'getintouch-columns';
    columnCells.forEach((cell) => {
      const col = document.createElement('div');
      col.className = 'getintouch-column';
      // Style any authored link as an underlined CTA.
      cell.querySelectorAll('a[href]').forEach((a) => {
        a.classList.add('getintouch-cta');
        try {
          const url = new URL(a.href, window.location.href);
          if (url.origin !== window.location.origin) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
        } catch (e) {
          // leave malformed hrefs as-is
        }
      });
      // Move the authored content into the column wrapper.
      while (cell.firstChild) col.append(cell.firstChild);
      cols.append(col);
    });
    content.append(cols);
  }

  block.append(content);
}
