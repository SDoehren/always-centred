# Always Centred

[![Github all releases](https://img.shields.io/github/downloads/sdoehren/always-centred/total.svg)](https://GitHub.com/sdoehren/always-centred/releases/)
[![GitHub issues](https://img.shields.io/github/issues/sdoehren/always-centred.svg)](https://GitHub.com/sdoehren/always-centred/issues/)
[![GitHub release](https://img.shields.io/github/release/sdoehren/always-centred.svg)](https://GitHub.com/sdoehren/always-centred/releases/)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/sdoehren)

Always Centred continuously centres and zooms the view on player owned characters or the currently selected token.


## Instructions
Set "Mode" to Player Characters or Selected Token, the rest should be automatic.

## Settings

- Mode: (default: Disabled)  
Disabled: Module off  
Player Characters: Will zoom and centre to include all **player owned** tokens.  
Selected Token:  Will zoom and centre to include only the selected token.  

"Selected Token" can work when multiple tokens are selected but it will only focus on one at a time and may lead to the camera bouncing.

- Auto Zoom: (default: Enabled)
Whether the camera will move towards and away from the board as needed.

- Padding (squares): (default:12)  
The number squares added to the box around the targets.

- Padding (%): (default: 33)  
The percentage to  add to the box around the targets.

- Max zoom level:  Ignored if Auto Zoom disabled (default: 1, max:3) 
Maximum tightness to the tabletop; high number tokens appear bigger, low number tokens appear smaller.  
Setting 1: 1 pixel on tabletop=1 pixel in view  
Setting 3: 1 pixel on tabletop=3 pixel in view  
Setting 0.2: 5 pixel on tabletop=1 pixel in view  

- Camera animation speed : Speed at which the camera recentres (default: 500ms; 0=instant)

## Change log

#### 0.2.0 - DM Controls
- General code improvements
- Added controls to allow DM to control all players centring.

#### 0.1.0 - First Beta Release  
This was the first public beta.
