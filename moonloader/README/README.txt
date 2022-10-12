*disclaimer:

I am not responsible for any abuse of this software e.g downloading copyrighted stuff, so be aware of using this software legally!
In general I am NOT responsible for any complaints about this software or anything related to it.

Its basically on your own "risk" using this software, even if there obviously shouldn't be any dangers. I only included trust-worthy libraries (imo), such as particle-js, jquery libraries.
Downloads are processed over my nodejs-server, which should finally only return a finished mp3, mp4 (, gif) file. On my server I mainly use ytdl-core , ffmpeg-static and -fluent for processing/ converting/ muxing data, this shouldn't effect you anyway.

Please keep in mind, because my server is running through a free glitch-account, it doesn't run permanently. That leads to a requirement of bumping it after some time of inactivity. This process may takes some seconds and blocks you from using key-features of my program.
Notice the tea-cup in the top right corner, indicating making a connection to the server.


*description:

Its a Chrome-Extension for downloading youtube videos and playlists named "moonloader", written with chrome manifest v3.
Its a free to use client side application containing UI elements such as a chrome popup and a background popup (when downloading).
The client also has the choice not to use an extra html popup for downloading, instead downloading by injecting a temporary script and a pre-tag (for communicating with it) into your current youtube's HTML DOM tree is also a possibility.
It takes use of content scripts to e.g filter playlist titles without the help of youtube-data api --> read-allowence for, of course ONLY, https://youtube.com/* is needed.

Its independent of youtube's data api because this api isn't capable of listing "mixed-playlists" (I believe), so I decided using my content-script's algorithm in general, even if its kinda inefficient.
This way moonloader is also independent from traffic - limitations according youtube's api, even if they wouldn't be that of a problem in this use case (--> would be outta my servers limitations though).


*Also keep in mind:

Because of the use of content.js and filtering the video titles outta the DOM elements of youtube, be aware that permanent working of this software is not guaranteed.
According to this I decided implementing a version control - feature for manually installations / update usage. It was the best solution I could find for updating this piece of software (non official .crx extensions aren't longer supported with newer versions of chrome).
Also keep in mind that support of your current version could be (completely) discarded in the future and a manual update to a newer version could be necessary.
There's no promise of continuing support, and as a result, no promise of functioning, even for the newest version of moonloader.