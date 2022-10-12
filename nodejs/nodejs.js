/** Instructions:
// add dependencies:
- cors
- express
- ytdl-core
- browser-id3-writer
- ffmpeg-static
- fluent-ffmpeg
- readline
//
**/
//--------------------------------------------------------------------

const { exec } = require("child_process");
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const ffmpegPath = require("ffmpeg-static");
const cp = require("child_process");
const stream = require("stream");

const app = express();
const PORT = process.env.PORT;
const fs = require("fs");
const readline = require("readline");

//const fetch = require("node-fetch");

app.use(cors());
app.listen(PORT, () => {
  console.log(`Server Works !!! At port ${PORT}`);
});


app.get("/changelog", async (req, res, next) => {
  // secret ... version control not supported in public version
});

app.get("/versionControl", async (req, res, next) => {
  return res.json("thisIsThePublicMoonloaderVersionAndBecauseOfThisTheVersionControlFeatureIsNotAvailableBecauseItsRunningOverAnotherGlitchAppForUpdatingCheckTheNewestGithubVersion");
});

app.get("/bump", (req, res, next) => {

});


app.get("/mp3InProgress", async (req, res, next) => {
  // information about mp3InProcess and ticket
  let buffer = fs.readFileSync("mp3InProgress.txt");

  let fileContent = buffer.toString();
  if (fileContent.includes("true")) {
    return res.json("true");
  } else {
    return res.json("jo just start downloading");
  }
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function mp3TimeoutReset(time) {
  setTimeout(function() {
    resetMp3();
  }, time);
}
app.get("/mp3Timeout", async (req, res, next) => {
  req.setTimeout(1200000);
  mp3TimeoutReset(1192000);
  console.log("mp3-status-listening started");
  let fileContent;
  let watcher = fs.watch("mp3Status.txt", function(event, filename) {
    //setTxt("mp3Status.txt", false);
    console.log("status changed");

    let buffer = fs.readFileSync("mp3Status.txt");

    fileContent = buffer.toString();
    watcher.close();
    return res.json(fileContent);
    //process.exit(0);
  });
});
app.get("/mp4CreateTicket", async (req, res, next) => {
  let ticket = "";
  for (let i = 0; i < 30; ++i) {
    ticket += getRandomInt(10);
  }
  // create dir for mp4-tickets if not existing
  var dir = './mp4Tickets';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  //

  setTxt("mp4Tickets/mp4Status" + ticket + ".txt", "a");
  return res.json(ticket);
});

app.get("/mp4DeleteTicket", async (req, res, next) => {
  let ticket = req.query.ticket;
  deleteTicket(ticket);
  return res.json("finished");
});

app.get("/mp4Timeout", async (req, res, next) => {
  try {
    let ticket = req.query.ticket;

    let fileContent;
    let watcher = fs.watch(
      "mp4Tickets/mp4Status" + ticket + ".txt",
      function(event, filename) {
        //setTxt("mp3Status.txt", false);
        console.log("status changed");
        if (fs.existsSync("mp4Tickets/mp4Status" + ticket + ".txt")) {
          let buffer = fs.readFileSync("mp4Tickets/mp4Status" + ticket + ".txt");
          fileContent = buffer.toString();
        } else {
          fileContent = "deleted";
          console.log("deletion detected");
        }
        watcher.close();
        return res.json(fileContent);
      }
    );
  } catch (err) {
    console.error(err);
  }
});
function getTxt(filename) {
  let buffer = fs.readFileSync(filename);
  let fileContent = buffer.toString();
  return fileContent;
}
function setTxt(filename, data) {
  fs.writeFileSync(filename, data);
}
function resetMp3() {
  setTxt("mp3InProgress.txt", "false");
  setTxt("mp3Status.txt", "resetState");
}
app.get("/mp3afk", async (req, res, next) => {
  req.setTimeout(2147483647);
  mp3TimeoutReset(2147413647);
  console.log("window close listening while active");
  let watcher = fs.watch("mp3InProgress.txt", function(event, filename) {
    console.log("progress-change");
    if (getTxt("mp3InProgress.txt") === "false") {
      console.log("progress and window close listening ended");
      watcher.close();
      res.end();
    }
  });

  req.on("close", function(err) {
    // on connection aborting
    console.log(
      "mp3Download Error (aborted/closed) (window close (while not in progress)) --> mp3InProgress to false"
    );
    resetMp3();
    try {
      fs.unlinkSync("audio.mp3");
      fs.unlinkSync("image.jpg");
    } catch (Err) { }
    watcher.close();
    res.end();

  });

  setTimeout(function() {
    watcher.close();
    res.end();
  }, 30000);
});

app.get("/downloadmp3", async (req, res, next) => {
  req.setTimeout(1200000);
  mp3TimeoutReset(1192000);
  let settings = req.query.settings;
  try {
    settings = settings.split("<>");
    req.on("close", function(err) {
      setTxt("mp3Status.txt", "aborted");
      // on connection aborting
      console.log(
        "mp3Download Error (aborted/closed) --> mp3InProgress to false"
      );
      resetMp3();
      try {
        fs.unlinkSync("audio.mp3");
        fs.unlinkSync("image.jpg");
      } catch (Err) { }
      //process.exit(0);
      try {
        dwnld.kill();
      } catch (e) { }
      return;
    });

    let inProgress = getTxt("mp3InProgress.txt");

    setTxt("mp3InProgress.txt", "true");

    // standart quality : "highestaudio" --> convertion might lead to lowering quality
    //for (let i = 0; i < settings.length; ++i) {
    let url = settings[0];
    //console.log(settings);
    let title;
    let id;
    let length;
    await ytdl.getInfo(url).then((info) => {
      length = info.videoDetails.lengthSeconds;
      title = info.videoDetails.title;
      title = title.replace(/[/\\?%*:|"<>]/g, "-");
      title = title.replace(/([^a-z0-9()\\-\\.\\&\\(\\'\\,\-\)]+)/gi, " ");
      //console.log(title);
      title = encodeURI(title);
      if (title.includes("%20") || title.includes("%22")) {
        title = decodeURI(title);
        //console.log(title);
      }
      //console.log("title: " + title);
      if (url.includes("?v=")) {
        id = url.split("?v=")[1]; // no longer urls (lists) ! // ...
      } else {
        id = url;
      }
      /*console.log(
      "thumbnail-url: " + "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"
    );*/
      getImg("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg");
    });
    if (length > 876) {
      return res.download("error.txt", "error.txt", function(err) {
        console.log(
          "error occured while downloading youtube video || the convertion afterwards ... --> status change + error.txt download"
        );
        if (getTxt("mp3Status.txt") === "false") {
          setTxt("mp3Status.txt", "true");
          console.log("set true");
        } else {
          setTxt("mp3Status.txt", "false");
          console.log("set false");
        }
      });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${title}.mp3"`);
    let stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    let start = Date.now();

    const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(ffmpegPath);
    let dwnld = ffmpeg(stream)
      .audioBitrate(128)
      .save("audio.mp3")
      .on(await "progress", (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
      })
      .on("end", () => {
        const ID3Writer = require("browser-id3-writer");
        const songBuffer = fs.readFileSync("audio.mp3");
        const coverBuffer = fs.readFileSync("image.jpg");
        const writer = new ID3Writer(songBuffer);
        writer.setFrame("APIC", {
          type: 3,
          data: coverBuffer,
          description: "",
        });
        writer.addTag();

        const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
        fs.writeFileSync("audio.mp3", taggedSongBuffer);

        try {
          fs.unlinkSync("image.jpg");
          //file removed
        } catch (err) {
          console.error(err);
        }
        return res.download("audio.mp3", title + ".mp3", function(err) {
          try {
            fs.unlinkSync("audio.mp3");
            if (getTxt("mp3Status.txt") === "false") {
              setTxt("mp3Status.txt", "true");
              console.log("set true");
            } else {
              setTxt("mp3Status.txt", "false");
              console.log("set false");
            }
            if (settings.length == 1) {
              resetMp3();

              console.log("mp3InProgress --> false");
            }
          } catch (err2) {
            console.log(err2);
          }
        });
      })
      .on("error", () => {

      });
    //}
  } catch (err) {
    res.download("error.txt", "error.txt", function(err) {
      console.log(
        "error occured while downloading youtube video || the convertion afterwards ... --> status change + error.txt downloaded"
      );
      if (getTxt("mp3Status.txt") === "false") {
        setTxt("mp3Status.txt", "true");
        console.log("set true");
      } else {
        setTxt("mp3Status.txt", "false");
        console.log("set false");
      }
    });
    if (settings.length == 3) {
      console.log("last element detected on error --> mp3InProgress --> false");
      setTxt("mp3InProgress.txt", "false");
    }
    /*resetMp3();
    console.log("mp3Download Error --> mp3InProgress to false");
    console.log(err);*/
  }
});

app.get("/mp3ToFalse", async (req, res, next) => {
  console.log("mp3 progress to false");
  setTxt("mp3InProgress.txt", "false");
});

app.get("/mp3InProgressFalse", async (req, res, next) => {
  console.log("mp3 set to false after successfull end call from client");
  setTxt("mp3InProgress.txt", "false");
  res.json({ stat: "finished" });
});
app.get("/downloadmp4", async (req, res, next) => {
  console.log("downloading mp4");
  let settings = req.query.settings.split("-*split*-");
  let url = settings[0];
  //console.log(url)
  let vid = settings[1];
  let aud = settings[2];
  let qualityVid = settings[3]; //
  let ticket;
  if (settings.length > 4) {
    ticket = settings[4];
  } else {
    ticket = null;
  }
  let closed = false;
  try {
    req.on("close", function(err) {
      console.log("close detected");
      if (!closed) {
        console.log("mp4Download Error (aborted/closed) --> ticket deleted");
        deleteTicket(ticket);
      }
    });
    let title;
    await ytdl.getInfo(url).then((info) => {
      title = info.videoDetails.title;
      title = title.replace(/[/\\?%*:|"<>]/g, "-");
      title = title.replace(/([^a-z0-9()\\-\\.\\&\\(\\'\\,\-\)]+)/gi, " ");
      //console.log(title);
      title = encodeURI(title);
      if (title.includes("%20") || title.includes("%22")) {
        title = decodeURI(title);
        //console.log(title);
      }
      //console.log("title: " + title);
    });
    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    let stream;
    if (vid === "true") {
      if (qualityVid === "standard") {
        if (!ytdl.validateURL(url)) {
          return res.sendStatus(400);
        }
        stream = await ytdl(url, {
          format: "mp4",
        }).pipe(res);
      } else {
        stream = ytmixer(url, qualityVid, aud).pipe(res);
      }
    } else {
      stream = await ytdl(url, {
        filter: "audioonly",
      }).pipe(res);
    }
    stream.on("finish", function() {
      closed = true;
      changeTicket(ticket);
      if (settings.length == 6) {
        deleteTicket(ticket);
      }
    });
    //changeTicket(ticket);
  } catch (err) {
    console.error(err);
    //deleteTicket(ticket);
    return res.download("error.txt", "error.txt", function(err) {
      console.log("returned error.txt");
      setTimeout(function() {
        closed = true;
        if (settings.length == 6) {
          deleteTicket(ticket);
        } else {
          changeTicket(ticket);
        }
      }, 300);
    });
  }
});
function changeTicket(ticket) {
  if (ticket != null) {
    if (getTxt("mp4Tickets/mp4Status" + ticket + ".txt") === "a") {
      setTxt("mp4Tickets/mp4Status" + ticket + ".txt", "b");
    } else {
      setTxt("mp4Tickets/mp4Status" + ticket + ".txt", "a");
    }
  }
}
function deleteTicket(ticket) {
  //setTxt("mp4Status" + ticket + ".txt", "deleted");
  // setTimeout(function () {
  try {
    fs.unlinkSync("mp4Tickets/mp4Status" + ticket + ".txt");
    console.log("ticket successfully deleted");
  } catch (error) {
    console.log("ticket deletion failed");
  }
  // },2000);
}
function removeAudio() {
  let ffmpegProcess = cp.spawn(ffmpegPath, []);
}
const ytmixer = (link, itag, audio) => {
  let audioStream;
  const result = new stream.PassThrough({ highWaterMark: 1024 * 512 });

  ytdl.getInfo(link).then(async (info) => {
    //console.log(info);
    if (audio === "true") {
      console.log("getting yt audio");
      audioStream = ytdl.downloadFromInfo(info, {
        filter: "audioonly",
        quality: "highestaudio",
      });
    } else {
      audioStream = ytdl("https://www.youtube.com/watch?v=W9nZ6u15yis", {
        quality: "highestaudio",
      }); // no good solution, theres probably a way better way through ffmpeg, but Im not that into ffmpeg by now
    }
    let videoStream;
    //let errorOccured = false;
    let errorOccured2 = false;
    videoStream = await ytdl
      .downloadFromInfo(info, { quality: itag })
      .on("error", async (err) => {
        //errorOccured = true;
        console.log(
          "too high quality detected, changing to highest available quality"
        );
        videoStream = await ytdl
          .downloadFromInfo(info, { quality: "highestvideo" })
          .on("error", async (err) => {
            errorOccured2 = true;
            convertion();
          });

        //console.log("changed quality to itag: " + itag);
        //let itags = [137,136,135,134];
        /*repeatLowerDownload();
      function repeatLowerDownload() {
   
          videoStream = ytdl.downloadFromInfo(info, {quality: parseInt(itag) > 134 ? (parseInt(itag) - 1).toString() : 'highestvideo'}).on('error', (err) => {
            repeatLowerDownload();
            itag = (parseInt(itag) - 1).toString();
            console.log("changed quality to itag: " + itag);
          })
     
          //repeatLowerDownload();
       
      }*/
      });
    //convertion();
    setTimeout(function() {
      if (!errorOccured2) {
        convertion();
      }
    }, 3000); // maybe I'll change the delay in the future (shorter) || other solution ...
    function convertion() {
      // create the ffmpeg process for muxing
      let ffmpegProcess = cp.spawn(
        ffmpegPath,
        [
          // supress non-crucial messages
          "-loglevel",
          "8",
          "-hide_banner",
          // input audio and video by pipe
          "-i",
          "pipe:3",
          "-i",
          "pipe:4",
          // map audio and video correspondingly
          "-map",
          "0:a",
          "-map",
          "1:v",
          // no need to change the codec
          "-c",
          "copy",
          // output mp4 and pipe
          "-f",
          "matroska",
          "pipe:5", //matroska
        ],
        {
          // no popup window for Windows users
          windowsHide: true,
          stdio: [
            // silence stdin/out, forward stderr,
            "inherit",
            "inherit",
            "inherit",
            // and pipe audio, video, output
            "pipe",
            "pipe",
            "pipe",
          ],
        }
      );

      audioStream.pipe(ffmpegProcess.stdio[3]);

      videoStream.pipe(ffmpegProcess.stdio[4]);
      ffmpegProcess.stdio[5].pipe(result);
    }
  });
  return result;
};

function getImg(URL) {
  // standart save loc : image.jpg (!)
  var http = require("https"),
    Stream = require("stream").Transform,
    fs = require("fs");

  var url = URL;

  http
    .request(url, function(response) {
      var data = new Stream();

      response.on("data", function(chunk) {
        data.push(chunk);
      });

      response.on("end", function() {
        fs.writeFileSync("image.jpg", data.read());
        return "finished";
      });
    })
    .end();
}
