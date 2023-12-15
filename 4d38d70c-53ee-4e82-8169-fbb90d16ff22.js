  if (typeof getURLParameter == 'undefined') {
      getURLParameter = function (e) {
          return decodeURIComponent((RegExp(e + "=(.+?)(&|$)").exec(location.search) || [, null])[1])
      }
  }

  if (typeof isCF2 == 'undefined') {
      isCF2 = function () {
          return $('[data-page-element="ContentNode"]').length > 0
      }
  }
  
    (function() {
  // run the scripts inside the dom node
  var $container = document.createElement('div')
  $container.innerHTML = '<script>\nif (document.location.host.indexOf(\'clickfunnels.com\') >= 0 || document.location.host.indexOf(\'funnel-preview.com\') >= 0) {\n    document.addEventListener(\'DOMContentLoaded\', function() {\n        //find vimeo iframe\n        var vimeo_iframes = document.querySelectorAll(\'[data-title*=\"cf-vimeo-video\"] iframe[src*=\"vimeo.com\"]\');\n\n        vimeo_iframes.forEach(function(vimeo_iframe) {\n            // get the html of the iframe\n            var vimeo_iframe_html = vimeo_iframe.outerHTML;\n            // replace the iframe with its html\n            vimeo_iframe.insertAdjacentHTML(\'afterend\', vimeo_iframe_html);\n            // remove the iframe loaded by clickfunnels\n            vimeo_iframe.parentNode.removeChild(vimeo_iframe);\n        });\n    });\n}\n</script>\n<script>\n/**************************\n * Copyright 2018 CF Pro Tools, All Rights Reserved\n * Do not share, or distribute this code without author\'s consent.\n * This copyright notice must remain in place whenever using\n * this code - DO NOT REMOVE\n * Author: Jaime Smith\n * Website: https://cfprotools.com\n **************************/\n\nvar debug = getDebug();\nvar videoWrapperId = \'[data-title*=\"cf-vimeo-video\"], [cfpt-vimeo-video=\"true\"], .cfpt-vimeo-video\';\n//var videoPlayer = null;\nvar checkerMillis = 1000;\nvar videoCurrentTime = 0;\nvar timerInterval = null;\nvar videoPlayers = [];\nvar watchPercentage = 0;\nvar videoVolume = 0;\n\nif (typeof $ == \"undefined\" && jQuery) {\n    $ = jQuery;\n}\n\nfunction getDebug() {\n    var debug = false;\n    if (window.location.href.indexOf(\'cfpt_debug=true\') > -1) {\n        debug = true;\n    }\n    return debug;\n}\n\nfunction debug_log(message) {\n    if (debug) {\n        console.log(message);\n    }\n}\n\n$(function () {\n    var soundImage = \"https://images.clickfunnels.com/ba/09a7a0cb2a11e8a233973e775a70ad/sound-on3.png\"; //update with your own image\n    var playButtonImage = \"https://images.clickfunnels.com/e0/641cd0cb3611e8a5efdf0f4d679b5f/playbutton.png\"; //update with your own image\n\n    var blocker = $(\'<div data-title=\"cf-vimeo-unmute cf-vimeo-restart cf-vimeo-remove-blocker\" class=\"iframeBlocker\"><div class=\"video-sound-overlay\"><div class=\"unmute-button\"><img src=\"\'+soundImage+\'\" alt=\"Click To Turn On Sound\" /></div><div class=\"play-button\"><img src=\"\'+playButtonImage+\'\" /></div></div></div>\');\n    $(\'iframe\', videoWrapperId).parents(\'.elVideo\').append(blocker);\n    $(\'.cfpt-vimeo-video\').append(blocker);\n    debug_log(\'blocker added\');\n\n    $(\'[data-title*=\"cf-vimeo-remove-blocker\"]\').on(\'click\', function () {\n        debug_log(\'remove blocker clicked\');\n        $(this).remove();\n    });\n    debug_log(\'blocker click handler added\');\n});\n\n$(function() {\n    if (typeof Vimeo == \'undefined\') {\n        $(\'body\').append($(\'<script>\', {src: \"https://player.vimeo.com/api/player.js\"}));\n        checkForVimeo();\n    } else {\n        handleVimeoPlayer();\n    }\n\n    function checkForVimeo() {\n        if (typeof Vimeo == \'undefined\') {\n            window.setTimeout(checkForVimeo, 100);\n        } else {\n            handleVimeoPlayer();\n        }\n    }\n});\n\nfunction handleVimeoPlayer() {\n    $(videoWrapperId).each(function () {\n        var thisThis = $(this);\n        var loop = false;\n\n        if ($(this).attr(\'data-title\')) {\n          loop = $(this).attr(\'data-title\').indexOf(\'cf-vimeo-loop\') !== -1;\n        } else if ($(this).attr(\'cfpt-vimeo-loop\')) {\n          loop = true;\n        }\n\n        var videoFrameSrc = $(\'iframe\', thisThis).attr(\'src\');\n        var newUrl = new URL(videoFrameSrc, window.location);\n        newUrl.searchParams.delete(\'autoplay\');\n        newUrl.searchParams.delete(\'muted\');\n        newUrl.searchParams.append(\'autoplay\',\'1\');\n        newUrl.searchParams.append(\'muted\',\'1\');\n        if (loop) {\n          newUrl.searchParams.append(\'loop\',\'1\');\n        }\n        videoFrameSrc = newUrl.toString();\n        $(\'iframe\', thisThis).attr(\'allow\', \'autoplay\');\n        $(\'iframe\', thisThis).attr(\'src\', videoFrameSrc);\n\n        var videoPlayer = new Vimeo.Player($(\'iframe\', thisThis));\n        videoPlayers.push(videoPlayer);\n\n        videoPlayer.ready().then(function () {\n            $(\'.elVideo\', thisThis).next(\'iframe\').remove();\n\n            $(\'[data-title*=\"cf-vimeo-unmute\"]\', thisThis).on(\'click\', function() {\n                videoPlayer.setVolume(1);\n                videoVolume = 1;\n                videoPlayer.setMuted(false);\n                videoPlayer.play();\n            });\n\n            $(\'[data-title*=\"cf-vimeo-restart\"]\', thisThis).on(\'click\', function() {\n                videoPlayer.setCurrentTime(0);\n                videoPlayer.play();\n                startTimeCheckers();\n            });\n\n            $(\'[data-title*=\"cf-vimeo-delay-\"]\').each(function() {\n                var seconds = null;\n                var titleParts = $(this).attr(\'data-title\').split(\' \');\n                var currThis = $(this);\n                $.each(titleParts, function(index, value) {\n                    if (value.indexOf(\'cf-vimeo-delay-\') > -1) {\n                        seconds = parseInt(value.split(\'-\').pop());\n                        currThis.attr(\'data-vimeo-delay\', seconds);\n                    }\n                });\n            });\n\n            function checkAndPop() {\n\n                $(\'[data-vimeo-delay]:hidden\').each(function() {\n                    var seconds = parseInt($(this).data(\'vimeo-delay\'));\n\n                    if (videoCurrentTime >= seconds && videoVolume) {\n                        $(this).fadeIn();\n                    }\n                });\n            }\n\n            function clearTimeCheckers() {\n                clearInterval(timerInterval);\n            }\n\n            function startTimeCheckers() {\n                timerInterval = setInterval(checkAndPop, checkerMillis);\n            }\n\n            videoPlayer.on(\'volumechange\', function (data) {\n                var thisVolume = data.volume;\n                var thisElID = videoPlayer.element.id;\n                if (thisVolume > 0) {\n                    $.each(videoPlayers, function (index, value) {\n                        var currElID = value.element.id;\n\n                        if (thisElID != currElID) {\n                            value.getVolume().then(function (volume) {\n                                if (volume > 0) {\n                                    value.pause();\n                                }\n                            });\n                        }\n                    });\n                }\n            });\n\n            videoPlayer.on(\'timeupdate\', function (data) {\n                videoCurrentTime = data.seconds;\n                watchPercentage = data.percent;\n            });\n\n            videoPlayer.on(\'play\', function (data) {\n                var thisVolume = 0;\n                videoPlayer.getVolume().then(function (volume) {\n                    thisVolume = volume;\n                });\n                var thisElID = videoPlayer.element.id;\n                if (thisVolume > 0) {\n                    $.each(videoPlayers, function (index, value) {\n                        var currElID = value.element.id;\n\n                        if (thisElID != currElID) {\n                            value.getVolume().then(function (volume) {\n                                if (volume > 0) {\n                                    value.pause();\n                                }\n                            });\n                        }\n                    });\n                }\n            });\n        });\n    });\n}\n</script>\n\n<style>\n.video-sound-overlay {\n    width: 100%;\n    height: 100%;\n    background-image:url(https://images.clickfunnels.com/35/663790d4c411e899cbf7997697a31b/big-play-button.png);\n    background-repeat:no-repeat;\n    position:absolute;\n    left:0%;\n    right:0%;\n    top:0%;\n    bottom:0%;\n    margin:auto;\n    background-size: 20%;\n    background-position: center;\n}\n\n.unmute-button {\n  text-align: left;\n}\n\n.video-sound-overlay img {\n    width: 18%;\n    padding: 10px;\n    position: absolute;\n}\n\n.video-sound-overlay img {\n  margin-top: 5px;\n  margin-left: 10px;\n  animation: pulse 2s infinite;\n  animation-timing-function: ease-out;\n}\n\n@keyframes pulseScale {\n  80% {\n      transform: scale(1.1);\n  }\n}\n\n.video-sound-overlay .play-button {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    margin-left: -100px;\n    margin-top: -100px;\n}\n\n@media only screen and (max-width: 770px) and (min-width: 0px) {\n    .iframeBlocker {\n        display: block !important;\n    }\n\n  .unmute-button img {\n    width: 35%;\n  }\n}\n</style>\n'
  document.body.appendChild($container);
  runScripts($container);

  // runs an array of async functions in sequential order
  function seq (arr, callback, index) {
    // first call, without an index
    if (typeof index === 'undefined') {
      index = 0
    }

    if (!arr[index]) {
      return;
    }

    arr[index](function () {
      index++
      if (index === arr.length) {
        if (callback)
          callback()
      } else {
        seq(arr, callback, index)
      }
    })
  }

  // trigger DOMContentLoaded
  function scriptsDone () {
    //var DOMContentLoadedEvent = document.createEvent('Event')
    //DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
    //document.dispatchEvent(DOMContentLoadedEvent)
  }

  /* script runner
   */

  function insertScript ($script, callback) {
    var s = document.createElement('script')
    s.type = 'text/javascript'
    if ($script.src) {
      s.onload = callback
      s.onerror = callback
      s.src = $script.src
    } else {
      s.textContent = $script.innerText
    }

    // re-insert the script tag so it executes.
    document.head.appendChild(s)

    // clean-up
    $script.parentNode.removeChild($script)

    // run the callback immediately for inline scripts
    if (!$script.src) {
      callback()
    }
  }

  
  function runScripts ($container) {
    // https://html.spec.whatwg.org/multipage/scripting.html
    var runScriptTypes = [
      'application/javascript',
      'application/ecmascript',
      'application/x-ecmascript',
      'application/x-javascript',
      'text/ecmascript',
      'text/javascript',
      'text/javascript1.0',
      'text/javascript1.1',
      'text/javascript1.2',
      'text/javascript1.3',
      'text/javascript1.4',
      'text/javascript1.5',
      'text/jscript',
      'text/livescript',
      'text/x-ecmascript',
      'text/x-javascript'
    ]

    // get scripts tags from a node
    var $scripts = $container.querySelectorAll('script')
    var runList = []
    var typeAttr

    [].forEach.call($scripts, function ($script) {
      typeAttr = $script.getAttribute('type')

      // only run script tags without the type attribute
      // or with a javascript mime attribute value
      if (!typeAttr || runScriptTypes.indexOf(typeAttr) !== -1) {
        runList.push(function (callback) {
          insertScript($script, callback)
        })
      }
    })

    // insert the script tags sequentially
    // to preserve execution order
    seq(runList, scriptsDone)
  }
}());

