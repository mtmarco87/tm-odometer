Path = require('path')
fs = require('fs')

module.exports = (grunt) ->
  # Load package.json
  pkg = grunt.file.readJSON("package.json")
  
  # Define the output directory name using package name
  pkgName = pkg.name.replace(/-lib$/, '')
    
  grunt.initConfig
    pkg: pkg

    # Legacy Module Generation
    coffee:
      compile:
        files:
          "dist/#{pkgName}/legacy/#{pkgName}.js": 'src/lib/core/tm-odometer.coffee'

    # Compile Sass to CSS
    compass:
      dist:
        options:
          sassDir: 'src/themes'
          cssDir: "dist/#{pkgName}/themes"
          environment: 'production'
          outputStyle: 'expanded'
          line_comments: false

    # Watch for changes in source files
    watch:
      coffee:
        files: ['src/lib/core/tm-odometer.coffee', 'src/themes/*']
        tasks: ["coffee", "terser:coffee", "compass"]

    # Minify JavaScript files
    terser:
      options:
        compress: true
        mangle: true
        output:
          beautify: false
          preamble: "/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.license %> License */\n"

      # Minify for Legacy Module
      coffee:
        files:
          "dist/#{pkgName}/legacy/#{pkgName}.min.js": ["dist/#{pkgName}/legacy/#{pkgName}.js"]

  # Load Grunt plugins
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'
  grunt.loadNpmTasks 'grunt-terser'

  # Default task: build Legacy Module and compile Sass Themes
  grunt.registerTask 'default', ['coffee', 'terser:coffee', 'compass']
