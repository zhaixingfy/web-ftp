Vue.component('ctrl-btn', {
  template: `
    <div class="ctrl-btn"
      :style="{zIndex: $root.zIndex + 5}"
    >
      <a href="javascript:" class="btn btn-success"
        @click="$root.router.open.isDisplay=true"
        v-if="$root.getUrlReport($root.curApp).secretVal"
      >
        <i class="glyphicon glyphicon-folder-open"></i>
        <span>打开</span>
      </a>
      <a href="javascript:" class="btn btn-warning"
        @click="$root.router.config.isDisplay=true"
      >
        <i class="glyphicon glyphicon-cog"></i>
        <span>配置</span>
      </a>
    </div>
  `
})

// 新建文件夹
Vue.component('modal-new-dir', {
  template: `
    <div class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="$root.router.newDir.isDisplay=false"
    >
      <form class="modal-dialog" 
        @click.stop
        @submit.prevent="submitNewDir"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>新建文件夹</span>
            </h4>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <span>在 {{$root.dir.path}} 下创建文件夹</span>
            </div>
            <input type="text" placeholder="输入名称" class="form-control" 
              v-model="$root.router.newDir.name"
              @input="$root.debounce=500;"
            />
          </div>
          <div class="modal-footer">
            <input type="submit" value="新建" class="btn btn-success btn-block" />
          </div>
        </div>
      </form>
    </div>
  `,
  methods: {
    submitNewDir(e) {
      const vm = this.$root
      const key = vm.getWrapFilesKey(vm.dir)
      const report = vm.getUrlReport(vm.curApp)
      const fullPath = vm.urlFormat(vm.dir.path + '/' + vm.router.newDir.name)
      vm.debounce = 1
      $.post(vm.curApp.url, {
        a: '新建文件夹',
        secretVal: report.secretVal,
        fullPath
      }, (data) => {
        if (vm.router.newDir.name.indexOf('/') > -1) {
          vm.dir.path = fullPath
        }
        vm.path2File = {}
        vm.router.newDir.name = ''
      })
      vm.router.newDir.isDisplay = false
    }
  }
})

// 重命名
Vue.component('modal-rename', {
  template: `
    <div class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="$root.router.newDir.isDisplay=false"
    >
      <form class="modal-dialog" 
        @click.stop
      >
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>重命名</span>
            </h4>
          </div>
          <div class="modal-body">
            <input type="text" placeholder="输入名称" class="form-control" 
              @input="$root.debounce=500;"
            />
          </div>
          <div class="modal-footer">
            <input type="submit" value="重命名" class="btn btn-success btn-block" />
          </div>
        </div>
      </form>
    </div>
  `,
})

// modal-open-dir
Vue.component('modal-open-dir', {
  template: `
    <div class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="$root.router.open.isDisplay=false"
    >
      <form class="modal-dialog"
        @click.stop
        @submit.prevent="submitOpenDir"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>打开文件夹</span>
            </h4>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <span>当前远程地址：{{$root.curApp.url}}</span>
            </div>
            <input type="text" placeholder="输入路径" class="form-control" 
              v-model="$root.router.open.path"
              @input="$root.debounce=500;"
            />
          </div>
          <div class="modal-footer">
            <input type="submit" value="打开" class="btn btn-success btn-block" />
          </div>
        </div>
      </form>
    </div>
  `,
  methods: {
    submitOpenDir() {
      const vm = this.$root
      $('html,body').animate({
        scrollTop: 0
      })
      vm.debounce = 0
      vm.dirList.push({
        "path": vm.urlFormat(vm.router.open.path),
        "sortBy": "0",
        "uid": g.createUid(),
        "css": {
          "left": "100px",
          "top": "100px",
          "width": "400px",
          "height": "400px",
          "zIndex": vm.zIndex
        }
      })
      vm.curDirIndex = vm.dirList.length - 1
      vm.router.open.isDisplay = false
      vm.router.open.path = ''
    }
  }
})

// 配置面板
Vue.component('modal-config', {
  template: `
    <div id="modal-config" class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="$root.router.config.isDisplay=false"
    >
      <form class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>配置</span>
            </h4>
          </div>
          <div class="modal-body">
            <div class="app-list">
              <section v-for="(appItem, appIdx) in $root.appList">
                <table class="align">
                  <tr>
                    <td>
                      <input type="text" class="form-control"
                        placeholder="输入地址" 
                        :value="appItem.url"
                        @input="$root.debounce=500;appItem.url=$event.target.value"
                      >
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input :type="appItem.eye ? 'text' : 'password'" class="form-control"
                        placeholder="输入秘钥" 
                        :value="appItem.secretKey"
                        @input="$root.debounce=500;appItem.secretKey=$event.target.value"
                      >
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      <div class="alert alert-danger text-left" style="margin-bottom: 8px;"
                        v-if="$root.getUrlReport(appItem).code"
                        @keydown.stop
                      >{{$root.getUrlReport(appItem).msg}}</div>
                      <div>
                        <span class="btn btn-info btn-xs"
                          v-if="$root.getUrlReport(appItem).isLoading"
                        >loading...</span><!-- 
                     --><span class="btn btn-success btn-xs"
                          v-if="$root.getUrlReport(appItem).secretVal"
                        >接口正常</span><!-- 
                     --><a href="javascript:" class="btn btn-danger btn-xs"
                          @click.prevent="$root.appList.splice(appIdx,1)"
                          v-if="$root.appList.length > 1"
                        >
                          <i class="glyphicon glyphicon-trash"></i>
                        </a><!-- 
                     --><a href="javascript:" class="btn btn-warning btn-xs"
                          @click.prevent="$root.appList.splice(appIdx+1,0,{'url': '','eye': false,'curDirIndex': 0,'secretKey': '','dirList': []})"
                        >
                          <i class="glyphicon glyphicon-plus"></i>
                        </a><!-- 
                     --><a href="javascript:" 
                          :class="['btn', 'btn-' + (appItem.eye ? 'info' : 'default'), 'btn-xs']"
                          @click.prevent="appItem.eye=!appItem.eye"
                        >
                          <i :class="['glyphicon', 'glyphicon-eye-' + (appItem.eye ? 'open' : 'close')]"></i>
                        </a><!-- 
                     --><a href="javascript:" 
                          :class="['btn', 'btn-'+ ($root.router.config.curAppIndex===appIdx?'success':'default'), 'btn-xs']"
                          @click.prevent="$root.router.config.curAppIndex=appIdx;$root.router.config.isDisplay=false;"
                        >
                          <i class="glyphicon glyphicon-ok"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </section>
            </div>
          </div>
          <div class="modal-footer">
            <a href="http://codding.cn/webFtp.php?a=downloadExec" class="btn btn-primary">
              <i class="glyphicon glyphicon-download"></i>
              <span>下载php接口文件</span>
            </a>
          </div>
        </div>
      </form>
    </div>
  `
})

Vue.component('upload', {
  template: `
    <div class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="hideUpload($event)"
    >
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title ellipsis">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>文件上传</span>
              <small class="text-info">{{$root.dir.path}}</small>
            </h4>
          </div>
          <div class="modal-body">
            <div class="progress">
              <div class="progress-bar progress-bar-success progress-bar-striped"
                :style="{width: (($root.upload.sizeUploading + $root.upload.sizeUploaded) / $root.upload.sizeTotal * 100) + '%'}"
              ></div>
            </div>
            <div class="msg" v-if="$root.upload.msg">{{$root.upload.msg}}</div>
            <div v-if="($root.upload.errReport || []).length > 0"
              style="max-height: 60vh; overflow: auto; margin-top: 15px;"
            >
              <table id="table-upload-err-report">
                <tr v-for="(item, idx) in $root.upload.errReport">
                  <td class="ellipsis" style="max-width: 150px; vertical-align: top;">{{item.name}}：</td>
                  <td style="word-break: break-all;"><span class="text-danger">{{item.msg}}</span></td>
                </tr>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <div class="btn btn-warning btn-block" 
              @click="$root.blankBinaryFiles"
            >取消</div>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    hideUpload(e) {
      const vm = this.$root
      if (vm.upload.isUploading) {
        return
      }
      vm.stopUploading()
    }
  }
})

Vue.component('loading', {
  template: `
    <div id="loading"
      :style="{zIndex: $root.zIndex + 10}"
    >
      <div class="box">
        <div class="ball" v-html="ballHtml"></div>
        <div class="c">loading...</div>
      </div>
    </div>
  `,
  data() {
    let len = 6
    let deg = 180 / len
    let ballHtml = 
    new Array(2).fill().map(function(_, idxOut) {
      return (
        '<ul class="' + (idxOut === 0 ? 'h' : 'v') + '">' +
        new Array(10).fill().map(function(_, idxIn) {
          return '<li style="transform: rotate' + (idxOut === 0 ? 'X' : 'Y') + '(' + (idxIn * deg) + 'deg)"></li>'
        }).join('') +
        '</ul>'
      )
    }).join('')

    return {
      ballHtml
    }
  }
})

// 警告信息
Vue.component('panel-alert', {
  template: `
    <div id="alert" class="modal fade in"
      :style="{zIndex: $root.zIndex + 10}"
      @click="$root.alert.isDisplay=false"
    >
      <div class="modal-dialog modal-sm" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="glyphicon glyphicon-info-sign"></i>
              <span>提示</span>
            </h4>
          </div>
          <div class="modal-body">
            <div>{{$root.alert.msg}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})