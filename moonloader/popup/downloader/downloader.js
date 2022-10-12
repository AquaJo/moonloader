

let ids;
let quality;
let removeVid;
let removeAud;
let mp3;
let nodejsURL;

function afking() {
  fetch(`${nodejsURL}mp3afk`, {
    // reset on window close      ////////
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => {
      afking();
    });
}

let c = 0;
let changeInterval = setInterval(function () {
  c = c + 1;
  console.log('change: ' + c);
  chrome.storage.local.set(
    {
      downloadCounter: c,
    },
    function () {}
  );
}, 200);

chrome.runtime.sendMessage('startTabListening', function (response) {
  if (!chrome.runtime.lastError) {
  } else {
  }
}); ///////////////////////////////////////////////////////////////////////// !!
chrome.runtime.sendMessage('getNodeUrl', function (response) {
  if (!chrome.runtime.lastError) {
  } else {
  }
  nodejsURL = response;

  chrome.runtime.sendMessage('download-infos', async function (response) {
    if (!chrome.runtime.lastError) {
    } else {
    }
    removeVid = response[0][0];
    removeAud = response[0][1];
    mp3 = response[0][2];
    ids = response[1];
    quality = response[2];
    console.log(response);
    if (mp3) {
      downloadMp3Titles(ids, 0);
    } else {
      fetch(`${nodejsURL}mp4CreateTicket`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .then((json) => {
          let ticket = json;
          chrome.storage.local.set(
            {
              // ik lists in list ... would make more sense but Iam not using local storage more complicated as of now ^^ hopefully I wont regret it later
              mp4Ticket: ticket,
            },
            function () {
              //chrome.runtime.sendMessage("startTabListening", function(response) {}); ///////////////////////////////////////////////////////////////////////// !!
              chrome.runtime.sendMessage(
                'updatePlaylistDialog',
                function (response) {
                  if (!chrome.runtime.lastError) {
                  } else {
                  }
                }
              );
            }
          );
          console.log(json);
          downloadMp4Titles(ids, quality, ticket, 0);
        });
    }
  });
});

function updatePlaylistDialog(ids) {
  if (ids.length > 1) {
    //
    let currentIndex;
    let outStandingTitles;
    chrome.storage.local.get('playlistTitles', function (result) {
      playlistTitles = Object.values(result)[0];
      chrome.storage.local.get('currentIndex', function (result) {
        currentIndex = Object.values(result)[0];
        chrome.storage.local.get('outStandingTitles', function (result) {
          outStandingTitles = Object.values(result)[0];
          console.log(outStandingTitles);
          outStandingTitles.push(playlistTitles[currentIndex]);
          chrome.storage.local.set(
            {
              // ik lists in list ... would make more sense but Iam not using local storage more complicated as of now ^^ hopefully I wont regret it later
              outStandingTitles: outStandingTitles,
              currentTitle: playlistTitles[currentIndex + 1],
              currentIndex: currentIndex + 1,
            },
            function () {
              chrome.runtime.sendMessage(
                'updatePlaylistDialog',
                function (response) {
                  if (!chrome.runtime.lastError) {
                  } else {
                  }
                }
              );
            }
          );
        });
      });
    });
  }
}
async function downloadMp4Titles(ids, quality, ticket, counter) {
  fetch(`${nodejsURL}mp4Timeout?ticket=${ticket}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => {
      if (json === 'deleted') {
        chrome.storage.local.set(
          {
            downloading: false,
          },
          function () {
            console.log('downloading set to false');
            setTimeout(function () {
              chrome.runtime.sendMessage('tabClosed', function (response) {
                if (!chrome.runtime.lastError) {
                } else {
                }
              });
              window.close();
            }, 600);
          }
        );
      } else {
        if (counter + 1 < ids.length) {
          setTimeout(function () {
            updatePlaylistDialog(ids);
            downloadMp4Titles(ids, quality, ticket, counter + 1);
          }, 300);
        } else {
          setTimeout(function () {
            chrome.storage.local.set(
              {
                downloading: false,
              },
              function () {
                console.log('downloading set to false');
              }
            );
            window.close();
          }, 1000);
        }
      }
    });
  if (counter + 1 < ids.length) {
    window.location.href =
      nodejsURL +
      'downloadmp4?settings=' +
      ids[counter] +
      '-*split*-' +
      !removeVid +
      '-*split*-' +
      !removeAud +
      '-*split*-' +
      quality +
      '-*split*-' +
      ticket;
  } else {
    window.location.href =
      nodejsURL +
      'downloadmp4?settings=' +
      ids[counter] +
      '-*split*-' +
      !removeVid +
      '-*split*-' +
      !removeAud +
      '-*split*-' +
      quality +
      '-*split*-' +
      ticket +
      '-*split*- thx';
  }
}
async function downloadMp3Titles(ids, counter) {
  if (counter == 0) {
    /// request if query empty
    fetch(`${nodejsURL}mp3InProgress`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        if (json.includes('true')) {
          console.log(
            'abrupt end : someone alredy downloading mp3 files on this server'
          );
          chrome.storage.local.set(
            {
              downloading: false,
            },
            function () {
              console.log('downloading set to false');
            }
          );
          window.close();
        } else {
          /*fetch(`${nodejsURL}mp3afk`, { // reset on window close      ////////
              method: 'GET'
            }).then(res => res.json())
            .then(json => {});*/
          downloadMp3Titles(ids, 1);
        }
      });
  } else {
    fetch(`${nodejsURL}mp3Timeout`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((json) => {
        console.log('status: finished detected');
        if (counter != ids.length) {
          updatePlaylistDialog(ids);
          downloadMp3Titles(ids, counter + 1);
        } else {
          fetch(`${nodejsURL}mp3InProgressFalse`, {
            method: 'GET',
          })
            .then((res) => res.json())
            .then((json) => {
              setTimeout(function () {
                chrome.storage.local.set(
                  {
                    downloading: false,
                  },
                  function () {
                    console.log('downloading set to false');
                  }
                );
                window.close();
              }, 1000);
            });
        }
      });

    console.log('downloading ' + ids[counter - 1]);
    setTimeout(function () {
      if (counter != ids.length) {
        window.location.href =
          nodejsURL +
          'downloadmp3?settings=' +
          ids[counter - 1] +
          '<>' +
          'playlistDwnld';
      } else {
        window.location.href =
          nodejsURL +
          'downloadmp3?settings=' +
          ids[counter - 1] +
          '<>' +
          'playlistDwnld' +
          '<>ThxNodeJsServerImTheLastOne';
      }
    }, 50);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === 'playlistCancel') {
    window.close();
    sendResponse('finished');
  }
});
