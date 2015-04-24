module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			js: {
				src: [
					'./public/js/*.js',
				],
				dest: './public/game.js',
			},
			stylesheets: {
				src: [
					'./public/css/*.css',
					'./bower_components/bootstrap/dist/css/bootstrap.min.css'
				],
				dest: './public/css/game.css',
			}
		},
		jshint: {
			files: ['Gruntfile.js', './app.js', './game.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch: {
			files: [
				'./public/js/*.js',
				'./public/css/*.css',
				'./bower_components/bootstrap/dist/css/bootstrap.min.css'
			],
			tasks: ['jshint', 'concat:js', 'concat:stylesheets']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['jshint', 'concat']);


};

