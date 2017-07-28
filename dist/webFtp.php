<?php 
error_reporting(0);
header('Access-Control-Allow-Origin:*');
header('Content-Type: text/html; Charset=utf-8');

// 向前端相应
function res($data) {
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

// 报错
function err($code, $msg) {
  echo json_encode([
    'code'=>$code,
    'msg'=>$msg,
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 删除文件失败原因
function whyUnlinkFileError($_path) {
  if (!file_exists($_path)) {
    err(2, '当前目录不存在：'.$_path);
  } else if (!is_readable($_path)) {
    err(2, '当前目录不可读：'.$_path);
  } else if (!is_writeable($_path)) {
    err(2, '当前目录不可写：'.$_path);
  } else {
    err(2, '未知的文件操作错误类型');
  }
}

// 递归删除目录
function rm($_path) {
  if (is_dir($_path)) {
    $handler = opendir($_path);
    while ($filename = readdir($handler)) {
      if ($filename === '.' || $filename === '..') {
        continue;
      }
      rm($_path.'/'.$filename);
    }
    closedir($handler);
    rmdir($_path);
  } else {
    unlink($_path) or die(whyUnlinkFileError($_path));
  }
}

// 一次性创建多级目录
function mkpath($path) {
  $path = preg_replace('/((\\\)|(\/))+/', '/', $path.'/');
  $path = preg_replace('/\/$/', '', $path);
  $pathArr = split('/', $path);
  $path = '';
  while (count($pathArr)) {
    $item = array_shift($pathArr);
    $path .= $item.'/';
    if (!is_dir($path)) {
      mkdir($path) or die(err(2, '目录创建失败：'.iconv('GBK', 'UTF-8', $path)));
    }
  }
  return [
    'UTF-8' => iconv('GBK', 'UTF-8', $path),
    'GBK' => $path,
  ];
}

// 递归拷贝目录
function loopCopy($dirFrom, $dirTo) {
  if (is_dir($dirFrom)) {
    $handler = opendir($dirFrom);
    @mkdir($dirTo);
    while ($filename = readdir($handler)) {
      if ($filename === '.' || $filename === '..') {
        continue;
      }
      $from = $dirFrom.'/'.$filename;
      $to = $dirTo.'/'.$filename;
      if (is_dir($from)) {
        loopCopy($from, $to);
      } else {
        copy($from, $to);
      }
    }
    closedir($handler);
  } else {
    copy($dirFrom, $dirTo);
  }
}

// 创建zip压缩包
function createZip($pathArr, $zipPath) {
  if (file_exists($zipPath)) {
    unlink($zipPath);
  }
  $z = new ZipArchive();
  $z -> open($zipPath, ZIPARCHIVE::CREATE);
  function folderToZip($folder, $zipFile, $exclusiveLength) {
    $handler = opendir($folder);
    while (false !== $f = readdir($handler)) {
      if ($f == '.' || $f == '..') {
        continue;
      }
      $filePath = $folder.'/'.$f;
      $localPath = substr($filePath, $exclusiveLength);
      if (is_file($filePath)) {
        $zipFile -> addFile($filePath, $localPath);
      }
      elseif(is_dir($filePath)) {
        $zipFile -> addEmptyDir($localPath);
        folderToZip($filePath, $zipFile, $exclusiveLength);
      }
    }
    closedir($handler);
  }
  foreach ($pathArr as $key => $sourcePath) {
    $parentPath = dirname($sourcePath);
    $dirName = basename($sourcePath);
    if (is_dir($sourcePath)) {
      $z -> addEmptyDir($dirName);
      folderToZip($sourcePath, $z, strlen($parentPath.'/'));
    } else {
      $z -> addFile($sourcePath, substr($sourcePath, strrpos($sourcePath, '/') + 1));
    }
  }
}

// 单文件下载
function fileDownload($pathDir, $filename) {
  function anotherWay() {
    echo file_get_contents($_filename) or die(err(2, '文件读取失败'));
    exit;
  }
  $filepath = $pathDir.'/'.$filename;
  $_filepath = iconv('UTF-8', 'GBK', $filepath);
  $file = fopen($_filepath, "r") or die(anotherWay());
  $filesize = filesize($_filepath);
  $buff = 1024 * 1024;

  header('Content-type: application/octet-stream');
  header('Accept-Ranges: bytes');
  header('Accept-Length: '.filesize($filesize));
  header('Content-Disposition: attachment; filename='.$filename);

  while ($filesize >= 0) {
    echo fread($file, $buff);
    $filesize -= $buff;
  }
  fclose($file);
}

// 获得IP地址
function getIp() {
  return $_SERVER['REMOTE_ADDR'] === '::1' ? '127.0.0.1' : $_SERVER['REMOTE_ADDR'];
}

$secretFilename = './token/token-'.getIp().'.secret';
if (!is_dir('./token')) {
  mkdir('token') or die(err(2, '接口文件权限不足，不能创建文件夹'));
}


switch ($_REQUEST['a']) {
  case 'getToken':
    $token = hash('sha256', uniqid());
    file_put_contents($secretFilename, $token) or die(err(2, $secretFilename. 'token写入文件失败'));
    res([
      'token' => $token
    ]);
    break;
  case 'downloadExec':
    fileDownload('', 'webFtp.php');
    exit;
}


$secretKey = '';
$secretVal = $_REQUEST['secretVal'];
$pathDir = $_REQUEST['pathDir'];
$_pathDir = iconv('UTF-8', 'GBK', $pathDir);
$token = file_get_contents($secretFilename);
$filenames = json_decode($_REQUEST['filenames'], true);
$pathFrom = $_REQUEST['pathFrom'];
$pathTo = $_REQUEST['pathTo'];

if (!$token) {
  err(2, 'undefined '.$secretFilename);
}

if (hash('sha256', $secretKey.$token) !== $secretVal) {
  err(2, '秘钥错误');
}

switch ($_REQUEST['a']) {
  case '接口探测':
    $_SERVER['uploadMaxSize'] = ini_get('upload_max_filesize');
    res($_SERVER);
    break;
  case '新建文件夹':
    mkpath(iconv('UTF-8', 'GBK', $_REQUEST['fullPath']));
    err(0, '创建成功');
    break;
  case '文件上传':
    $_targetPath = iconv('UTF-8', 'GBK', $pathDir.'/'.$_REQUEST['name']);
    mkpath(dirname($_targetPath));
    move_uploaded_file(
      $_FILES['file']['tmp_name'],
      $_targetPath
    ) or die(err(2, $_REQUEST['name'].' 文件上传失败，请检查相关权限'));
    err(0, '文件上传成功');
    break;
  case '删除文件':
    foreach ($filenames as $key => $value) {
      rm(iconv('UTF-8', 'GBK', $pathDir.'/'.$value));
    }
    err(0, '文件删除成功');
    break;
  case '获取文件列表':
    if (!file_exists($_pathDir)) {
      err(2, '当前路径不存在 '.$pathDir);
    }
    if (!is_dir($_pathDir)) {
      err(2, '当前路径不是文件夹 '.$pathDir);
    }
    if (!is_readable($_pathDir)) {
      err(2, '当前路径不可读  '.$pathDir);
    }
    $handler = opendir($_pathDir);
    $result = [];
    while ($_filename = readdir($handler)) {
      if ($_filename === '.' || $_filename === '..') {
        continue;
      }
      $filename = iconv('GBK', 'UTF-8', $_filename);
      $_fullPath = $_pathDir.'/'.$_filename;
      $fullPath = iconv('GBK', 'UTF-8', $_fullPath);
      $result[] = [
        'isDir' => is_dir($_fullPath),
        'mtime' => filemtime($_fullPath),
        'name' => $filename
      ];
    }
    res($result);
    break;
  case '复制':
    $from = json_decode($_REQUEST['from'], true);
    $to = json_decode($_REQUEST['to'], true);
    foreach ($from as $key => $value) {
      $_targetPathFrom = iconv('UTF-8', 'GBK', $_REQUEST['pathFrom'].'/'.$value);
      $_targetPathTo = iconv('UTF-8', 'GBK', $_REQUEST['pathTo'].'/'.$to[$key]);
      if (file_exists($_targetPathTo)) {
        rm($_targetPathTo);
      }
      if (is_dir($_targetPathFrom)) {
        loopCopy($_targetPathFrom, $_targetPathTo);
      } else {
        copy($_targetPathFrom, $_targetPathTo);
      }
    }
    err(0, '文件复制完毕');
    break;
  case '重命名':
    $from = json_decode($_REQUEST['from'], true);
    $to = json_decode($_REQUEST['to'], true);
    foreach ($from as $key => $value) {
      $targetPathFrom = $_REQUEST['pathFrom'].'/'.$value;
      $targetPathTo = $_REQUEST['pathTo'].'/'.$to[$key];
      if (file_exists($targetPathTo)) {
        rm($targetPathTo);
      }
      rename(
        iconv('UTF-8', 'GBK', $targetPathFrom),
        iconv('UTF-8', 'GBK', $targetPathTo)
      );
    }
    err(0, '文件重命名完毕');
    break;
  case '下载':
    // print_r($_REQUEST);
    // exit;
    fileDownload($pathDir, $filenames[0]);
    break;
  case '打包下载':
    $pathArr = [];
    foreach ($filenames as $key => $name) {
      $pathArr[] = iconv('UTF-8', 'GBK', $pathDir.'/'.$name);
    }
    $zipName = getIp().'.zip';
    createZip($pathArr, $zipName);
    fileDownload('.', $zipName);
    unlink($zipName) or die(whyUnlinkFileError($zipName));
    break;
  case '读取文件':
    echo file_get_contents(iconv('UTF-8', 'GBK', $_REQUEST['fullPath']));
    break;
}
