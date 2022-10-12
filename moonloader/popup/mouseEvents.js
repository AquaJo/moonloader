let showVidDownloadQuality = true;
let removeAudSeq = false;
let mp3Download = false;
let removeVidSeq = false;
let domDownload = false;
let domDownloadClick = false;
let downloadBtn1Active = false;
let downloadBtn2Active = false;
let vidQuality = null;
let vidDownloadBtn1;
let vidDownloadBtn2;
let vidDownloadBtnSpacer;
let bodyVidDownload;
let github;

let firstLoad = true;
let teaCup;

let downloadMode;
let youtubeApiKey;
let youtubeApiPages;
chrome.runtime.sendMessage('youtubeDataApiKey', function (response) {
  youtubeApiKey = response;
});
chrome.runtime.sendMessage('youtubeDataApiPages', function (response) {
  youtubeApiPages = response;
});


async function getCurrentTabId() {
  let queryOptions = {
    active: true,
    lastFocusedWindow: true,
  };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  // console.log('currentTabId : ' + tab.id);
  try {
    return tab.id;
  } catch (error) {
    return undefined;
  }
}

function updateLocalStorage() {
  if (!youtubeApiMode) {
    chrome.storage.local.set(
      {
        // save check properties
        vidDownloadCheck0: domDownload,
        vidDownloadCheck1: removeVidSeq,
        vidDownloadCheck2: removeAudSeq,
        vidDownloadCheck3: mp3Download,
        vidQualityITag: vidQuality,
      },
      function () {}
    );
  } else {
    chrome.storage.local.set(
      {
        // save check properties
        vidDownloadCheck1: removeVidSeq,
        vidDownloadCheck2: removeAudSeq,
        vidDownloadCheck3: mp3Download,
        vidQualityITag: vidQuality,
      },
      function () {}
    );
  }
}
document.addEventListener('DOMContentLoaded', function () {
  /*Thanks to Wesley Maik
https://codepen.io/wesleymaik/pen/BaxaYVW
https://codepen.io/wesleymaik
*/
  //Selector
  const $ = (selector) => document.querySelector(selector);

  //Elements
  const input = $('#inputError'),
    eraser = $('#eraser'),
    pencil = $('#pencil');

  //Pencil animation
  input.addEventListener('input', () => {
    pencil.animate(
      [
        { transform: 'rotate(8deg)', offset: 0 },
        { transform: 'rotate(0deg)', offset: 0.2 },
        { transform: 'rotate(8deg)', offset: 0.5 },
        { transform: 'rotate(0deg)', offset: 1 },
      ],
      {
        easing: 'ease',
        duration: 1000,
      }
    );
  });

  //Eraser
  eraser.addEventListener('click', () => {
    const loop = () => {
      setTimeout(() => {
        input.readOnly = true;
        const value = input.value,
          erased = String(value).substring(0, value.length - 1);
        input.value = erased;
        value.length ? loop() : (input.readOnly = false);
      }, 25);
    };
    loop();
  });

  ///**/
  if (youtubeApiKey === 'xxxxx') {
    inputStuff('none');
    noInputStuff('block');
  } else {
    inputStuff('block');
    noInputStuff('none');
  }
  function inputStuff(mode) {
    let elms = document.querySelectorAll('.urlInputStuff');

    elms.forEach((elms) => {
      elms.style.display = mode;
    });
  }
  function noInputStuff(mode) {
    let elms = document.querySelectorAll('.noInputStuff');

    elms.forEach((elms) => {
      elms.style.display = mode;
    });
  }

  let opt1 = document.getElementById('opt1');
  let opt2 = document.getElementById('opt2');
  let opt3 = document.getElementById('opt3');
  let opt4 = document.getElementById('opt4');
  let opt5 = document.getElementById('opt5');
  opt3.click();
  vidDownloadBtn1 = document.getElementById('vidDownloadBtn1');
  vidDownloadBtn2 = document.getElementById('vidDownloadBtn2');
  vidDownloadBtnSpacer = document.getElementById('vidDownloadBtnSpacer');
  bodyVidDownload = document.getElementById('bodyVidDownload');
  let checkZero = document.getElementById('zeroCheck');
  let checkOne = document.getElementById('oneCheck');
  let checkTwo = document.getElementById('twoCheck');
  let checkThree = document.getElementById('threeCheck');
  let versions1 = document.getElementById('versions1');
  let versions2 = document.getElementById('versions2');

  let playlistCancel = document.getElementById('playlistCancel');

  github = document.getElementById('github'); // doubled declaration ....
  if (firstLoad) {
    //?
    firstLoad = false;
    teaCup = document.getElementById('teaCup');
    versions1.style.filter = 'brightness(0.5)';
    versions2.style.filter = 'brightness(0.5)';

    chrome.storage.local.get('downloading', function (result) {
      // if already downloading open downloading UIS
      let res = Object.values(result)[0];
      if (res === true) {
        chrome.storage.local.get('downloadMode', function (result) {
          let res = Object.values(result)[0];
          if (res === 'simple') {
            chrome.storage.local.get('currentTitle', function (result) {
              simpleDownloadDialog(Object.values(result)[0]);
            });
          } else {
            playlistDialog();
          }
        });
      } else {
        getCurrentTabId().then(function (res) {
          chrome.storage.local.set(
            {
              // save check properties
              ytTab: res,
            },
            function () {}
          );
        });
      }
    });
  }
  opt1.addEventListener('click', function () {
    vidQuality = 'highestvideo';
    updateLocalStorage();
  });
  opt2.addEventListener('click', function () {
    vidQuality = '137';
    updateLocalStorage();
  });
  opt3.addEventListener('click', function () {
    vidQuality = '136';
    updateLocalStorage();
  });
  opt4.addEventListener('click', function () {
    vidQuality = '135';
    updateLocalStorage();
  });
  opt5.addEventListener('click', function () {
    vidQuality = '134';
    updateLocalStorage();
  });

  document.getElementById('button1').addEventListener('click', function () {
    mode = 'downloadVideo';
    updatePages();
    chrome.storage.local.get(
      [
        'vidDownloadCheck0',
        'vidDownloadCheck1',
        'vidDownloadCheck2',
        'vidDownloadCheck3',
        'vidQualityITag',
      ],
      function (items) {
        let list = Object.values(items);
        if (list[0] === true) {
          checkZero.click();
        }
        if (list[1] === true) {
          checkOne.click();
        }
        if (list[2] === true) {
          checkTwo.click();
        }
        if (list[3] === true) {
          checkThree.click();
        }
        if (list[4] === 'highestvideo') {
          opt1.click();
        } else if (list[4] === '137') {
          opt2.click();
        } else if (list[4] === '136') {
          opt3.click();
        } else if (list[4] === '135') {
          opt4.click();
        } else {
          opt5.click();
        }
      }
    );
  });

  document.getElementById('button2').addEventListener('click', function () {
    mode = 'downloadGif';
  });

  vidDownloadBtn1.addEventListener('click', function () {
    mode = 'loading';
    downloadMode = 'simple';
    updatePages();
  });

  github.addEventListener('click', function () {
    if (github.style.visibility === 'visible') {
      window.open('https://github.com/AquaJo', '_blank');
    }
  });

  versions1.addEventListener('click', function () {
    /*
    document.getElementById("versionsBtn1").style.display = "none";
    //  document.getElementById("versionsBtn2").style.display = "none";
    bodyVidDownload.style.display = "none";
    bodyVidDownload.style.display = "none";
    let button1 = document.getElementById("button1");
    button1.style.display = "none";
    document.getElementById("listview").style.display = "block";
    document.getElementsByClassName("title").style.display = "none";
    document.getElementsByClassName("normBody").style.display = "none";
    for (let i = 0; i < 140; ++i) {
      appendList("version 0.22");
    }
    function appendList(input) {
      let article = document.createElement("article");
      article.classList.add("leaderboard__profile");
      let img = document.createElement("img");
      img.classList.add("leaderboard__picture");
      let span = document.createElement("span");
      span.classList.add("leaderboard__name");
      var text = document.createTextNode(input);
      span.appendChild(text);
      article.appendChild(img);
      article.appendChild(span);
      document.getElementById("leaderboards").appendChild(article);
    }*/
    if (versions1.style.filter === 'brightness(1)') {
      location.replace('./version-control/versions.html');
    }
  });
  versions2.addEventListener('click', function () {
    if (versions2.style.filter === 'brightness(1)') {
      location.replace('./version-control/versions.html');
    }
  });

  vidDownloadBtn2.addEventListener('click', function () {
    mode = 'loading';
    downloadMode = 'playlistSelect'; // maybe bit seamless
    updatePages();
  });
  checkZero.addEventListener('click', function () {
    domDownloadClick = !domDownloadClick;
    if (!youtubeApiMode) {
      domDownload = !domDownload;
      updatePages();
      updateLocalStorage();
    }
    let span = document.getElementById('spanZero');
    if (domDownloadClick) {
      if (!youtubeApiMode) {
        span.style.border = '.5em solid limegreen';
      } else {
        span.style.border = '.5em solid grey';
      }
    } else {
      span.style.removeProperty('border');
    }
  });

  checkOne.addEventListener('click', function () {
    if (removeVidSeq) {
      removeVidSeq = false;
      if (!mp3Download) {
        showVidDownloadQuality = true;
      } else {
        checkThree.click();
      }
    } else {
      removeVidSeq = true;
      showVidDownloadQuality = false;
    }
    if (removeAudSeq) {
      checkTwo.click();
    }
    updatePages();
    updateLocalStorage();
  });
  checkTwo.addEventListener('click', function () {
    if (removeAudSeq) {
      removeAudSeq = false;
    } else {
      removeAudSeq = true;
    }
    if (!showVidDownloadQuality) {
      checkOne.click();
    }
    if (mp3Download) {
      checkThree.click();
    }
    updatePages();
    updateLocalStorage();
  });
  checkThree.addEventListener('click', function () {
    if (mp3Download) {
      mp3Download = false;
      if (!removeVidSeq) {
        showVidDownloadQuality = true;
      }
    } else {
      mp3Download = true;
      if (!removeVidSeq) {
        checkOne.click();
      }
      showVidDownloadQuality = false;
    }
    if (removeAudSeq) {
      checkTwo.click();
    }
    updatePages();
    updateLocalStorage();
  });

  playlistDownloadBtn.addEventListener('click', function () {
    downloadMode = 'playlistDownload';
    updatePages();
  });

  playlistCancel.addEventListener('click', function () {
    chrome.runtime.sendMessage('playlistCancel', function (response) {});
    chrome.storage.local.set(
      {
        // save check properties
        downloading: false,
      },
      function () {
        chrome.storage.local.get('vidDownloadCheck0', function (result) {
          domDownload = Object.values(result)[0];

          if (domDownload) {
            chrome.storage.local.get('ytTab', function (result) {
              tab = Object.values(result)[0];
              chrome.tabs.sendMessage(
                tab,
                'deleteMp4Ticket',
                function (response) {
                  //location.replace("./index.html");
                }
              );
            });
          } else {
            location.replace('./index.html');
          }
        });
      }
    );
  });
  updatePages();
});

function interval() {
  window.location.href = nodejsURL + 'bump';
  setInterval(function () {
    window.location.href = nodejsURL + 'bump';
    console.log('interval bump executed');
  }, nodejsIntervalBumpTime * 60 * 1000);
}
