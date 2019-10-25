<?php

function loadAssets($enqueue, $distfolder)
{
    // Look for the manifest file.
    $themedir = get_template_directory();
    $themeurl = get_template_directory_uri();
    $manifest = "$themedir/$distfolder/manifest.json";

    if (file_exists($manifest)) {
        $manifest = file_get_contents($manifest);
        $assets = json_decode($manifest, true);
        foreach ((array) $enqueue as $asset) {
            $name = $asset['name'];
            $ext = $asset['ext'];
            //concat key
            $key = "$name.$ext";
            //browse manifest for key files
            if (array_key_exists($key, $assets)) {
                $file = "$themeurl/$distfolder/$assets[$key]";
                //load scripts and styles
                if ($ext === 'css') {
                    wp_enqueue_style($name, $file);
                } else {
                    wp_enqueue_script($name, $file);
                }
            }
        }
    }
}

// load assets
function getAssets()
{
    $enqueue = array(
        ['name' => 'main', 'ext' => 'css'],
        ['name' => 'vendor', 'ext' => 'js'],
        ['name' => 'bundle', 'ext' => 'js'],
    );
    loadAssets($enqueue, 'dist');
}

add_action('wp_enqueue_scripts', 'getAssets');

// load gutenberg assets
function getGutenbergAssets()
{
    if (is_admin()) {
        $enqueue = array(
            ['name' => 'gutenberg', 'ext' => 'css'],
            ['name' => 'bundle', 'ext' => 'js'],
        );
        loadAssets($enqueue, 'dist');
    }
}
add_action('admin_head', 'getGutenbergAssets');

//loads directly from devServer
function dev_css()
{
    echo '<link href="http://localhost:9000/main.css" rel="stylesheet">';
    echo '<script type="text/javascript" src="http://localhost:9000/scripts/main.js"></script>';
    echo '<script type="text/javascript" src="http://localhost:9000/scripts/bundle.js"></script>';
    echo '<script type="text/javascript" src="http://localhost:9000/scripts/vendor.js"></script>';
    echo '<script type="text/javascript" src="http://localhost:9000/scripts/devserver.js"></script>';
}

function develop_assets()
{
    $connection = @fsockopen('localhost', '9000');

    if ($connection) {
        return true;
    }

    return false;
}
if (develop_assets()) {
    add_action('wp_head', 'dev_css');
}
