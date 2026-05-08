/**
 * Slug generator that handles English + Hindi (Devanagari) text.
 *
 * Strategy:
 *   1. Transliterate Devanagari → Latin (e.g., "जयपुर" → "jaipur")
 *   2. Lowercase, replace spaces with hyphens
 *   3. Strip non-alphanumeric (except hyphen)
 *   4. Collapse multiple hyphens
 *   5. Trim hyphens, limit length (60 chars)
 *
 * Examples:
 *   "Jaipur News: BJP MLA on duty" → "jaipur-news-bjp-mla-on-duty"
 *   "जयपुर में बड़ा हादसा"          → "jaipur-mein-bada-hadsa"
 */

// Devanagari → Latin transliteration map (IAST-ish, simplified for URL use)
const DEVANAGARI_MAP = {
    // Vowels
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'अं': 'an', 'अः': 'ah',

    // Vowel signs (matras)
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ः': 'h', 'ँ': 'n',

    // Consonants
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',

    // Nukta variants (Urdu-influenced)
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',

    // Halant (suppresses inherent 'a')
    '्': '',

    // Numerals
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

const transliterate = (text) => {
    if (!text) return '';
    let out = '';
    for (const char of text) {
        if (DEVANAGARI_MAP[char] !== undefined) {
            out += DEVANAGARI_MAP[char];
        } else {
            out += char;
        }
    }
    return out;
};

export const slugify = (text, { maxLength = 60 } = {}) => {
    if (!text) return '';

    let slug = transliterate(String(text));

    slug = slug
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')      // strip combining marks
        .replace(/[^a-z0-9\s-]/g, ' ')         // keep only alphanumeric + space + hyphen
        .replace(/\s+/g, '-')                  // spaces → hyphen
        .replace(/-+/g, '-')                   // collapse multiple hyphens
        .replace(/^-+|-+$/g, '');              // trim leading/trailing hyphens

    if (slug.length > maxLength) {
        // Cut at word boundary
        slug = slug.slice(0, maxLength).replace(/-[^-]*$/, '');
    }

    // Fallback if everything got stripped (e.g., emoji-only title)
    if (!slug) slug = 'article';

    return slug;
};

/**
 * Make a slug unique by appending a short random suffix if needed.
 * Used in DB-write path: caller provides a "checkExists(slug)" callback.
 */
export const uniqueSlug = async (text, checkExists) => {
    const base = slugify(text);
    let slug = base;
    let attempt = 0;
    while (await checkExists(slug)) {
        attempt += 1;
        // Append 4-char random hex
        const suffix = Math.random().toString(16).slice(2, 6);
        slug = `${base}-${suffix}`;
        if (attempt > 5) break; // safety
    }
    return slug;
};
