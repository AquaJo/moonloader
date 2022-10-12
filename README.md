# moonloader
moonloader is a chrome extension (in development), allowing you to download youtube videos or even whole playlists in one step as mp4 in different qualities, mp3 or as gif (gif feature currently in development). 

Either download over the rocket app icon, which provides the main app with most customization or just use youtubes download - button, that now is changed by moonloader.

Keep in mind this app is still in development, there are known bugs. But for most users its core - elements should mostly work.

## how to implement
- **firstly set up your **own** nodejs - serve, featuring requests for downloading via yt-dl** \
copy paste the node.js code from ./nodejs/nodejs.js \
paste it in your nodejs index.js (e.g use free glitch.com hosting services) \
also include these extra files inside root-/main-folder\
add the described dependencies in the package .json\
use "start": "node index.js"\
disclaimer: mp4Status tickets are still a bit glitched, so sometimes they didn't get deleted --> fix planned for the future\

- **secondly the client - side stuff** \
download this repo and extract the moonloader folder containing all the important files (NOT the moonloader folder containing e.g LICENSE!) \
edit config.js and paste your node.js-server-adress (in glitch you can find it by clicking "Share" --> Live Site) as var nodejsURL \
now type chrome://extensions into ya chromium based browser (e.g chrome, edge, opea gx ... / not firefox ...) and enable developer mode
after that place ya extracted moonloader folder inside -- voilà

## quick preview
pictures | descriptions
--- | ---
![image](https://user-images.githubusercontent.com/84229101/181517035-6f0be952-12f1-44df-8331-4b1b2074e41f.png) | main interface
![image](https://user-images.githubusercontent.com/84229101/195343323-856cd4f6-b957-4197-8483-41836f9c4f41.png) | options
<img src="https://user-images.githubusercontent.com/84229101/195343877-eb16e5b2-0cfe-418e-98d2-780fe2be4058.png" width="58%"/> | playlist selection
![image](https://user-images.githubusercontent.com/84229101/195345988-842bfd15-b579-4e72-b04e-f7ae195ed260.png) | simple download dialog
<img src="https://user-images.githubusercontent.com/84229101/195344317-f5300c0c-0ece-463a-b843-d8be2a0b2735.png" width="58%"/> | playlist download dialog
<img src="https://user-images.githubusercontent.com/84229101/181523408-22f20adc-81bd-4673-a458-9e11450a6502.png" width="69%"/> | modified youtube - download popup

## credits
this design is only possible due to awesome resources NOT made by me!

**Big Thanks To:** 

*styling*

- https://codepen.io/mars2601
--> for the amazing button (main menue)

- https://codepen.io/cssinate
--> for the amazing selector

- https://codepen.io/dylanraga
--> for the amazing tick box

- https://codepen.io/perry_nt
--> for the amazing button(s) (download menues)

- https://codepen.io/c_vilander
--> for the amazing loading-header

- https://codepen.io/avstorm         //        https://icons8.com/animated-icons/tea
--> for the amazing tea-loader

- https://github.com/VincentGarreau
--> for the amazing particle system ('particle.js')

- https://codepen.io/Markshall
--> for the amazing listview-UI-design (in my case: 'version control UI')

- https://codepen.io/Saabbir
--> for the amazing button hover animation (in version-control (changelogs))

- https://codepen.io/abdelrhmansaid --> creating the nice hover animation     &     fontawesome.com & their library --> providing the github logo asset
--> for the amazing github logo with animation

- https://codepen.io/BuddyLReno
--> for the amazing selector / tickbox - menue (for choosing videos to download in my case)

- https://codepen.io/aaroniker
--> for the amazing input-styles (for choosing playlist-index ranges in my case)

- Sergio Pedercini:  https://medium.com/@pppped/how-to-code-a-responsive-circular-percentage-chart-with-svg-and-css-3632f8cd7705
--> for the amazing circle loading bar

- fontawesome for the shuttle-space icon (main logo in my use case) and the github-icon for linking to my GitHub

*javascript*

- https://stackoverflow.com/users/1070129/emkey08
--> for the amazing setInputFilter() - function // not used anymore

- https://codepen.io/wagerfield
--> for the amazing text animation (when downloading playlists in my case // ! not used anymore)

- and all the other amazing people on stackoverflow helping with every question


(for most recent credits check them out in ./moonloader/README/credits.txt)

## DISCLAIMER:
Use this extension for legal purpose only! \
I am not responsible for anything. \
Feel free to read the .txt files in ./moonloader/README

