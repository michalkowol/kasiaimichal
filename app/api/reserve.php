<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.0 404 Not Found');
    die();
}

header('Content-Type: application/json; charset=UTF-8');

function isJson($string) {
    return is_string($string) && json_decode($string) && (json_last_error() == JSON_ERROR_NONE) ? true : false;
}

function getJsonFromBody() {
    $body = file_get_contents('php://input');
    if (!isJson($body)) {
        header('HTTP/1.0 400 Bad Request');
        die();
    }
    return json_decode($body, true);
}

$reservation = getJsonFromBody();
$gifts = unserialize(file_get_contents('../../db/gifts.data'));
$newGifts = array_map(function($gift) {
    global $reservation;
    if ($reservation['name'] == $gift['name']) {
        $gift['reserved'] = $reservation['reserved'];
    }
    return $gift;
}, $gifts);
file_put_contents('../../db/gifts.data', serialize($newGifts));
echo json_encode($newGifts);