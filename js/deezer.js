exports.userInput = "Profile ID";
exports.logo = "/img/deezerlogo.png";
var tip = "deezer.com/profile/XXXXXXXX";
exports.html = '<input id="username" type="text"><div class="tip">'+ tip +'</div><text id="error"></text><br/><button type="button" id="import">IMPORT PLAYLISTS</button>';
exports.importData = importData;

function importData(username) {
	$.get("http://api.deezer.com/2.0/user/"+username+"/playlists", deezerUserRequestHandler, "json").fail(requestErrorHandler);
}

function deezerUserRequestHandler(response) {
	if(typeof response.data == "undefined" || response.total === 0){
		showErrorMessage("This user doesn't have any playlists");
		stopLoader();
		return;
	}

	for (var i = 0; i < response.data.length; i++)
		$.get("http://api.deezer.com/2.0/playlist/"+response.data[i].id, deezerPlaylistResponseHandler, "json").fail(requestErrorHandler);
}

function deezerPlaylistResponseHandler(response) {
	if(response.tracks.data === [])
		return;

	var tracks = parseDeezerTracks(response.tracks.data);
	generateTemporaryPlaylist(tracks, 'Deezer - ' + response.title, response.picture);
}

function parseDeezerTracks(deezerTracks){
	var tracks = new Array();
	for (var i = 0; i < deezerTracks.length; i++) {
		tracks.push({name: deezerTracks[i].title, artist: deezerTracks[i].artist.name});
	};

	return tracks;
}