var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return true;
}

// https://developers.google.com/datastudio/connector/reference#getauthtype
function getAuthType() {
  const AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.PATH_USER_PASS)
    .build();
}

function setCredentials(request) {
  const creds = request.pathUserPass;
  const url = creds.path;
  const userName = creds.username;
  const password = creds.password;

  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('bi.url', url);
  userProperties.setProperty('bi.username', userName);
  userProperties.setProperty('bi.password', password);
  console.log([url, userName, password]);
  if (!validateCredentials(url, userName, password)) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    }
  }
  return {
    errorCode: 'NONE'
  };
}

function isAuthValid() {
  const userProperties = PropertiesService.getUserProperties();
  const url = userProperties.getProperty('bi.url');
  const userName = userProperties.getProperty('bi.username');
  const password = userProperties.getProperty('bi.password');
  console.log([url, userName, password]);
  return validateCredentials(url, userName, password);
}

function validateCredentials(url, userName, password) {
  console.log('validateCredentials', [url, userName, password]);
  if ((url.match(/https?:\/\//)) && (userName != '') && (password != '')) {
    try {
      return TestConnection();
    } catch (error) {
      return false;
    }
  }
  return false;
}

function resetAuth() {
  var user_tokenProperties = PropertiesService.getUserProperties();
  user_tokenProperties.deleteProperty('bi.url');
  user_tokenProperties.deleteProperty('bi.username');
  user_tokenProperties.deleteProperty('bi.password');
}