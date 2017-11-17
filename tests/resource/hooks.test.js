'use strict';

var Promise = require('bluebird'),
    request = require('request'),
    expect = require('chai').expect,
    _ = require('lodash'),
    rest = require('../../lib'),
    inflection = require('inflection'),
    test = require('../support');

test.hooks = {};
['create', 'update', 'destroy'].forEach(function(verb) {
  test.hooks[verb] = {};
  if (verb !== 'destroy') {
    test.hooks[verb].beforeValidate = false;
    test.hooks[verb].afterValidate = false;
  }

  test.hooks[verb]['before' + inflection.capitalize(verb)] = false;
  test.hooks[verb]['after' + inflection.capitalize(verb)] = false;
});

test.tests = {
  create: function(options) {
    options.enableTest();

    request.post({
      url: test.baseUrl + '/users',
      json: { username: 'arthur', email: 'arthur@gmail.com' }
    }, function(error, response, body) {
      var record = _.isObject(body) ? body : JSON.parse(body);
      expect(record.errors).to.be.ok;
      expect(record.errors[0]).to.equal(options.expectedError);
      options.afterTest();
    });
  },

  update: function(options) {
    options.enableTest();

    request.post({
      url: test.baseUrl + '/users',
      json: { username: 'jamez', email: 'jamez@gmail.com' }
    }, function(error, response, body) {
      expect(error).is.null;
      expect(response.headers.location).is.not.empty;

      var path = response.headers.location;

      request.put({
        url: test.baseUrl + path,
        json: { email: 'emma@fmail.co.uk' }
      }, function(err, response, body) {
        expect(response.statusCode).to.equal(500);
        var record = _.isObject(body) ? body : JSON.parse(body);
        expect(record.errors).to.be.ok;
        expect(record.errors[0]).to.equal(options.expectedError);
        options.afterTest();
      });
    });
  },

  destroy: function(options) {
    options.enableTest();

    request.post({
      url: test.baseUrl + '/users',
      json: { username: 'chicken', email: 'chicken@gmail.com' }
    }, function(error, response, body) {
      expect(error).is.null;
      expect(response.headers.location).is.not.empty;
      var path = response.headers.location;

      request.del({
        url: test.baseUrl + path
      }, function(err, response, body) {
        expect(response.statusCode).to.equal(500);
        var record = _.isObject(body) ? body : JSON.parse(body);
        expect(record.errors).to.be.ok;
        expect(record.errors[0]).to.equal(options.expectedError);
        options.afterTest();
      });
    });
  }
};

describe('Resource(hooks)', function() {
  before(function() {
    test.models.User = test.db.define('users', {
      id: { type: test.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: {
        type: test.Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: test.Sequelize.STRING,
        unique: { msg: 'must be unique' },
        validate: { isEmail: true }
      }
    });

    Object.keys(test.hooks).forEach(function(verb) {
      Object.keys(test.hooks[verb]).forEach(function(hook) {
        test.models.User.hook(hook, function(verb, hook, instance, options, callback) {
          if (test.hooks[verb][hook]) {
            throw new Error(verb + "#" + hook);
          }
          if (callback !== undefined) {
            callback();
          }
        }.call(null, verb, hook));
      });
    });

  });

  beforeEach(function() {
    return Promise.all([ test.initializeDatabase(), test.initializeServer() ])
      .then(function() {
        rest.initialize({ app: test.app, sequelize: test.Sequelize });
        rest.resource({
          model: test.models.User,
          endpoints: ['/users', '/users/:id']
        });
      });
  });

  afterEach(function() {
    return test.clearDatabase()
      .then(function() { return test.closeServer(); });
  });

  // TESTS
  Object.keys(test.hooks).forEach(function(verb) {
    describe(verb, function() {
      Object.keys(test.hooks[verb]).forEach(function(hook) {
        it(hook, function(done) {
          var expectedError = verb + '#' + hook;
          test.tests[verb]({
            expectedError: expectedError,
            enableTest: function(verb, hook) {
              test.hooks[verb][hook] = true;
            }.call(null, verb, hook),
            afterTest: function(verb, hook) {
              test.hooks[verb][hook] = false;
              done();
            }.call(null, verb, hook)
          });
        });
      });
    });
  });

});
