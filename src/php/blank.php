<?php 
error_reporting(0);

if (!file_exists('count')) {
  $count = 0;
} else {
  $count =file_get_contents('count');
}

$count++;
file_put_contents('count', $count);