/**
 * Parses markdown-style discharge summary text into sections and tables
 * so the Verified page can render proper HTML (tables, section headings).
 */

/**
 * @param {string} line
 * @returns {string[]}
 */
function parseTableRow(line) {
  const parts = line.split('|').map((p) => p.trim());
  if (parts.length && parts[0] === '') parts.shift();
  if (parts.length && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

/**
 * Detect and parse a pipe table (e.g. | Label | Value | \n |---|\n | A | B |).
 * @param {string} block
 * @returns {{ headers: string[], rows: string[][] } | null}
 */
function parsePipeTable(block) {
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const sep = /^\|[\s\-:|]+\|$/;
  let sepIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && sep.test(lines[i])) {
      sepIdx = i;
      break;
    }
  }
  if (sepIdx < 1) return null;
  const headerRow = parseTableRow(lines[sepIdx - 1]);
  const rows = [];
  for (let i = sepIdx + 1; i < lines.length; i++) {
    if (lines[i].includes('|')) rows.push(parseTableRow(lines[i]));
  }
  return { headers: headerRow, rows };
}

/**
 * @typedef {{ type: 'paragraph', title: string | null, content: string }} ParagraphSection
 * @typedef {{ type: 'table', title: string, headers: string[], rows: string[][] }} TableSection
 * @param {string} text
 * @returns {(ParagraphSection | TableSection)[]}
 */
export function parseDischargeSummaryText(text) {
  if (!text || !String(text).trim()) return [];
  const sections = [];
  const lines = String(text).split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      const title = headerMatch[1].trim();
      i++;
      const bodyLines = [];
      while (i < lines.length && !/^##\s+/.test(lines[i])) {
        bodyLines.push(lines[i]);
        i++;
      }
      const body = bodyLines.join('\n').trim();
      const table = parsePipeTable(body);
      if (table && (table.headers.length || table.rows.length)) {
        sections.push({
          type: 'table',
          title,
          headers: table.headers,
          rows: table.rows,
        });
      } else {
        sections.push({ type: 'paragraph', title, content: body });
      }
      continue;
    }
    const introLines = [];
    while (i < lines.length && !/^##\s+/.test(lines[i])) {
      introLines.push(lines[i]);
      i++;
    }
    const intro = introLines.join('\n').trim();
    if (intro) {
      const table = parsePipeTable(intro);
      if (table && (table.headers.length || table.rows.length)) {
        sections.push({
          type: 'table',
          title: null,
          headers: table.headers,
          rows: table.rows,
        });
      } else {
        sections.push({ type: 'paragraph', title: null, content: intro });
      }
    }
  }
  return sections;
}

/**
 * Extract body inner HTML from backend's full document (renderedHtml).
 * @param {string} fullHtml
 * @returns {string}
 */
export function extractBodyContent(fullHtml) {
  if (!fullHtml || typeof fullHtml !== 'string') return '';
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1].trim() : fullHtml;
}

/** Emoji for section titles (shared by Verified view and Doctor preview). */
export function getSectionEmoji(title) {
  if (!title || typeof title !== 'string') return '';
  const t = title.toLowerCase();
  if (t.includes('patient') && (t.includes('identif') || t.includes('detail'))) return '👤';
  if (t.includes('admission') || t.includes('discharge')) return '📅';
  if (t.includes('diagnosis')) return '🩺';
  if (t.includes('investigation') || t.includes('invest')) return '🔬';
  if (t.includes('treatment') || t.includes('medication')) return '💊';
  if (t.includes('procedure')) return '🏥';
  if (t.includes('advice') || t.includes('follow')) return '📌';
  if (t.includes('signature')) return '✍️';
  return '📄';
}
