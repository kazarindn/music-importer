exports.userInput = "Playlist ID";
exports.logo = "/img/moglogo.png";
var tip = "mog.com/playlists/XXXXXXXX";
exports.html = '<input id="username" type="text"><div class="tip">'+ tip +'</div><text id="error"></text><br/><button type="button" id="import">IMPORT PLAYLIST</button>';
exports.importData = importData;

function importData(username) {
	$.get("http://mog.com/playlists/" + username, mogUserRequestHandler, "text").fail(requestErrorHandler);
}

function mogUserRequestHandler(data) {
    var result = {};
    var match;
    match = data.match('<meta property="og:title" content="([^"]+)" />');
    if(match === null) {
        showErrorMessage("Something went wrong, try again later");
        stopLoader();       
        return;
    }
    result.title = match[1];
    match = data.match('meta property="og:image" content="([^"]+)" />');
    result.picture = match[1];
	tracks = [];
    var reg  = /<a href="\/tracks\/[^"]+">([^<]+)<\/a> by <a href="\/artists\/[^"]+">([^<]+)<\/a>/g ;
    while(match = reg.exec(data))
		tracks.push({name: match[1], artist: match[2]});

    generateTemporaryPlaylist(tracks, 'MOG - ' + result.title, result.picture);
}