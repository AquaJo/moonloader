let mode = 'starter';
let id;
let ids = [];
let titles = [];
let title;
let bumping = false;
let first = true;
let randomTicket = 'undefined';

let playlistBuffer = null;
let playlistId;
let videoIdApiMode;
let urlApi;

function chromeStorageGet(key) {
  // bit pointless ;)
  let res;
  chrome.storage.local.get([key], function (result) {
    res = Object.values(result)[0];
  });
  return res;
}

let nowBumping = true;

let url;
let hideInp1V = false;

function updatePages() {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      //alert(tabs.id);
      let button1 = document.getElementById('button1');
      let error = document.getElementById('error');
      let qualitySelector = document.getElementById('qualitySelector');

      let versionsBtn1 = document.getElementById('versionsBtn1');
      let github = document.getElementById('github');
      //let versionsBtn2 = document.getElementById("versionsBtn2");
      //let selectorDiv1 = document.getElementById("selectorDiv1");
      if (mode === 'starter') {
        if (navigator.onLine) {
          //console.log(error);
          let url = tabs[0].url;
          console.log(tabs);
          if (
            url !== undefined &&
            url.split('?v=')[0] === 'https://www.youtube.com/watch'
          ) {
            mode = 'menue';
            updatePages();
          } else {
            //main.remove();
            versionsBtn1.style.display = 'none';
            error.style.display = 'block';
            button1.style.display = 'none';
            mode = 'error';
            github.style.top = '135.5px';
            setTimeout(function () {
              github.style.visibility = 'visible';
            }, 100);

            // input entering event
            let inp = document.getElementById('inputError');
            $('#inputError').on('keyup', function (e) {
              if (e.key === 'Enter' || e.keyCode === 13) {
                // get id
                let finalId = youtubeIdFromUrl(inp.value);
                if (finalId === undefined) {
                  finalId = inp.value;
                  urlApi = 'https://youtube.com/watch?v=' + inp.value;
                } else {
                  urlApi = inp.value;
                }
                videoIdApiMode = finalId;
                //
                // check if api-key is
                let jsonResponse = JSON.parse(
                  httpGet(
                    'https://www.googleapis.com/youtube/v3/videos?id=' +
                      finalId +
                      '&key=' +
                      youtubeApiKey
                  )
                );
                try {
                  if (jsonResponse.error.code == 400) {
                    alert('youtube data api v3 - key is invalid');
                  }
                } catch (e) {
                  // see if videolink is valid
                  try {
                    if (jsonResponse.items[0].kind === 'youtube#video') {
                      youtubeApiMode = true;
                      // append title of background download option
                      let label = document.getElementById('labelZeroCheck');
                      label.title =
                        label.title + '\nonly working on yt due to permissions';
                      //
                      // see if videolink contains list and in case log list id for possible later usage
                      if (inp.value.includes('list')) {
                        playlistId = youtubeListIdFromUrl(inp.value);
                        // check for validity ...
                        playlistBuffer = JSON.parse(
                          httpGet(
                            'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
                              playlistId +
                              '&key=' +
                              youtubeApiKey
                          )
                        );
                        try {
                          if (playlistBuffer.error.code) {
                            playlistBuffer = null; // playlist does not exist || is not public
                          }
                        } catch (e) {
                          // playlist exists ...
                        }
                        //
                      }

                      mode = 'menue';
                      updatePages();
                      document.getElementById('error').style.display = 'none';
                    }
                  } catch (e) {
                    // handling unvalid url --> .kind property
                  }
                }
                //
              }
            });
          }
        } else {
          let noInternet = document.getElementById('noInternet');
          noInternet.style.display = 'block';
          button1.style.display = 'none';
          bodyVidDownload.style.display = 'none';
          versionsBtn1.style.display = 'none';
          versionsBtn2.style.display = 'none';
          mode = 'noInternet';
        }
        //selectorDiv1.style.display = "none";
      } else {
        if (!mainMenueLock && mode !== 'menue') {
          ////// !!!
          github.style.display = 'none';
        }

        if (mode === 'menue') {
          document.getElementById('versionsBtn1').style.display = 'block';
          github.style.visibility = 'visible';
          let rand = Math.floor(Math.random() * 5); // set random download button animation
          if (rand == 0) {
            vidDownloadBtn1.className = 'btn2 from-top';
            vidDownloadBtn2.className = 'btn2 from-top';
          } else if (rand == 1) {
            vidDownloadBtn1.className = 'btn2 from-left';
            vidDownloadBtn2.className = 'btn2 from-left';
          } else if (rand == 2) {
            vidDownloadBtn1.className = 'btn2 from-right';
            vidDownloadBtn2.className = 'btn2 from-right';
          } else if (rand == 3) {
            vidDownloadBtn1.className = 'btn2 from-center';
            vidDownloadBtn2.className = 'btn2 from-center';
          } else {
            vidDownloadBtn1.className = 'btn2 from-bottom';
            vidDownloadBtn2.className = 'btn2 from-bottom';
          }

          button1.style.display = 'block'; // setting up displaying main menue
          error.style.display = 'none';
          mode = 'menue';

          // get playlistIds and titles

          if (youtubeApiMode) {
            // not the best method, making calls to api already here and filtering titlese from content already here, but I added the api afterwards and want to adapt ... --> maybe new structure in the future ... --> getting titles and ids on playlist download click
            ids = [];
            titles = [];
            if (playlistBuffer !== null) {
              // is playlist
              pageNumber = youtubeApiPages;
              getJSON(1);
              function getJSON(counter) {
                if (counter <= pageNumber) {
                  let nextPageExists = true;
                  if (counter != 1) {
                    // get JSONS from youtube data api
                    playlistBuffer = JSON.parse(
                      httpGet(
                        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50' +
                          '&pageToken=' +
                          playlistBuffer.nextPageToken +
                          '&playlistId=' +
                          playlistId +
                          '&key=' +
                          youtubeApiKey
                      )
                    );
                  }
                  // get titles and ids of playlist items outta JSONResponse
                  let items = playlistBuffer.items;
                  for (let i = 0; i < items.length; ++i) {
                    titles.push(items[i].snippet.title);
                    ids.push(items[i].snippet.resourceId.videoId);
                  }
                  //
                  if (playlistBuffer.nextPageToken === undefined) {
                    nextPageExists = false;
                  }
                  if (nextPageExists) {
                    counter++;
                    getJSON(counter);
                  }
                }
              }
              // finished getting titles and ids and pushing them to the right variable
            }
            // settings single title information
            title = JSON.parse(
              httpGet(
                'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' +
                  videoIdApiMode +
                  '&key=' +
                  youtubeApiKey
              )
            );
            title = title.items[0].snippet.title;
          } else {
            if (tabs[0].url.includes('&list=')) {
              // idk why not 1 var for titles as list -.- ...
              chrome.tabs.sendMessage(
                tabs[0].id,
                'playlistIds',
                function (response) {
                  console.group('playlistInformation');
                  console.group('ids');
                  console.log(response);
                  console.groupEnd();
                  ids = response;
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    'getTitles',
                    function (response) {
                      console.group('titles');
                      //console.log(response);
                      let titlesList = response;
                      for (let i = 0; i < ids.length; ++i) {
                        titles.push(
                          titlesList[titlesList.length - ids.length + i]
                        );
                      }
                      console.log(titles);
                      console.groupEnd();
                      console.groupEnd();
                    }
                  );
                }
              );
            } else {
            }
            chrome.tabs.sendMessage(
              tabs[0].id,
              'getTitle',
              function (response) {
                console.log(response);
                title = response;
              }
            );
          }
        } else if (mode === 'downloadVideo' && !mainMenueLock) {
          body.style.minHeight = '363px';
          canvas.style.minHeight = '363px';
          versionsBtn1.style.display = 'none';
          button1.style.display = 'none';
          bodyVidDownload.style.display = 'block';
          if (showVidDownloadQuality) {
            vidDownloadBtnSpacer.style.display = 'none';
            qualitySelector.style.display = 'block';
          } else {
            qualitySelector.style.display = 'none';
            vidDownloadBtnSpacer.style.display = 'block';
          }
          //alert(nowBumping);

          vidDownloadBtn1.style.filter = 'brightness(1)';
          downloadBtn1Active = true;
          if (ids.length == 0) {
            vidDownloadBtn2.style.filter = 'brightness(0.5)';
            downloadBtn2Active = false;
          } else {
            vidDownloadBtn2.style.filter = 'brightness(1)';
            downloadBtn2Active = true;
          }

          /*if (removeAudSeq && showVidDownloadQuality == false) { // not needed anymore
          vidDownloadBtn1.style.filter = "brightness(0.4)";
          vidDownloadBtn2.style.filter = "brightness(0.4)";
        } else {
          vidDownloadBtn1.style.filter = "brightness(1)";
          vidDownloadBtn2.style.filter = "brightness(1)";
        }*/
        } else if (mode === 'loading') {
          if (downloadBtn1Active === true && downloadMode === 'simple') {
            if (!youtubeApiMode) {
              url = tabs[0].url;
            } else {
              url = urlApi;
            }
            console.log(url);

            let videoSequence = !removeVidSeq;
            let audioSequence = !removeAudSeq;
            let videoQuality = '';

            console.log('downloading ready');

            chrome.storage.local.set(
              {
                downloading: true,
                downloadMode: 'simple',
                currentTitle: title,
              },
              function () {
                simpleDownloadDialog(title);
                if (domDownload) {
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    'downloaderDOM',
                    function (response) {}
                  );
                  chrome.runtime.sendMessage(
                    'listenForTabCloseAndReset',
                    function (response) {}
                  ); // maybe parsing tab[0].id would already do the job
                } else {
                  chrome.runtime.sendMessage(
                    'download-popup',
                    function (response) {}
                  );
                }
              }
            );
          } else if (
            downloadBtn2Active === true &&
            downloadMode === 'playlistSelect'
          ) {
            let rangeRegex = crateRegexRange(1, ids.length);
            bodyVidDownload.style.display = 'none';
            let main = document.getElementById('playlistVideoSelectorMain');
            main.style.marginTop = '0px';
            main.style.display = 'block';
            body.style.maxHeight = '600px';
            canvas.style.maxHeight = '600px';
            body.style.minHeight = '0px';
            canvas.style.minHeight = '0px';
            let playlistVideoSelector = document.getElementById(
              'playlistVideoSelectorMain'
            );
            playlistVideoSelector.style.maxHeight = '541px';
            playlistVideoSelector.style.minHeight = '0px';
            body.style.minWidth = '420px';
            canvas.style.minWidth = '420px';

            inputStart = document.getElementById('playlistInput1');
            inputEnd = document.getElementById('playlistInput2');
            inputStart.value = '1';
            old[0] = '1';
            old[1] = titles.length.toString();
            inputEnd.value = titles.length.toString();
            let playlistInput1Old = '';
            let oldInp1 = '1';
            $('#playlistInput1').on('change keyup paste', function () {
              if (oldInp1 !== inputStart.value) {
                inputRangeListener(inputStart, 0, 1);
              }
              oldInp1 = inputStart.value;
            });
            let oldInp2 = titles.length;
            $('#playlistInput2').on('change keyup paste', function () {
              if (oldInp2 !== inputEnd.value) {
                inputRangeListener(inputEnd, 1, titles.length);
              }
              oldInp2 = inputEnd.value;
            });

            for (let n = 0; n < titles.length; ++n) {
              // create selection options

              let inpGroup = document.createElement('div');
              inpGroup.classList.add('inputGroup');
              inpGroup.setAttribute('id', 'inpGroup' + n);
              let inp = document.createElement('input');
              inp.setAttribute('id', 'option' + n);
              inp.setAttribute('name', 'option' + n);
              inp.setAttribute('type', 'checkbox');

              let label = document.createElement('label');
              label.setAttribute('for', 'option' + n);
              if (titles[n].length > 41) {
                label.innerHTML = titles[n].substring(0, 41) + '...';
              } else {
                label.innerHTML = titles[n];
              }

              inpGroup.appendChild(inp);
              inpGroup.appendChild(label);
              inpGroup.style.opacity = 1;
              let form = document.getElementById('playlistVideoSelectorForm');
              form.appendChild(inpGroup);
              inpGroup.onclick = onClickPlaylist;
            }

            activatePlaylistItem(0);
          } else if (downloadMode === 'playlistDownload') {
            let resIds = [];
            let playlistTitles = [];
            let firstIndex = -54;
            for (let i = 0; i < playlistStatus.length; ++i) {
              if (playlistStatus[i] === true) {
                if (firstIndex == -54) {
                  firstIndex = i;
                }
                resIds.push(ids[i]);
                playlistTitles.push(titles[i]);
              }
            }
            if (resIds.length > 0) {
              ids = resIds;
              console.log('resIds: \n' + resIds);
              chrome.storage.local.set(
                {
                  // ik lists in list ... would make more sense but Iam not using local storage more complicated as of now ^^ hopefully I wont regret it later
                  messages: [],
                  downloading: true,
                  downloadMode: 'playlist',
                  outStandingTitles: [],
                  currentTitle: titles[firstIndex],
                  currentIndex: 0,
                  idsLength: resIds.length,
                  playlistTitles: playlistTitles,
                },
                function () {
                  playlistDialog();
                  downloadMode2 = 'playlist';
                  if (domDownload) {
                    chrome.tabs.sendMessage(
                      tabs[0].id,
                      'downloaderDOM',
                      function (response) {}
                    ); //////
                    chrome.runtime.sendMessage(
                      'listenForTabCloseAndReset',
                      function (response) {
                        if (!chrome.runtime.lastError) {
                        } else {
                        }
                      }
                    );
                  } else {
                    chrome.runtime.sendMessage(
                      'download-popup',
                      function (response) {
                        if (!chrome.runtime.lastError) {
                        } else {
                        }
                      }
                    );
                  }
                }
              );
            }
          }
          //}
        } else if (mode === 'downloadAudio') {
          //
        }
      }
    }
  );
}
//clearLogs();
function clearLogs() {
  chrome.storage.local.set(
    {
      messages: [],
    },
    function () {}
  );
}
//downloadingFalse();
function downloadingFalse() {
  chrome.storage.local.set(
    {
      downloading: false,
    },
    function () {}
  );
}
let playlistDialogInitialization = true;

function playlistDialog() {
  versionsBtn1.style.display = 'none'; // hide unneeded stuff
  button1.style.display = 'none';
  github.style.display = 'none';
  document.getElementById('error').style.display = 'none';
  document.getElementById('noInternet').style.display = 'none';
  document.getElementById('teaCup').style.display = 'none'; //
  let outStandingTitles;
  let currentIndex;
  let currentTitle;
  let idsLength;
  chrome.storage.local.get('outStandingTitles', function (result) {
    // ik ...
    outStandingTitles = Object.values(result)[0];
    console.log(outStandingTitles);
    chrome.storage.local.get('currentTitle', function (result) {
      currentTitle = Object.values(result)[0];
      chrome.storage.local.get('currentIndex', function (result) {
        currentIndex = Object.values(result)[0];
        chrome.storage.local.get('idsLength', function (result) {
          idsLength = Object.values(result)[0];
          chrome.storage.local.get('messages', function (result) {
            messages = Object.values(result)[0];
            //console.log(Object.values(result))
            // declaring needed dimensions and what to show
            body.style.maxHeight = '480px';
            canvas.style.maxHeight = '480px';
            body.style.minWidth = '420px';
            canvas.style.minWidth = '420px';
            let playlistDownloadBtn = document.getElementById(
              'playlistDownloadBtn'
            );
            let playlistDownloadMenue = document.getElementById(
              'playlistDownloadMenue'
            );
            playlistDownloadMenue.style.maxHeight = '439px';
            playlistVideoSelectorMain.style.display = 'none';
            playlistDownloadMenue.style.display = 'block';
            //

            // setting percentage stuff and downloading status (not logs)
            document.getElementById('downloadedInfo').innerHTML =
              'downloaded: ' + currentIndex + ' / ' + idsLength;
            setPercentage(currentIndex, idsLength); //
            //alert(idsLength);
            function setPercentage(start, end) {
              let perc = (start / end) * 100;
              document
                .getElementById('circle')
                .setAttribute('stroke-dasharray', perc + ',' + 100);
              document.getElementById('circleText').innerHTML =
                Math.round(perc * 10) / 10 + '%';
            }

            //
            document.getElementById('message').addEventListener(
              'DOMNodeInserted',
              function (event) {
                // scroll always to bottom of message div when change detected ...
                document
                  .getElementById('message')
                  .scrollTo(0, document.getElementById('message').scrollHeight);
              },
              false
            );
            //console.log(result);

            // download logging

            if (playlistDialogInitialization) {
              //alert("previous");
              playlistDialogInitialization = false;
              for (let i = 0; i < messages.length; ++i) {
                // maybe change this ..... ---> only on first start (global var()) , so that this function can be called easily when popup is open.... ---> messages afterwards ???? ... when multiple downloads happened ...... ignore them
                /*let p  = document.createElement("p");
                p.innerHTML = messages[i];
                document.getElementById("message").appendChild(p);*/
                pushMessage(messages[i], i * 10, 0, false);
              }
            }

            if (messages.length == 0) {
              pushMessage('downloading logs:', 0, 50, false);
              messages.push('downloading logs:');
              let msg = '--------------   ' + new Date().toLocaleTimeString();
              pushMessage(msg, 50, 100, false); // could also leave this and always draw line ...
              messages.push(msg);
            }
            console.log(messages);

            let firstCurrent = false;
            if (messages[messages.length - 2] === 'downloading logs:') {
              firstCurrent = true;
            }

            //pushMessage("testMsgh", 100, 50)
            /////////////////////////////////
            setTimeout(function () {
              outStandingTitles.push('nothing');
              for (let i = 0; i < outStandingTitles.length; ++i) {
                let resMsg;
                if (i != outStandingTitles.length - 1) {
                  if (i == 0) {
                    // && messages.length -1 includes currently downloading: ()
                    pushMessage(
                      'successfully finished downloading this title',
                      0,
                      50,
                      false
                    );
                    messages.push(
                      'successfully finished downloading this title'
                    );
                    //pushMessage("--------", 70,50,false);
                    //messages.push("--------");
                  } else {
                    if (i == 1) {
                      resMsg = '--- meanwhile ---';
                      pushMessage(resMsg, 200 * i, 50, false);
                      messages.push(resMsg);
                    }
                    resMsg =
                      'successfully downloaded: ' +
                      shortenTitle(outStandingTitles[i], 35);
                    pushMessage(resMsg, 200 * i, 50, false);
                    messages.push(resMsg);
                  }
                } else {
                  if (
                    messages.indexOf(
                      'currently downloading: ' + shortenTitle(currentTitle, 35)
                    ) == -1
                  ) {
                    if (!firstCurrent) {
                      let msg = '--------   ' + new Date().toLocaleTimeString();
                      pushMessage(msg, 800, 50, false);
                      messages.push(msg);
                    }
                    resMsg =
                      'currently downloading: ' +
                      shortenTitle(currentTitle, 35);
                    pushMessage(resMsg, 1300, 50, false);
                    messages.push(resMsg);
                  }
                }
                //messages.push(resMsg);
              }
              outStandingTitles = [];
              //pushMessage("downloading logs:", 0);
              //pushMessage("-----------------", 400);
              //for (let i = 0; i < 3; i++) {
              chrome.storage.local.set(
                {
                  messages: messages,
                  outStandingTitles: [],
                },
                function () {}
              );
            }, messages.length * 100);
          });
        });
      });
    });
  });
}

function shortenTitle(text, length) {
  return text.length > length ? text.substring(0, length) + ' ...' : text;
}

function saveToMessages() {}

function pushMessage(text, delay, speed, safe) {
  if (safe) {
    chrome.storage.local.get('messages', function (result) {
      let msgs = Object.values(result)[0];
      msgs.push(text);
      chrome.storage.local.set(
        {
          messages: msgs,
        },
        function () {
          let i = 0;

          let p = document.createElement('p');
          let id = Math.random().toString(36).slice(-8);
          document.getElementById('message').appendChild(p);
          p.setAttribute('id', id);
          setTimeout(function () {
            typeWriter(id, text, speed);
          }, delay);

          function typeWriter(id, txt, speed) {
            if (i < txt.length) {
              document.getElementById(id).innerHTML += txt.charAt(i);
              i++;
              setTimeout(function () {
                typeWriter(id, txt, speed);
              }, speed);
            }
          }
        }
      );
    });
  } else {
    let i = 0;

    let p = document.createElement('p');
    let id = Math.random().toString(36).slice(-8);
    document.getElementById('message').appendChild(p);
    p.setAttribute('id', id);
    setTimeout(function () {
      typeWriter(id, text, speed);
    }, delay);

    function typeWriter(id, txt, speed) {
      if (i < txt.length) {
        document.getElementById(id).innerHTML += txt.charAt(i);
        i++;
        setTimeout(function () {
          typeWriter(id, txt, speed);
        }, speed);
      }
    }
  }
}

var MESSAGES;
MESSAGES = [];
let logs = [];

function pushaMessage(text, delay) {
  // not that efficient this way ... function multiple times called
  //MESSAGES = [];
  MESSAGES.push({
    delay: delay,
    text: text,
  });
  logs.push(text);
  chrome.storage.local.set(
    {
      messages: logs,
    },
    function () {}
  );
  (function () {
    var $animate,
      $container,
      $message,
      $paragraph,
      animate,
      initialise,
      scramble;
    /*
                MESSAGES.push({
                  delay: 1200,
                  text: "------------"
                });
                MESSAGES.push({
                  delay: 2200,
                  text: "You don't interact with anybody."
                });
                MESSAGES.push({
                  delay: 3600,
                  text: "Your whole sense of reality is, pretty warped..."
                });
                MESSAGES.push({
                  delay: 5200,
                  text: "Does it bother you that we're not real?"
                });*/

    $container = $('#container');

    $message = $('#message');

    $animate = $('#animate');

    $paragraph = null;

    scramble = function (element, text, options) {
      var $element,
        addGlitch,
        character,
        defaults,
        ghostCharacter,
        ghostCharacters,
        ghostLength,
        ghostText,
        ghosts,
        glitchCharacter,
        glitchCharacters,
        glitchIndex,
        glitchLength,
        glitchProbability,
        glitchText,
        glitches,
        i,
        letter,
        object,
        order,
        output,
        parameters,
        settings,
        shuffle,
        target,
        textCharacters,
        textLength,
        wrap,
        _i,
        _j,
        _results;
      defaults = {
        probability: 0.2,
        glitches: '-|/\\',
        blank: '',
        duration: text.length * 40,
        ease: 'easeInOutQuad',
        delay: 0.0,
      };
      $element = $(element);
      settings = $.extend(defaults, options);
      shuffle = function () {
        if (Math.random() < 0.5) {
          return 1;
        } else {
          return -1;
        }
      };
      wrap = function (text, classes) {
        return '<span class="' + classes + '">' + text + '</span>';
      };
      glitchText = settings.glitches;
      glitchCharacters = glitchText.split('');
      glitchLength = glitchCharacters.length;
      glitchProbability = settings.probability;
      glitches = (function () {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = glitchCharacters.length; _i < _len; _i++) {
          letter = glitchCharacters[_i];
          _results.push(wrap(letter, 'glitch'));
        }
        return _results;
      })();
      ghostText = $element.text();
      ghostCharacters = ghostText.split('');
      ghostLength = ghostCharacters.length;
      ghosts = (function () {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ghostCharacters.length; _i < _len; _i++) {
          letter = ghostCharacters[_i];
          _results.push(wrap(letter, 'ghost'));
        }
        return _results;
      })();
      textCharacters = text.split('');
      textLength = textCharacters.length;
      order = function () {
        _results = [];
        for (
          var _i = 0;
          0 <= textLength ? _i < textLength : _i > textLength;
          0 <= textLength ? _i++ : _i--
        ) {
          _results.push(_i);
        }
        return _results;
      }
        .apply(this)
        .sort(this.shuffle);
      output = [];
      for (
        i = _j = 0;
        0 <= textLength ? _j < textLength : _j > textLength;
        i = 0 <= textLength ? ++_j : --_j
      ) {
        glitchIndex = Math.floor(Math.random() * (glitchLength - 1));
        glitchCharacter = glitches[glitchIndex];
        ghostCharacter = ghosts[i] || settings.blank;
        addGlitch = Math.random() < glitchProbability;
        character = addGlitch ? glitchCharacter : ghostCharacter;
        output.push(character);
      }
      object = {
        value: 0,
      };
      target = {
        value: 1,
      };
      parameters = {
        duration: settings.duration,
        ease: settings.ease,
        step: function () {
          var index, progress, _k;
          progress = Math.floor(object.value * (textLength - 1));
          for (
            i = _k = 0;
            0 <= progress ? _k <= progress : _k >= progress;
            i = 0 <= progress ? ++_k : --_k
          ) {
            index = order[i];
            output[index] = textCharacters[index];
          }
          return $element.html(output.join(''));
        },
        complete: function () {
          return $element.html(text);
        },
      };
      return $(object).delay(settings.delay).animate(target, parameters);
    };

    animate = function () {
      var data, element, index, options, _i, _len;
      for (index = _i = 0, _len = MESSAGES.length; _i < _len; index = ++_i) {
        if (index == MESSAGES.length - 1) {
          data = MESSAGES[index];
          element = $paragraph.get(index);
          element.innerText = '';
          options = {
            delay: data.delay,
          };
          scramble(element, data.text, options);
        }
      }
    };

    initialise = function () {
      var index, text, _i, _len;
      $animate.click(animate);
      for (index = _i = 0, _len = MESSAGES.length; _i < _len; index = ++_i) {
        text = MESSAGES[index];

        $message.append('<p>');
      }
      $paragraph = $container.find('p');
      animate();
    };

    initialise();
  }.call(this));
}

function simpleDownloadDialog(title) {
  // popup preset for simple downloading
  //chrome.runtime.sendMessage("downloadTabOpen", async function(response) {});
  versionsBtn1.style.display = 'none';
  button1.style.display = 'none';
  github.style.display = 'none';
  document.getElementById('error').style.display = 'none';
  document.getElementById('noInternet').style.display = 'none';
  //document.getElementById("playlistDownloadMenue").style.display = "none";

  let loading = document.getElementById('loading');
  let normB = document.getElementsByClassName('normBody');
  let canvas = document.getElementById('canvas');
  bodyVidDownload.style.display = 'none';
  loading.style.display = 'block';
  canvas.style.minHeight = '0px ';
  body.style.minHeight = '0px ';
  canvas.style.maxHeight = '200px ';
  body.style.maxHeight = '200px ';

  setTimeout(function () {
    document.getElementById('currentDownload').style.display = 'block';
    setTimeout(function () {
      let currentDownloadTitle = document.getElementById(
        'currentDownloadTitle'
      );
      //  let modifiedTitle = title.replace(/[/\\?%*:|"<>]/g, "-");
      //  modifiedTitle = modifiedTitle.replace(/([^a-z0-9()\\-\\.\\&\\(\\'\\,\-\)]+)/gi, " ");
      currentDownloadTitle.innerHTML = title;
      //  alert(title);
      // resize text
      let textSize = 1.23;
      //alert(title.width(textSize));
      let oldTextSize = -32831293;
      while (title.width(textSize) > 258) {
        textSize -= 0.01;
        if (title.width(textSize) == oldTextSize) {
          break;
        }
        oldTextSize = title.width(textSize);
      }
      currentDownloadTitle.style.fontSize = textSize + 'em';
      currentDownloadTitle.style.display = 'block';
    }, 180);
  }, 1280);
}

onClickPlaylistCounter = 0;
playlistActive = false;
let onClickPlaylist = function () {
  let num = parseInt(this.id.split('inpGroup')[1]);
  if (playlistActive) {
    onClickPlaylistCounter++;
    if (this.style.opacity == 1) {
      if (onClickPlaylistCounter == 1) {
        this.style.opacity = 0.73;
        try {
          // add info to playlistStatus array
          playlistStatus[num] = false;
        } catch (err) {}
      } else {
        onClickPlaylistCounter = 0;
      }
    } else {
      if (onClickPlaylistCounter == 1) {
        this.style.opacity = 1;
        try {
          // add info to playlistStatus array
          playlistStatus[num] = true;
        } catch (err) {}
      } else {
        onClickPlaylistCounter = 0;
      }
    }
  }
};

let old = ['', ''];
let timeoutPlaylistInp;

let inputStart;
let inputEnd;

function inputRangeListener(el, num, start) {
  if (playlistActive) {
    let boolean;
    let value = el.value;
    for (let i = 0; i < value.length; ++i) {
      if (
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(
          value.charAt(i)
        ) >= 0 &&
        !(
          value.includes('e') ||
          value.includes('^') ||
          value.includes(',') ||
          value.includes('.') ||
          value.includes('-')
        )
      ) {
        if (i == value.length - 1) {
          valInt = parseInt(value);
          if (valInt >= 1 && valInt <= titles.length) {
            boolean = true;
          } else {
            boolean = false;
            break;
          }
        }
      } else {
        boolean = false;
        break;
      }
    }
    if (!boolean) {
      if (Number.isNaN(value.charCodeAt(0))) {
        boolean = true;
      }
    }
    if (boolean) {
      old[num] = value;
      el.value = value;

      el.setCustomValidity('');
      try {
        clearTimeout(timeoutPlaylistInp);
      } catch (error) {}
      timeoutPlaylistInp = setTimeout(function () {
        // simple solution ... no valBefore check
        let resMin;
        let resMax;

        if (inputStart.value === '') {
          resMin = 1;
        } else {
          if (parseInt(inputStart.value) <= titles.length) {
            resMin = parseInt(inputStart.value);
          } else {
            resMin = titles.length;
            inputStart.value = titles.length;
          }
        }

        if (inputEnd.value === '') {
          resMax = titles.length;
        } else {
          if (parseInt(inputEnd.value) <= titles.length) {
            resMax = parseInt(inputEnd.value);
          } else {
            resMax = titles.length;
            inputEnd.value = titles.length;
          }
        }
        markRange(resMin, resMax, 0);
        console.log('update');
      }, 500);
    } else {
      el.value = old[num];
      el.setCustomValidity(
        'must be an integer in range: 1 <= x <= ' + titles.length
      );
      el.reportValidity();
    }
  } else {
    el.value = el.value.substring(0, start - 1);
  }
}

let playlistStatus = [];

function activatePlaylistItem(counter) {
  setTimeout(
    function () {
      if (counter < titles.length) {
        let element = document.getElementById('option' + counter);
        element.click();
        //console.log(counter);
        playlistStatus.push(true);
        activatePlaylistItem(counter + 1);
      } else {
        playlistActive = true;
        document.getElementById(
          'playlistVideoSelectorForm'
        ).style.pointerEvents = 'auto';
      }
    },
    counter * 6 <= 50 ? 50 - counter * 6 : 0
  );
}

function markRange(int_, int__, counter) {
  // to mark // activate specific ranges in playlist selection // index +  1 params
  let min = int_ < int__ ? int_ : int__;
  let max = int_ > int__ ? int_ : int__;
  min--;
  max--;
  //console.log(playlistStatus);
  //console.log(playlistStatus);
  setTimeout(
    function () {
      playlistActive = false; // maybe do this stuff before looping
      document.getElementById('playlistVideoSelectorForm').style.pointerEvents =
        'none'; // ""

      let element = document.getElementById('option' + counter);
      if (counter >= min && counter <= max) {
        if (playlistStatus[counter] === false) {
          playlistStatus[counter] = true;
          element.click();
          document.getElementById('inpGroup' + counter).style.opacity = 1;
          //onClickPlaylist = document.getElementById("inpGroup"+counter);
        }
      } else {
        if (playlistStatus[counter] === true) {
          playlistStatus[counter] = false;
          element.click();
          document.getElementById('inpGroup' + counter).style.opacity = 0.73;
          //onClickPlaylist = document.getElementById("inpGroup"+counter);
        }
        // deactivate
      }
      // element.click();
      if (counter < titles.length - 1) {
        markRange(int_, int__, counter + 1); // preserve older informations + loop
      } else {
        playlistActive = true;
        document.getElementById(
          'playlistVideoSelectorForm'
        ).style.pointerEvents = 'auto';
      }
    },
    counter * 6 <= 50 ? 50 - counter * 6 : 0
  );
}

String.prototype.width = function (size) {
  var f = size + 'em Montserrat',
    o = $('<div></div>')
      .text(this)
      .css({
        position: 'absolute',
        float: 'left',
        'white-space': 'nowrap',
        visibility: 'hidden',
        font: f,
      })
      .appendTo($('body')),
    w = o.width();

  o.remove();

  return w * 1.05;
};

window.addEventListener('offline', () => {
  mode = 'starter';
  pageUpdater();
});

function createRandomCode(length) {
  let res = '';
  for (let i = 0; i < length; ++i) {
    numb = Math.floor(Math.random() * 3);
    if (numb == 0) {
      res += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    } else if (numb == 1) {
      res += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    } else {
      res += Math.floor(Math.random() * 10).toString();
    }
  }
  return res;
}

// Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter, errMsg) {
  // thanks to https://stackoverflow.com/users/1070129/emkey08 NOT USED ANYMORE
  [
    'input',
    'keydown',
    'keyup',
    'mousedown',
    'mouseup',
    'select',
    'contextmenu',
    'drop',
    'focusout',
  ].forEach(function (event) {
    textbox.addEventListener(event, function (e) {
      if (inputFilter(this.value)) {
        // Accepted value
        if (
          ['keydown', 'mousedown', 'focusout'].indexOf(e.type) >= 0 ||
          hideInp1V
        ) {
          this.classList.remove('input-error');
          //this.setCustomValidity("");
          //this.reportValidity();
        }
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty('oldValue')) {
        // Rejected value - restore the previous one
        //this.classList.add("input-error");
        /*this.setCustomValidity(errMsg);
        this.reportValidity();*/
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value - nothing to restore
        this.value = '';
      }
    });
  });
}

// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

function crateRegexRange(min, max) {
  // bit inefficient --> range 0-100 is e.g. is also [0-9]|[1-9][0-9]|100 // NOT USED ANYMORE
  let firstSegmentsNum = Math.trunc(min / 10) + 1;
  let lastSegmentsNum = Math.trunc(max / 10) + 1;
  let neededSegments = lastSegmentsNum - firstSegmentsNum + 1;
  //alert(firstSegmentsNum);
  //alert(lastSegmentsNum);
  let regexString = '';

  let minString = min.toString();
  let maxString = max.toString();
  for (let i = 0; i < neededSegments; ++i) {
    let segment;
    if (i == 0) {
      if (firstSegmentsNum != 1) {
        if (minString.charAt(minString.length - 1) !== '9') {
          segment =
            minString.substring(0, minString.length - 1) +
            '[' +
            minString.charAt(minString.length - 1) +
            '-9]|';
          //alert(segment);
        } else {
          segment = minString + '|';
        }
      } else {
        segment = '[' + minString.charAt(0) + '-9]|';
      }
    } else if (i == neededSegments - 1) {
      if (maxString.charAt(maxString.length - 1) !== '0') {
        segment =
          maxString.substring(0, maxString.length - 1) +
          '[0-' +
          maxString.charAt(maxString.length - 1) +
          ']';
      } else {
        segment = maxString;
      }
    } else {
      firstBracketPos = regexString.indexOf('[', 0);
      if (
        firstBracketPos < regexString.indexOf('|', 0) &&
        firstBracketPos != -1 &&
        firstBracketPos != 0
      ) {
        segment =
          parseInt(regexString.substring(0, firstBracketPos)) + i + '[0-9]|';
      } else if (regexString.charAt(0) === '[') {
        segment = 0 + i + '[0-9]|';
      } else {
        segment =
          parseInt(regexString.substring(0, regexString.indexOf('|'))) +
          i +
          '[0-9]|';
      }
    }

    regexString = regexString + segment;
  }
  let result = new RegExp('\\b(' + regexString + ')\\b');
  console.log('regex-range created : ' + result);
  return result;
}

function httpGet(theUrl) {
  // SYNCHRONIOUS
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open('GET', theUrl, false, true); // false for synchronous request
  xmlHttp.send(null);
  //alert(xmlHttp.responseText);
  return xmlHttp.responseText;
}

function youtubeIdFromUrl(url) {
  //basically from script.js
  let urls = [];
  urls.push(url.split('/watch?v=')[1]);
  if (url.includes('&list=')) {
    let code = urls[0].split('&list=')[0];
    urls = [];
    urls.push(code);
  } else if (url.includes('&t=')) {
    let urlT = urls[0].split('&t=')[0];
    urls = [];
    urls.push(urlT);
  }
  return urls[0];
}

function youtubeListIdFromUrl(url) {
  let res = url.split('&list=')[1];
  res = res.split('&')[0];
  return res;
}
