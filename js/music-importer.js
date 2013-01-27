var sp = getSpotifyApi();
var models = sp.require('$api/models');
var views = sp.require('$api/views');
var services = ['lastfm', 'deezer'];
var serviceLinks = [];
var loadedPlaylists = {};

window.onload = function(){
	for (var i = 0; i < services.length; i++) {
		var script = sp.require('/js/' + services[i]);
		serviceLinks.push(script);
		console.log('Script added: ' + services[i]);
		$('#header').append('<label for="' +services[i]+ '"><input class="service" id="' +services[i]+ '" type="radio" name="service" value="' +script.name+ '" onchange="javascript:showTip(\''+services[i]+'\',\''+script.tip+'\',\''+script.name+'\',\''+script.userInput+'\');"></input>' +script.name+ '</label>');
		
	};

	$('#username').keypress(function (e) {
	  if (e.which === 13)
	    startImport();
	});

	//set default values
	$('#' + services[0]).attr('checked', true);
	showTip(services[0], serviceLinks[0].tip, serviceLinks[0].name, serviceLinks[0].userInput);

	$('#import').click(startImport);
};

function showTip(id, tip, serviceName, userInput){
	if ($('#'+id).is(':checked')) {
    	$('#tip').text(tip);
    	$('#import').text('Import from ' + serviceName);
    	$('#title').text(userInput);
    }
}

function startImport(){
	var checked = $("input:checked");

	resetPlaylist();
	loadedPlaylists = {};
	if(validate() === false) return;
	
	startLoader();

	serviceLinks[services.indexOf(checked[0].id)].importData($('#username').val());
}

function validate()
{
	clearErrorMessage();
	if(!document.getElementById('username').value 
		|| $.trim(document.getElementById('username').value).length == 0)
	{
		showErrorMessage("Input field is empty");
		return false;
	}
	return true;
}

function searchTrack(name, artist, playlist, id){
	var searchString = 'artist:"'+ artist +'" track:"'+ name +'"';
	var search = new models.Search(searchString);
	search.localResults = models.LOCALSEARCHRESULTS.APPEND;

	search.observe(models.EVENT.CHANGE, function() {
		if(search.tracks.length !== 0){
			if($('#' +id).parent().is(':hidden') === true)
				$('#'+id).parent().show();
			var track = search.tracks[0];
			playlist.add(track.uri);
			loadedPlaylists[id].push(track.uri);
		}
	});

	search.appendNext();
}

function generateTemporaryPlaylist(tracks, playlistName, image){
	var tempPlayList = new models.Playlist();
	var list  = new views.List(tempPlayList);
	var id = 'playlist_'+(new Date()).getTime();
	loadedPlaylists[id] = [];
	$('#playlists').append('<div class="playlist" hidden><div><table><tr><td><img width="150" height="150" src="'+image+'"><td class="playlist_title"><text class="playlist-name" id="'+id+'_name">'+playlistName+'</text></br><button class="button icon add-playlist" id="button_'+id+'" onclick="javascript:addNewPermanentPlaylist(\''+id+'\');"><span class="plus"></span>Add as Playlist</button></tr></table></div><div id="'+id+'" class="sp-list" style="max-height:none;"></div></div>');
	$('#'+ id).append(list.node);

	stopLoader();
	for (var i = 0; i < tracks.length; i++)
		searchTrack(tracks[i].name, tracks[i].artist, tempPlayList, id);
}

function addNewPermanentPlaylist(id){
	$('#button_'+id).hide();
	setTimeout(function(){$('#button_'+id).show();}, 2000);
	var tracks = loadedPlaylists[id];
	var newPlaylist = new models.Playlist($('#'+id+'_name').text());
	for (var i = 0; i < tracks.length; i++)
		newPlaylist.add(tracks[i]);
}

function requestErrorHandler(){
	showErrorMessage("Something went wrong, try again later...");
	stopLoader();
}

function startLoader(){
	$('#error').html('<div id="loader"></div>');
}

function stopLoader(){
	$('#loader').remove();
}

function showErrorMessage(message){
	$('#error').text(message);
}

function clearErrorMessage(){
	$('#error').text('');
}

function resetPlaylist(){
	$('#playlists').text('');
}