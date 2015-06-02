var connect = require('connect');
var serve   = require('serve-static');

connect().use( serve(__dirname + '/build' ) ).listen( 8080 );
