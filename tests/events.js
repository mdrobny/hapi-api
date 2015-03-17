'use strict';
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var server = require('../src/index.js');

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var apiUrl = '/api/v1/events';

describe('Get event by id', function() {
    var options;
    lab.beforeEach(function(done) {
        options = {
            method: 'GET',
            url: apiUrl + '/'
        };
        done();
    });

    it('returns not found error when not existing id passed', function(done) {
        options.url += '123';
        server.inject(options, function(res) {
            expect(res.statusCode).to.equal(404);
            expect(res.result.message).to.equal('Event with id: 123 not found');

            done();
        });
    });

    it('returns event data', function(done) {
        options.url += '1';
        server.inject(options, function(res) {
            var result = res.result;
            expect(res.statusCode).to.equal(200);
            expect(result).to.be.an.object();
            expect(result).to.contain(['id', 'name', 'place']);
            expect(result.id).to.equal(1);
            done();
        });
    });
});
