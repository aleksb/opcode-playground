const upDownProgram = `# ===============
#   UP AND DOWN
# ===============


# Increment section
# -----------------

# Load our counter from location 80
20 80

# Display counter
5

# Add 1
94

# And store it in location 80 again
22 80

# Now we need to check if the counter = 11
# If so, don't display the number but continue

16 0B # 0B is 11 in decimal
71 -9 # Go back and do another increment otherwise


# Decrement section
# -----------------

# Load our counter from location 80
20 80

# Subtract 1 because it is originally at 11
96

# Display it
5

# Store it again
22 80

# Check if it is equal to 1
96
71 -8 #If not, do another decrement

# Move to the next line
# ---------------------

# Load and display ASCII newline character
10 0A
8

# Start over
7 0


# Variables
# ---------

# There is only one variable, the counter

# Variables are put at location 80
    i 80

# Counter variable - starts off as 1
1`;

const circleProgram = `# =================
#   DRAW A CIRCLE
# =================


# (use “blitz” and “turbo”)



# Background
# ==========

# This program is based on the following principle.
# This equation of a circle of radius r:
# x^2 + y^2 = r^2
#
# We will actually take two circles, and colour in
# pixels that lie between the inner and outer circle


# We will "draw" in the memory region
# 80-FF (second half of memory)

# Each cell corresponds to a particular pair of x,y
# co-ordinates. Since the hexdump has 16 columns and
# 8 rows, we will double the Y co-ordinate.

# Also, since there are an even number of pixels, we
# will skip X = 0 and Y = 0
# X co-ordinates get larger towards the right
# Y co-ordinates get larger as you go up
# So the top left corner is (-8, 8) and the bottom
# right corner is (8, -8)

# For example, here are memory addresses and their
# corresponding co-ordinates:
#
# 0x80 (-8, 8)
# 0x81 (-7, 8)
# 0x87 (-1, 8)
# 0x88 ( 1, 8)
# 0x8F ( 8, 8)
# 0x90 (-8, 7)
# 0xB7 (-1, 1)
# 0xC8 ( 1,-1)
#
# Note that there are never any 0s.

# Negative numbers are represented using 2’s complement
# convention.


# Algorithm Overview
# ==================

# Note, the variables are stored starting at 0x70
# See end of code for a list

# calculate X^2
# calculate Y^2
# add them together
# check if the answer is inside/outside the inner radius
# if inside, draw a space
# if outside, check the outer radius
# if inside, draw a square
# if outside, draw a space

# stop if we get outside the drawing area

# Add 1 to X
# If X = 0, add 1 to X
# If X > 8, set X to -8 and add 2 to Y
# If Y = 0, add 2 to Y
# (we add 2 to double the Y co-ordinate)
# repeat whole process for next "pixel"



# Code
# ====


# -------------------
# Calculate X^2 + Y^2
# -------------------

# Load X into A
20 70

# Multiply X by X
# (Repeat X times - add X to DP)
11 0
25 70
96
71 -4

# Store X*X in location 72
23 72

# Load Y into A
20 71

# Multiply Y by Y
# (Repeat Y times - add Y to DP)
11 0
25 71
96
71 -4

# Get Y*Y into A
2

# Add X*X to Y*Y
24 72


# -----------------------------------------
# Determine whether pixel is part of circle
# -----------------------------------------


# Compare it to inner radius^2
16 35

74 +5 # if below inner radius draw a space
10 20 # ASCII space
7 +7

# Otherwise compare it to outer radius^2
# (add difference between outer and inner)
16 15
74 -7 # if below inner radius draw a square
      # otherwise go back to draw space
10 FE # ASCII small square

# "draw" "pixel"
21 73 # get current location into DP
42 # put pixel

95 # set up next location for next time
23 73

# Halt program when DP wraps around to 0
2
70 7F



# --------------
# Update X and Y
# --------------

# Increase X
20 70
94

71 +2 # skip X=0
94    # skip X=0

# Store X back
22 70

16 9 # if X=9 then we need to move to next row
71 0 # otherwise next pixel

# Reset X to -8

10 F8
22 70

# Decrease Y by 2

20 71
96
96

71 +3 # skip Y=0
96    # skip Y=0
96

22 71 # store Y back
# ignore Y getting too large
# This is dealt with earlier
7 0



# ---------
# Variables
# ---------

h 70

F8 # X, initially -8
8  # Y, initially 8
0  # X_squared
80 # Initial pixel memory location

`;


function upDownDemoButton() {
  d3.select('#main-input').node().value = upDownProgram;
}
function circleDemoButton() {
  d3.select('#main-input').node().value = circleProgram;
}
