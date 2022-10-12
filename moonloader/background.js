self.importScripts('config.js');
/*self.importScripts('libs/firebase-app.js');
self.importScripts('libs/firebase-database.js');
self.importScripts('libs/firebase-storage.js');
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  databaseURL: databaseURL,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();
mainRef = database.ref(savePath);

function gotDataTicketListener(data) {
  let dataVal = data.val();
  chrome.runtime.sendMessage({
    ticketListenerFinished: dataVal
  })
}

function errData() {}*/
//console.log(await getData(request.getFirebase));
async function getCurrentTabId() {
  let queryOptions = {
    active: true,
    lastFocusedWindow: true,
  };

  return new Promise(async (resolve) => {
    let [tab] = await chrome.tabs.query(queryOptions);
    //console.log("in f: " + tab.id);
    resolve(tab.id);
  });
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  //let [tab] = await chrome.tabs.query(queryOptions);
  //console.log([await chrome.tabs.query(queryOptions)].id);
  //return await chrome.tabs.query(queryOptions).id;
}
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  //getCurrentTabId();
  if (request === 'getNodeUrl') {
    sendResponse(nodejsURL);
  } else if (request === 'getBumpTime') {
    sendResponse(nodejsIntervalBumpTime);
  } else if (request === 'mainRef') {
    sendResponse(savePath);
  } else if (request === 'firebaseURL') {
    sendResponse(databaseURL);
  } else if (request === 'youtubeDataApiPages') {
    sendResponse(youtubeDataApiPageNumber);
  } else if (request.getFirebase != null) {
    //
    const promise = new Promise(async (resolve) => {
      /* gets active tab info */
      let res;
      await mainRef
        .child(request.getFirebase)
        .get()
        .then(function (snapshot) {
          //try {
          let data = snapshot.val();
          if (data != null) {
            res = data;
          }
        });
      resolve(res);
    });

    promise.then((tab) => {
      sendResponse(tab);
    });
  } else if (request.setFirebase != null) {
    mainRef.child(request.setFirebase[0]).set(request.setFirebase[1]);
    sendResponse('finished');
  } else if (request.setFBTicketListener != null) {
    mainRef
      .child('/tickets/' + request.setFBTicketListener + '/finished')
      .on('value', gotDataTicketListener, errData);
  } else if (request.deleteFirebase != null) {
    mainRef.child(request.deleteFirebase).removeValue();
    sendResponse('finished');
  } else if (request === 'download-popup') {
    /*chrome.windows.getCurrent(function(winCurrent){
        chrome.windows.create({url: "downloader/downloader.html"}, function(win){
            chrome.windows.update(winCurrent.id, {focused: true});
        });
    });*/
    /*chrome.windows.getCurrent(function(winCurrent){
        chrome.windows.create({url: "downloader/downloader.html"}, function(win){
            chrome.windows.update(winCurrent.id, {focused: true});
        });
    });*/

    chrome.windows.create({
      url: 'popup/downloader/downloader.html',
      type: 'popup',
      left: 100,
      focused: false,
      width: 400,
      height: 300,
    });

    //sendResponse(win);
    //}
    sendResponse('finished');
  } else if (request === 'startTabListening') {
    // popup side ... also recognizing full tab close
    let old;
    let tabOpen = 'true';
    chrome.storage.local.get('ytTab', function (result) {
      res = Object.values(result)[0];

      tab = res;
      chrome.tabs.onRemoved.addListener(function tabRemoved(res, removed) {
        // ik ...
        if (res === tab) {
          console.log('closed');
          tabOpen = 'false2';
          chrome.tabs.onRemoved.removeListener(tabRemoved);
        }
      }); // overload
      let falseC = 0;
      downloadTabOpen = setInterval(function () {
        chrome.storage.local.get('downloadCounter', function (result) {
          res = Object.values(result)[0];
          //console.log(res);
          //alert(res);
          console.log(res);
          if (old == res) {
            console.log(tabOpen);
            if (tabOpen === 'false2') {
              tabOpen = 'true';
            }
            clearInterval(downloadTabOpen);
            setTimeout(function () {
              chrome.storage.local.set(
                {
                  downloading: false,
                },
                function () {
                  chrome.runtime.sendMessage('tabClosed', function (response) {
                    if (!chrome.runtime.lastError) {
                    } else {
                    }
                  });
                }
              );
              console.log('falseC : ' + falseC);
              console.log('tabOpen : ' + tabOpen);
              if (tabOpen === 'true' || falseC < 3) {
                chrome.tabs.sendMessage(
                  tab,
                  'deleteMp4Ticket',
                  function (response) {
                    if (!chrome.runtime.lastError) {
                    } else {
                    }
                  }
                );
              } else {
                createStatusTicketDeleter(); // if tab was closed
              }
            }, 600);
          } else {
            if (tabOpen === 'false2') {
              tabOpen = 'false';
              console.log('real false');
              falseC++;
            }
          }
          old = res;
        });
        if (tabOpen === 'false') {
          falseC++;
        }
      }, 1000);
    });
  } else if (request === 'listenForTabCloseAndReset') {
    // full tab side      ....    instant event ... for dom download only
    getCurrentTabId().then(function (res) {
      let ytTab = res;
      console.log('ytTab = ' + ytTab);
      //console.log(res);
      //sendResponse(res);
      chrome.storage.onChanged.addListener(storageListener);

      function storageListener(changes, namespace) {
        chrome.storage.local.get('downloading', function (result) {
          res = Object.values(result)[0];
          if (res === false) {
            chrome.tabs.onRemoved.removeListener(tabListener);
            chrome.storage.onChanged.removeListener(storageListener);
          }
        });
      }

      chrome.tabs.onRemoved.addListener(tabListener);

      async function tabListener(res, removed) {
        console.log(
          'closed tab Id: ' + res + '   ...   listening for id: ' + ytTab
        );
        if (res === ytTab) {
          //alert("tab closed")
          chrome.tabs.onRemoved.removeListener(tabListener);
          chrome.storage.onChanged.removeListener(storageListener);
          chrome.storage.local.get('downloading', function (result) {
            //console.log("onRemove registrated");
            res = Object.values(result)[0];
            console.log('downloading: ' + res);
            if (res === true) {
              //console.log("tab closed");
              chrome.storage.local.set(
                {
                  downloading: false,
                },
                function () {
                  createStatusTicketDeleter();
                }
              );
            }
          });
        }
      }
      /*chrome.tabs.onUpdated.addListener(function(res, changeInfo, tab) {
        chrome.storage.local.get("downloading", function(result) {
          console.log("onUpdate registrated");
          res = Object.values(result)[0];
          if (res === true) {
            console.log("tab closed");
            chrome.storage.local.set({
              "downloading": false
            }, function() {
              createStatusTicketDeleter();
            });
          }
        });
      });*/
    });
  } else if (request === 'playlistCancel') {
    console.log('playlist-canceling detected');
    //clearInterval(downloadTabOpen);
  } else if (request === 'youtubeDataApiKey') {
    sendResponse(youtubeDataApiKey);
  }
  return true;
});
let downloadTabOpen;

// shortened firebase functions
async function getData(path) {
  let pathr = savePath + path;
  let res = false;
  let ref = database.ref(pathr.substring(0, pathr.lastIndexOf('/')));
  let child = pathr.substring(pathr.lastIndexOf('/') + 1, pathr.length);
  //console.log("ref: " + path.substring(0, path.lastIndexOf("/")) + "   child: " + path.substring(path.lastIndexOf("/") + 1, path.length));
  await ref
    .child(child)
    .get()
    .then(async function (snapshot) {
      //try {
      let data = snapshot.val();
      if (data != null) {
        res = data;
      }
      //} catch (error) {}
    });
  return res;
}

let tab;
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(function () {
      chrome.storage.local.set(
        {
          popupOpen: false,
        },
        function () {
          console.log('popupState - closed');
        }
      );
    });
  }
});

chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.set(
    {
      downloading: false,
    },
    function () {
      console.log('downloading set to false');
    }
  );
});

function createStatusTicketDeleter() {
  chrome.windows.create({
    url: 'popup/deleteStatusTicketMp4/deleteStatusTicketMp4.html',
    type: 'popup',
    left: 100,
    focused: false,
    width: 1,
    height: 1,
  });
}
