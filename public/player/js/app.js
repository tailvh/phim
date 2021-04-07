/* global p2pml, jwplayer, jwplayer_hls_provider, $ */
class App {
  async init () {
    this.gConfig = window.GlobalConfig || { PPEnabled: 0, GGProxy: 1, LogEnable: 1, LogType: 'VODWATCH', LogName: '247phim01', LogSecret: 'RTG8BV4WDB' }
    this.isP2PSupported = p2pml.core.HybridLoader.isSupported() && this.gConfig.PPEnabled
    var params = new URLSearchParams(document.location.search)
    this.videoUrl = params.get('url') || 'https://xemtv24h.com/statics/fmp4/films5/hovi/index.m3u8'
    this.sub = params.get('sub')
    this.subs = params.get('subs')
    this.tracks = []
    this.downloadStats = { p2p: 0, http: 0 }
    this.downloadTotal = 0
    this.uploadTotal = 0
    console.log(this.gConfig)    

    // Calculate percent
    let m = 1000000
    setInterval(() => { console.log(`%c Total ${(this.downloadTotal / m || 0).toFixed(2)}M - P2P ${(this.downloadStats.p2p / m || 0).toFixed(2)}M (${(this.downloadStats.p2p / this.downloadTotal * 100 || 0).toFixed(2)}%) - HTTP ${(this.downloadStats.http / m || 0).toFixed(2)}M (${(this.downloadStats.http / this.downloadTotal * 100 || 0).toFixed(2)}%) - Uploaded ${(this.uploadTotal / m || 0).toFixed(2)}M`, 'background: #222; color: #bada55') }, 20000)

    if (this.videoUrl) {
      this.videoContainer = document.getElementById('video_container')
      if (this.sub) {
        this.tracks = [{ file: this.sub, label: 'Default', kind: 'captions', 'default': true }]
      } else if (this.subs) {
        let that = this
        $.getJSON(this.subs, function (data) {
          for (var i = 0; i < data.length; i++) { that.tracks.push(data[i]) }
          that.restart()
        })
      }
      this.restart()
    }
  }
  async restart () {    
    let config = {
      debug: false,
      segments: {
        // number of segments to pass for processing to P2P algorithm
        forwardSegmentCount: 50 // usually should be equal or greater than p2pDownloadMaxPriority and httpDownloadMaxPriority
      },
      loader: {
        // how long to store the downloaded segments for P2P sharing
        cachedSegmentExpiration: 86400000,
        // count of the downloaded segments to store for P2P sharing
        cachedSegmentsCount: 1000,
        // first 4 segments (priorities 0, 1, 2 and 3) are required buffer for stable playback
        requiredSegmentsPriority: 2,
        // each 1 second each of 10 segments ahead of playhead position gets 6% probability for random HTTP download
        httpDownloadMaxPriority: 9,
        httpDownloadProbability: 0.06,
        httpDownloadProbabilityInterval: 1000,
        // disallow randomly download segments over HTTP if there are no connected peers
        httpDownloadProbabilitySkipIfNoPeers: true,
        // P2P will try to download only first 51 segment ahead of playhead position
        p2pDownloadMaxPriority: 50,
        // 1 second timeout before retrying HTTP download of a segment in case of an error
        httpFailedSegmentTimeout: 500,
        // number of simultaneous downloads for P2P and HTTP methods
        simultaneousP2PDownloads: 20,
        simultaneousHttpDownloads: 2,
        // enable mode, that try to prevent HTTP downloads on stream start-up
        httpDownloadInitialTimeout: 120000, // try to prevent HTTP downloads during first 2 minutes
        httpDownloadInitialTimeoutPerSegment: 17000, // try to prevent HTTP download per segment during first 17 seconds
        // allow to continue aborted P2P downloads via HTTP
        httpUseRanges: true,
        maxBufferLength: 300,
        xhrSetup: window.customXHR
        // trackerAnnounce: ['wss://devseason.com']
      }
    }    
    this.engine = this.isP2PSupported ? new p2pml.hlsjs.Engine(config) : undefined
    this.initJwPlayer()    
  }
  async initJwPlayer () {    
    var video = document.createElement('div')
    video.id = 'video'
    video.volume = 0
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.setAttribute('autoplay', '')
    this.videoContainer.appendChild(video)
    jwplayer.key = 'ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc='

    var player = jwplayer('video')
    player.setup({
      playlist: [{
        sources: [{
          file: this.videoUrl,
          onXhrOpen: window.customXHR
        }],
      }],
      tracks: this.tracks, 
      preload: 'auto',
      //skin: { name: 'alaska', url: 'alaska.css' }
    })

    jwplayer_hls_provider.attach()
    if (this.isP2PSupported) {
      this.engine.on(p2pml.core.Events.PieceBytesDownloaded, this.onBytesDownloaded.bind(this))
      this.engine.on(p2pml.core.Events.PieceBytesUploaded, this.onBytesUploaded.bind(this))
      // var trackerAnnounce = this.engine.getSettings().loader.trackerAnnounce
      p2pml.hlsjs.initJwPlayer(player, {
        liveSyncDurationCount: 7,
        maxBufferLength: 300,
        loader: this.engine.createLoaderClass()
      })
    }
    player.on('ready', function () {      
      document.getElementById('video').setAttribute('style', 'position: fixed;top:0px;bottom:0px;right:0px;left:0px;')      
    })    
  }
  onBytesDownloaded (method, size) {
    this.downloadStats[method] = this.downloadStats[method] || 0
    this.downloadStats[method] += size
    this.downloadTotal += size
  }
  onBytesUploaded (method, size) {
    this.uploadTotal += size
  }
}
window.demo = new App()
window.demo.init()
