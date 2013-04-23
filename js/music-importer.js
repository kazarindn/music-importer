var sp = getSpotifyApi();
var models = sp.require('$api/models');
var views = sp.require('$api/views');
var services = ['deezer', 'lastfm', 'mog'];
var serviceLinks = [];
var loadedPlaylists = {};
var selectedId = 0;
var frameWidth = 30;
var frameHeight = 30;
var spriteWidth = 360;
var spriteHeight = 30;
var curPx = 0;
var ti;

window.onload = function() {
	for (var i = 0; i < services.length; i++) {
		var script = sp.require('/js/' + services[i]);
		serviceLinks.push(script);
		$('#services').append('<div class="service"><img class="darken" width="160" height="100" src="'+ script.logo + '"/><div class="hr" hidden><hr/></div></div>');
	};

	$('.darken').click(function() {
		clearErrorMessage();
		$('.hr').hide();
		$(this).parent().children(".hr").show();
		$(this).fadeTo(300, 1);

		var id = 0;
		for(var i=0; i< serviceLinks.length; i++) {
			if(this.src.toString().indexOf(serviceLinks[i].logo) > -1) {
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
		if($(this).next(".hr:hidden").size() !== 1) return;

    	$(this).fadeTo(500, 0.5);
	}, function() {
	    $(this).fadeTo(300, 1);
	});

	$('.hr:hidden').first().prev().click();
	$('#addAll').click(addAllPlaylists);
};

function startImport() {
	$(".add_all_playlists").hide();
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
		showErrorMessage(serviceLinks[selectedId].userInput + " is empty");
		return false;
	}
	return true;
}

function searchTrack(name, artist, playlist, id) {
	var searchString = 'artist:"'+ artist +'" track:"'+ name +'"';
	var search = new models.Search(searchString);
	search.localResults = models.LOCALSEARCHRESULTS.APPEND;

	search.observe(models.EVENT.CHANGE, function() {
		if(search.tracks.length !== 0) {
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

function addAllPlaylists() {
	$('#addAll').css('visibility','hidden');
	setTimeout(function() { $('#addAll').css('visibility','visible'); }, 2000);

	var playlists = $('#playlists').children(".playlist");
	for(var i=0; i < playlists.length; i++) {
		var children = playlists[i].children;
		var playlist = children[children.length-1];
		if(playlist.hidden === true) continue;

    	addNewPermanentPlaylist(playlist.id);
	}
}

function addNewPermanentPlaylist(id) {
	$('#button_'+id).hide();
	setTimeout(function() { $('#button_'+id).show(); }, 2000);
	var tracks = loadedPlaylists[id];
	var newPlaylist = new models.Playlist($('#'+id+'_name').text());
	for (var i = 0; i < tracks.length; i++)
		newPlaylist.add(tracks[i]);
}

function requestErrorHandler() {
	showErrorMessage("Something went wrong, try again later...");
	stopLoader();
}

function animateSprite() {
	if(document.getElementById("loader") === null) return;
	document.getElementById("loader").style.backgroundPosition = curPx + 'px 0px';
	curPx = curPx + frameWidth;
	 
	if (curPx >= spriteWidth) {
	curPx = 0;
	}
	 
	ti = setTimeout(animateSprite, 80);
}

function startLoader() {
	$('#progress').html('<div id="loader"></div>');
	animateSprite();
}

function stopLoader() {
	$('#loader').remove();
	if(!$('#error').text().length)
		$('.add_all_playlists:hidden').show();
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