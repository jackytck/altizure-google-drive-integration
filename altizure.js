/* global gapi, google */
import {
  ALTI_CALLBACK,
  ALTI_KEY
} from './config'
import {
  deleteCookie,
  getCookie,
  randomState,
  setCookie,
  tokenStateFromHash
} from './helper'

let ALTI_TOKEN = ''
let selectedFiles = []

function onLogout () {
  deleteCookie('token')
  window.location.href = ALTI_CALLBACK
}

function onUpload () {
  const pid = document.getElementById('pid').value
  if (!pid) {
    alert('Enter pid!')
    return
  }
  if (!selectedFiles.length) {
    alert('No file is selected!')
  }
  selectedFiles.forEach(f => {
    uploadSingle(({
      pid,
      name: f.name,
      url: f.link,
      md5: f.md5,
      token: global.oauthToken
    }))
  })
}

function uploadSingle ({ pid, name, url, md5, token }) {
  const query = `
    mutation {
      uploadImageURL(pid: "${pid}", url: "${url}", filename: "${name}", token: "${token}") {
        id
      }
    }
  `
  gql({ query, token: ALTI_TOKEN }).then(res => {
    console.log(res.data)
    updateImageList()
  })
  setInterval(updateImageList, 5000)
}

function gql ({ query, token }) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'key': ALTI_KEY,
    'altitoken': token
  })
  const body = JSON.stringify({
    query
  })
  const init = {
    method: 'POST',
    headers,
    body
  }
  const request = new Request('https://api.altizure.com/graphql', init)
  return fetch(request).then(function (response) {
    return response.json()
  })
}

function renderUpload (divId, token) {
  const u = new URL(window.location.href)
  const pid = u.searchParams.get('pid') || ''
  const query = `
  {
    my {
      self {
        name
      }
    }
  }
  `
  gql({ query, token }).then(res => {
    const user = res.data.my.self.name
    const html = `
            <h3>Welcome ${user}!</h3>
            <p>1. Press Google Drive</p>
            <p>2. Enter pid</p>
            <p>3. Press Upload</p>
            <input type="text" id="pid" name="pid" placeholder="pid" value="${pid}" />
            <button onclick="onUpload()">Upload</button>
            <div><div id="file-list" /></div>
            <div><div id="image-list" /></div>
            <br/>
            <br/>
            <button onclick="onLogout()">Logout</button>
          `
    document.getElementById(divId).innerHTML = html
  })
}

function updateImageList () {
  const pid = document.getElementById('pid').value
  const query = `
  {
  	project(id: "${pid}") {
      allImages {
        totalCount
        edges {
          node {
            id
            state
            name
            filename
          }
        }
      }
    }
  }
  `
  gql({ query, token: ALTI_TOKEN }).then(res => {
    const imgs = res.data.project.allImages.edges.map(x => `<li>${x.node.name}: ${x.node.state}</li>`)
    document.getElementById('image-list').innerHTML = `<p>Project images:</p><ol>${imgs.join('')}</ol>`
  })
}

// A simple callback implementation.
function pickerCallback (data) {
  let folderId = ''
  if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
    const doc = data[google.picker.Response.DOCUMENTS][0]
    folderId = doc[google.picker.Document.ID]
    queryFiles(folderId)
  }
}

function queryFiles (folderId) {
  gapi.client.drive.files.list({
    q: `'${folderId}' in parents`,
    fields: 'files(id,originalFilename,fileExtension,md5Checksum)',
    pageSize: 1000
  })
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log('Result', response.result)
      renderFiles(response.result.files)
    },
    function (err) {
      console.error('Execute error', err)
    })
}

/**
 * {
 *  fileExtension: "JPG"
 *  id: "0B574oGEFI9O6QWE0ejZQVnREckE"
 *  md5Checksum: "47399b72b3698ece2f33990bda3b6fe9"
 *  originalFilename: "DJI_0104.JPG"
 * }
 */
function renderFiles (files) {
  selectedFiles = []
  const fileNames = []
  files.forEach(f => {
    if (!f.fileExtension || !['jpg', 'png', 'json', 'csv'].includes(f.fileExtension.toLowerCase())) {
      return
    }
    fileNames.push(`<li>${f.originalFilename}</li>`)
    selectedFiles.push({
      name: f.originalFilename,
      link: `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`,
      md5: f.md5Checksum
    })
  })
  document.getElementById('file-list').innerHTML = `<p>Selected files:</p><ol>${fileNames.join('')}</ol>`
}

function render (divId) {
  const tokenCookie = getCookie('token')
  if (!tokenCookie) {
  // not login
    const { token, state } = tokenStateFromHash()
    if (token && state) {
    // callback
      const prevState = getCookie('state')
      if (state !== prevState) {
        document.getElementById(divId).innerHTML = '<h1>Invalid state!</h1>'
      } else {
        setCookie('token', token, 90)
        deleteCookie('state')
        ALTI_TOKEN = tokenCookie
        window.location = `${window.location.origin}/${window.location.pathname}`
        renderUpload(divId, token)
        // setupGoogleDrive()
      }
    } else {
    // render auth button
      const state = randomState(20)
      setCookie('state', state)
      const authUrl = `https://api.altizure.com/auth/start?client_id=${ALTI_KEY}&response_type=token&redirect_uri=${ALTI_CALLBACK}&state=${state}`
      document.getElementById(divId).innerHTML = `
            <h1>Altizure Google Drive Demo</h1>
            <button type='reset' onclick="location.href='${authUrl}'">
              Login with Altizure account
            </button>
          `
    }
  } else {
    ALTI_TOKEN = tokenCookie
    renderUpload(divId, tokenCookie)
    // setupGoogleDrive()
  }
}

export {
  onLogout,
  onUpload,
  pickerCallback,
  render
}
