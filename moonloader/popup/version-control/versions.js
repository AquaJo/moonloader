let manifestData = chrome.runtime.getManifest();
let nodejsURL;
let nodejsIntervalBumpTime;
let clickNum;
let allUrls = [];
let allStati = [];
let alreadyOpening = false;
let allVersions = [];
chrome.runtime.sendMessage("getNodeUrl", function(response) {
  nodejsURL = response;
  chrome.runtime.sendMessage("getBumpTime", function(response) {
    nodejsIntervalBumpTime = response;
    interval(); // to keep the server up
  });
});

document.addEventListener("DOMContentLoaded", function() {
  chrome.storage.local.get(["allVersions", "allStati", "allUrls"], function(result) {

    allVersions = result.allVersions;
    allStati = result.allStati;
    allUrls = result.allUrls;
    for (let i = allVersions.length - 1; i > -1; --i) {
      appendList("version " + allVersions[i], allStati[i], i);
    }
  });


});

function appendList(input, style, num) {
  let version = input.split("version ")[1];
  let article = document.createElement("article");
  article.classList.add("leaderboard__profile");
  article.setAttribute("id", version);
  let img = document.createElement("img");
  img.classList.add("leaderboard__picture");
  /*img.style.boxShadow = "0 0 0 10px #b23831, 0 0 0 22px #b23831";
} else if (rand == 2) {
  img.style.boxShadow = "0 0 0 10px  #5E819D, 0 0 0 22px  #5E819D";
} else if (rand == 3){
img.style.boxShadow = "0 0 0 10px  #8ab22e, 0 0 0 22px  #8ab22e";
}*/
  let span = document.createElement("span");
  span.classList.add("leaderboard__name");
  let text = document.createTextNode(input);
  if (style !== "available") {
    span.style.color = "#A30000";
  } else if (version > manifestData.version) {
    span.style.color = "#32CD30";
  }
  if (manifestData.version === version) {
    span.style.color = "#A36A00";
  }
  span.appendChild(text);
  article.appendChild(img);
  article.appendChild(span);
  document.getElementById("leaderboards").appendChild(article);
  clickNum = num;
  document.getElementById(version).onclick = onClick;
}
let onClick = function() {
  if (!alreadyOpening) {
    alreadyOpening = true;
    let id = this.id;
    let clickNum = allVersions.indexOf(id);

    console.log(this.id);
    console.log(`${nodejsURL}changelog?v=${id}`);
    fetch(`${nodejsURL}changelog?v=${id}`, {
        method: 'GET'
      }).then(res => res.json())
      .then(json => {
        console.log(json);
        let leaderboards = document.getElementById("leaderboards"); // idk why plural ^^
        leaderboards.style.display = "none";
        let html = document.getElementById("html");
        html.style.width = "408px";
        document.body.style.width = "408px";
        let main = document.getElementById("main");
        main.style.maxWidth = "408px";

        let pre0 = document.createElement("PRE");
        pre0.innerHTML = "changelog";
        pre0.style.textIndent = "20px";
        pre0.style.fontWeight = "600";
        pre0.style.letterSpacing = "2.4px";
        //pre0.style.letterSpacing = "4.5px";
        let pre1 = document.createElement("PRE");
        pre1.style.textIndent = "20px";
        pre1.innerHTML = "version " + id;
        pre1.style.fontSize = "21px";
        pre1.style.lineHeight = "1.3";
        pre1.style.opacity = "0.65";
        pre1.style.transform = "translateY(-18px)";
        pre1.style.letterSpacing = "2px";
        let pre2 = document.createElement("PRE");
        pre2.style.fontSize = "18px";
        pre2.innerHTML = json + "\n\n";
        pre2.style.transform = "translateY(-21px)";
        pre2.style.letterSpacing = "0.1";
        //let text = document.createTextNode(json);
        let header = document.getElementById("header");
        header.style.height = "100%";
        header.appendChild(pre0);
        header.appendChild(pre1);
        header.appendChild(pre2);
        let t1 = document.getElementById("title");
        t1.style.display = "none";

        let vDownload = document.createElement("a");
        vDownload.classList.add("btn");
        vDownload.setAttribute("id", "vDownload");
        vDownload.setAttribute("href", "#");

        let spanBtn0 = document.createElement("span");
        spanBtn0.classList.add("text");
        spanBtn0.innerHTML = "Text";
        let spanBtn1 = document.createElement("span");
        spanBtn1.classList.add("flip-front");
        spanBtn1.innerHTML = "back";
        let spanBtn2 = document.createElement("span");
        spanBtn2.classList.add("flip-back");
        spanBtn2.innerHTML = "to options";

        vDownload.appendChild(spanBtn0);
        vDownload.appendChild(spanBtn1);
        vDownload.appendChild(spanBtn2);

        header.appendChild(vDownload);

        vDownload = document.getElementById("vDownload");
        vDownload.style.float = "left";
        vDownload.style.transform = "translateY(-75px)";

        if (allStati[clickNum] === "available") {
          let vDownload2 = document.createElement("a");
          vDownload2.classList.add("btn");
          vDownload2.setAttribute("id", "vDownload2");
          vDownload2.setAttribute("href", "#");

          let spanBtn02 = document.createElement("span");
          spanBtn02.classList.add("text");
          spanBtn02.innerHTML = "Text";
          let spanBtn12 = document.createElement("span");
          spanBtn12.classList.add("flip-front");
          spanBtn12.innerHTML = "download";
          let spanBtn22 = document.createElement("span");
          spanBtn22.classList.add("flip-back");
          spanBtn22.innerHTML = "me";
          vDownload2.appendChild(spanBtn02);
          vDownload2.appendChild(spanBtn12);
          vDownload2.appendChild(spanBtn22);

          header.appendChild(vDownload2);

          vDownload2 = document.getElementById("vDownload2");
          vDownload2.style.float = "left";
          vDownload2.style.transform = "translateY(-75px)";
          vDownload2.style.marginLeft = "170px";


          vDownload2.addEventListener("click", function() { // missleading ids ^^
            console.log(allUrls[clickNum]);
            //window.location.href = allUrls[clickNum];
            //alert(clickNum);
            chrome.tabs.create({ url: allUrls[clickNum] });
          });
        }
        alreadyOpening = false;
        vDownload.addEventListener("click", function() {
          location.replace("versions.html");
          /*
          vDownload.style.display = "none";
          vDownload2.style.display = "none";
          pre0.remove();
          pre1.remove();
          pre2.remove();
          header.style.height = "60px";
          t1.style.display = "block";
          main.style.height = "0px";
          leaderboards.style.display = "block";
          html.style.width = "300px";
          document.body.style.width = "300px";
          main.style.maxWidth = "300px";*/
        });
        //header.style.height = "300px";
        //header.style.display = "none";
        //  main.style.display = "none";
        //header.append(pre);
        //main.appendChild(pre);
      });
  }
}
var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};








function interval() {
  window.location.href = nodejsURL + 'bump';
  setInterval(function() {
    window.location.href = nodejsURL + 'bump';
    console.log("interval bump executed");
  }, nodejsIntervalBumpTime * 60 * 1000);
}
