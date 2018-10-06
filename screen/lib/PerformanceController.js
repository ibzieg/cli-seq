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

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _CommandBox = require('./CommandBox');

var _CommandBox2 = _interopRequireDefault(_CommandBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCREEN_HEIGHT = 30;
var SCREEN_WIDTH = 100;
var SCENE_BOX_WIDTH = 20;
var TRACK_BOX_WIDTH = 20;

var layout = {
    statusBar: {
        left: 0,
        top: 0,
        width: SCREEN_WIDTH,
        height: 3
    },
    deviceSelect: {
        left: 1,
        top: 2,
        width: SCREEN_WIDTH,
        height: 5
    },
    controller: {
        left: 0,
        top: 4,
        width: SCREEN_WIDTH,
        height: 12
    },
    logBox: {
        top: 15,
        left: 0,
        width: SCREEN_WIDTH - SCENE_BOX_WIDTH - TRACK_BOX_WIDTH + 2,
        height: 13
    },
    inputBox: {
        top: 27,
        left: 0,
        width: SCREEN_WIDTH - SCENE_BOX_WIDTH - TRACK_BOX_WIDTH + 2,
        height: 3
    },
    trackConfigBox: {
        top: 15,
        left: SCREEN_WIDTH - SCENE_BOX_WIDTH - TRACK_BOX_WIDTH + 1,
        width: TRACK_BOX_WIDTH,
        height: 15
    },
    sceneConfigBox: {
        top: 15,
        left: SCREEN_WIDTH - SCENE_BOX_WIDTH,
        width: SCENE_BOX_WIDTH,
        height: 15
    }
};

var knobMap = [{ label: "Rate", name: "rate", type: "track" }, { label: "Octave", name: "octave", type: "track" }, { label: "Length", name: "length", type: "track" }, { label: "Steps", name: "steps", type: "track" }, { label: "Sequence", name: "sequenceType", type: "track" }, { label: "Graph", name: "graphType", type: "track" }, { label: "Arp", name: "arp", type: "track" }, { label: "Arp Rate", name: "arpRate", type: "track" }, { label: "Root", name: "root", type: "scene" }, { label: "Mode", name: "mode", type: "scene" }, { label: "Min Note", name: "minNote", type: "scene" }, { label: "Max Note", name: "maxNote", type: "scene" }, { label: "Master", name: "resetEvent", type: "scene" }, { label: "Set Size", name: "noteSetSize", type: "scene" }, { label: "End", name: "end", type: "track" }, { label: "Follow", name: "follow", type: "track" }, { label: "Enabled", name: "enabled", type: "track" }, { label: "", name: "", type: "" }, { label: "", name: "", type: "" }, { label: "Gen→Graph", name: "", type: "" }, { label: "Gen→Track", name: "", type: "" }, { label: "Gen→All", name: "", type: "" }, { label: "Gen→Notes", name: "", type: "" }, { label: "Playlist", name: "playlistMode", type: "root" }];

var PerformanceController = function (_React$Component) {
    _inherits(PerformanceController, _React$Component);

    function PerformanceController() {
        _classCallCheck(this, PerformanceController);

        return _possibleConstructorReturn(this, (PerformanceController.__proto__ || Object.getPrototypeOf(PerformanceController)).apply(this, arguments));
    }

    _createClass(PerformanceController, [{
        key: 'getTitleText',
        value: function getTitleText() {
            return _colors2.default.green(this.performance.name) + ': Scene ' + _colors2.default.green(this.performance.selectedScene + 1);
        }
    }, {
        key: 'getPlayModeText',
        value: function getPlayModeText() {
            return 'Mode: ' + (this.performance.playlistMode === true ? _colors2.default.magenta('playlist') : _colors2.default.green('loop'));
        }
    }, {
        key: 'getStatusText',
        value: function getStatusText() {
            var title = this.getTitleText();
            var modeText = this.getPlayModeText();

            var text = '';
            text += title;
            text += Array(SCREEN_WIDTH - 3 - title.length - modeText.length).join(' ');
            text += modeText;
            return text;
        }
    }, {
        key: 'getTrackStateText',
        value: function getTrackStateText() {
            var state = Object.assign({
                linearGraph: this.track.graphData ? this.track.graphData.linear : []
            }, this.track);
            var keys = ["instrument", "note", "velocity", "constants", "linearGraph"];
            var text = '';
            text += _colors2.default.magenta.bold('Track:\n');
            for (var i = 0; i < keys.length; i++) {
                text += keys[i] + ': ' + _colors2.default.green(state[keys[i]]) + '\n';
            }
            return text;
        }
    }, {
        key: 'getSceneStateText',
        value: function getSceneStateText() {
            var keys = ["cvA", "cvB", "cvC", "cvD", "gateA", "gateB", "gateC", "gateD", "modA", "modB", "modC", "modD"];

            var text = '';
            text += _colors2.default.magenta.bold('Scene:\n');
            for (var i = 0; i < keys.length; i++) {
                text += keys[i] + ': ' + _colors2.default.green(this.scene.options[keys[i]]) + '\n';
            }
            return text;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var getValue = function getValue(item) {
                switch (item.type) {
                    case 'track':
                        return _this2.track[item.name];
                    case 'scene':
                        return _this2.scene.options[item.name];
                    case 'root':
                        return _this2.props.data[item.name];
                    default:
                        return null;
                }
            };

            return _react2.default.createElement(
                'element',
                null,
                _react2.default.createElement(
                    'box',
                    { top: 0,
                        left: 1,
                        width: SCREEN_WIDTH - 3,
                        height: 3,
                        border: { type: 'line' },
                        style: {
                            border: { fg: 'magenta' } } },
                    this.getStatusText()
                ),
                knobMap.map(function (item, i) {
                    return _react2.default.createElement(
                        'box',
                        { key: i,
                            label: '{bold}' + item.label + '{/}',
                            left: i % 8 * 12 + 1,
                            top: Math.floor(i / 8) * 2 + 3,
                            width: 13,
                            height: 3,
                            tags: true,
                            border: { type: 'line' },
                            style: { border: { fg: 'white' } } },
                        _colors2.default.green(getValue(item))
                    );
                }),
                this.scene.tracks.map(function (t, i) {
                    return _react2.default.createElement(
                        'box',
                        { key: i,
                            top: 9,
                            left: i % 8 * 12 + 1,
                            height: 3,
                            width: 13,
                            border: { type: _this2.performance.selectedTrack === i ? 'line' : 'line' },
                            style: { border: { fg: 'white' } } },
                        _this2.performance.selectedTrack === i ? _colors2.default.magenta.bold('\u2192' + t.name) : ' ' + t.name
                    );
                }),
                _react2.default.createElement(_CommandBox2.default, {
                    top: 11,
                    left: 1,
                    height: 19,
                    width: 49,
                    log: this.props.log,
                    emitter: this.props.emitter,
                    onCommandInput: this.props.onCommandInput,
                    onExit: this.props.onExit }),
                _react2.default.createElement(
                    'box',
                    {
                        top: 11,
                        left: 49,
                        height: 18,
                        width: 25,
                        border: { type: 'line' },
                        style: { border: { fg: 'white' } } },
                    this.getTrackStateText()
                ),
                _react2.default.createElement(
                    'box',
                    {
                        top: 11,
                        left: 73,
                        height: 18,
                        width: 25,
                        border: { type: 'line' },
                        style: { border: { fg: 'white' } } },
                    this.getSceneStateText()
                )
            );
        }
    }, {
        key: 'performance',
        get: function get() {
            if (this.props.data.performances && this.props.data.performances.length) {
                return this.props.data.performances[this.props.data.selectedPerformance];
            } else {
                return {};
            }
        }
    }, {
        key: 'scene',
        get: function get() {
            return this.props.scene;
        }
    }, {
        key: 'track',
        get: function get() {
            var t = this.props.scene.tracks[this.performance.selectedTrack];
            if (t) {
                return t;
            } else {
                return {};
            }
        }
    }]);

    return PerformanceController;
}(_react2.default.Component);

exports.default = PerformanceController;