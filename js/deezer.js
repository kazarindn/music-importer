exports.name = "Deezer";
exports.importData = importData;

function importData(username){
	console.log('Importing from Deezer...');

	$.get("http://api.deezer.com/2.0/user/"+username+"/playlists", deezerUserRequestHandler, "json").fail(requestErrorHandler);
}

function deezerUserRequestHandler(response){
	if(response.total === 0){
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
	generateTemporaryPlaylist(tracks, 'Deezer - ' + response.title);
}

function parseDeezerTracks(deezerTracks){
	var tracks = new Array();
	for (var i = 0; i < deezerTracks.length; i++) {
		tracks.push({name: deezerTracks[i].title, artist: deezerTracks[i].artist.name});
	};

	return tracks;
}