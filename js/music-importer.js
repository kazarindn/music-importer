var sp = getSpotifyApi();
var models = sp.require('$api/models');
var views = sp.require('$api/views');
var services = ['lastfm', 'deezer'];
var serviceLinks = [];
var loadedPlaylists = {};

window.onload = function(){
	init();
	document.getElementById('import').onclick = function(){
		var checked = $("input:checked");

		resetPlaylist();
		if(validate() === false) return;
		
		startLoader();

		serviceLinks[services.indexOf(checked[0].id)].importData($('#username').val());
	}
};

function init(){
	for (var i = 0; i < services.length; i++) {
		var script = sp.require('/js/' + services[i]);
		serviceLinks.push(script);
		console.log('Script added: ' + services[i]);
		$('#header').append('<label for="' +services[i]+ '"><input class="service" id="' +services[i]+ '" type="radio" name="service" value="' +script.name+ '"/>' +script.name+ '</label>');
	};

	$('#' + services[0]).attr('checked', true);
}

function validate()
{
	clearErrorMessage('lastfmErrror');
	if(!document.getElementById('username').value 
		|| trim(document.getElementById('username').value).length == 0)
	{
		showErrorMessage("Username is empty");
		return false;
	}
	return true;
}

function searchTrack(name, artist, playlist, id){
	var searchString = 'artist:"'+ artist +'" track:"'+ name +'"';
	var search = new models.Search(searchString);
	search.localResults = models.LOCALSEARCHRESULTS.APPEND;

	search.observe(models.EVENT.CHANGE, function() {
		if(search.tracks.length != 0){
			var track = search.tracks[0];
			playlist.add(track.uri);
			loadedPlaylists[id].push(track.uri);
		}
	});

	search.appendNext();
}

function generateTemporaryPlaylist(tracks, playlistName){
	var tempPlayList = new models.Playlist();
	var list  = new views.List(tempPlayList);
	var id = 'playlist_'+(new Date()).getTime();
	loadedPlaylists[id]= [];
	$('#playlists').append('<div class="playlist"><div><table><tr></tr><tr><text class="playlist-name" id="'+id+'_name">'+playlistName+'</text></br><button class="button icon add-playlist" onclick="javascript:addNewPermanentPlaylist(\''+id+'\');"><span class="plus"></span>Add as Playlist</button></tr></table></div><div id="'+id+'" class="sp-list" style="max-height:none;"></div></div>');
	$('#'+ id).append(list.node);

	stopLoader();
	for (var i = 0; i < tracks.length; i++) {
		searchTrack(tracks[i].name, tracks[i].artist, tempPlayList, id);
	};
}

function addNewPermanentPlaylist(id){
	var tracks = loadedPlaylists[id];
	var newPlaylist = new models.Playlist($('#'+id+'_name').text());
	for (var i = 0; i < tracks.length; i++) {
		newPlaylist.add(tracks[i]);
	};
}

function startLoader(){
	document.getElementById('error').innerHTML = '<div id="loader"></div>';
}

function stopLoader(){
	var element = document.getElementById('loader');
	element.parentNode.removeChild(element);
}

function showErrorMessage(message){
	var div = document.getElementById('error');
	div.innerHTML = message;
}

function clearErrorMessage(){
	var div = document.getElementById('error');
	div.innerHTML = '';
}

function resetPlaylist(){
	var div = document.getElementById('playlists');
	div.innerHTML = '';
}

function trim(str) {
        return str.replace(/^\s+|\s+$/g,"");
}