'use strict';

module.exports = function(grunt) {
	var dir = __dirname;

	grunt.registerTask('init', function(name) {
		var fileName = name || 'markdown';

		grunt.file.write(name+'.md', '## file\n');
		grunt.file.write(name+'.html', '<html></html>');

		grunt.task.run('render');

		return;
	});

	grunt.initConfig({
		markdown: {
			all: {
				files: [
					{
						expand: true,
						src: '*.md',
						dest: './',
						ext: '.html'
					}
				],
			},
		},
	});
	
	grunt.loadNpmTasks('grunt-markdown');
	grunt.registerTask('render', 'markdown');
};
