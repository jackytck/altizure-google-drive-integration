/* global gapi, google */
import {
  G_CLIENT_ID,
  G_DEV_KEY,
  G_SCOPE
} from './config'

let pickerApiLoaded = false
let oauthToken
let callback

function setupGoogle (pickerCallback) {
  callback = pickerCallback
  return onApiLoad
}

// Use the API Loader script to load google.picker and gapi.auth.
function onApiLoad () {
  gapi.load('auth2', onAuthApiLoad)
  gapi.load('picker', onPickerApiLoad)
}

function onAuthApiLoad () {
  console.log('nat nat?')
  const authBtn = document.getElementById('auth')
  authBtn.disabled = false
  authBtn.addEventListener('click', function () {
    gapi.auth2.authorize({
      client_id: G_CLIENT_ID,
      scope: G_SCOPE
    }, handleAuthResult)
  })
}

function onPickerApiLoad () {
  pickerApiLoaded = true
  createPicker()
}

function handleAuthResult (authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token
    createPicker()
  }
}

function pickFolderView () {
  return new google.picker.DocsView()
    .setIncludeFolders(true)
    .setMimeTypes('application/vnd.google-apps.folder')
    .setSelectFolderEnabled(true)
}

// Create and render a Picker object for picking user Photos.
function createPicker () {
  if (pickerApiLoaded && oauthToken) {
    const picker = new google.picker.PickerBuilder()
      .addView(pickFolderView())
      .setOAuthToken(oauthToken)
      .setDeveloperKey(G_DEV_KEY)
      .setCallback(callback)
      .build()
    picker.setVisible(true)
  }
}

export default setupGoogle
