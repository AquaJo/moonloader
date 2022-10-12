additional information:

*description:

Its a Chrome-Extension for downloading youtube videos and playlists named "moonloader", written with chrome manifest v3.
Its a free to use client side application containing UI elements such as a chrome popup and a background popup (when downloading).
The client also has the choice not to use an extra html popup for downloading, instead downloading by injecting a script and a pre-tag (for communicating with it) into your current youtube's HTML DOM tree is also a possibility.
It takes use of content scripts to e.g filter playlist titles without the help of youtube-data api --> read-allowence for, of course ONLY, https://youtube.com/* is needed.

In its core it is independent of youtube's data api because this api isn't capable of listing "mixed-playlists" (I believe), so I decided using my content-script's algorithm in general, even if its kinda inefficient.
This way moonloader is also independent from traffic - limitations according youtube's api.
If you want to have the option using youtube data api anyway, include the key inside config.js.


*Also keep in mind:

Because of the use of content.js and filtering the video titles outta the DOM elements of youtube, be aware that permanent working of this software is not guaranteed.
According to this I decided implementing a version control - feature for manually installations / update usage. It was the best solution I could find for updating this piece of software (non official .crx extensions aren't longer supported with newer versions of chrome).
If youre reading this on github, the best solution is to manually update, through downloading the latest github version.
Also keep in mind that support of your current version could be (completely) discarded in the future and a manual update to a newer version could be necessary.
There's no promise of continuing support, and as a result, no promise of functioning, even for the newest version of moonloader.
