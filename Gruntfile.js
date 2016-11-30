//
// JavaScript
//

const javaScriptInputDirectory = "build/ts/**";
const javaScriptInput = "build/ts/index.js";
const javaScriptOutput = "build/index.js";

const uglifyFiles = {
  [javaScriptOutput]: javaScriptOutput
};

//
// Sass
//

const sassInputDirectory = "src/sass/**";
const sassInput = "src/sass/index.scss";
const sassOutput = "build/index.css";

const sassFiles = {
  [sassOutput]: sassInput
};

const transform = [
  ["babelify",
    {
      "presets": ["es2015"]
    }
  ]
];

//
// Grunt
//

module.exports = function (grunt) {

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    browserify: {
      once: {
        src: javaScriptInput,
        dest: javaScriptOutput,
        options: {
          transform: transform
        }
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      once: {
        files: uglifyFiles
      }
    },

    sass: {
      once: {
        options: {
          sourceMap: true
        },
        files: sassFiles
      }
    },

    watch: {
      javascript: {
        files: [javaScriptInputDirectory],
        tasks: ["browserify:once"]
      },
      sass: {
        files: [sassInputDirectory],
        tasks: ["sass:once"]
      }
    }

  });

  grunt.registerTask("default", [
    "browserify:once",
    "uglify:once",
    "sass:once"
  ]);

};