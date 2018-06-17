let axios = require('axios')
let http = require('http')
let fs = require('fs')
let path = require('path')
const uuidv4 = require('uuid/v4');
const { exec } = require('child_process');

var apiKey = '8uKmep4edXBrNU8kxz6HYrP0'
var secretKey = '48a2d8d49d3279b355e62a17ac91114e'

/**
 * 获取当前token
 * @returns {Promise<T>}
 */
function token () {
  let url = `https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  return axios.get(url)
    .then(function (response) {
      if (response.status === 200) {
        let data = response.data
        return data.access_token
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}

/**
 * 语音识别，返回视频文件
 * @param text
 * @returns {Promise<T>}
 */
function voice (text) {
  return token().then((token) => {
    let url = `http://tsn.baidu.com/text2audio?tex=${text}&tok=${token}&cuid=xx&ctp=1&lan=zh`
    return url
  })
}

var express = require('express')
var app = express()
var bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json({limit: '50mb'}))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false,
  parameterLimit: 50000
}))

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/token', function (req, res) {
  token().then((_token) => {
    res.send(_token)
  })
})

app.get('/voice', function (req, res) {
  voice('中文1212').then((url) => {
    http.get(url, function (response) {
      console.info(response)
      // res.setHeader('Content-Length', file.length)
      // res.write(file, 'binary')
      // res.end()
      res.writeHead(200, {
        'Content-Type': 'audio/mp3'
      })
      response.pipe(res)
    })
  })
})

app.post('/upload', function (req, res) {
  let blobbase64 = req.body.blob.substr(22)
  var buf = Buffer.from(blobbase64, 'base64')
  // buf 保存到文件，然后压缩
  var uuid = uuidv4()
  var folder = path.join(__dirname, 'audio')
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
  var oldFile = path.join(__dirname, 'audio', uuid + '.wav')
  fs.writeFileSync(oldFile, buf)

  var outputFile = path.join(__dirname, 'audio', uuid + '.output.wav')

  exec(`/Users/aihuaxu/Downloads/ffmpeg -i ${oldFile} -acodec pcm_s16le -ar 16000 ${outputFile}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    token().then((_token) => {
      // 先转码，再上传文件到服务器
      var options = {
        hostname: 'vop.baidu.com',
        port: 80,
        path: `/server_api?token=${_token}&cuid=1123x`,
        method: 'POST',
        headers: {
          'Content-Type': 'audio/pcm;rate=16000',
          'format': 'pcm',
          'rate': '16000'
        }
      }
      var body = ''
      var request = http.request(options, function (response) {
        // When we receive data, we want to store it in a string
        response.on('data', function (chunk) {
          body += chunk
        })
        // On end of the request, run what we need to
        response.on('end', function () {
          // Do Something with the data
          console.log(body)
          res.json(body)
        })
      })

      // Now we need to set up the request itself.
      // This is a simple sample error function
      request.on('error', function(e) {
        console.log('problem with request: ' + e.message)
        res.json({})
      })

      // Write our post data to the request
      // fs.createReadStream()
      // var fileBuffer = new Buffer('/Users/aihuaxu/Downloads/output.wav')
      request.write(fs.readFileSync(outputFile))
      // End the request.
      request.end()
    })
  });

})
// app.post('/upload', function (req, res) {
//   let url = `http://vop.baidu.com/server_api`
//   // console.info(req.body.blob.substr(23))
//   let blobbase64 = req.body.blob.substr(23)
//   // var buf = Buffer.from(blobbase64, 'base64')
//   token().then((tokenstr) => {
//     axios.post(url, {
//       format: 'pcm',
//       rate: '16000',
//       channel: 1,
//       cuid: '123123123',
//       token: tokenstr,
//       speech: toBase64('/Users/aihuaxu/Downloads/output.wav'), // fs.readFileSync('/software/ffmpegbin/output.wav').toString('base64'),
//       len: 147500 // req.body.len
//     }).then((_res) => {
//       console.info(_res.data)
//       res.json({})
//     })
//   })
// })

// function toBase64(filename) {
//   return fs.readFileSync(filename).toString('base64')
// }

app.listen(3000, () => console.log('Example app listening on port 3000!'))
