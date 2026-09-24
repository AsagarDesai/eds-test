/**
 * Get in Touch block.
 *
 * A contact banner with a background image, an eyebrow label, a heading, two
 * information columns, and a configurable CTA (e.g. "Get Direction"). Every
 * piece of content comes from Document Authoring.
 *
 * Authoring model (rows, top to bottom):
 *   Row 1 → background image (a single picture)
 *   Row 2 → eyebrow label (short text, e.g. "Get in Touch")
 *   Row 3 → heading (e.g. "We'd love to hear from you")
 *   CTA row → | CTA name | CTA link | Redirect (true/false) |
 *       Identified by a cell whose text is exactly "true" or "false".
 *       Redirect true (default) opens the link in a new tab; false opens it
 *       in the same tab. The CTA renders under the first info column.
 *   Columns row → | left info column | right info column |
 *       Each column holds its own bold label and paragraph(s).
 */
function findBooleanCell(cells) {
  return cells.findIndex((cell) => {
    const t = cell.textContent.trim().toLowerCase();
    return t === 'true' || t === 'false';
  });
}

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

  // Remaining rows: a CTA config row and one or more info-column rows.
  let ctaConfig = null;
  const columnCells = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const boolIndex = findBooleanCell(cells);

    if (boolIndex !== -1) {
      // CTA row: | name | link | redirect (true/false) |
      const redirect = cells[boolIndex].textContent.trim().toLowerCase() === 'true';
      const otherCells = cells.filter((_, i) => i !== boolIndex);
      const linkEl = row.querySelector('a[href]');
      const nameCell = otherCells[0];
      // The name is the first non-boolean cell's text; the link is an authored
      // anchor if present, otherwise the remaining cell's text (a URL).
      const name = nameCell ? nameCell.textContent.trim() : '';
      let href = '';
      if (linkEl) {
        href = linkEl.getAttribute('href');
      } else if (otherCells[1]) {
        href = otherCells[1].textContent.trim();
      }
      ctaConfig = { name, href, redirect };
    } else {
      // Info columns row.
      cells.forEach((cell) => columnCells.push(cell));
    }
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

  // Build the CTA element (rendered under the first column below).
  let ctaEl = null;
  if (ctaConfig && ctaConfig.name && ctaConfig.href) {
    ctaEl = document.createElement('a');
    ctaEl.className = 'getintouch-cta';
    ctaEl.href = ctaConfig.href;
    ctaEl.textContent = ctaConfig.name;
    // Redirect flag controls the tab: true (default) → new tab, false → same.
    if (ctaConfig.redirect) {
      ctaEl.target = '_blank';
      ctaEl.rel = 'noopener noreferrer';
    }
  }

  if (columnCells.length) {
    const cols = document.createElement('div');
    cols.className = 'getintouch-columns';
    columnCells.forEach((cell, index) => {
      const col = document.createElement('div');
      col.className = 'getintouch-column';
      // Move the authored content into the column wrapper.
      while (cell.firstChild) col.append(cell.firstChild);
      // Place the CTA under the first column, matching the reference layout.
      if (index === 0 && ctaEl) {
        col.append(ctaEl);
      }
      cols.append(col);
    });
    content.append(cols);
  } else if (ctaEl) {
    // No columns authored — still render the CTA.
    content.append(ctaEl);
  }

  block.append(content);
}
