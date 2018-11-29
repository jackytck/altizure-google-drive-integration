function randomState (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function setCookie (name, value, days) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + value + expires + ';path=/;secure'
}

function getCookie (name) {
  const value = '; ' + document.cookie
  const parts = value.split('; ' + name + '=')
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
}

function deleteCookie (name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'
}

function tokenStateFromHash () {
  let token = ''
  let state = ''
  const hash = window.location.hash
  const re = /access_token=(\w+).*state=(\w+)/g
  const mat = re.exec(hash)
  if (mat && mat[1] && mat[2]) {
    token = mat[1]
    state = mat[2]
  }
  return { token, state }
}

export {
  randomState,
  setCookie,
  getCookie,
  deleteCookie,
  tokenStateFromHash
}
