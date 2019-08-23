const memory = [];
function fillMemory(value) {
  for (let i = 0; i < 256; i++) {
    memory[i] = value;
  }
}

let IP = 0;
let shadowIP = 0;
let IR = 0;
let DP = 0;
let A  = 0;

let running = false;
let stopAtJump = false;
let jumpCleared = false;
let scheduled = null;
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

      const isJump = (IR & 0xF0) === 0x70 || IR === 0x7;

      if (stopAtJump) {
        if (isJump) {
          if (jumpCleared) {
            running = false;
            stopAtJump = false;
            showState();
            stop();
            return;
          }
        } else {
          jumpCleared = true;
        }
      }
      const jumpsSlower = (!stopAtJump || jumpCleared) &&
                          (jtick > itick || jskip < iskip);

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
