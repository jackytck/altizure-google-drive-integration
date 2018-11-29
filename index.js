import {
  onLogout,
  onUpload,
  pickerCallback,
  render
} from './altizure'

import setupGoogle from './google'

global.onUpload = onUpload
global.onLogout = onLogout

global.onApiLoad = setupGoogle(pickerCallback)
render('altizure-container')
