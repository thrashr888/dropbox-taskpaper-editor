Dropbox Taskpaper Editor
========================

"It's certainly an impressive piece of work." — [Macdrifter](http://macdrifter.com/2014/02/the-taskpaper-rd-notebook.html)

This app allows you to edit your Taskpaper documents stored in Dropbox directly from the browser. It requires "Full Dropbox" permissions in order to edit the Taskpaper files.

This is a client-side app using AngularJS and Dropbox APIs. It does not require a server to run. You should be able to deploy directly to Dropbox, S3, Google Drive or other static file hosts. If so, you'll need to setup your own Dropbox App [https://www.dropbox.com/developers/apps] and add the ngDropbox callback url to the whitelist. For example: `http://localhost:9000/bower_components/ngDropbox/callback.html`. Then add your appKey in `app/scripts/app.js`. Outside of localhost, the Dropbox authentication only works with https.

Demo site deployed on S3 and CloudFront: [Dropbox Taskpaper Editor](https://dgiu4ye9xtr28.cloudfront.net/)

Install & Run
-------------

    > npm install -g grunt-cli bower
    > npm install
    > bower install
    > grunt serve

Thanks
------

This app uses:

- ngDropbox
- JSTaskPaper
- AngularJS
- Yeoman
- Grunt
- Bootstrap
- jQuery

License
-------

Copyright (C) 2013-2014 Paul Thrasher

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
