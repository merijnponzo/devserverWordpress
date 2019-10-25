# devserverWordpress

Theme development with SCSS, font and file loaders
Hot reload for both javascript and scss files

No browsersync but chokidar for watching php and twig files
And a simple script devserver.js to rewrite all links within your document


> cd wp-content/themes/ponzotheme

> npm install

Use the test/index.html for testing your theme without wordpress 
> npm run test

Create a typeface from your svg icons
> npm run icons

Start your wordpress theme development
> npm run start

Build a dist folder in /app
> npm run build

In app/lib/assets.php
It's injecting the modules from localhost:9000



Upload your app folder in your production theme and you are ready to go
