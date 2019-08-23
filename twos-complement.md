# Two’s complement in Opcode Playground

Every number in Opcode Playground is an 8-bit binary number (known as a
byte). These can only hold values between 0 and 255.

They wrap around. If you add 1 to 255, you get 0. If you add 3 to 255,
you get 2. If you subtract 1 from 0, you get 255. And so on.

Here’s the interesting thing. If you add 1 to 255, you get 0. If you add
2 to 254, you get 0. If you add 3 to 253, you get 0.

So in some sense, 255 is “equivalent” to -1, 254 is “equivalent” to -2,
and 253 is “equivalent” to -3. This is the idea behind a system known as
two’s complement.

When you add -1 to -1, you expect to get -2. And as you may guess, 255 +
255 will wrap around to 254!

When you are using two’s complement, it’s conventional to treat 0 to 127
as positive and 128 to 255 (AKA -128 to -1) as negative. A good rule of
thumb is that if your numbers are always between -100 and 100, you won’t
have any problems.

The NEG instruction and JP and JZP instructions are based on the two’s
complement system. They are very useful when it comes to seeing if one
number is less than/greater than another (which is important in many
programs).

The following program is a modification of the one in the
[variables](variables.md) page but actually stops once it gets above
100.

    # ---------------
    #     new bit
    # ---------------

    # Load total into A
    20 F0

    16 64 # subtract decimal 100

    # if the result is >0, that means total >100
    75 FF # jump to an FF byte which will end the program

    # ----------------
    #   original bit
    # ----------------

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

It does show one number above 100. This can be fixed but I wanted to
keep the changes to the previous program small.
