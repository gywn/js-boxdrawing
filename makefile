ALL: index.html menlo.min.js main.css
	
main.css: main.scss
	sass --scss --style compact $< $@

draw.data.js: box_data.rb glyphs.rb
	ruby $< > $@

menlo.min.js: caret.js keys.js ui.js history.js draw.js draw.data.js shadow.js drag.js init.js
	cat $^ | java -jar yuicompressor-2.4.8.jar --type js > $@