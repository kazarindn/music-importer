exports.name = 'last.fm';
exports.importData = importData;

var lastfmApiKey = "152353e5ff3561e1d1772715194945ee";

function importData(username){
	console.log('Importing from last.fm...');

	$.get("http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=" + 
		username + "&api_key=" + lastfmApiKey + "&limit=0&format=json", lastfmHandler, "json").fail(requestErrorHandler);
}

function lastfmHandler(response) {
		if(typeof response.error !== "undefined") {
			showErrorMessage("Something went wrong, try again later");
			stopLoader();
			return;
		}

		if(response.lovedtracks.total == 0) {
			showErrorMessage("This user doesn't have any loved tracks");
			stopLoader();
			return;
		}
		var tracks = parseLastfmTracks(response.lovedtracks.track);
		generateTemporaryPlaylist(tracks, 'Last.fm - Loved Tracks');	
}

function parseLastfmTracks(tracks){
	var lastfmTracks = new Array();
	for(var i=0; i<tracks.length; i++)
		lastfmTracks.push({name: tracks[i].name, artist: tracks[i].artist.name});

	return lastfmTracks;
}