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

function reset() {
  stop();
  fillMemory(0xFF);
  A = DP = IP = shadowIP = 0;
  IR = memory[shadowIP];
  showState();
}
function loadButton() {
  reset();
  load('#main-input', 0xFF);
  strobe(false);
}
function patchButton() {
  load('#patch-input', null);
}



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

function runStopButton() {
  if (running) {
    stop();
  } else {
    run();
  }
}
function run() {
  stopAtJump = false;
  running = true;
  d3.select('#run-stop').classed('running', running);
  // also starts
  //strobe(true);
  execute();
}
function stop() {
  stopAtJump = false;
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
}
function resetButton() {
  stop();
  reset();
}
function nextJumpButton() {
  stop();
  stopAtJump = true;
  jumpCleared = false;
  running = true;
  d3.select('#run-stop').classed('running', running);
  execute();
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

