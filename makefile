ALL: index.html menlo.min.js main.css
	
main.css: src/main.scss
	sass --scss --style compact $< $@

src/draw.data.js: src/box_data.rb src/glyphs.rb
	ruby $< > $@

.menlo.min.js: $(addprefix src/, caret.js keys.js ui.js history.js \
		draw.js draw.data.js shadow.js drag.js init.js)
	cat $^ | java -jar tools/yuicompressor-2.4.8.jar --type js > $@

menlo.min.js: src/license.js .menlo.min.js
	cat $^ > $@