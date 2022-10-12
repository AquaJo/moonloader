let nodejsURL;
chrome.runtime.sendMessage("getNodeUrl", function(response) {
  nodejsURL = response;
  console.log(nodejsURL);
  chrome.storage.local.get("mp4Ticket", function(result) {
    let ticket = Object.values(result)[0];
    fetch(`${nodejsURL}mp4DeleteTicket?ticket=${ticket}`, {
        method: 'GET'
      }).then(res => res.json())
      .then(json => {
        window.close();
      })
  });
});
