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
  
}