var argv = require('argv');

argv.option([
	{
		name: 'db',
		type: 'string',
		description: 'JSON data. Required.'
	},
	{
		name: 'host',
		type: 'string',
		description: 'Host name. Default is "localhost". You can use "0.0.0.0" to accept requests from outside network.'
	},
	{
		name: 'port',
		type: 'number',
		description: 'Port. Default is 8000.'
	}
]);

var config = argv.run().options;
if (!config.db) {
	argv.run(['-h']);
	return;
}
config.protocol = config.protocol || 'http';
config.host = config.host || 'localhost';
config.port = config.port || 8000;

var settings = argv.run();
console.log(settings);

var express = require('express');
var app = express();

app.use(require('body-parser')());

var db = {
	storage: require(config.db),
	idCounts: {},

	/**
	 * @param {String} name
	 * @returns {Object}
	 */
	getTable: function(name) {
		var table = this.storage[name];
		return table;
	},

	/**
	 * @param {String} name
	 * @param {Object} data
	 * @returns {Object}
	 */
	create: function(name, data) {
		var record = null;
		var table = this.getTable(name);
		if (table) {
			var last = table[table.length-1];
			var id = (last ? last.id+1 : 1);
			data.id = id;
			table.push(data);
			record = data;
		}
		return record;
	},

	/**
	 * @param {String} name
	 * @param {String} id
	 * @returns {Object}
	 */
	read: function(name, id) {
		var record = null;
		var table = this.getTable(name);
		for (var i=0, l=table.length; table && i<l; i++) {
			if (table[i].id == id) {
				record = table[i];
				break;
			}
		}
		return record;
	},

	/**
	 * @param {String} name
	 * @param {String} id
	 * @param {Object} data
	 * @returns {Object}
	 */
	update: function(name, id, data) {
		var record = this.read(name, id);
		if (record) {
			for (var key in data) {
				record[key] = data[key];
			}
		}
		return record;
	},

	/**
	 * @param {String} name
	 * @param {String} id
	 * @returns {Object}
	 */
	delete: function(name, id) {
		var record = this.read(name, id);
		if (record) {
			var table = this.getTable(name);
			var afters, index, l;
			for (index=0, l=table.length; index<l; i++) {
				if (table[index] === record) {
					afters = table.splice(index);
					break;
				}
			}
			afters.shift();
			afters.forEach(function(record, index) {
				table.push(record);
			});
		}
		return record;
	}
};

app.get('/:name', function(req, res) {
	var params = req.params;
	var table = db.getTable(params.name);

	if (table) {
		res.send(table);
	}
	else {
		res.status(404).send('');
	}
});
app.get('/:name/:id', function(req, res) {
	var params = req.params;
	var record = db.read(params.name, params.id);

	if (record) {
		res.send(record);
	}
	else {
		res.status(404).send('');
	}
});
app.post('/:name', function(req, res) {
	var params = req.params;
	var data = req.body;
	var record = db.create(params.name, data);

	if (record) {
		res.send(record);
	}
	else {
		res.status(404).send('');
	}
});
app.patch('/:name/:id', function(req, res) {
	var params = req.params;
	var data = req.body;
	var record = db.update(params.name, params.id, data);

	if (record) {
		res.send(record);
	}
	else {
		res.status(404).send('');
	}
});
app.delete('/:name/:id', function(req, res) {
	var params = req.params;
	var record = db.delete(params.name, params.id);

	if (record) {
		res.status(204);  // No Content
	}
	else {
		res.status(404).send('');
	}
});

config.host = '0.0.0.0';//FIXME
config.port = 3000;//FIXME

app.listen(config.port, config.host);
var origin = config.protocol + '://' + config.host + ':' + config.port;
console.log('Started at ' + origin + '.');
console.log('Waiting...');
