[TOC]

# Web-Ftp 简约的远程文件管理工具

- 一款功能强悍的磁盘管理工具，支持局域网文件共享，支持跨域远程操作

- 有着与windows相似的文件快捷操作，轻松上手

- 采用cdn，加快页面响应速度

- 项目压缩合并后，变身只有40多K的html文件，双击即可运行

- 采用es6编写，使用最新html5 API 无缝配合现代浏览器

- 单页面应用，不允许多浏览器同时使用

- 目前仅支持php，后续将支持种后台编程语言


# 快捷操作 (Shortcut operation) 1

- alt + o 打开文件夹 (open dir)
- alt + n 新建文件夹 (new dir)
- alt + m 配置web-ftp (web-ftp panel config)
- alt + w / alt + x 关闭文件夹 (close dir)
- alt + d 选中当前路径 (Select current path)
- ctrl (command) + a 全选 (select all)
- ctrl (command) + c 复制 (copy)
- ctrl (command) + x 剪切 (cut)
- ctrl (command) + v 粘贴，也可粘贴截图 (Paste, or paste screenshots)
- ctrl (command) + z / backspace  历史后退 (history back)
- ctrl (command) + y  历史前进 (history forward)
- ctrl (command) + alt + f 自动排版 (auto layout)
- enter 打开 (open)
- delete 删除 (delete file)
- f2 重命名 (file rename)


# 快捷操作 (Shortcut operation) 2

- 按住alt键，拖拽标题栏 = 复制文件夹面板
Hold down the ALT key, drag the title bar = copy folder panel

- 按住shift键，点选 = 连续选择多个
Hold down the shift key, Click = continue to select multiple

- 按住shift键，框选 = 加/减选择多个
Hold down the shift key, box = add / subtract, select multiple

- 按住ctrl (command)键，点选 = 反选择一个
Hold down the ctrl (command) key, Click = select one

- 按住ctrl (command)键，框选 = 反选择多个
Hold down the ctrl (command) key, box select = counter select multiple


# 如何使用

1. 打开 dist 目录，下载 ftp.html 双击即可使用，使用服务器环境打开，支持拖拽 **文件/文件夹** 上传

2. webFtp.php 为接口文件，放入本地或远程根目录

3. 打开ftp.html，配置面板输入如：http://localhost/webFtp.php，秘钥默认为空，可在webFtp.php里面进行设置

4. 点击打开按钮，输入目录路径即可正常使用


<!-- # 操作演示 -->

## 下载php接口文件，放到服务器根目录下 (Download the PHP interface file and put it under the server root directory)


# 接口文档 Interface document

**如果你也喜欢这个项目，可按照接口文档，编写自己的后台接口文件**


## 获取接口文件 Get an interface file

http://codding.cn/webFtp.php?a=downloadExec


## 获取token  Get token

**request**
```json
{
  "a": "getToken"
}

```

**response**
```json
{
  "token": "86d0d9d65f135bd2eb830085bea2e14b62ba53fbd101ee27d8a3f08f6a308936"
}
```


## 接口探测，获取最大上传大小  Interface probe to get the maximum upload size

**request**
```json
{
  "a": "接口探测"
}

```

**response**
```json
{
  "uploadMaxSize": "10M"
}
```


## 获取文件列表 Get file list

**request**
```json
{
  "a": "获取文件列表",
  "pathDir": "./blog",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f"
}
```

**response**
```json
[{
  "isDir": true,
  "mtime": 1497523600,
  "name": "upload"
}, {
  "isDir": false,
  "mtime": 1501334257,
  "name": "ftp.html"
}, {
  "isDir": true,
  "mtime": 1501334040,
  "name": "token"
}]
```


## 删除文件 Delete file

**request**
```json
{
  "a": "删除文件",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
  "pathDir": ".",
  "filenames": "["a.jpg"]"
}
```

**response**
```json
{
  "code": 0,
  "msg": "文件删除成功"
}
```


## 新建文件夹  New folder

**request**
```json
{
  "a": "新建文件夹",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
  "fullPath": "./abc"
}
```

**response**
```json
{
  "code": 0,
  "msg": "创建成功"
}
```


## 复制文件 Copy file

**request**
```json
{
  "a": "复制",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
  "pathFrom": ".",
  "pathTo": "./abc",
  "from": "[\"webFtp.php\"]",
  "to": "[\"webFtp.php\"]"
}
```

**response**
```json
{
  "code": 0,
  "msg": "文件复制完毕"
}
```


## 剪切文件 Cut file

**request**
```json
{
  "a": "重命名",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
  "pathFrom": "./abc",
  "pathTo": ".",
  "from": "[\"webFtp.php\"]",
  "to": "[\"webFtp.php\"]"
}
```

**response**
```json
{
  "code": 0,
  "msg": "文件复制完毕"
}
```


## 文件上传 File upload

**request**
```json
{
  "a": "文件上传",
  "pathDir": "./abc",
  "name": "/test.php",
  "file": "二进制文件",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
}
```

**response**
```json
{
  "code": 0,
  "msg": "文件上传成功"
}
```


## 下载 download

**request**

http://codding.cn/webFtp.php?a=%E4%B8%8B%E8%BD%BD&secretVal=92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f&pathDir=.%2Fbiaoqing&filenames=%5B%22test%22%5D

**response**

服务端读取输出二进制文件



## 打包下载 Package download

**request**
```json
{
  "a": "打包下载",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f",
  "pathDir": "./blog",
  "filenames": "[\"vue.js\",\"webFtp.php\"]"
}
```

**response**

下载zip压缩包，其他格式也可



## 读取文件 read file

**request**
```json
{
  "a": "读取文件",
  "secretVal": "92492c6990320cea815bd43489c799e046e13ee061cf0bfcb65c214fdaa7401f&",
  "fullPath": "./blog/logo.png"
}
```

**response**

服务端读取输出二进制文件