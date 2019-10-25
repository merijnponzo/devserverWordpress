<?php

$theme_includes = [
    'lib/assets.php',
];

foreach ($theme_includes as $file) {
    if (!$filepath = locate_template($file)) {
        trigger_error(sprintf(__('Error locating %s for inclusion', THEMENAME), $file), E_USER_ERROR);
    }
    require_once $filepath;
}
unset($file, $filepath);
