exports.userInput = "Email";
exports.userPassword = "Password";
exports.logo = "/img/doubanfmlogo.png";
var tip = "douban.fm";
exports.html = '<input id="username" type="text"><br><input id="password" type="password"><div class="tip">'+ tip +'</div><text id="error"></text><br/><button type="button" id="import">IMPORT PLAYLIST</button>';
exports.importData = importData;

function importData(username, password) {
  $.post("http://www.douban.com/j/app/login", { email: username, password: password, version: "608", app_name: "radio_android" }, parseLoginInfo, "json").fail(requestErrorHandler);
}

function parseLoginInfo(response) {
  if(response.r != "0") {
    showErrorMessage("Username or password not correct!");
    stopLoader();
    return;
  }
  
$.get("http://www.douban.com/j/app/radio/liked_songs?version=608&client=s:mobile|y:android+4.1.1|f:608|m:Google|d:-1178839463|e:google_galaxy_nexus&app_name=radio_android&from=android_608_Google&token=" + response.token + "&user_id=" + response.user_id + "&expire=" + response.expire, doubanFMHandler).fail(requestErrorHandler);
}

function doubanFMHandler(response) {
	if(response.r != "0") {
		showErrorMessage("Something went wrong, try again later");
		stopLoader();
		return;
	}
  
	if(response.songs.length == 0) {
		showErrorMessage("This user doesn't have any loved tracks");
		stopLoader();
		return;
	}
  
  var tracks = parseDoubanfmTracks(response.songs)
	generateTemporaryPlaylist(tracks, 'douban.fm - Liked Tracks', "/img/lastfm.png");	
}

function parseDoubanfmTracks(tracks) {
  var resultTracks = new Array();
  for(var i=0; i<tracks.length; i++) {
    resultTracks.push({name: tracks[i].title, artist: tracks[i].artist});
  }
  
  return resultTracks;
}