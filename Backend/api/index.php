<?php
// Force Laravel to detect the request base path correctly under Vercel Serverless
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

// Forward Vercel Serverless request to Laravel public/index.php
require __DIR__ . '/../public/index.php';
