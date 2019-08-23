const output = [""];


const real = new Float32Array(6);
const imag = new Float32Array(6);
const ac = new AudioContext();
const osc = ac.createOscillator();

// square wave approximation
// (slightly softened)
real[1] = 1;
real[3] = 1/3;
real[5] = 1/5;
real[7] = 1/7;


function boop(i) {
  const wave = ac.createPeriodicWave(real, imag, {disableNormalization: true});
  const context = new AudioContext()
  const o = context.createOscillator()
  const g = context.createGain()
  g.connect(context.destination)
  g.gain.setValueAtTime(0, 0);
  g.gain.linearRampToValueAtTime(0.3, 0.0002);
  g.gain.linearRampToValueAtTime(0.3, 0.15);
  g.gain.linearRampToValueAtTime(0.0, 0.1502);
  o.connect(g)
  o.frequency.value = 0.03038194444 * i * i - 2.1875 * i + 161.875
  o.setPeriodicWave(wave);
  o.start(0)
  o.stop(1)
}

document.querySelector('[name=ispeed]').oninput = setISpeed;
document.querySelector('[name=jspeed]').oninput = setJSpeed;


const ISPEEDS = ["plod", "slow", "medium", "fast", "max<br>(without skipping)",
                "turbo", "ludicrous", "blitz"];
const ITICKS = [1200, 500, 250, 60, 0, 0, 0, -40];
const ISKIPS = [0, 0, 0, 0, 0, 10, 100, 0];

const JSPEEDS = ["sleep on it", "double check", "quick",
                "max<br>(without skipping)", "turbo", "blitz"];
const JTICKS = [3000, 1200, 300, 0, 0, -40];
const JSKIPS = [0, 0, 0, 0, 5, 30, 0];

let itick;
let iskip;
let jtick;
let jskip;

function setISpeed() {
  const value = document.querySelector('[name=ispeed]').value;
  document.querySelector('#ispeed').innerHTML = ISPEEDS[value];

  itick = ITICKS[parseInt(value)];
  iskip = ISKIPS[parseInt(value)];
}
function setJSpeed() {
  const value = document.querySelector('[name=jspeed]').value;
  document.querySelector('#jspeed').innerHTML = JSPEEDS[value];
  jtick = JTICKS[parseInt(value)];
  jskip = JSKIPS[parseInt(value)];
}
setISpeed();
setJSpeed();


const outputWindow = d3.select('#output');
let ipLED, irLED, dpLED, accLED;
window.addEventListener("load", function(e) {


  ipLED  = updateable('#ip');
  irLED  = updateable('#ir');
  dpLED  = updateable('#dp');
  accLED = updateable('#acc');

  reset();
});




function updateable(id) {

  const svg = d3.select(d3.select('embed').node().getSVGDocument());

  const leds = svg.select(id).selectAll('g');

  const hideables = leds.nodes().map(function(led) {
    const es = d3.select(led).selectAll('ellipse').nodes();
    const ps = d3.select(led).selectAll('path').nodes();
    return [es[2], es[3], ps[ps.length - 1]].map(d3.select);
  });
  const tweaks = [];
  for (let i = 0; i < 8; i++) {
    tweaks.push([Math.random() * 0.25, 1 - Math.random() * 0.25]);
  }
  return {
    lights: function(opacities) {
      for (let i = 0; i < 8; i++) {
        hideables[i].map(function(hideable) {
          hideable.attr('opacity', opacities[i]);
        });
      }
    },
    tweaks: tweaks,
    set: function(val) {
      let lights = [];
      for (let i = 0; i < 8; i++) {
        lights.push(this.tweaks[i][(val & (1<<(7-i)))?1:0]);
      }
      this.lights(lights);
    },
  };
}

const memory = [];
function fillMemory(value) {
  for (let i = 0; i < 256; i++) {
    memory[i] = value;
  }
}
function reset() {
  stop();
  fillMemory(0xFF);
  A = DP = IP = shadowIP = 0;
  IR = memory[shadowIP];
  showState();
}
function loadButton() {
  reset();
  load('#main-input');
  strobe(false);
}



let IP = 0;
let shadowIP = 0;
let IR = 0;
let DP = 0;
let A  = 0;

function hexByte(n) {
  const s = n.toString(16);
  return (s.length > 1? '' : '0') + s;
}

function memDump() {
  let s = '';
  s += 'A:  ' + hexByte(A);
  s += '   IP: ' + hexByte(IP) + '\n';
  s += 'DP: ' + hexByte(DP);
  s += '   IR: ' + hexByte(IR) + '\n\n';
  for (let row = 0; row < 16; row++) {
    const rowHex = row.toString(16).toUpperCase();
    s += rowHex + '0 - ' + rowHex + 'F    ';
    for (let col = 0; col < 16; col++) {
      const addr = col + row * 16;
      const b = memory[addr];
      if (addr === IP) {
        s += '<span style="color: black; background-color: white;">';
      }
      s += hexByte(b).toUpperCase();
      if (addr === IP) {
        s += '</span>';
      }
      s += ' ';
      if (col === 7) {
        s += ' ';
      }
    }
    s += ' \u2502';

    for (let col = 0; col < 16; col++) {
      const addr = col + row * 16;
      const b = memory[addr];
      s += codepage437(b, true);
    }
    s += '\u2502\n';
  }
  document.querySelector('#memory').innerHTML = s;
}

let running = false;
let scheduled = null;
function runStopButton() {
  if (running) {
    stop();
  } else {
    run();
  }
}
function run() {
  running = true;
  d3.select('#run-stop').classed('running', running);
  // also starts
  //strobe(true);
  execute();
}
function stop() {
  running = false;
  d3.select('#run-stop').classed('running', running);
  if (scheduled !== null) {
    clearTimeout(scheduled);
    scheduled = null;
  }
}
function stepButton() {
  stop();
  execute();
  clearTimeout(scheduled);
}
function resetButton() {
  stop();
  reset();
}
function strobe(run) {
  IP = shadowIP = IR = DP = A = 0;
  let strobe = 1;
  function _() {
    if (strobe === 0) {
      if (run) {
        execute();
      } else {
        IR = memory[shadowIP];
        showState();
      }
      return;
    }
    ipLED.set(strobe);
    irLED.set(strobe);
    dpLED.set(strobe);
    accLED.set(strobe);
    if (strobe === 128) {
      strobe = 255;
      setTimeout(_, 90);
    } else if (strobe === 255) {
      strobe = 0;
      setTimeout(_, 1100);
    } else {
      strobe *= 2;
      setTimeout(_, 90);
    }
  }
  _();
}

function getArg() {
  if (IP === shadowIP) {
    IP++;
    return true;
  }
  arg = memory[IP];
}

function step() {
  if (IR === 0x0) {
    boop(A);
  } else if (IR === 0x1) {
    // NOP
  } else if (IR === 0x2) {
    const temp = A;
    A = DP;
    DP = temp;
  } else if (IR === 0x5) {
    output[output.length - 1] += A + ' ';
    updateOutput();
  } else if (IR === 0x6) {
    output[output.length - 1] += A.toString(16);
    updateOutput();
  } else if (IR === 0x8) {

    if (A === 0x0A) {
      output.push([""]);
    } else if (A === 0x08) {
      if (output[output.length - 1].length) {
        output[output.length - 1] = output[output.length - 1].slice(0, -1);
      }
    } else {
      output[output.length - 1] += codepage437(A, true);
    }
    updateOutput();

  } else if (IR === 0x9) {
    A = 256 - A;
  } else if (IR === 0x10) {
    if (getArg()) return;
    A = arg;
  } else if (IR === 0x11) {
    if (getArg()) return;
    DP = arg;
  } else if (IR === 0x14) {
    if (getArg()) return;
    A += arg;
  } else if (IR === 0x15) {
    if (getArg()) return;
    DP += arg;
  } else if (IR === 0x16) {
    if (getArg()) return;
    A -= arg;
  } else if (IR === 0x17) {
    if (getArg()) return;
    DP -= arg;
  } else if (IR === 0x20) {
    if (getArg()) return;
    A = memory[arg];
  } else if (IR === 0x21) {
    if (getArg()) return;
    DP = memory[arg];
  } else if (IR === 0x22) {
    if (getArg()) return;
    memory[arg] = A;
  } else if (IR === 0x23) {
    if (getArg()) return;
    memory[arg] = DP;
  } else if (IR === 0x24) {
    if (getArg()) return;
    A += memory[arg];
  } else if (IR === 0x25) {
    if (getArg()) return;
    DP += memory[arg];
  } else if (IR === 0x26) {
    if (getArg()) return;
    A -= memory[arg];
  } else if (IR === 0x27) {
    if (getArg()) return;
    DP -= memory[arg];
  } else if (IR === 0x40) {
    A = memory[DP];
  } else if (IR === 0x42) {
    memory[DP] = A;
  } else if (IR === 0x44) {
    A += memory[DP];
  } else if (IR === 0x46) {
    A -= memory[DP];
  } else if (IR === 0x7) {
    if (getArg()) return;
    IP = arg - 1;
  } else if (IR === 0x70) {
    if (getArg()) return;
    if (A === 0) {
      IP = arg - 1;
    }
  } else if (IR === 0x71) {
    if (getArg()) return;
    if (A !== 0) {
      IP = arg - 1;
    }
  } else if (IR === 0x74) {
    if (getArg()) return;
    if (0 <= A && A < 128) {
      IP = arg - 1;
    }
  } else if (IR === 0x75) {
    if (getArg()) return;
    if (1 <= A && A < 128) {
      IP = arg - 1;
    }
  } else if (IR === 0x94) {
    A++;
  } else if (IR === 0x95) {
    DP++;
  } else if (IR === 0x96) {
    A--;
  } else if (IR === 0x97) {
    DP--;
  } else {
    stop();
    throw "NOP";
  }

  A  = A & 255;
  DP = DP & 255;

  IP = (IP + 1) & 255;
  shadowIP = IP;
}
let runTill = 0;
let ictr = 0;
let jctr = 0;
// FIXME this can be optimised to not go so indirectly
function execute() {

  scheduled = null;

  IR = memory[shadowIP];

  try {
    if (!running) {
      step();
      showState();
      return;
    }

    // use a loop instead of recursion to stop deep recursion
    while (true) {
      IR = memory[shadowIP];

      const jumpsSlower = jtick > itick || jskip < iskip;
      const isJump = (IR & 0xF0) === 0x70 || IR === 0x7;
      if (jumpsSlower && (isJump && IP === shadowIP)) {

        ictr = iskip; // reset instruction counter since we showed mem
        if (itick < 0) {
          runTill = new Date().getTime() - itick;
        }

        if (jtick < 0) {
          if (runTill < new Date().getTime()) {
            step();
            showState();
            runTill = new Date().getTime() - jtick;
            scheduled = setTimeout(execute, 0);
          } else {
            step();
            continue; //execute();
          }
        } else if (jtick > 0) {
          step();
          showState();
          scheduled = setTimeout(execute, jtick);
        } else {
          // would be nice to put a loop here but we may end up
          // going to a non-jump instruction
          if (jctr === 0) {
            jctr = jskip;
            step();
            showState();
            scheduled = setTimeout(execute, 0);
          } else {
            step();
            jctr--;
            continue; //execute();
          }
        }
      } else {
        if (itick < 0) {
          if (runTill < new Date().getTime()) {
            step();
            showState();
            runTill = new Date().getTime() - itick;
            scheduled = setTimeout(execute, 0);
          } else {
            step();
            continue; //execute();
          }
        } else if (itick > 0) {
          step();
          showState();
          scheduled = setTimeout(execute, itick);
        } else {
          // would be nice to put a loop here but we may end up
          // going to a jump instruction
          if (ictr === 0) {
            ictr = iskip; // reset instruction counter since we showed mem
            step();
            showState();
            scheduled = setTimeout(execute, 0);
          } else {
            step();
            ictr--;
            continue; //execute();
          }
        }
      }

      break;
    }
  } catch (err) {
    if (err !== "NOP") {
      throw err;
    }
    showState();
  }
}
function showState() {
  IR = memory[shadowIP];
  ipLED.set(IP);
  irLED.set(IR);
  dpLED.set(DP);
  accLED.set(A);
  memDump();
}
function updateOutput() {
  outputWindow.node().innerHTML =
    "<div>" + output.join("</div><div>") + "</div>";
}
