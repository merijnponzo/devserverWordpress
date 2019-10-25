//replace links
function createProxyUrls() {
  //devServers url
  const devServer = 'http://localhost:' + PORT
  var items = document.querySelectorAll('a')
  for (var i in items) {
    var item = items[i]
    if (item.nodeName) {
      let url = item.getAttribute('href')
      if (url) {
        let newurl = url.replace(PROXYTARGET, devServer)
        item.setAttribute('href', newurl)
        item.setAttribute('data-routelink', newurl)
      }
    }
  }
}

;(function(open) {
  var t
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener(
      'readystatechange',
      function() {
        //debounce function, should only called once
        clearTimeout(t)
        t = setTimeout(createProxyUrls, 200)
      },
      false
    )
    open.apply(this, arguments)
  }
})(XMLHttpRequest.prototype.open)

//replace links
window.onload = function() {
  createProxyUrls()
}
