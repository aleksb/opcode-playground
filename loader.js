function load(id, clearValue) {
  if (clearValue === 0 || clearValue) {
    fillMemory(clearValue);
  }
  const input = d3.select(id).node().value;
  const noComments = input.replace(/#.*$/gm, '').trim();
  const tokens = noComments.split(/\s+/);
  if (tokens.length === 1 && tokens[0] === '') {
    return;
  }
  let mode = 'h';
  let pos = 0;
  try {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].toLowerCase();
      const first = '' + token[0];

      if (['i', 'h',].indexOf(first) !== -1) {
        mode = first;
        let addr;
        if (token.length !== 1) {
          addr = token.substr(1);
        } else {
          i++;
          if (i >= tokens.length) {
            throw 'unexpected end-of-input';
          }
          addr = tokens[i];
        }
        if (! /^[0-9A-Fa-f]+$/.test(addr)) {
          throw "invalid address after " + first + ": '" + addr + "'";
        }
        pos = parseInt(addr, 16);
      } else if (first === '+' || first === '-') {
        if (! /^.\d+$/.test(token)) {
          throw "invalid relative reference '" + token + "'";
        }
        const rel = parseInt(token);
        if (rel <= -256 || rel >= 256) {
          throw "relative reference '" + token + "' out of bounds";
        }
        const val = (pos + rel);
        memory[pos] = val;
        pos++;
        if (pos === 256) {
          pos = 0;
        }
      } else if (first === '#') {
        if (! /^.\d+$/.test(token)) {
          throw "invalid decimal '" + token + "'";
        }
        const val = parseInt(token.slice(1));
        if (val >= 256) { // we already know it isn't negative
          throw "value '" + token + "' out of bounds";
        }
        memory[pos] = val;
        pos++;
        if (pos === 256) {
          pos = 0;
        }
      } else {
        let val;
        if (mode === 'i') {
          if (! /^\d+$/.test(token)) {
            throw "invalid decimal value '" + token + "'";
          }
          val = parseInt(token);
        } else /*if (mode === 'h')*/ {
          if (! /^[0-9A-Fa-f]+$/.test(token)) {
            throw "invalid hex value '" + token + "'";
          }
          val = parseInt(token, 16);
        }
        if (val >= 256) { // we already know it isn't negative
          throw "value '" + token + "' out of bounds";
        }
        memory[pos] = val;
        pos++;
        if (pos === 256) {
          pos = 0;
        }
      }
    }
  } catch (e) {
    alert(e);
  }
  IR = memory[shadowIP];
  showState();
}
