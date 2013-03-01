exports.name = "Deezer";
exports.userInput = "User ID";
exports.tip = "e.g. 19477031 in http://www.deezer.com/en/profile/19477031";
exports.logo = "/img/deezerlogo.png";
exports.html = '<input id="username" type="text"><button class="sp-button sp-primary" type="button" id="import">Start import</button>'
exports.importData = importData;

function importData(username){
	console.log('Importing from Deezer...');

	$.get("http://api.deezer.com/2.0/user/"+username+"/playlists", deezerUserRequestHandler, "json").fail(requestErrorHandler);
}

function deezerUserRequestHandler(response){
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