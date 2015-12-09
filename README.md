# platformGame
A platform game from http://eloquentjavascript.net chapter 15, based off the platform game Dark Blue (http://www.lessmilk.com/games/10/)

There are two display modes: DOMDisplay, and CanvasDisplay. Each uses pretty widely varying methods for displaying the levels and the actors.

DOMDisplay uses a table element to draw the background and absolutely positioned divs for the actors.

CanvasDisplay draws everything onto a single canvas element, animating based off of the actor and player's behavior.

As of right now, there's not a way to switch between them besides specifying in index.html which one to use in the `runGame()` function.
