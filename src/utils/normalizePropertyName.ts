/**
 * normalizePropertyName.ts
 *
 * Elimina sufijos de habitaciones (XBR, XB, X Bedroom, etc.) y de huéspedes
 * (Xpax) de los nombres de propiedades para mejorar la consistencia visual.
 *
 * Patrones eliminados:
 *   • (4BR), (5B), (4 Bedroom)          → entre paréntesis, donde sea en el string
 *   • 4BR, 4B, 4 BR, 4-Bedroom         → con espacio antes
 *   • -9BR, " - 8 BR", " - 14BR"       → con guión antes
 *   • Palmiers10BR, Oiseaux3B           → pegado a letra (sin espacio)
 *   • 8pax, 12pax, (6Pax), - 14pax     → cantidad de huéspedes
 *   • Todo el texto que sigue al sufijo → "6BR, TC", "5BR at TC", "3BR - PH"
 */
export function normalizePropertyName(name: string): string {
  let n = name.trim();

  // Paso 1 — Remover (XBR) / (XB) / (X Bedroom/s) entre paréntesis, donde sea
  n = n.replace(/\s*\(\s*\d+\s*b(?:edrooms?|r)?\s*\)/gi, '');

  // Paso 2 — Remover Xpax con cualquier separador o paréntesis
  n = n.replace(/[\s\-–_]*\(?\s*\d+\s*pax\s*\)?/gi, '');

  // Paso 3 — Remover sufijo BR/B/Bedroom + todo lo que le sigue hasta el final
  //
  // Tres variantes de separador antes del número:
  //   (A) guión explícito:  " - 9BR", "-4BR", " -9BR"  → [\s]*[\-–]\s*\d+...
  //   (B) espacio:          " 4BR", " 4 BR", " 4-Bedroom"  → \s+\d+...
  //   (C) pegado a letra:   "Palmiers10BR", "Dreams4BR"  → lookbehind letra + \d+...
  //
  // El .* al final elimina cualquier texto posterior: "at TC", ", TC", "- PH", etc.
  n = n.replace(
    /(?:[\s]*[\-–_]\s*\d+\s*b(?:edrooms?|r)?|\s+\d+\s*[\-–]?\s*b(?:edrooms?|r)?|(?<=[a-zA-ZÀ-ÖØ-öø-ÿ])\d+\s*b(?:edrooms?|r)?).*$/gi,
    ''
  );

  // Paso 4 — Limpiar separadores sobrantes al final (" -", ",", "_", etc.)
  n = n.replace(/[\s,\-–_/]+$/, '');

  return n.trim();
}