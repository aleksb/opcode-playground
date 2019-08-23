# Variables in Opcode Playground

There is very litle you can do with just two registers. The solution to
this is to select particular memory locations to hold certain values.
These are called variables.

Whenver you want to _do anything_ with the variables, you need to load
them into registers first, and once you are done, you need to write them
back to memory. While SETA loads a fixed value into A, LOADA allows a
variable to be loaded into A. STORA does the opposite.

There is also a LADDA instruction, which is a load-and-add.

The following program calculates triangular numbers (1+2+3+4+...). It
uses two variables. One is the current total, the other is the number
being added.

These variables are respectively at locations F0 and F1. Step through
the program a few times until everything is clear.

    # Load total into A
    20 F0

    # Add 2nd number to A
    24 F1
    # Display result
    5

    # Save total back to its memory location
    22 F0

    # Load 2nd number into A
    20 F1

    # Add 1 to A
    94

    # Save number back into its memory location
    22 F1

    # Start again
    7 0

    # ---------
    # Variables
    # ---------

    # We will store the variables starting at F0
        i F0

    0 # current total (initially 0)
    1 # number to add (initially 1)
