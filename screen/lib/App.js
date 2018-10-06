'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _reactBlessed = require('react-blessed');

var _PerformanceController = require('./PerformanceController');

var _PerformanceController2 = _interopRequireDefault(_PerformanceController);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*const React = require('react');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               const blessed = require('blessed');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               const render = require('react-blessed').render;*/

//import data from './saved-state';

// Rendering a simple centered box
var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props, context) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props, context));

        _this.state = {
            data: {},
            scene: { options: {}, tracks: [] },
            log: []
        };

        _this.eventEmitter = new _events2.default();
        return _this;
    }

    _createClass(App, [{
        key: 'addLogLine',
        value: function addLogLine(text) {
            if (this._mounted) {
                this.eventEmitter.emit('log', text);
            }
        }
    }, {
        key: 'updateState',
        value: function updateState(data) {
            if (this._mounted) {
                this.setState({ data: data });
            }
        }
    }, {
        key: 'updateScene',
        value: function updateScene(scene) {
            if (this._mounted) {
                this.setState({ scene: scene });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._mounted = true;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._mounted = false;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_PerformanceController2.default, {
                data: this.state.data,
                scene: this.state.scene,
                log: this.state.log,
                emitter: this.eventEmitter,
                onCommandInput: this.props.onCommandInput,
                onExit: this.props.onExit
            });
        }
    }]);

    return App;
}(_react2.default.Component);

exports.default = App;