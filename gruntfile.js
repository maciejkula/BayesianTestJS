module.exports = function(grunt) {

    // Load tasks.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({

        browserify: {
            build : {
                files : {
                    'build/scripts/bayes.js' : ['src/scripts/bayes.js'],
                },
            }
        },

        uglify : {
            build : {
                files : {
                    'build/scripts/bayes.min.js' : ['build/scripts/bayes.js']
                }
            }
        },

        cssmin : {
            build: {
                files : {
                    'build/style.css' : ['src/style.css']
                }
            }
        },

        copy : {
            build: {
                files : {
                    'build/index.html' : ['src/index.html']
                }
            }
        },

        watch : {
            css : {
                files : ['src/style.css'],
                tasks : ['cssmin:build']
            },
            js : {
                files : ['src/bayes.js'],
                tasks : [
                    'browserify:build',
                    'uglify:build'
                ]
            },
            html : {
                files : ['src/index.html'],
                tasks : ['copy:build']
            }
        }
    });

    grunt.registerTask('build', [
        'browserify:build',
        'uglify:build',
        'cssmin:build',
        'copy:build'
    ]);


}
