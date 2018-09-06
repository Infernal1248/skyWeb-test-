<?php
function randomDate($min, $max)
{
    $val = rand($min, $max);
    return date('Y-m-d', $val);
}
$first_minute = mktime(0, 0, 0, date("n"), 1);
$last_minute = mktime(23, 59, 59, date("n"), date("t"));
$booked = array();
for ($i = 0; $i < rand(1, 20); ++$i) {
    $booked[] = randomDate($first_minute, $last_minute);
}
echo json_encode($booked);
die();
?>
