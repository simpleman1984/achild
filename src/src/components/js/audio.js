import axios from 'axios'
import blobToBase64 from 'blob-to-base64'

let appid = 'MO9EtMdx4GLYVLEyDq37Wfpt'
let appsecret = 'ZVYvKGM94wl3vtafg5q9GuyAy0w6GNB2'
let tokenstr = '24.d00dde82a58c7a58997df66adcdb1bd7.2592000.1531547228.282335-11397668'

// https://github.com/axios/axios
function token () {
  let url = `https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=${appid}&client_secret=${appsecret}`
  axios.get(url)
    .then(function (response) {
      console.log(response)
      return response.data.access_token
    })
    .catch(function (error) {
      console.log(error)
    })
}
function play (text) {
  let url = `http://tsn.baidu.com/text2audio?tex=${text}&tok=${tokenstr}&cuid=xx&ctp=1&lan=zh`
  var audio = document.createElement('audio')
  audio.style.display = 'none'
  audio.src = url
  audio.autoplay = true
  audio.onended = function () {
    audio.remove()
  }
  document.body.appendChild(audio)
}
function upload (formdata, blob) {
  if (!blob) {
    return
  }
  blobToBase64(blob, (error, base64) => {
    if (error) {
      console.log(error.stack)
      return
    }
    // formdata.append('blob', base64)
    // formdata.append('len', blob.size)
    formdata['blob'] = base64
    formdata['len'] = blob.size
    axios.post('http://127.0.0.1:3000/upload', formdata, {
      // headers: {
      //   'Content-type': 'application/x-www-form-urlencoded'
      // }
    })
  })
}
export default {
  token,
  play,
  upload
}
