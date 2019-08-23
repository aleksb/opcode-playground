# Using subroutines in Opcode Playground


At first glance it may seem that creating a subroutine that can be
called from multiple places is impossible. Jumps can only go to the same
place, and there’s no other way to change control flow, so how does a
subroutine return to its caller?

Well, it may not be particularly pretty or flexible, but it’s possible.
You may want to go and try to figure it out yourself.

But if you really want to know...

There’s no reason that instructions can’t modify other instructions.
That’s called self-modifying code and used to be frequently used in the
8-bit era to cram more functionality into limited space.

So, the trick here is to figure out where you want a subroutine to go
back to, and write this into the jump instruction at the end of the
subroutine. Here’s an example.

    # stuff happens
    # now I need to call a subroutine

    10 +5
    22 4F # <--- depends on where and how long the subroutine is
    7 40

    0 # whatever next instruction you want. The +5 refers to this.

    # more stuff happens
    # I need to call the subroutine again

    10 +5
    22 4F # <--- depends on where and how long the subroutine is
    7 40

    0 # whatever next instruction you want. The +5 refers to this.


    # Suppose the subroutine goes from address 40 to 4F
    h 40

    # code code code
    # more code

    7 AA # doesn’t matter what you put for AA. It gets overwritten.

    # Assuming the address of the AA is 4F, that’s what you put
    # every time you want to call the subroutine
