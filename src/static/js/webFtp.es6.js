/*
  Powered By: 摘星fy
  Edit By: sublimetext
  Date: 2017-7-8
  QQ: 273259755
*/
;(function($) {
  Vue.config.silent = true
  // 务必在加载 Vue 之后，立即同步设置以下内容
  Vue.config.devtools = true
  
  let curDir = $()
  let draggableEl = $()
  let oldFileEl = $()
  let dirListEl = $()
  let binaryFiles = []

  const fileInput = document.createElement('input')
  const folderInput = document.createElement('input')

  fileInput.type = folderInput.type = 'file'
  fileInput.setAttribute('multiple', 'true')
  folderInput.setAttribute('webkitdirectory', 'true')

  window.vm = new Vue({
    el: '#web-ftp',
    data() {
      return {
        zIndex: 0,
        debounce: 0,
        router: { // 路由
          config: {
            isDisplay: false,
            curAppIndex: 0,
            appList: [{
              url: 'http://localhost/web-ftp/src/php/webFtp.php',
              eye: false,
              curDirIndex: 0,
              secretKey: '',
              dirList: []
            }]
          },
          newDir: {
            isDisplay: false,
            name: ''
          },
          open: {
            isDisplay: false,
            path: ''
          }
        },
        rename: {
          isDisplay: false,
          name: ''
        },
        is: { // 布尔类型
          mac: navigator.userAgent.indexOf('Mac OS') > -1,
          isUploadDirSupport: 'webkitdirectory' in folderInput,
          loading: false,
        },
        freeView: {
          isDisplay: true,
          left: 0,
          top: 0,
          scale: 1,
          rotate: 0,
          curIndex: 0,
          imgList: []
        },
        alert: {
          isDisplay: false,
          msg: '找不到相关目录'
        },
        urlReport: {}, // 接口报告
        path2File: {}, // 目录 -> 文件列表
        clipboard: { // 剪切板
          isCopy: false,
          pathFrom: 'c:/phpStudy',
          filenames: []
        },
        menu: { // 右键菜单
          list: ['复制', '剪切', '粘贴']
        },
        timer: { // 定时器
          dragover: 0,
          autoScroll: 0,
          changeHash: 0,
        },
        upload: { // 上传信息
          msg: '',
          isUploading: false,
          sizeTotal: 0,
          sizeUploaded: 0,
          sizeUploading: 0,
          errReport: [],
        },
        mapType: {
          'bmp': 'picture',
          'tiff': 'picture',
          'gif': 'picture',
          'jpeg': 'picture',
          'jpg': 'picture',
          'svg': 'picture',
          'png': 'picture',
          /*'c': 'text-height',
          'cpp': 'text-height',
          'lua': 'text-height',
          'html': 'text-height',
          'css': 'text-height',
          'js': 'text-height',
          'node': 'text-height',
          'java': 'text-height',
          'md': 'text-height',
          'jsp': 'text-height',
          'net': 'text-height',
          'py': 'text-height',
          'swift': 'text-height',
          'php': 'text-height',*/
          'rm': 'film',
          'rmvb': 'film',
          'wmv': 'film',
          'avi': 'film',
          'mp4': 'film',
          '3gp': 'film',
          'mkv': 'film',
          'cd': 'music',
          'ogg': 'music',
          'mp3': 'music',
          'wma': 'music',
          'wav': 'music',
          'mp3pro': 'music',
          'rm': 'music',
          'real': 'music',
          'ape': 'music',
          'module': 'music',
          'midi': 'music',
          'vqf': 'music',
          /*'zip': 'tasks',
          'rar': 'tasks',*/
        }
      }
    },
    computed: {
      config() {
        return this.router.config
      },
      appList() {
        return this.config.appList || []
      },
      curApp() {
        return this.appList[this.curAppIndex] || {}
      },
      dirList() {
        return this.curApp.dirList || []
      },
      dir() {
        return this.dirList[this.curDirIndex] || {}
      },
      curAppIndex: {
        get() {
          let i = this.config.curAppIndex
          let len = this.appList.length
          return (i % len + len) % len
        },
        set(newVal) {
          this.config.curAppIndex = newVal
        }
      },
      curDirIndex: {
        get() {
          let i = this.curApp.curDirIndex
          let len = this.dirList.length
          return (i < 0 || i > len - 1) ? len - 1 : i
        },
        set(newVal) {
          this.curApp.curDirIndex = newVal
        }
      },
    },
    watch: {
      'router': { // router -> hash
        deep: true,
        handler(newVal) {
          const vm = this
          clearTimeout(vm.timer.changeHash)
          vm.timer.changeHash = setTimeout(() => {
            location.hash = JSON.stringify(newVal)
          }, vm.debounce || 10)
          vm.debounce = 0
        }
      },
      'rename.isDisplay': function(newVal) {
        if (newVal) {
          vm.$nextTick(() => {
            $('.modal:visible .form-control:eq(0)').each((i, node) => {
              node.focus()
              node.select()
            })
          })
        }
      }
    },
    methods: { // 初始化路由
      routerInit() {
        const vm = this
        let r = {}
        try {
          r = JSON.parse(location.hash.substring(1))
        } catch (e) {
          bug('router parse err')
        }

        r.config = r.config || {}
        r.config = r.config || {}
        r.config.isDisplay = r.config.isDisplay || false
        r.config.curAppIndex = r.config.curAppIndex || 0
        r.config.appList = r.config.appList || []
        r.newDir = r.newDir || {}
        r.newDir.isDisplay = r.newDir.isDisplay || false
        r.newDir.name = r.newDir.name || ''
        r.open = r.open || {}
        r.open.isDisplay = r.open.isDisplay || false
        r.open.path = r.open.path || ''

        if (r.config.appList.length === 0) {
          r.config.appList.push({
            url: 'http://codding.cn/webFtp.php',
            eye: false,
            curDirIndex: 0,
            secretKey: '',
            dirList: [/*{
              path: 'c:/phpStudy/www',
              sortBy: '0',
              uid: g.createUid(),
              css: {
                left: '100px',
                top: '100px',
                width: '400px',
                height: '400px',
                zIndex: 1,
              }
            }*/],
          })
        }

        vm.router = r

        // 接口探测 + 获取服务端信息
        vm.checkReport(() => {
          // 打开全部文件夹
          vm.openAllDir()
        })

        if (
          r.config.isDisplay ||
          r.open.isDisplay ||
          r.newDir.isDisplay
        ) {
          setTimeout(() => {
            if (!$(':focus').is('.form-control')) {
              $('.modal .form-control:eq(0)').focus()
            }
          }, 100)
        }
      },
      urlFormat(path) {
        return path.replace(/(\\|\/)+/g, '/').replace(/\/+$/, '')
      },
      getWrapFilesKey(dir) {
        return this.curApp.url + '-' + this.curApp.secretKey + '-' + dir.path
      },
      getFiles(dir) {
        return this.path2File[this.getWrapFilesKey(dir)] || []
      },
      getBinaryFiles() { // 获取二进制文件
        return binaryFiles
      },
      getUrlReport(appItem) {
        return this.urlReport[appItem.url + '-' + appItem.secretKey] || {}
      },
      updateDirPath(e, dir) {
        const input = e.target
        const path = vm.urlFormat(input.value)
        input.value = dir.path = path
        input.blur()
      },
      stopUploading() {
        const vm = this
        binaryFiles = []
        vm.upload = { // 上传信息
          msg: '',
          isUploading: false,
          sizeTotal: 0,
          sizeUploaded: 0,
          sizeUploading: 0,
          errReport: [],
        }
      },
      blankBinaryFiles() {
        const vm = this
        vm.upload.errReport = []
        binaryFiles = []
      },
      submitRename(e) { // 提交重命名
        const vm = this
        const lis = curDir.find('.file[draggable=true]')
        const count = {
          dir: 0,
          file: 0,
        }
        const data = {
          a: '重命名',
          secretVal: vm.getUrlReport(vm.curApp).secretVal,
          pathFrom: vm.dir.path,
          pathTo: vm.dir.path,
          from: [],
          to: [],
        }
        const basename = vm.rename.name.replace(/\.[^.]*$/, '')
        lis.each((idx, node) => {
          const filenameOrigin = node.getAttribute('filename')
          const filetypeOrigin = node.getAttribute('filetype')
          const basenameOrigin = node.getAttribute('basename')
          const isDir = node.getAttribute('is-dir') === 'true'
          data.from.push(filenameOrigin)
          if (node === oldFileEl[0]) {
            data.to.push(vm.rename.name)
          } else {
            data.to.push(basename + '(' + (isDir ? ++count.dir : ++count.file) + ')' + (filetypeOrigin ? '.' + filetypeOrigin : ''))
          }
        })
        data.from = JSON.stringify(data.from)
        data.to = JSON.stringify(data.to)
        $.post(vm.curApp.url, data, (data) => {
          vm.path2File = {}
          vm.openAllDir()
          vm.rename.name = ''
          vm.rename.isDisplay = false
        })
      },
      async fileUpload(fnEnd) { // 文件上传
        const report = vm.getUrlReport(vm.curApp)
        vm.upload = { // 上传信息
          uploadMsg: '',
          isUploading: true,
          sizeTotal: 0,
          sizeUploaded: 0,
          sizeUploading: 0,
          errReport: [],
        }
        binaryFiles.sort((a, b) => {
          return b.size - a.size
        })
        binaryFiles.forEach((oFile, idx) => {
          vm.upload.sizeTotal += oFile.size
        })
        while (binaryFiles.length) {
          const oFile = binaryFiles.shift()
          if (oFile.size > report.uploadMaxSize_) {
            vm.upload.sizeUploaded += oFile.size
            vm.upload.errReport.push({
              code: 2,
              name: oFile.name,
              msg: '上传失败，服务器限制文件上传最大不得超过 ' + report.uploadMaxSize
            })
            continue
          }
          await new Promise((succ, err) => {
            const formData = new FormData()
            formData.append('a', '文件上传')
            formData.append('pathDir', vm.dir.path)
            formData.append('name', oFile.fullPath)
            formData.append('file', oFile)
            formData.append('secretVal', report.secretVal)

            const xhr = new XMLHttpRequest()
            xhr.open('POST', vm.curApp.url, true)
            xhr.upload.onprogress = (e) => {
              vm.upload.msg = binaryFiles.length + '个文件等待中， 正在上传 ' + oFile.name + ' / '
              vm.upload.sizeUploading = e.loaded
            }
            xhr.onload = xhr.onerror = (e) => {
              let data = {}
              vm.upload.sizeUploaded += oFile.size

              if (e.type === 'error') {
                vm.upload.errReport.push({
                  name: oFile.name,
                  msg: '上传失败，也许是权限问题'
                })
              }
              try {
                data = JSON.parse(xhr.responseText)
              } catch (e) {
                data = {
                  code: 2,
                  msg: '上传失败，后台异常'
                }
              }
              data.name = oFile.name
              if (data.code) {
                vm.upload.errReport.push(data)
              }
              succ(xhr.responseText)
            }
            xhr.send(formData)
          })
        }
        vm.path2File = {}
        vm.upload.isUploading = false
        vm.upload.msg = ''
        vm.openAllDir()
        fnEnd && fnEnd()
      },
      async checkReport(fnEnd) { // 检测接口是否通畅
        const vm = this
        for (let i = 0, len = vm.appList.length; i < len; i++) {
          let appItem = vm.appList[i]
          let reportKey = appItem.url + '-' + appItem.secretKey
          if (!appItem.url || vm.urlReport[reportKey]) {
            continue
          }
          vm.$set(vm.urlReport, reportKey, {isLoading: true})
          try {
            let {token} = await new Promise((succ, err) => {
              $.ajax({
                url: appItem.url,
                method: 'post',
                dataType: 'json',
                data: {
                  a: 'getToken',
                },
                success: succ,
                error: err,
              })
            })
            let secretVal = CryptoJS.SHA256(appItem.secretKey + token).toString()
            let serverInfo = await new Promise((succ, err) => {
              $.post(appItem.url, {
                a: '接口探测',
                secretVal
              }, (data) => {
                succ(data)
              }, 'json')
            })
            if (!serverInfo.code) {
              serverInfo.secretVal = secretVal
              serverInfo.uploadMaxSize_ = serverInfo.uploadMaxSize.match(/\d+/) * 1024 * 1024
            }
            vm.urlReport[reportKey] = serverInfo
          } catch (e) {
            vm.urlReport[reportKey] = {
              code: 2,
              msg: '接口地址异常'
            }
          }
        }
        fnEnd && fnEnd()
      },
      async openAllDir(fnEnd) { // 打开全部文件夹
        const vm = this
        const report = this.getUrlReport(this.curApp)
        // vm.is.loading = true
        if (!report.secretVal) {
          // vm.is.loading = false
          bug('接口不通，不请求')
          return
        }
        for (let i = 0, len = vm.dirList.length; i < len; i++) {
          const dir = vm.dirList[i]
          const key = vm.getWrapFilesKey(dir)
          if (vm.path2File[key]) {
            continue
          }
          vm.$set(vm.path2File, key, [])
          vm.path2File[key] = await new Promise((succ, err) => {
            $.post(vm.curApp.url, {
              a: '获取文件列表',
              pathDir: dir.path || '/',
              secretVal: report.secretVal
            }, (data) => {
              if (!data.code) {
                data.sort((a, b) => {
                  if (a.isDir === b.isDir) {
                    return a.name.localeCompare(b.name)
                  } else {
                    return b.isDir.toString().localeCompare(a.isDir.toString())
                  }
                })
                data.forEach((item, idx) => {
                  item._mtime = new Date(item.mtime * 1000).date()
                  item.type = !item.isDir && item.name.indexOf('.') > -1 ? 
                    item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase() : ''
                })
              }
              succ(data)
            }, 'json')
          })
        }
        // vm.is.loading = false
      },
      exec(e, command, isNotPreventDefault) {
        const vm = this
        !isNotPreventDefault && e.preventDefault()
        let report = vm.getUrlReport(vm.curApp)
        switch (command) {
          case '自动排版':
            {
              let row = Math.ceil(document.documentElement.clientWidth / 500)
              let iWidth = Math.floor((document.documentElement.clientWidth - 10) / row - 10)
              let count = -1
              vm.dirList.forEach((dir, idx) => {
                count++
                dir.css.width = dir.css.height = iWidth + 'px'
                dir.css.left = (iWidth + 10) * (count % row) + 10 + 'px'
                dir.css.top = (iWidth + 10) * Math.floor(count / row) + 10 + 'px'
              })
            }
            break
          case '打开':
            {
              const _dirList = []
              const files = vm.getFiles(vm.dir)
              const has = {}
              curDir.find('.file[draggable=true]').each((idx, node) => {
                const isDir = node.getAttribute('is-dir') === 'true'
                const index = node.getAttribute('file-index')
                if (isDir) {
                  let dir = JSON.parse(JSON.stringify(vm.dir))
                  dir.path += '/' + node.getAttribute('filename')
                  _dirList.push(dir)
                } else {
                  has.pic = has.pic || vm.mapType[node.getAttribute('filetype')]
                }
              })
              let li = $(e.target).closest('.file')
              if (has.pic) {
                let name = li.attr('filename')
                files.forEach((v, i) => {
                  if (vm.mapType[v.type] === 'picture') {
                    vm.freeView.imgList.push(v)
                  }
                  if (v.name === name) {
                    vm.freeView.curIndex = vm.freeView.imgList.length - 1
                  }
                })
              }
              if (_dirList.length > 0) {
                _dirList.forEach((dir, idx) => {
                  dir.uid = g.createUid()
                  dir.css.left = parseInt(dir.css.left) + idx * 34 + 'px'
                  dir.css.top = parseInt(dir.css.top) + idx * 34 + 'px'
                })
                vm.dirList.splice(vm.curDirIndex, 1, ..._dirList)
                vm.curDirIndex = vm.curDirIndex + _dirList.length - 1
              }
            }
            break
          case '新建文件夹':
            if (!vm.dir.path) {
              return
            }
            vm.router.newDir.isDisplay = true
            break
          case '全选':
            oldFileEl = curDir.find('li').attr('draggable', 'true').eq(0)
            break
          case '复制':
          case '剪切':
            {
              dirListEl.find('.cut').removeClass('cut')
              let clip = vm.clipboard = {
                isCopy: command === '复制',
                pathFrom: vm.dir.path,
                filenames: [],
              }
              curDir.find('.file[draggable=true]').each((idx, node) => {
                clip.filenames.push(node.getAttribute('filename'))
                $(node)[clip.isCopy ? 'removeClass' : 'addClass']('cut')
              })
            }
            break
          case '粘贴':
            {
              let clip = vm.clipboard
              if (!clip.pathFrom) {
                return
              }
              if (report.code || vm.getFiles(vm.dir).code) {
                bug('当前路径不是目录 ' + vm.dir.path)
                vm.clipboard = {}
                return
              }
              if (clip.pathFrom === vm.dir.path) {
                bug('同一目录，不需要移动')
                vm.clipboard = {}
                return
              }

              $.post(vm.curApp.url, {
                a: clip.isCopy ? '复制' : '重命名',
                secretVal: report.secretVal,
                pathFrom: clip.pathFrom,
                pathTo: vm.dir.path,
                from: JSON.stringify(clip.filenames),
                to: JSON.stringify(clip.filenames)
              }, (data) => {
                vm.clipboard = {}
                vm.path2File = {}
                vm.openAllDir()
              })
            }
            break
          case '前进':
            history.forward()
            break
          case '后退':
            history.back()
            break
          case '选中路径':
            curDir.find('.gray-title .form-control:eq(0)').focus().each((idx, el) => {
              el.select && el.select()
            })
            break
          case '删除':
            {
              let data = {
                a: '删除文件',
                secretVal: report.secretVal,
                pathDir: vm.dir.path,
                filenames: []
              }
              curDir.find('.file[draggable=true]').each((idx, el) => {
                data.filenames.push(el.getAttribute('filename'))
              })
              data.filenames = JSON.stringify(data.filenames)
              $.post(vm.curApp.url, data, function(data) {
                vm.path2File = {}
                vm.openAllDir()
              }, 'json')
            }
            break
          case '重命名':
            if (!$.contains(curDir[0], oldFileEl[0])) {
              return
            }
            vm.rename.name = oldFileEl.attr('filename')
            vm.rename.isDisplay = true
            break
          case '下载':
            location = vm.curApp.url + '?' + g.json2URL({
              a: '下载',
              secretVal: report.secretVal,
              pathDir: vm.dir.path,
              filenames: JSON.stringify([curDir.find('.file[draggable=true]').eq(0).attr('filename')])
            })
            break
          case '下载zip':
            {
              const filenames = []
              curDir.find('.file[draggable=true]').each((idx, node) => {
                filenames.push(node.getAttribute('filename'))
              })
              location = vm.curApp.url + '?' + g.json2URL({
                a: '打包下载',
                secretVal: report.secretVal,
                pathDir: vm.dir.path,
                filenames: JSON.stringify(filenames)
              })
            }
            break
          case '上传文件':
            fileInput.click()
            break
          case '上传文件夹':
            folderInput.click()
            break
        }
      },
    },
    mounted() {
      const vm = this
      vm.routerInit()
      window.top.addEventListener('hashchange', (e) => {
        vm.routerInit()
      }, false)

      vm.dirList.forEach((dir, idx) => {
        vm.zIndex = Math.max(dir.css.zIndex, vm.zIndex)
      })

      document.body.style.display = ''
      vm.$nextTick(initEvents)
    }
  })
  
  function initEvents() {
    const selectRect = $('#web-ftp .select-rect')
    dirListEl = $('#web-ftp .dir-list')
    curDir = dirListEl.children().eq(vm.curDirIndex)
    dirListEl.on('mousedown', function(e) {
      const target = $(e.target)
      if (target.is(':focus') || target.closest('.gray-title .glyphicon')[0]) {return}
      const resize = target.closest('.resize')
      const grayTitle = target.closest('.gray-title')
      const autoScroll = target.closest('.auto-scroll')
      const fileList = target.closest('.file-list')
      const x1 = e.clientX
      const y1 = e.clientY
      let originX, originY, originW, originH
      $(':focus').blur()
      
      curDir = target.closest('.dir').each((idx, el) => {
        originX = el.offsetLeft
        originY = el.offsetTop
        originW = el.offsetWidth
        originH = el.offsetHeight
      })

      vm.curDirIndex = parseInt(curDir.attr('dir-index'))
      for (let i = 0, len = vm.dirList.length; i < len; i++) {
        if (vm.dirList[i] === vm.dir) {
          continue
        }
        if (vm.dir.css.zIndex <= vm.dirList[i].css.zIndex) {
          vm.dir.css.zIndex = ++vm.zIndex
          break
        }
      }

      // 拖拽标题栏，改变位置
      grayTitle.each((idx, el) => {
        e.preventDefault()
        curDir.css('transition', 'none')
        if (e.altKey) {
          let _dir = JSON.parse(JSON.stringify(vm.dir))
          _dir.uid = g.createUid()
          vm.dirList.splice(vm.curDirIndex + 1, 0, _dir)
          vm.curDirIndex++
          vm.$nextTick(() => {
            curDir = dirListEl.children().eq(vm.curDirIndex).css('transition', 'none')
          })
        }
        document.onmousemove = (e) => {
          const x2 = e.clientX
          const y2 = e.clientY
          let x = x2 - x1 + originX
          let y = y2 - y1 + originY
          if (x < 0) {
            x = 0
          }
          if (y < 0) {
            y = 0
          }
          curDir.css({
            left: x + 'px',
            top: y + 'px',
          })
        }
        document.onmouseup = (e) => {
          document.onmousemove = document.onmouseup = null
          curDir.each((idx, el) => {
            vm.dir.css = {
              left: el.offsetLeft + 'px',
              top: el.offsetTop + 'px',
              width: el.offsetWidth + 'px',
              height: el.offsetHeight + 'px',
              zIndex: vm.dir.css.zIndex,
            }
          })
          dirListEl.children().css('transition', '')
        }
      })

      // 拖拽八个方向，改变尺寸
      resize.each((idx, el) => {
        e.preventDefault()
        const sClass = target.attr('class')
        const isL = sClass.indexOf('l') > -1
        const isT = sClass.indexOf('t') > -1
        const attr = ({
          'l': ['left', 'width'],
          't': ['top', 'height'],
          'r': ['width'],
          'b': ['height'],
          'lt': ['left', 'top', 'width', 'height'],
          'rt': ['top', 'width', 'height'],
          'rb': ['width', 'height'],
          'lb': ['left', 'width', 'height'],
        })[sClass]
        const _curDir = curDir[0]
        const iMin = 200
        curDir.css({
          transition: 'none'
        })
        document.onmousemove = (e) => {
          const x2 = e.clientX
          const y2 = e.clientY
          const o = {}
          if (isL) {
            o.left = x2 - x1 + originX
          }
          if (isT) {
            o.top = y2 - y1 + originY
          }
          o.width = (isL ? x1 - x2 : x2 - x1) + originW
          o.height = (isT ? y1 - y2 : y2 - y1) + originH
          if (o.width < iMin) {
            if (isL) {
              o.left = originX + originW - iMin
            }
            o.width = iMin
          }
          if (o.height < iMin) {
            if (isT) {
              o.top = originY + originH - iMin
            }
            o.height = iMin
          }
          if (o.left < 0) {
            if (isL) {
              o.width += o.left
            }
            o.left = 0
          }
          if (o.top < 0) {
            if (isT) {
              o.height += o.top
            }
            o.top = 0
          }
          attr.forEach((key, idx) => {
            _curDir.style[key] = o[key] + 'px'
          })
        }
        document.onmouseup = (e) => {
          document.onmousemove = document.onmouseup = null
          curDir.each((idx, el) => {
            vm.dir.css = {
              left: el.offsetLeft + 'px',
              top: el.offsetTop + 'px',
              width: el.offsetWidth + 'px',
              height: el.offsetHeight + 'px',
              zIndex: vm.dir.css.zIndex,
            }
          })
          curDir.css({
            transition: ''
          })
        }
      })

      // 框选文件
      fileList.each((idx, el) => {
        const _curDir = curDir[0]
        const _autoScroll = autoScroll[0]
        const _selectRect = selectRect[0]
        const posAutoScroll = _autoScroll.getBoundingClientRect()
        const startX = x1 - posAutoScroll.left + _autoScroll.scrollLeft
        const startY = y1 - posAutoScroll.top + _autoScroll.scrollTop
        let lis = [].slice.call(_autoScroll.querySelectorAll('.dir-list li'))
        let _lis = []
        let isMoved = false

        if (target.attr('draggable') === 'true') {
          const li = target.closest('.file')
          if (li.attr('draggable') === 'true' && !g.isCtrlKey(e) && !e.shiftKey) {
            if (e.which !== 3) {
              document.onmouseup = fnUp
            }
          } else {
            fnUp(e)
          }
          if (e.which === 3) {
            oldFileEl = li
          }
        } else {
          e.preventDefault()
          _lis = lis.map((el, idx) => {
            const isIndraggable = el.getAttribute('draggable') === 'true'
            if (isIndraggable && !g.isCtrlKey(e) && !e.shiftKey) {
              el.setAttribute('draggable', 'false')
            }
            return {
              l: el.offsetLeft,
              t: el.offsetTop,
              r: el.offsetLeft + el.offsetWidth,
              b: el.offsetTop + el.offsetHeight,
              ctrlSign: g.isCtrlKey(e) && isIndraggable,
              shiftSign: e.shiftKey && isIndraggable,
              li: el
            }
          })
          selectRect.appendTo(autoScroll)
          document.onmousemove = fnMove
          document.onmouseup = (e) => {
            fnUp(e, e.which === 3)
          }
        }

        function fnMove(e) {
          const target = $(e.target)
          const x2 = e.clientX
          const y2 = e.clientY
          isMoved = isMoved || !!(x2 - x1) || !!(y2 - y1)
          if (!isMoved) {
            return
          }
          clearTimeout(vm.timer.autoScroll)
          if (e.clientY < posAutoScroll.top || e.clientY > posAutoScroll.bottom) {
            const isUp = e.clientY < posAutoScroll.top
            const speed = isUp ? e.clientY - posAutoScroll.top : e.clientY - posAutoScroll.bottom
            _autoScroll.scrollTop += speed
            vm.timer.autoScroll = setTimeout(() => {
              fnMove({
                clientX: e.clientX,
                clientY: e.clientY,
                ctrlKey: g.isCtrlKey(e),
                shiftKey: e.shiftKey,
                altKey: e.altKey,
              })
            }, 17)
          }
          const endX = x2 - posAutoScroll.left + _autoScroll.scrollLeft
          const endY = y2 - posAutoScroll.top + _autoScroll.scrollTop
          let l = Math.min(startX, endX)
          let t = Math.min(startY, endY)
          let w = Math.abs(startX - endX)
          let h = Math.abs(startY - endY)
          if (l < 0) {
            w += l
            l = 0
          }
          if (t < 0) {
            h += t
            t = 0
          }
          if (w > _autoScroll.scrollWidth - l) {
            w = _autoScroll.scrollWidth - l
          }
          if (h > _autoScroll.scrollHeight - t) {
            h = _autoScroll.scrollHeight - t
          }
          _selectRect.style.left = l + 'px'
          _selectRect.style.top = t + 'px'
          _selectRect.style.width = w + 'px'
          _selectRect.style.height = h + 'px'
          _selectRect.style.display = 'block'

          let r = l + w
          let b = t + h
          for (let i = 0, len = _lis.length; i < len; i++) {
            const tmp = _lis[i]
            const li = tmp.li
            const isColl = !(
              l > tmp.r ||
              t > tmp.b ||
              r < tmp.l ||
              b < tmp.t
            )
            if (g.isCtrlKey(e)) {
              li.setAttribute('draggable', isColl ? !tmp.ctrlSign : tmp.ctrlSign)
            } else if (e.shiftKey) {
              li.setAttribute('draggable', isColl || tmp.shiftSign)
              isColl && delete tmp.shiftSign
            } else {
              li.setAttribute('draggable', isColl)
            }
          }
        }
        function fnUp(e, isNotSelect) {
          const target = $(e.target)
          const closestFileEl = target.closest('.file')
          clearTimeout(vm.timer.autoScroll)
          document.onmousemove = document.onmouseup = null
          selectRect.hide()
          if (isMoved) {
            // 框选
            curDir.find('.file[draggable=true]:eq(0)').each((idx, el) => {
              oldFileEl = $(el)
            })
          } else {
            // 点选
            if (g.isCtrlKey(e)) {
              // 反选
              closestFileEl.each((idx, el) => {
                oldFileEl = closestFileEl
                el.setAttribute('draggable', !(el.getAttribute('draggable') === 'true'))
              })
            } else if (e.shiftKey) {
              // 连选
              closestFileEl.each((idx, el) => {
                oldFileEl = $.contains(curDir[0], oldFileEl[0]) ? oldFileEl : curDir.find('.file:eq(0)')
                const _start = oldFileEl.attr('file-index')
                const _end = el.getAttribute('file-index')
                const start = Math.min(_start, _end)
                const end = Math.max(_start, _end)
                lis.forEach((el, idx) => {
                  el.setAttribute('draggable', idx >= start && idx <= end)
                })
              })
            } else {
              // 普通选
              if (!isNotSelect) {
                lis.forEach((el, idx) => {
                  el.setAttribute('draggable', 'false')
                })
                closestFileEl[0] && (oldFileEl = closestFileEl.attr('draggable', 'true'))
              }
            }
          }
        }
      })
    }).on('dblclick', '.file', function(e) {
      e.preventDefault()
      vm.exec(e, '打开')
    }).on('contextmenu', '.file-list', function(e) {
      e.preventDefault()
      let x = e.clientX
      let y = e.clientY
      const lis = curDir.find('.file[draggable=true]')
      if ($(e.target).attr('draggable') === 'true') {
        vm.menu.list = ['打开', '复制', '剪切', '粘贴', '重命名', '删除', (lis.length === 1 && lis.attr('is-dir') !== 'true') ? '下载' : '下载zip']
      } else {
        vm.menu.list = ['新建文件夹', '上传文件', '上传文件夹', vm.clipboard.pathFrom ? '粘贴' : '']
      }

      vm.$nextTick(() => {
        $('#menu').show()
        let w = $('#menu').width()
        let h = $('#menu').height()
        if (x + w > document.documentElement.clientWidth) {
          x = document.documentElement.clientWidth - w
        }
        if (y + h > document.documentElement.clientHeight) {
          y = document.documentElement.clientHeight - h
        }
        $('#menu').css({
          left: x + 'px',
          top: y + 'px',
        })
      })
    }).on('dragstart', '.file-list', function(e) {
      const _e = e.originalEvent
      const fileEls = curDir.find('.file[draggable=true]')
      let zipName = ''
      let zipType = ''
      let action = ''

      draggableEl = $(e.target).closest('.file')

      if (fileEls.length === 1) {
        let filename = fileEls.find('.file-name').html()
        if (fileEls.attr('is-dir') === 'true') {
          zipName = filename + '.zip'
          zipType = 'zip'
          action = '打包下载'
        } else {
          zipName = filename
          zipType = (filename.match(/\.(\w+)$/) || [])[1] || 'text'
          action = '下载'
        }
      } else {
        zipName = 'download.zip'
        zipType = 'zip'
        action = '打包下载'
      }

      const names = []
      fileEls.each((idx, el) => {
        names.push(el.getAttribute('filename'))
      })

      let sURL = 'application/' + zipType + ':' + zipName + ':' + vm.curApp.url + '?' + g.json2URL({
        a: action,
        secretVal: vm.getUrlReport(vm.curApp).secretVal,
        pathDir: vm.dir.path,
        filenames: JSON.stringify(names)
      })
      vm.exec(e, e.altKey ? '复制' : '剪切', 'not preventDefault')
      _e.dataTransfer.setData('DownloadURL', sURL)
      _e.dataTransfer.setData('text', 'http:codding.cn/blog.html')
    }).on('dragover', function(e) {
      dirListEl.children().removeClass('dragover')
      $(e.target).closest('.dir').addClass('dragover')
      clearTimeout(vm.timer.dragover)
      vm.timer.dragover = setTimeout(function() {
        dirListEl.children().removeClass('dragover')
      }, 200)
      return false
    }).on('drop', function(e) { // 所有退拽相关的操作
      const _e = e.originalEvent
      const target = $(e.target)
      e.preventDefault()
      _e.stopImmediatePropagation()
      dirListEl.find('.cut').removeClass('cut')
      vm.curDirIndex = parseInt(target.closest('.dir').attr('dir-index'))
      vm.dir.css.zIndex = ++vm.zIndex

      if (draggableEl[0]) {
        vm.exec(e, '粘贴')
      } else {
        g.getFileFromDataTransfer(_e.dataTransfer, (files) => {
          binaryFiles = files
          vm.fileUpload()
        })
        dirListEl.find('.cut').removeClass('cut')
      }
      draggableEl = $()
      return false
    })

    fileInput.onchange = folderInput.onchange = function() {
      const me = this
      binaryFiles = [].slice.call(this.files).map((oFile, idx) => {
        oFile.fullPath = '/' + (me === fileInput ? oFile.name : oFile.webkitRelativePath)
        return oFile
      })
      vm.fileUpload()
    }

    const mapKey = {
      '8': 'backspace',
      '9': 'tab',
      '13': 'enter',
      '27': 'esc',
      '35': 'end',
      '36': 'home',
      '38': 'up',
      '39': 'right',
      '40': 'bottom',
      '46': 'delete',
      '65': 'a',
      '66': 'b',
      '67': 'c',
      '68': 'd',
      '69': 'e',
      '70': 'f',
      '71': 'g',
      '72': 'h',
      '73': 'i',
      '74': 'j',
      '75': 'k',
      '76': 'l',
      '77': 'm',
      '78': 'n',
      '79': 'o',
      '80': 'p',
      '81': 'q',
      '82': 'r',
      '83': 's',
      '84': 't',
      '85': 'u',
      '86': 'v',
      '87': 'w',
      '88': 'x',
      '89': 'y',
      '90': 'z',
      '113': 'f2',
    }
    $(document).on('click', (e) => {
      $('#menu').hide()
    }).on('copy', (e) => {
      if (!$(e.target).is(':focus')) {
        vm.exec(e, '复制', 'not preventDefault')
      }
    }).on('cut', (e) => {
      if (!$(e.target).is(':focus')) {
        vm.exec(e, '剪切', 'not preventDefault')
      }
    }).on('paste', (e) => {
      if (vm.clipboard.pathFrom) {
        vm.exec(e, '粘贴')
      } else {
        const _e = e.originalEvent
        const oFile = _e.clipboardData.items[0].getAsFile()
        if (oFile) {
          oFile.fullPath = '/' + new Date().getTime() + '.png'
          binaryFiles = [oFile]
          vm.fileUpload()
        }
      }
    }).on('dragover', function(e) {
      e.preventDefault()
    }).on('drop', function(e) {
      e.stopImmediatePropagation()
      e.originalEvent.preventDefault()
    }).on('keydown', (e) => {
      const sKey = mapKey[e.keyCode]
      const isCtrlKey = g.isCtrlKey(e)

      if (sKey === 'esc') {
        vm.router.open.isDisplay = 
        vm.router.newDir.isDisplay = 
        vm.router.config.isDisplay = 
        vm.rename.isDisplay = false
        vm.freeView.imgList = []
      }

      curDir = dirListEl.children().eq(vm.curDirIndex)

      if ($(e.target).is(':focus')) {
        return
      }

      if (isCtrlKey && e.shiftKey && e.altKey) {
        switch (sKey) {

        }
      } else if (isCtrlKey && e.shiftKey) {
        switch (sKey) {

        }
      } else if (isCtrlKey && e.altKey) {
        switch (sKey) {
          case 'a': // 截图
            vm.clipboard = {}
            break
          case 'f':
            vm.exec(e, '自动排版')
            break
        }
      } else if (e.shiftKey && e.altKey) {
        switch (sKey) {

        }
      } else if (isCtrlKey) {
        switch (sKey) {
          case 'a':
            vm.exec(e, '全选')
            break
          case 'q':
            vm.exec(e, '选中路径')
            break
          case 'y':
            vm.exec(e, '前进')
            break
          case 'z':
            vm.exec(e, '后退')
            break
        }
      } else if (e.shiftKey) {
        switch (sKey) {

        }
      } else if (e.altKey) {
        switch (sKey) {
          case 'w':
          case 'x':
            vm.dirList.splice(vm.curDirIndex, 1)
            break
          case 'o':
            vm.router.open.isDisplay = true
            break
          case 'n':
            vm.exec(e, '新建文件夹')
            break
          case 'm':
            vm.router.config.isDisplay = true
            break
        }
      } else {
        switch (sKey) {
          case 'delete':
            vm.exec(e, '删除')
            break
          case 'backspace':
            vm.exec(e, '后退')
            break
          case 'enter':
            vm.exec(e, '打开')
            break
          case 'f2':
            vm.exec(e, '重命名')
            break
        }
      }
    })
  }
  
})(window.jQuery);