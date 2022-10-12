//particle.JS.load('particle-div','libs/particle-cfg.json');
let youtubeApiMode = false;
chrome.runtime.connect({
  name: 'popup',
});

chrome.storage.local.set(
  {
    popupOpen: true,
  },
  function () {
    console.log('popupState - open');
  }
);

let databaseURL;
let nodejsURL;
let versionLog;
let mainMenueLock = true;
let nodejsIntervalBumpTime;
let manifestData = chrome.runtime.getManifest();
chrome.runtime.sendMessage('getBumpTime', function (response) {
  nodejsIntervalBumpTime = response;
});

chrome.runtime.sendMessage('firebaseURL', function (response) {
  databaseURL = response;
});

function storageClear() {
  chrome.storage.local.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    } else {
    }
    // do something more
  });
  chrome.storage.sync.clear(); // callback is optional
}
chrome.runtime.sendMessage('getNodeUrl', function (response) {
  nodejsURL = response;
  fetch(`${nodejsURL}versionControl`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => {
      versionLog = json;
      setTimeout(function () {
        // bumping control ... elements should be loaded
        mainMenueLock = false;
        teaCup.style.display = 'none';
        console.group('version-controlling');
        console.log('versionLog: \n' + versionLog);
        console.log(' & bump interval started');
        interval();
        if (
          !JSON.stringify(versionLog).includes(
            'thisIsThePublicMoonloaderVersionAndBecauseOfThisTheVersionControlFeatureIsNotAvailableBecauseItsRunningOverAnotherGlitchAppForUpdatingCheckTheNewestGithubVersion'
          )
        ) {
          // key for detecting public version without version control
          let versionLogList = versionLog.split(';\n');
          console.log(versionLogList.length);
          versionLogList.pop();
          console.log(versionLogList);

          let availableVersionsList = [];
          let allVersions = [];
          let allStati = [];
          let allUrls = [];
          for (let i = 0; i < versionLogList.length; ++i) {
            let items = versionLogList[i].split('<>');
            allVersions.push(items[0]);
            allStati.push(items[1]);
            allUrls.push(items[2]);
            if (items[1] === 'available') {
              availableVersionsList.push(items[0]);
            }
          }
          console.log(allUrls);
          console.log(allStati);
          chrome.storage.local.set(
            {
              allVersions: allVersions,
              allStati: allStati,
              allUrls: allUrls,
            },
            function () {}
          );

          console.log(availableVersionsList);
          // check if not newest / newest version / supported
          let myVersion = manifestData.version;
          let indexOfMyVersion = availableVersionsList.indexOf(myVersion);
          if (
            indexOfMyVersion < availableVersionsList.length - 1 &&
            indexOfMyVersion != -1
          ) {
            console.log('not newest available version but supported');
            versions2.style.color = '#daa520';
            versions1.style.color = '#daa520';
            chrome.storage.local.get('showWarning', function (result) {
              if (result.showWarning !== false) {
                if (
                  confirm(
                    "Your version isn't the newest one - consider version updating! There is the possibility of shutdowns of older versions in the future because of complications or major bugs. Click the 'versions'-button to download a newer version. Also there might be new features - for that read changelogs. Want to hear this message again then click 'okay'"
                  )
                ) {
                } else {
                  chrome.storage.local.set(
                    {
                      showWarning: false,
                    },
                    function () {}
                  );
                }
              } else {
              }
              //storageClear();
            });
          } else if (indexOfMyVersion == -1) {
            mainMenueLock = true;
            console.log('version not longer available / supported');
            versions2.style.color = '#d8392b';
            versions1.style.color = '#d8392b';
            alert(
              "Your version is no longer supported! Please click on the 'versions'-button to download another - available - version."
            );
          } else {
            console.log('newest version: all okay');
            versions2.style.color = '#38a32a';
            versions1.style.color = '#38a32a';
          }
          console.groupEnd();
          versions1.style.filter = 'brightness(1)';
          versions2.style.filter = 'brightness(1)';
        } else {
          //alert("public v")
          console.log(
            'no version controlling supported - public version --> keep updating through using the newest github version'
          );
          versions2.style.color = '#38a32a';
          versions1.style.color = '#38a32a';
        }
      }, 50); //
    });
});

async function getFirebase(path) {
  let res;
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        getFirebase: path,
      },
      function (response) {
        if (!chrome.runtime.lastError) {
        } else {
        }
        res = response;

        resolve(res);
      }
    );
  });
}

function setFirebase(path, value) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        setFirebase: [path, value],
      },
      function (response) {
        if (!chrome.runtime.lastError) {
        } else {
        }
        resolve('finished');
      }
    );
  });
}

let downloadMode2 = 'simple'; //...
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.ticketListenerFinished != null) {
    if (request.ticketListenerFinished === true) {
      console.log('detected download finished alert from firebase');
      chrome.runtime.sendMessage(
        {
          deleteFirebase: 'tickets/' + randomTicket,
        },
        function (response) {
          if (!chrome.runtime.lastError) {
          } else {
          }
        }
      );
      mode = 'downloadFinished';
      updatePages();
    }
  } else if (request === 'download-infos') {
    let mainInfos = [removeVidSeq, removeAudSeq, mp3Download];
    let quality = vidQuality;
    let urls = [];
    //downloadMode = "playlist";
    if (ids.length > 0 && downloadMode2 === 'playlist') {
      urls = ids;
    } else {
      // maybe not needed ...
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
    }
    //alert([mainInfos, urls, quality]);
    //alert(urls);
    //alert(urls);
    sendResponse([mainInfos, urls, quality]);
  } else if (request === 'tabClosed') {
    //alert("hi");
    location.replace('./index.html');
  } else if (request === 'updatePlaylistDialog') {
    chrome.storage.local.get('downloadMode', function (result) {
      res = Object.values(result)[0];
      if (res === 'playlist') {
        playlistDialog();
      }
    });
  }
});
