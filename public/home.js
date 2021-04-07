/* global $, localStorage */
$(document).ready(function () {
  $('#xmodal').html('')
  if (localStorage.getItem('videoId')) {
    let time = localStorage.getItem('videoId')
    $('body').append('<div id="xmodal"></div>')
    $('#xmodal').html(`<div class='xmodalwrap'>
      <div class='xmodalcurtain'></div>
      <div class='xmodalbody'>
        <div class='xmodaltext'>Bạn đang xem ${time}, bạn có muốn tiếp tục xem ?</div>
        <div class='xmodaltext'>
          <div class='xmodalbtn rxplaystart'>Xem từ đầu</div>
          <div class='xmodalbtn rxplaystart rxresume'>Xem tiếp tục</div>
        </div>
      </div>
    </div>`)
  }
})

$('body').on('click', '.xmodalcurtain', function () {
  $('#xmodal').html('')
})

$('body').on('click', '.rxplaystart', function (ele) {
  let currentTime = 0
  if ($(this).hasClass('rxresume')) {
    currentTime = localStorage.getItem('videoId')
    console.log(currentTime)
  }

  $('body').scrollTop(0) // $('.xbodyplayer').html('<video id="player" autoplay controls crossorigin></video>')
  $('#xmodal').html('')

  // Player Init
  ;(function initPlayer () {
    // Player sources
    let sources = [{
      file: $('.xbodyplayer').attr('link'),
      onXhrOpen: function (xhr, url) {}
    }]
    // Player options
    let jwoptions = {
      playlist: [{ sources: sources }],
      aspectratio: '16:9',
      width: '100%',
      autostart: true,
      captions: { color: '#ffb800', fontSize: 30, backgroundOpacity: 0 }
    }
    ;(typeof (window.jwplayer('xbodyplayer').setup) !== 'undefined') ? window.jwplayer('xbodyplayer').setup(jwoptions) : setTimeout(initPlayer, 1000)
  })()

  clearInterval(window.intervalVideotime)
  window.intervalVideotime = setInterval(() => {
    try {
      // localStorage.setItem('videoId', player[0].plyr.media.currentTime)
    } catch (e) {}
  }, 5000)
})
