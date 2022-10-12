let downloadingURL = null;
let nodejsURL;

function downloaderDomFunction(mode) {
  chrome.runtime.sendMessage("getNodeUrl", function(response) {
    nodejsURL = response;
    if (mode === "popup") {
      chrome.runtime.sendMessage("download-infos", async function(response) {
        downloaderDomFunction2(response);
      });
    } else {
      let mainInfos = [false, false, false];
      let url;
      if (downloadingURL == null) {
        url = document.location.href;
      } else {
        url = downloadingURL;
        downloadingURL = null;
      }
      let urls = [];

      urls.push(url.split("/watch?v=")[1]); // same as from script.js (popup)
      if (url.includes("&list=")) {
        let code = urls[0].split("&list=")[0];
        urls = [];
        urls.push(code);
      } else if (url.includes("&t=")) {
        let urlT = urls[0].split("&t=")[0];
        urls = [];
        urls.push(urlT);
      }


      downloaderDomFunction2([mainInfos, urls, quality === "high" ? "136" : "135"]);
    }
    chrome.runtime.sendMessage("download-infos", async function(response) {});
  });
}

function downloaderDomFunction2(response) {
  let removeVid = response[0][0];
  let removeAud = response[0][1];
  let mp3 = response[0][2];
  let ids = response[1];
  let quality = response[2];
  try {
    document.getElementById("IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody").remove();
    document.getElementById("IAmAnInjectedSriptFromMoonloaderForProcessingDownloads").remove();
  } catch (error) {

  }
  let resString = "nodejsURL#" + nodejsURL + "###" + "removeVid#" + removeVid + "###" + "removeAud#" + removeAud + "###" + "mp3#" + mp3 + "###" + "ids#" + ids + "###" + "quality#" + quality;
  let text = document.createElement("pre");
  text.style.display = "none";
  text.innerHTML = resString;
  text.setAttribute("id", "IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody");
  document.body.appendChild(text);



  var s = document.createElement('script');
  s.src = chrome.runtime.getURL('DOMDownloader.js');
  s.setAttribute("id", "IAmAnInjectedSriptFromMoonloaderForProcessingDownloads");
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);


  // LISTEN FOR PRE ELEMENT CHANGE TO REGISTER DOWNLOADING END
  // identify an element to observe
  elementToObserve = document.getElementById("IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody");

  // create a new instance of 'MutationObserver' named 'observer',
  // passing it a callback function
  observer = new MutationObserver(function(mutationsList, observer) {
    //console.log(mutationsList);
    if (elementToObserve.innerHTML === "finished") {
      chrome.storage.local.set({
        "downloading": false
      }, function() {
        //console.log("downloading set to false");
        setTimeout(function() {
          chrome.runtime.sendMessage("tabClosed", function(response) {});
        }, 600)
      });
    } else if (elementToObserve.innerHTML === "update") {
      let currentIndex;
      let outStandingTitles;
      chrome.storage.local.get("playlistTitles", function(result) {
        playlistTitles = Object.values(result)[0];
        chrome.storage.local.get("currentIndex", function(result) {
          currentIndex = Object.values(result)[0];
          chrome.storage.local.get("outStandingTitles", function(result) {
            outStandingTitles = Object.values(result)[0];
            //console.log(outStandingTitles);
            outStandingTitles.push(playlistTitles[currentIndex])
            chrome.storage.local.set({ // ik lists in list ... would make more sense but Iam not using local storage more complicated as of now ^^ hopefully I wont regret it later
              "outStandingTitles": outStandingTitles,
              "currentTitle": playlistTitles[currentIndex + 1],
              "currentIndex": currentIndex + 1,
            }, function() {
              chrome.runtime.sendMessage("updatePlaylistDialog", function(response) {});
            });
          });
        });
      });
    }
  });

  // call 'observe' on that MutationObserver instance,
  // passing it the element to observe, and the options object
  observer.observe(elementToObserve, {
    characterData: false,
    childList: true,
    attributes: false
  })
}





chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //  console.log("test");
  if (request === 'playlistIds') {
    sendResponse(getPlaylistIds());
    getTitle();
  } else if (request === "getTitle") {
    sendResponse(getTitle());
  } else if (request === "getTitles") {
    sendResponse(getTitles());
  } else if (request === "getURL") {
    sendResponse(window.location.toString()); //////
  } else if (request === "downloaderDOM") {
    downloaderDomFunction("popup");
  } else if (request === "deleteMp4Ticket") { // SAME CODE AS deleteStatusTicketMp4.js KEEP IT UPDATED !!
    document.getElementById("IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody").innerHTML = "finished";
    //alert(document.getElementById("IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody").innerHTML);
    let nodejsURL;
    chrome.runtime.sendMessage("getNodeUrl", function(response) {
      nodejsURL = response;
      chrome.storage.local.get("mp4Ticket", function(result) {
        let ticket = Object.values(result)[0];
        fetch(`${nodejsURL}mp4DeleteTicket?ticket=${ticket}`, {
            method: 'GET'
          }).then(res => res.json())
          .then(json => {
            //  alert("req send");
            sendResponse("finished"); ////
          })
      });
    });
  }
  return true;
});

function getTitle() {

  let list = document.documentElement.innerHTML.split("<");
  let list2 = [];
  for (let i = 0; i < list.length; ++i) {
    let item = list[i];
    if (item.includes('yt-formatted-string force')) { //  for not needing an extern api / and key
      //console.log(item.split(">")[1]);
      if (item.split(">")[1] === "") {
        item = list[i + 1];
        item = item.split(">")[1];
        return (item);
      } else {
        return (item.split(">")[1]);
      }
    }
  }

}

function getTitles() { // ....... can output / return multiple playlists --> for actual playlist titles further handling in pageUpdater.js --> filtering out the last items from list (last x many as ids returned)
  let list = document.documentElement.innerHTML.split("<");
  let list2 = [];
  for (let i = 0; i < list.length; ++i) {
    let item = list[i];
    //item = item.replace("\\","/");
    if (item.includes('div id="content" class="style-scope')) {
      scan = true;
    }
    if (item.includes('span id="video-title"') && item.includes("ytd-playlist-panel") && scan === true) {
      //console.log(item);
      let res = item.split(">\n")[1];
      let c = 0;
      while (res.charAt(c) === ' ') {
        c++;
      }
      res = res.substring(c, res.length - 1);
      res = res.split("\n")[0];
      list2.push(res); //item.split('>')[1]);
    }
  }




  return list2;
}

function getPlaylistIds() { //bit inefficent but should works ... --> "workaround for finding ids of "mix-playlists" --> not working with youtube api (I think)
  let list = document.documentElement.innerHTML.split("<");
  let list2 = [];

  let counter = 0;
  let scan = false;
  for (let i = 0; i < list.length; ++i) {
    let item = list[i];
    //item = item.replace("\\","/");
    if (item.includes('div id="content" class="style-scope')) { // fix --> sometimes there were too many songs in list (from before) (if no complete reaload happened)
      scan = true;
    }
    if (item.includes("href") && item.includes("wc-endpoint") && scan === true) {
      item = item.split('href=\"/watch?v=')[1];
      item = item.split('&amp')[0];
      list2.push(item);
    }
  }
  return list2;
}








let manifestData = chrome.runtime.getManifest();
let downloadBlock;
let downloadClicked = false;

function checkNode() { // based on the starting script in script.js (popup), checking for the nodejs - server
  chrome.runtime.sendMessage("getNodeUrl", function(response) {
    let nodejsURL = response;
    try { // actually catching in the fetching function (!)
      fetching();
    } catch (error) {
      //alert("error recognized during fetcdh");
      setTimeout(function() {
        fetching();
      }, 800);
      //fetching();
    }

    function fetching() {
      fetch(`${nodejsURL}versionControl`, {
          method: 'GET'
        }).then(res => res.json())
        .then(json => {
          let versionLog = json;
          //alert("abc1");
          setTimeout(function() { // bumping control ... elements should be loaded
            //console.group("version-controlling moonloader");
            //console.log("versionLog: \n" + versionLog);
            //console.log(" & bump interval started");


            if (!JSON.stringify(versionLog).includes("thisIsThePublicMoonloaderVersionAndBecauseOfThisTheVersionControlFeatureIsNotAvailableBecauseItsRunningOverAnotherGlitchAppForUpdatingCheckTheNewestGithubVersion")) { // key for detecting public version without version control
              let versionLogList = versionLog.split(";\n");
              //console.log(versionLogList.length);
              versionLogList.pop();
              //console.log(versionLogList);

              let availableVersionsList = [];
              let allVersions = [];
              let allStati = [];
              let allUrls = [];
              for (let i = 0; i < versionLogList.length; ++i) {
                let items = versionLogList[i].split("<>");
                allVersions.push(items[0]);
                allStati.push(items[1]);
                allUrls.push(items[2]);
                if (items[1] === "available") {
                  availableVersionsList.push(items[0]);
                }
              }
              //console.log(allUrls);
              //console.log(allStati);
              chrome.storage.local.set({
                'allVersions': allVersions,
                'allStati': allStati,
                'allUrls': allUrls
              }, function() {});

              //console.log(availableVersionsList);
              // check if not newest / newest version / supported
              let myVersion = manifestData.version;
              let indexOfMyVersion = availableVersionsList.indexOf(myVersion);
              if (indexOfMyVersion < availableVersionsList.length - 1 && indexOfMyVersion != -1) {
                //console.log("not newest available version but supported");
                /*chrome.storage.local.get("showWarning", function(result) {
                  if (result.showWarning !== false) {
                    if (confirm("Your version isn't the newest one - consider version updating! There is the possibility of shutdowns of older versions in the future because of complications or major bugs. Click the 'versions'-button to download a newer version. Also there might be new features - for that read changelogs. Want to hear this message again then click 'okay'")) {

                    } else {
                      chrome.storage.local.set({
                        'showWarning': false
                      }, function() {});
                    }
                  } else {}
                  //storageClear();
                });*/
                downloadBlock = false;
                furtherDownloadCheck();
                //alert("not newest")
              } else if (indexOfMyVersion == -1) {
                console.log("version not longer available / supported");
                //alert("Your version is no longer supported! Please click on the 'versions'-button to download another - available - version.");
                downloadBlock = true;
                subText.innerHTML += "<br />" + "<span style='color: #FF5349;'>* your moonloader - version is no longer supported! </span>";
                //alert("not sup")
              } else {
                //console.log("newest version: all okay");
                downloadBlock = false;
                furtherDownloadCheck();
                //alert("all fine");
              }
              //console.groupEnd();
            } else {
              downloadBlock = false;
              furtherDownloadCheck();
            }
            function furtherDownloadCheck() {
              setTimeout(function() {
                //alert("clicked:  "+downloadClicked);
                if (downloadClicked) {
                  //alert("abc2");
                  startDownloadingThisTitle();
                }
                downloadClicked = false;
              }, 1000);
            }
          }, 50); //
        })
        .catch((error) => {
          alert("error while fetching, retrying in some seconds automatically");
          setTimeout(function() {
            fetching();
          }, 4000);
        });
    }
  });
}
let downloadBtnRes;
let selectBox;
let qualityElement;
let quality = "medium";
let subText;
let downloadCounter = 0;

function updateYTDownloadDialog(bump) {
  let downloadDialog = document.getElementsByTagName("ytd-offline-promo-renderer")[0];
  //console.log(downloadDialog);
  let children = downloadDialog.children;
  let title;
  let mainText;
  let downloadBtn;
  for (let c = 0; c < children.length; ++c) { // FINDING ELEMENTS
    if (children[c].id === "title") {
      title = children[c];

    } else if (children[c].id === "subtitle") {
      mainText = children[c];

    } else if (children[c].id === "description") {
      subText = children[c];
    } else if (children[c].getAttribute('class') === "buttons style-scope ytd-offline-promo-renderer") {
      let children2 = children[c].children;
      for (let i = 0; i < children2.length; ++i) {
        if (children2[i].id === "action-button") {
          downloadBtn = children2[i];
        } else if (children2[i].id === "dismiss-button") {
          downloadBtnRes = children2[i];
        }
      }
    } else if (children[c].id === "premium-options") {
      try {
        selectBox = children[c];
        qualityElement = children[c].children[0].children[0].children[0];

      } catch (e) {

      }
    }
  }

  // set download btn
  let btnTextEl = downloadBtnRes.children[0].children[0].children[0];
  btnTextEl.innerHTML = "download";

  title.innerHTML = "Dieses Video ohne Premium herunterladen";

  subText.innerHTML = "* dialog modified by moonloader" + "<br />" + "* for more customization click the app-icon" + "<br />" + "* keep in mind, connecting to glitch can take a moment";
  if (downloadCounter == 0) {
    downloadBtn.remove();
    mainText.remove();
    downloadCounter++;
  }
  if (bump) {
    checkNode()
  }
}
let observer2 = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      // do things to your newly added nodes here
      let node = mutation.addedNodes[i];
      if (node.id === "headers-icon") {
        downloadBlock = true;
        updateYTDownloadDialog(true);


        downloadBtnRes.addEventListener("click", downloadClick);
        selectBox.addEventListener("click", selectionClick);

        function selectionClick() {
          try {
            //alert(selectBox.getElementsByTagName("ytd-settings-radio-option-renderer").length);
            if (selectBox.getElementsByTagName("ytd-settings-radio-option-renderer").length == 2) {
              //console.log(qualityElement.ariaChecked);
              if (qualityElement.ariaChecked === "false") {
                quality = "medium";
              } else {
                quality = "high";
              }
            }
            //alert(quality);
          } catch (err) {

          }
        }

        setTimeout(function() { // listen for new opening / close
          let downloadDialogMain = document.getElementsByTagName("tp-yt-paper-dialog")[0];

          let changeCounter = 0;
          let observer3 = new MutationObserver(function(mutations) { // ik
            if (changeCounter % 2 == 1) {
              quality = "medium";
              downloadBlock = true;
              updateYTDownloadDialog(true);
            }
            changeCounter++;
          });

          observer3.observe(downloadDialogMain, {
            attributes: true,
            attributeFilter: ['style']
          });

          //console.log(downloadDialogMain);
        }, 200);

        function downloadClick() {
          chrome.storage.local.get("downloading", function(result) {
            downloading = Object.values(result)[0];
            let title = getTitle();
            chrome.storage.local.set({
              "downloading": true,
            }, function() {
              if (!downloading) {
                chrome.storage.local.set({
                  "downloadMode": "simple"
                }, function() {
                  if (!downloadBlock) {
                    downloadingURL = document.location.href;
                    startDownloadingThisTitle();
                    chrome.runtime.sendMessage("listenForTabCloseAndReset", function(response) {});
                    chrome.storage.local.set({
                      "currentTitle": title
                    }, function() {});
                  } else if (downloadBlock) {
                    //alert("download blocked --> downloadClicked ----> true");
                    downloadClicked = true;
                    chrome.runtime.sendMessage("listenForTabCloseAndReset", function(response) {});
                    chrome.storage.local.set({
                      "currentTitle": title
                    }, function() {});
                  }
                });
              }
            });
          });
          //alert(quality);
          //alert("t")
          //selectBox.removeEventListener("click", selectionClick);
          //downloadBtnRes.removeEventListener("click", downloadClick);
        }
      }
    }
  })
})

function startDownloadingThisTitle() {
  //let title = getTitle();
  /*chrome.storage.local.set({
    "downloading": true,
    "downloadMode": "simple",
    "currentTitle": title
  }, function() {*/

  downloaderDomFunction("fromYt");

  //});
}

observer2.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
})
