/* global XMLHttpRequest, md5 */
let GGProxyTimeout = 2000
let GGProxyGapMs = 50000
let GGProxyStartbyte = 100000
let GGProxyLink = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=604800&url='
let GGProxyHost = 'focus-opensocial.googleusercontent.com'
let Config = {
  PPEnabled: 0,
  GGProxy: 1,
  GGBackupServer: 'xemtv24h.com',
  LogEnable: 1,
  LogServer: 'https://log.xemtv24h.com/api/v1/logvod',
  LogType: 'VODWATCH',
  LogName: '247phim01',
  LogSecret: 'RTG8BV4WDB',
  ...window.GlobalConfig }

window.customXHRLastProxyCall = {}
window.customXHRQueue = {}
window.customXHR = function (xhr, url) {
  let timestamp = new Date().getTime()
  let hostname = (new URL(url)).hostname
  let oUrl = url
  let mUrl = GGProxyLink + url

  const ooUrl = new URL(oUrl)
  let backupUrl = oUrl.replace(ooUrl.hostname, Config.GGBackupServer)

  let curIndex = timestamp + '' + makeid(5)
  window.customXHRQueue[curIndex] = { status: 0, time: 0, length: 0, lengthM: 0, done: 0, hostname: hostname, url: url, startTime: timestamp }

  setTimeout(function () {
    window.customXHRQueue[curIndex].done = 1
  }, GGProxyTimeout * 2)

  // GGProxy
  if (Config.GGProxy) {
    let tempurl = url.split('.').slice(0, -1).join('.'); let startbyte = tempurl.split('@')[1] || 0; if (startbyte && GGProxyStartbyte) {}

    // M3U8 Get base url
    if (url.indexOf('.m3u8') !== -1) {
      window.baseUrl = url.substr(0, url.lastIndexOf('/'))
    }

    // Append base url to google link
    if (url.indexOf('images1-focus-opensocial.googleusercontent.com') !== -1 && url.indexOf('container=focus&refresh=604800&url=') === -1) {
      url = GGProxyLink + window.baseUrl + url.substr(url.lastIndexOf('/'), url.length)
    }

    if (startbyte >= GGProxyStartbyte &&
        timestamp - (window.customXHRLastProxyCall[mUrl] || 0) > GGProxyGapMs) {
      try {
        window.customXHRLastProxyCall[url] = timestamp
        window.customXHRQueue[curIndex].url1 = url
        xhr.open('GET', url, true); xhr.send()

        setTimeout(function () {
          let status = ''
          if (xhr.responseURL.indexOf(GGProxyHost) !== -1 && xhr.readyState === 4) {
            status = 'ALREADY - ' + xhr.getResponseHeader('expires')
          } else if (xhr.responseURL.indexOf(GGProxyHost) !== -1 && xhr.readyState > 2) {
            status = 'FAST - cache success'
          }

          if (xhr.responseURL === '') {
            status = 'SLOW - cache failed'
            window.customXHRQueue[curIndex].url2 = backupUrl
            xhr.open('GET', backupUrl, true); xhr.send() // setXHRInfo(curIndex, xhr)
          }

          if (status) {}
        }, GGProxyTimeout)
      } catch (e) {}
    } else {
      xhr.open('GET', backupUrl, true); xhr.send()
    }
  }

  xhr.onloadend = function () { setXHRInfo(curIndex, xhr) }
  xhr.onerror = function () { setXHRInfo(curIndex, xhr) }
  xhr.onabort = function () { setXHRInfo(curIndex, xhr) }
  xhr.ontimeout = function () { setXHRInfo(curIndex, xhr) }
}

function makeid (length) {
  let result = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function setXHRInfo (curIndex, xhr) {
  if (typeof (xhr) !== 'undefined') {
    window.customXHRQueue[curIndex].status = xhr.status
    window.customXHRQueue[curIndex].endTime = new Date().getTime()
    window.customXHRQueue[curIndex].length = parseInt(xhr.getResponseHeader('content-length'), 10) / 1000
    window.customXHRQueue[curIndex].lengthM = parseInt(xhr.getResponseHeader('content-length'), 10) / 1000000
    window.customXHRQueue[curIndex].time = (window.customXHRQueue[curIndex].endTime - window.customXHRQueue[curIndex].startTime) / 1000
  }
}

setInterval(function () {
  let mXHRQueue = {}
  for (let prop in window.customXHRQueue) {
    if (window.customXHRQueue[prop].done) {
      mXHRQueue[prop] = window.customXHRQueue[prop]
      delete window.customXHRQueue[prop]
    }
  }

  if (Config.LogEnable) {
    if (Object.keys(mXHRQueue).length) {
      let data = JSON.stringify(mXHRQueue)
      let type = Config.LogType
      let name = Config.LogName
      let secret = Config.LogSecret
      let hash = md5(data + type + secret)
      data = encodeURI(data)

      var xhr = new XMLHttpRequest()
      xhr.open('POST', Config.LogServer, true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          let jsonResponse = this.response
          if (jsonResponse) {}
        }
      }
      xhr.send(JSON.stringify({ type: type, name: name, data: JSON.stringify(mXHRQueue), hash: hash, length: Object.keys(mXHRQueue).length }))
    }
  }
}, 5000)
