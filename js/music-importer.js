var sp = getSpotifyApi();
var models = sp.require('$api/models');
var views = sp.require('$api/views');
var services = ['deezer', 'lastfm', 'deezer'];
var serviceLinks = [];
var loadedPlaylists = {};
var selectedId = 0;

window.onload = function() {
	for (var i = 0; i < services.length; i++) {
		var script = sp.require('/js/' + services[i]);
		serviceLinks.push(script);
		console.log('Script added: ' + services[i]);
		//$('#services').append('<label for="' +services[i]+ '"><input class="service" id="' +services[i]+ '" type="radio" name="service" value="' +script.name+ '" onchange="javascript:showTip(\''+services[i]+'\',\''+script.tip+'\',\''+script.name+'\',\''+script.userInput+'\');"></input>' +script.name+ '</label>');
		$('#services').append('<div class="service"><hr hidden/><img class="darken" width="160" height="100" src="'+ script.logo + '"/></div>');
	};

	$('.darken').click(function() {
		$('hr').hide();
		$(this).parent().children("hr").show();

		var id = 0;
		for(var i=0; i< serviceLinks.length; i++){
			if(this.src.toString().indexOf(serviceLinks[i].logo) > -1){
				$("#user-control").children().remove();
				$("#user-control").append(serviceLinks[i].html);
				$('#username').watermark(serviceLinks[i].userInput);
				selectedId = i;

				break;
			}
		}

		$('#import').click(startImport);
		$('#username').keypress(function (e) {
		  if (e.which === 13)
		    startImport();
		});
			
	});
	$('.darken').hover(function() {
    	$(this).fadeTo(500, 0.5);
	}, function() {
	    $(this).fadeTo(500, 1);
	});

	//set default values
	// $('#' + services[0]).attr('checked', true);
	// showTip(services[0], serviceLinks[0].tip, serviceLinks[0].name, serviceLinks[0].userInput);

	$('hr:hidden').first().next().click();
};

// function showTip(id, tip, serviceName, userInput) {
// 	if ($('#'+id).is(':checked')) {
//     	$('#tip').text(tip);
//     	$('#import').text('Import from ' + serviceName);
//     	$('#title').text(userInput);
//     }
// }

function startImport() {
	resetPlaylist();
	loadedPlaylists = {};
	if(validate() === false) return;
	
	startLoader();

	serviceLinks[selectedId].importData($('#username').val());
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

function searchTrack(name, artist, playlist, id) {
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

function generateTemporaryPlaylist(tracks, playlistName, image) {
	var tempPlayList = new models.Playlist();
	var list  = new views.List(tempPlayList);
	var id = 'playlist_'+(new Date()).getTime();
	loadedPlaylists[id] = [];
	$('#playlists').append('<div class="playlist" hidden><div><table><tr><td><img width="150" height="150" src="'+image+'"><td class="playlist_title"><div><input class="hide" type="text" class="playlist-name" id="'+id+'_text" onkeydown="if (event.keyCode == 13) 	updatePlaylistName('+id+'_text)" onblur="updatePlaylistName('+id+'_text)" /></div><text class="playlist-name show" id="'+id+'_name" onclick="editPlaylistName('+id+'_name)">'+playlistName+'</text></br><button class="button icon add-playlist" id="button_'+id+'" onclick="javascript:addNewPermanentPlaylist(\''+id+'\');"><span class="plus"></span>Add as Playlist</button></tr></table></div><div id="'+id+'" class="sp-list" style="max-height:none;"></div></div>');
	$('#'+ id).append(list.node);

	stopLoader();
	for (var i = 0; i < tracks.length; i++)
		searchTrack(tracks[i].name, tracks[i].artist, tempPlayList, id);
}

function updatePlaylistName(id) {
	var text = $(id).val();

	if($.trim(text) !== '')
		$(id).parent().next().text(text);

	$(id).removeClass("show");
	$(id).addClass("hide");
	$(id).parent().next().removeClass("hide");
	$(id).parent().next().addClass("show");
}

function editPlaylistName(id) {
	var text = $(id).text();
	var nameEditor = $(id).prev().children(":first");
	nameEditor.val(text);
	
	$(id).removeClass("show");
	$(id).addClass("hide");
	nameEditor.removeClass("hide");
	nameEditor.addClass("show");

	nameEditor.focus();
}

function addNewPermanentPlaylist(id) {
	$('#button_'+id).hide();
	setTimeout(function(){$('#button_'+id).show();}, 2000);
	var tracks = loadedPlaylists[id];
	var newPlaylist = new models.Playlist($('#'+id+'_name').text());
	for (var i = 0; i < tracks.length; i++)
		newPlaylist.add(tracks[i]);
}

function requestErrorHandler() {
	showErrorMessage("Something went wrong, try again later...");
	stopLoader();
}

function startLoader() {
	$('#error').html('<div id="loader"></div>');
}

function stopLoader() {
	$('#loader').remove();
}

function showErrorMessage(message) {
	$('#error').text(message);
}

function clearErrorMessage() {
	$('#error').text('');
}

function resetPlaylist() {
	$('#playlists').text('');
}