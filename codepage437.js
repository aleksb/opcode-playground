function codepage437(code, escape) {
  const d = (
      "\u00B7\u263A\u263B\u2665\u2666\u2663\u2660\u2022" +
      "\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C" +
      "\u25BA\u25C4\u2195\u203C\u00B6\u00A7\u25AC\u21A8" +
      "\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC" +
      " !\"#$%&'()*+,-./0123456789:;<=>?" +
      "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_" +
      "`abcdefghijklmnopqrstuvwxyz{|}~\u2302Ç" +
      "üéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáí" +
      "óúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬" +
      "├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπ" +
      "ΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u2190"
    ).substr(code, 1);
  if (escape) {
    return d.replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;');
  } else {
    return d;
  }
}
