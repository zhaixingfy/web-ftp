var g = {
  is: {
    mac: navigator.userAgent.indexOf('Mac OS') > -1,
  },
  json2URL(json) {
    let arr = []
    for (let key in json) {
      arr.push(key + '=' + encodeURIComponent((typeof json[key] === 'object' ? JSON.stringify(json[key]) : json[key])))
    }
    return arr.join('&')
  },
  urlFormat(url) {
    return url.replace(/(\\|\/)+/g, '/').replace(/\/$/, '')
  },
  createUid() {
    return parseInt(Math.random().toString().replace('0.', '')).toString(36)
  },
  isCtrlKey(e) {
    return g.is.mac ? e.metaKey : e.ctrlKey
  },
  getReport(appItem) {
    return this.g.urlReport[appItem.url + '-' + appItem.secretKey] || {}
  },
  dirname(path) {
    return path.replace(/\/[^/]*$/, '')
  },
  getFileFromDataTransfer(dataTransfer, cb) {
    if (dataTransfer.files.length === 0) {
      return []
    }
    let timerRead = 0
    let files = []
    function singleRead(entry) {
      if (entry.isFile) {
        entry.file(function(file) {
          file.fullPath = entry.fullPath
          files.push(file)
          timerRead && clearTimeout(timerRead)
          timerRead = setTimeout(function() {
            cb && cb(files)
          }, 300)
        })
      } else if (entry.isDirectory) {
        entry.createReader().readEntries(function(entries) {
          Array.prototype.slice.call(entries).forEach(singleRead)
        })
      }
    }
    Array.prototype.slice.call(dataTransfer.items).forEach(function(item) {
      if (item.kind === 'file') {
        singleRead(item.webkitGetAsEntry())
      }
    })
  },
}

if (!Array.prototype.fill) {
  Array.prototype.fill = function(val, _start, _end) {
    _start = _start || 0
    _end = _end || this.length - 1
    _start = (_start % this.length + this.length) % this.length
    _end = (_end % this.length + this.length) % this.length
    const start = Math.max(_start, _end)
    const end = Math.min(_start, _end)
    for (let i = start; i <= end; i++) {
      this[i] = val
    }
    return this
  }
}

Number.prototype.fill0 = function(len) {
  let n = this.toString()
  len = len || 2
  while (n.length < len) {
    n = '0' + n
  }
  return n
}

Date.prototype.date = function(f) {
  let json = {
    y: (this.getFullYear()).fill0(),
    m: (this.getMonth() + 1).fill0(),
    d: (this.getDate()).fill0(),
    h: (this.getHours()).fill0(),
    i: (this.getMinutes()).fill0(),
    s: (this.getSeconds()).fill0(),
  }
  return (f || 'y-m-d h:i:s').replace(/y|m|d|h|i|s/g, (key) => {
    return json[key]
  })
}

if (document.body.closest) {
  $.prototype.closest = function(selector) {
    return this.map((idx, el) => {
      return el.closest(selector)
    })
  }
}

$(window).on('scroll', (e) => {
  $('#menu').hide()
})
