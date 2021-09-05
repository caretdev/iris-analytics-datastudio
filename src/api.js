/**
 * @param {string} method
 * @param {string} path
 * @param {Object} payload
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(method, path, payload) {
  const userProperties = PropertiesService.getUserProperties();
  const url = userProperties.getProperty('bi.url');
  const userName = userProperties.getProperty('bi.username');
  const password = userProperties.getProperty('bi.password');
  console.log('fetchDataFromApi', [url, method, path], payload);
  const auth = 'Basic ' + Utilities.base64Encode(userName + ':' + password);
  const fullUrl = [url, path].join('/').replaceAll(/(?<!https?:)\/+/g, '/');

  var options = {
    method,
    muteHttpExceptions: true,
    headers: {
      'Authorization': auth
    }
  }
  if (method.toUpperCase() == 'POST' && payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  var response = UrlFetchApp.fetch(fullUrl, options);
  console.log(response);
  return JSON.parse(response);
}

/**
 * @returns {boolean} Status for TestConnection.
 */
function TestConnection() {
  const response = fetchDataFromApi('GET', 'Info/TestConnection');
  return (response && response.Status == 'OK');
}

function Cubes() {
  const response = fetchDataFromApi('POST', 'Info/Cubes');
  return response.Result.Cubes;
}

function Measures(cube) {
  const response = fetchDataFromApi('POST', `Info/Measures/${cube}`);
  return response.Result.Measures;
}

function Filters(cube) {
  const response = fetchDataFromApi('POST', `Info/Filters/${cube}`);
  return response.Result.Filters;
}

function MDX(query) {
  const payload = {
    MDX: query,
    WAIT: 1
  }
  const response = fetchDataFromApi('POST', `Data/MDXExecute`, payload);
  return response.Result;
}