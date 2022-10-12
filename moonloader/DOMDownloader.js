//alert(document.getElementById("IAmAInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody").innerHTML);
preElementMoonloader = document.getElementById("IAmAnInjectedPreTextFromMoonloaderToCommunicateWithTheDownloaderWhichIsAlsoInThisDomElementButInTheHeadIAmInTheBody");
infosMoonloader = preElementMoonloader.innerHTML;
infosMoonloader = infosMoonloader.split("###");
infos2Moonloader = [];
for (let i = 0; i < infosMoonloader.length; ++i) {
  let item = infosMoonloader[i].split("#");
  infos2Moonloader.push(item[0]);
  infos2Moonloader.push(item[1]);
}
infosHeaderMoonloader = [];
infosContentMoonloader = [];
for (let i = 0; i < infos2Moonloader.length; ++i) {
  if (i % 2 == 0) {
    infosHeaderMoonloader.push(infos2Moonloader[i]);
  } else {
    infosContentMoonloader.push(infos2Moonloader[i]);
  }
}

nodejsURLMoonloader = infosContentMoonloader[infosHeaderMoonloader.indexOf("nodejsURL")];

removeVidMoonloader = infosContentMoonloader[infosHeaderMoonloader.indexOf("removeVid")] === "true" ? true : false;
removeAudMoonloader = infosContentMoonloader[infosHeaderMoonloader.indexOf("removeAud")] === "true" ? true : false;
mp3Moonloader = infosContentMoonloader[infosHeaderMoonloader.indexOf("mp3")] === "true" ? true : false;
idsMoonloader = [];
idsMoonloader = (infosContentMoonloader[infosHeaderMoonloader.indexOf("ids")]).split(",");
//alert(idsMoonloader);
quality = infosContentMoonloader[infosHeaderMoonloader.indexOf("quality")];

//alert(nodejsURLMoonloader+removeVidMoonloader+removeAudMoonloader+mp3Moonloader+idsMoonloader+quality);

function afking() {
  fetch(`${nodejsURLMoonloader}mp3afk`, { // reset on window close      ////////
      method: 'GET'
    }).then(res => res.json())
    .then(json => {
      afking();
    });
}

function updatePlaylistDialog()  {
  //alert("update now");
  preElementMoonloader.innerHTML = "update";
}

if (mp3Moonloader) {
  downloadmp3MoonloaderTitles(idsMoonloader, 0);
} else {
  fetch(`${nodejsURLMoonloader}mp4CreateTicket`, {
      method: 'GET'
    }).then(res => res.json())
    .then(json => {
      let ticket = json;
      //console.log(json);
      downloadMp4Titles(idsMoonloader, quality, ticket, 0);
    })
}


async function downloadMp4Titles(ids, quality, ticket, counter) {
  fetch(`${nodejsURLMoonloader}mp4Timeout?ticket=${ticket}`, {
      method: 'GET'
    }).then(res => res.json())
    .then(json => {
      //alert(preElementMoonloader.innerHTML);
      if(json === "deleted") {
        preElementMoonloader.innerHTML = "finished";
      } else if (preElementMoonloader.innerHTML !== "finished") {
      if (counter + 1 < ids.length) {
        setTimeout(function() {
          updatePlaylistDialog(); //
          downloadMp4Titles(ids, quality, ticket, counter + 1);
        }, 300);
      } else {
        setTimeout(function() {
          preElementMoonloader.innerHTML = "finished";
        }, 1000);
      }
    }
    })
  if (counter + 1 < ids.length) {
    window.location.href = nodejsURLMoonloader + "downloadmp4?settings=" + ids[counter] + "-*split*-" + !removeVidMoonloader + "-*split*-" + !removeAudMoonloader + "-*split*-" + quality + "-*split*-" + ticket;
  } else {
    window.location.href = nodejsURLMoonloader + "downloadmp4?settings=" + ids[counter] + "-*split*-" + !removeVidMoonloader + "-*split*-" + !removeAudMoonloader + "-*split*-" + quality + "-*split*-" + ticket + "-*split*- thx";
  }
}
async function downloadmp3MoonloaderTitles(ids, counter) {
  if (counter == 0) { /// request if query empty
    fetch(`${nodejsURLMoonloader}mp3InProgress`, {
        method: 'GET'
      }).then(res => res.json())
      .then(json => {
        //console.log(json);
        if (json.includes("true")) {
          //console.log("abrupt end : someone alredy downloading mp3Moonloader files on this server");
          preElementMoonloader.innerHTML = "finished";
          /*chrome.storage.local.set({
            "downloading": false
          }, function() {
            console.log("downloading set to false")
          });
          window.close();*/
        } else {
          /*fetch(`${nodejsURLMoonloader}mp3Moonloaderafk`, { // reset on window close      ////////
              method: 'GET'
            }).then(res => res.json())
            .then(json => {});*/

          downloadmp3MoonloaderTitles(ids, 1);
        }
      })
  } else {

    fetch(`${nodejsURLMoonloader}mp3Timeout`, {
        method: 'GET'
      }).then(res => res.json())
      .then(json => {
        //console.log("status: finished detected");
        if (counter != ids.length) {
          if (json === "aborted") {
            preElementMoonloader.innerHTML = "finished";
          } else if (preElementMoonloader.innerHTML !== "finished") {
            updatePlaylistDialog(); //
            downloadmp3MoonloaderTitles(ids, counter + 1);
          } else {
            window.location.href = nodejsURLMoonloader + "mp3ToFalse";
          }
        } else {
          fetch(`${nodejsURLMoonloader}mp3InProgressFalse`, {
              method: 'GET'
            }).then(res => res.json())
            .then(json => {
              setTimeout(function() {
                preElementMoonloader.innerHTML = "finished";
                //window.close();
              }, 1000);
            })
        }
      });

    //console.log("downloading " + ids[counter - 1]);
    setTimeout(function() {
      if (counter != ids.length) {
        window.location.href = nodejsURLMoonloader + "downloadmp3?settings=" + ids[counter - 1] + "<>" + "playlistDwnld";
      } else {
        window.location.href = nodejsURLMoonloader + "downloadmp3?settings=" + ids[counter - 1] + "<>" + "playlistDwnld" + "<>ThxNodeJsServerImTheLastOne";
      }

    }, 50);

  }
}
