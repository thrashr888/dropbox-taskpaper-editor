/*globals $, prompt*/
'use strict';

angular.module('dropboxTaskpaperApp')
  .constant('dirName', 'Taskpaper')
  .constant('fileTTL', 10000) // 10 seconds
  .controller('MainCtrl', function ($scope, Dropbox, $rootScope, dirName, $location, Taskpaper, fileTTL, $interval) {

    // if (dropbox.isAuthenticated()) {
    //   // console.log(datastore);
    //   datastore.then(function (value) {
    //     console.log(value);
    //   });
    // }

    // allow inserting tabs into our editor's textarea
    $(document).delegate('textarea', 'keydown', function(e) {
      var keyCode = e.keyCode || e.which;
      // console.log(keyCode, e);

      if (
           e.which === 115 && (e.ctrlKey||e.metaKey) || e.which === 19
         ) {
        // ctrl-s for save
        e.preventDefault();
        $scope.saveFile($scope.currentFile, $scope.fileContent);
      }
      if (keyCode === 83 && e.ctrlKey) {
        // ctrl-s for save
        e.preventDefault();
        $scope.saveFile($scope.currentFile, $scope.fileContent);
      }

      if (keyCode === 9) {
        e.preventDefault();
        var start = $(this).get(0).selectionStart;
        var end = $(this).get(0).selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start) +
                    '\t' +
                    $(this).val().substring(end));

        // put caret at right position again
        $(this).get(0).selectionStart =
        $(this).get(0).selectionEnd = start + 1;
      }
    });

    $scope.loadingFiles = false;
    $scope.loadingContent = false;
    $scope.message = null;
    $scope.files = [];
    $scope.fileContent = null;
    $scope.origFileContent = null;
    $scope.fileConflict = false;

    $scope.readDir = function readDir(autoOpenFile) {
      $scope.loadingFiles = true;
      Dropbox.readdir(dirName).then(function (res) {
        if(!res) {
          $scope.message = 'No Taskpaper files found in /TaskPaper/*.';
        }
        // for(var i = 0, l = res.length; i<l; i++) {
        //   res[i].replace('/$\/' + dirName + '\//i', '');
        // }
        // console.log(res);
        $scope.files = res;
        $scope.loadingFiles = false;

        if(autoOpenFile && localStorage.currentFile) {
          $scope.openFile(localStorage.currentFile);
        }
      });
    };

    if($rootScope.isAuthenticated) {
      $scope.readDir(true);
    }

    $scope.logOut = function logOut() {
      delete localStorage['dropbox.oauth'];
      $rootScope.uid = null;
      $rootScope.isAuthenticated = false;
      $scope.files = [];
      $location.path('/').replace();
    };

    $scope.fileContentChanged = function fileContentChanged() {
      // console.log(value);
      // console.log($scope.fileContent);

      if(!$scope.fileContent) {
        $scope.message = 'No content';
        $scope.renderedContent = '';
        $scope.loadingContent = false;
      } else {
        // try {
        $scope.renderedContent = Taskpaper.convertTaskpaperToHtml($scope.fileContent);
        $scope.loadingContent = false;
        // } catch(e) {
        //   $scope.message = 'Error parsing the taskpaper document. ' + e;
        // }
      }
    };

    $scope.$watch('fileContent', function fileContentWatch() {
      $scope.fileContentChanged();
    });

    $interval(function () {
      if($scope.currentFile) {
        $scope.openFile($scope.currentFile, true);
      }
    }, fileTTL);

    $scope.openFile = function openFile(file, isRefresh) {
      // console.log(file);
      var isNewFile = false;
      var isFileChanged = false;
      var isOrigFileChanged = false;

      if (isRefresh) {
        $scope.refreshContent = true;
      } else {
        $scope.loadingContent = true;
      }

      Dropbox.readFile(file).then(function (res) {
        $scope.message = null;
        $scope.loadingContent = false;
        $scope.refreshContent = false;

        // update current file
        if ($scope.currentFile !== file) {
          isNewFile = true;
        }

        // update orig file content
        if ($scope.origFileContent !== res) {
          isOrigFileChanged = true;
        }

        // check for changes
        if ($scope.fileContent !== $scope.origFileContent) {
          isFileChanged = true;
        }

        console.log([isNewFile, isOrigFileChanged, isFileChanged]);

        // check for dirty file before loading a new file
        if (isNewFile && isFileChanged) {
          // will loose changes. save first?
          if(window.confirm('The current document has been changed. Save before loading?')) {
            $scope.saveFile($scope.currentFile, $scope.fileContent);
          }
          $scope.currentFile = file;
          localStorage.currentFile = file;
          $scope.origFileContent = res;
          $scope.fileContent = res;
          $scope.fileConflict = false;
          return;
        } else if (isNewFile) {
          // just a new file. change everything.
          $scope.currentFile = file;
          localStorage.currentFile = file;
          $scope.origFileContent = res;
          $scope.fileContent = res;
          $scope.fileConflict = false;
          return;
        }

        // nothing new
        if (!isNewFile && !isOrigFileChanged && !isFileChanged) {
          $scope.fileConflict = false;
          return;
        }

        // client has changed
        if (!isNewFile && !isOrigFileChanged && isFileChanged) {
          $scope.fileConflict = false;
          return;
        }

        // server version has changed. client has not. reload.
        if (!isNewFile && isOrigFileChanged && !isFileChanged) {
          $scope.origFileContent = res;
          $scope.fileContent = res;
          $scope.fileConflict = false;
          return;
        }

        // server version has changed. client has too. conflict!
        if (!isNewFile && isOrigFileChanged && isFileChanged) {
          if(window.confirm('The document has changed on the server. Reload?')) {
            $scope.origFileContent = res;
            $scope.fileContent = res;
            $scope.fileConflict = false;
          } else {
            // ignore for now?
            $scope.origFileContent = res;
            $scope.fileConflict = true;
            $scope.message = 'The version of this file has changed since you last opened it. You will need to refresh to make changes.';
          }
        }

      });
    };

    $scope.saveFile = function saveFile(file, fileContent) {
      if($scope.fileConflict) {
        $scope.message = 'The version of this file has changed since you last opened it. '+
          'You will need to refresh to make changes before saving.';
        return;
      }

      $scope.message = 'Saving ' + file + '...';
      Dropbox.writeFile(file, fileContent).then(function (res) {
        // console.log(res);
        // $scope.fileContent = res;
        $scope.message = null;
        if (!res) {
          $scope.message = 'Error saving file. Try refreshing the page.';
        }
      });
    };

    $scope.newFile = function newFile() {
      if($scope.fileConflict) {
        $scope.message = 'The version of this file has changed since you last opened it. '+
          'You will need to refresh to make changes before saving.';
        return;
      }

      var file = prompt('File name:');
      if (!file) {
        return;
      }
      file = '/' + dirName + '/' + file + '.taskpaper';

      $scope.message = 'Creating ' + file + '...';
      Dropbox.writeFile(file, '').then(function (res) {
        console.log(res);
        if (!res) {
          $scope.message = 'Error saving file. Try refreshing the page.';
        } else {
          $scope.currentFile = res.path;
          $scope.origFileContent = '';
          $scope.fileContent = '';
          $scope.fileConflict = false;
          $scope.message = null;
          $scope.readDir();
        }
      });
    };

  })
  .service('Taskpaper', function () {

    var exports = {};

    exports.gIndentLevel = 0;
    exports.kIndentTag = '<ul>\n';
    exports.kOutdentTag = '</ul>\n';
    exports.kNoteClass = 'tpnote';
    exports.kItemTagName = 'li';
    exports.kTaskClass = 'tptask';
    exports.kTagClassPrefix = 'tptag-';
    exports.kTagClass = 'tptag';
    exports.kProjectClass = 'tpproject';

    exports.convertTaskpaperToHtml = function convertTaskpaperToHtml(taskPaperText) {
      var outputHtml = '';

      var tppObject = this;
      $.each(taskPaperText.split('\n'), function() {
        var html = document.createElement('a').appendChild(document.createTextNode(this)).parentNode.innerHTML;
        var outputLine = html + '\n';
        outputLine = tppObject.tagLine(outputLine);
        outputLine = tppObject.indentLine(outputLine);
        outputHtml = outputHtml + outputLine;
      });

      // At the end of the file, close any open indentation tags.
      for (var j = 0; j < this.gIndentLevel; j++)
      {
        outputHtml = outputHtml +  this.kOutdentTag;
      }
      return '<ul class="tptop">' + outputHtml + '</ul>';
    };

    // Adds the necessary tags to indent the line as needed and returns the indented line.
    // Updates the global $gIndentLevel variable.
    exports.indentLine = function indentLine(line)
    {
      // Count the tabs.
      var tabCount = this.numberOfTabs(line);

      if (this.gIndentLevel !== tabCount)
      {
        var tag = this.kOutdentTag;
        if (this.gIndentLevel < tabCount)
        {
          tag = this.kIndentTag;
        }

        for (var i = 0; i < Math.abs(this.gIndentLevel - tabCount); ++i)
        {
          // Set up the right number of tabs. (Need the tabs to make the html source readable.)
          var tabsForThisLine = '';
          var numberOfOutputTabs = i;
          if(this.gIndentLevel < tabCount)
          {
            numberOfOutputTabs = this.gIndentLevel - i;
          }

          for (var j = 0; j < numberOfOutputTabs; ++j)
          {
            tabsForThisLine = tabsForThisLine + '\t';
          }

          // Add the tabs and indent tag.
          line = tabsForThisLine + tag + line;
        }

        this.gIndentLevel = tabCount;
      }

      return line;
    };

    // // Returns the line with the appropriate tags added.
    exports.tagLine = function tagLine(line) {

      var itemClass = this.kNoteClass;

      //  If it starts with "- ", it's a task.
      if (line.match(/^(\s*)\- /))
      {
        itemClass = this.kTaskClass;
        line = line.replace(/^(\s*)\- /, '$1');

        var tags = line.match(/@[^\s]+/g);

        /*jshint -W116*/
        if(tags != undefined) {
        /*jshint +W116*/
          for(var i = 0; i < tags.length; i++) {
            var originalTag = tags[i];
            line = line.replace(originalTag, '<span class=\"' + this.kTagClass + '\">' + originalTag + '</span>');
            originalTag = originalTag.replace('@','');

            // Remove parameterized stuff
            var currentTag = originalTag.replace(/([^\s\(\)]+)\s*\(.*\)/, '$1');
            itemClass = itemClass + ' ' + this.kTagClassPrefix + currentTag;

            // Add parameterized stuff
            if(originalTag.match(/(.+)\((.*)\)/)) {
              var parameterTag = originalTag.replace(/(.+)\((.*)\)/, '$1-$2');
              if(parameterTag.length > 0) {
                itemClass = itemClass + ' ' + this.kTagClassPrefix + parameterTag;
              }
            }
          }
        }

      }
      else
      {
        // If it ends with ":", it's a project.
        if (line.match(/:\s*$/))
        {
          itemClass = this.kProjectClass;
          line = line.replace(/:\s*$/, '\n'); // Get rid of the ":".
        }
      }

      var openTag = '<' + this.kItemTagName + ' class=\"' + itemClass + '\">';
      var closeTag = '</' + this.kItemTagName + '>';

      // Squeeze the opening and closing tags in after the whitespace at the beginning
      // of the line and at the end of the line, respectively.
      line = line.replace(/^(\s*)(.*)/, '$1' + openTag + '$2' + closeTag + '\n');
      return line;

    };

    // Returns the number of tabs at the start of the screen
    exports.numberOfTabs = function numberOfTabs(text) {
      var count = 0;
      var index = 0;
      while (text.charAt(index++) === '\t') {
        count++;
      }
      return count;
    };

    return exports;

  });
