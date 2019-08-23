# Opcode Playground


![Opcode Playground circuit board](https://aleksb.github.io/opcode-playground/circuit-board.svg "Opcode Playground circuit board")

### [Open Opcode Playground](https://aleksb.github.io/opcode-playground/)

## What’s an opcode?

Opcode is short for **op**eration **code**. It’s a number that tells a
computer processor what to do.

The only programming language that computers directly understand is
called **machine language**. And opcodes are the instructions in machine
language.

All other programming languages are either transformed into machine
language, or are carried out by existing programs which are in machine
language form. For example, programs written in C are usually
transformed into machine language, while programs written in Python are
usually carried out by the Python interpreter, which is in machine
language form.

The set of possible opcodes a processor can execute is called its
**instruction set**. There are only a few common instruction sets. Most
desktop PCs have processors with the same instruction set (sometimes
called AMD64 and sometimes x86\_64), which are made by both Intel and
AMD. Mobile devices often have processors that use the ARM instruction
set.


## What’s Opcode Playground?

Opcode Playground is a CPU simulator designed to teach you the concepts
of machine language and assembly language. Since machine code is the
fundamental language that all processors execute, it is useful to
understand the concepts even if you don’t know the specifics.

That’s why Opcode Playground is a simplified design chosen to have a
reasonably simple but representative instruction set.


## The Machine

The OpcodePlayground board is a mildly realistic circuit board with a
control chip (which decides what to do next) and an ALU (which
calculates things). Together these form a computer processor.

There are also some RAM chips (which store data), and some LEDs which
display, in binary, the content of the 4 registers.


## The Registers

A register is a special memory unit which has a special function. The
registers are inside the Control unit, but their values are displayed
via the LEDs. Each register has a different purpose in the
OpcodePlayground processor.

**IR** is the instruction register. It holds the currently executing
instruction. This literally controls what will happen next in the
processor. For instance, an “add” instruction will mean that the next
thing that happens is two numbers getting added together.

**IP** is the instruction pointer. In a processor, instructions are
stored in memory (RAM or ROM) in a sequence and the instruction pointer
keeps track of which one the processor is up to. So, IP contains the
memory address of the currently executing instruction.

**A** is the _accumulator_ register. It’s the main register that your
program uses for calculations.

**DP** is the data pointer. This is an extra register that is often used
to store a memory address that you might need.


## The Instructions

Like all CPUs, instructions are given numerical codes. The wires and
gates inside a CPU switch on and switch off various circuits based on
these codes, which is how instructions make the right thing happen.

The simplest instruction is 00, or BEL. Early computers had actual bells
that the program could ring to get the attention of the user. In our
case, this instruction plays a sound on the board’s buzzer.

Another simple instruction is 02, or SWAP. This exchanges the contents
of A and DP. For example, if A was 6 and DP was 1, then A becomes 1 and
DP becomes 6.

Some instructions take an **argument**, that is, they are followed by a
second number that they do something with. For example, the 10
instruction (or SETA) is followed by a second number, which is what will
be put into A. Thus, 10 15 will place 15 into the A register.

Some arguments are treated like ordinary numbers. Others are treated as
memory locations. For example, 20 15 will not put 15 into the A
register, but rather, it will look up what is at memory location 15 and
put _that_ into the A register.

By convention, arguments that are treated like numbers are represented
using () and arguments that are treated like memory locations (or
addresses) are represented using [].


## Hexadecimal

Almost all numbers in the simulator will be in hexadecimal. Do some
reading about it if you aren’t sure what that means! However, if you
follow the examples you don’t need to be super confident with hex.


## Loading syntax

The code window has a special syntax for writing your instructions. All
instructions must be written using numbers. (Sorry, I’m not going to add
assembly language to the loader! It’ll toughen you up! Besides, the
opcodes in this instruction set are easy to learn.)

All you need to do is write numbers in hex. You can put several on one
line if you put spaces between them. When you click “load”, these
numbers will be put into RAM starting at address 0.

Anything starting with a `#` will be ignored (i.e. it’s a comment.)

There are three special features.

* If you write h followed by a number, for instance “h 80”, then from
  that point forward, the numbers will be stored starting from address
  80.
* You can use “i” instead of “h” to load integers in decimal rather than
  hex. You may want to use this to give some input numbers to your
  programs in decimal.
* If you write + or - before a number, it will become a _relative
  address_, that is, it will turn into the memory address of the spot in
  memory the loader is up to, plus or minus the value you put.

  For instance, if you write “7 -1”, you create an infinite loop, since
  you have a JUMP instruction, followed by the address of that same jump
  instruction. _Relative references are always in decimal._


## Getting started

### Open the [Opcode Playground](https://aleksb.github.io/opcode-playground/)

Don’t be afraid of the long list of instructions. You don’t need to use
them all.

Type in this program:

    10 A0
    0
    10 70
    0

Hit `Load` to load it into memory, and set the instruction speed to
medium. then hit `Run` to go through it. 

You should hear two tones. This program works by putting the hex value
A0 (160) into the A register, then executing the BEL instruction to play
the tone. Afterwards, the hex value 70 (112) is placed into the A
register, then again executing the BEL instruction.

Look up `10` and `0` in the instruction table. `A0` and `70` are not
actually opcodes, but they are additional data for the `10` opcodes.

Hit `Load` again, and use the `Step` instruction to go through the
program one step at a time. Watch the A register and the IP register as
you do this.

Now try this program:


    11 80
    40
    08
    95
    7 -4


    # data section
    i 80

    # Hello World in ASCII
    72 101 108 108 111 32 87 111 114 108 100 10

You will see a message come up in the output window. Keep it running,
however, and you will see garbage coming out. We have an infinite loop
because the program keeps jumping back from the `7 -4` to the `40`.

Forever.

Let’s fix it.

First off, let’s understand what happens. The first instruction loads
the number `80` (hex) into the DP (data pointer) register—because it
points to the data we are about to use. If you look further down, you
will see that the data has been loaded starting at that address.

Next, we use the `GET` instruction to load the value `DP` is referencing
into `A`. So, that would be 72 (decimal) which is the letter ‘H’ in
ASCII.

Then we use the `CHAR` instruction to write this in the output window.

Then we increment DP so that next time around we will work with the
letter ‘e’.

Finally we `JUMP` back to the `GET` instruction and do it all over again.

The problem is that the `JUMP` will keep happening forever. What we need
to do is to do something else once we have processed all the characters
in the message. We can use the conditional jump (70-75) instructions to
do this. Have a look at them and see if you can think of a solution.

The simplest solution is to do this. I won’t tell you how it works; read
through it and try to figure it out. If you’re not sure, run it and
then stop just before the end, and start stepping through carefully.

    11 80
    40
    70 +5
    08
    95
    7 -6


    # data section
    i 80

    # Hello World in ASCII
    72 101 108 108 111 32 87 111 114 108 100 10
    0

You can click the “demo” buttons to see some well-commented examples.
But remember that the way to learn isn’t by studying examples, but by
diving into the deep end and beating you head against challenges until
you have those a-ha! moments.

Some challenge ideas are below.

## More details

* What to do when you need more registers?
  [Use variables.](variables.md)

* 255’s the limit! [Two’s complement](twos-complement.md) in
  Opcode Playground.

* Don’t repeat yourself. [Using subroutines](subroutines.md) in
  Opcode Playground.


## Challenges

I’ll expand this list soon, but here are some initial ideas.

* Multiply the numbers at locations 80 and 81
* Output a list of Fibonacci numbers
* Find the sum of the numbers in memory range from 80 to 88
* Find the largest number in memory range from 80 to 9F
* Output a cross made of #s, 20 characters high and 30 characters wide
* Find the GCD of two numbers
* Print out all 256 characters supported by the board (some of the
  non-printable characters will come out as non-standard characters
  based on those used by the IBM PC!)

Higher difficulty:

* Convert an ASCII string to upper case.
* Find the longest increasing subsequence with a sequence
  (E.g. in the sequence 1 7 8 9 4 5 6 1 2 4 8 9, the LIS is 1 2 4 8 9)
* Do find-and-replace on a piece of text
* Generate random words (given a random seed value)
* Evaluate ASCII expressions like (5+2)\*3-9

Super-challenges:

* Simulate Conway’s Game of Life
* Calculate square roots (I have managed to do this to 9 figures—with
  great difficulty)
