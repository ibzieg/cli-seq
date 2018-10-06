'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _reactBlessed = require('react-blessed');

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _instance = null;

var Screen = function () {
    _createClass(Screen, null, [{
        key: 'create',
        value: function create(options) {
            if (_instance instanceof Screen) {
                throw new Error('Screen instance has already been created');
            } else {
                _instance = new Screen(options);
            }
        }
    }, {
        key: 'Instance',
        get: function get() {
            return _instance;
        }
    }, {
        key: 'instance',
        get: function get() {
            return _instance;
        }
    }]);

    function Screen(options) {
        var _this = this;

        _classCallCheck(this, Screen);

        this.options = options;

        var screen = _blessed2.default.screen({
            autoPadding: true,
            dockBorders: true,
            smartCSR: true,
            title: 'paraseq'
        });

        screen.key(['escape', 'q', 'C-c'], function (ch, key) {
            if (_this.options.onExit) {
                _this.options.onExit();
            } else {
                return process.exit(0);
            }
        });

        this.component = (0, _reactBlessed.render)(_react2.default.createElement(_App2.default, {
            onCommandInput: this.options.onCommandInput,
            onExit: this.options.onExit
        }), screen);
    }

    _createClass(Screen, [{
        key: 'log',
        value: function log(text) {
            this.component.addLogLine(text);
        }
    }, {
        key: 'updateState',
        value: function updateState(state) {
            // TODO move this into event emitter?
            this.component.updateState(state);
        }
    }, {
        key: 'updateScene',
        value: function updateScene(scene) {
            this.component.updateScene(scene);
        }
    }, {
        key: 'updateControllerMap',
        value: function updateControllerMap(controllerMap) {
            // TODO;
        }
    }]);

    return Screen;
}();

module.exports = Screen;