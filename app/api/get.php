<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('HTTP/1.0 404 Not Found');
    die();
}

header('Content-Type: application/json; charset=UTF-8');

$gifts = unserialize(file_get_contents('../../db/gifts.data'));
echo json_encode($gifts);