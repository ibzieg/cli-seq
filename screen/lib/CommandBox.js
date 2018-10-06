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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommandBox = function (_React$Component) {
    _inherits(CommandBox, _React$Component);

    function CommandBox() {
        _classCallCheck(this, CommandBox);

        return _possibleConstructorReturn(this, (CommandBox.__proto__ || Object.getPrototypeOf(CommandBox)).apply(this, arguments));
    }

    _createClass(CommandBox, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            setTimeout(function () {
                _this2.refs.commandInput.focus();
            }, 0);

            this.props.emitter.on('log', this.appendLog.bind(this));
        }
    }, {
        key: 'appendLog',
        value: function appendLog(text) {
            this.refs.log.insertBottom(text);
            this.refs.log.setScrollPerc(100);
            this.setState(); // force render
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'box',
                { top: this.props.top,
                    left: this.props.left,
                    width: this.props.width,
                    height: this.props.height
                    // border={{type: 'line'}}
                    , style: {
                        border: { fg: 'white' } } },
                _react2.default.createElement('box', {
                    // top={this.props.top+1}
                    ref: 'log',
                    top: 0,
                    left: 0,
                    scrollable: true,
                    width: this.props.width,
                    height: this.props.height - 3,
                    border: { type: 'line' },
                    style: {
                        border: { fg: 'white' } } }),
                _react2.default.createElement('textbox', {
                    top: this.props.height - 4,
                    left: 0,
                    width: this.props.width,
                    height: 3,
                    ref: 'commandInput',
                    scrollable: true,
                    inputOnFocus: true,
                    keys: true,
                    mouse: true,
                    border: { type: 'line' },
                    style: {
                        border: { fg: 'white' } },
                    onKeypress: this.handleKeypress.bind(this),
                    onSubmit: function onSubmit(value) {
                        //this.appendLog(value);
                        _this3.refs.commandInput.clearValue();
                        _this3.refs.commandInput.focus();
                        if (value === "exit") {
                            _this3.props.onExit();
                        } else {
                            if (_this3.props.onCommandInput) {
                                _this3.props.onCommandInput(value);
                            }
                        }
                    }
                })
            );
            /*          <box top={this.props.top + this.props.height - 3}
                         left={this.props.left}
                         width={this.props.width}
                         height={3}
                         border={{type: 'line'}}
                         style={{
                             border: {fg: 'magenta'}}}>
                       <textbox
                            ref='commandInput'
                            scrollable={true}
                            keys={true}
                            >
                        </textbox>
                    </box>*/
        }
    }, {
        key: 'handleKeypress',
        value: function handleKeypress(ch, key) {

            //this.appendLog(key.name);

            var fkeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];
            if (fkeys.indexOf(key.name) >= 0) {
                // if (typeof this.options.onFunctionKey === "function") {
                //     this.options.onFunctionKey(fkeys.indexOf(key.name));
                // }
            } else if (key.name === "up" || key.ctrl && key.name === "p") {
                // this._state.commandHistoryIndex = Math.max(this._state.commandHistoryIndex - 1, 0);
                // let cmd = this._state.commandHistory[this._state.commandHistoryIndex];
                // this.commandInput.setValue(cmd);
                // this._screen.render();
            } else if (key.name === "down" || key.ctrl && key.name === "n") {
                // this._state.commandHistoryIndex = Math.min(this._state.commandHistoryIndex + 1, this._state.commandHistory.length);
                // let cmd = this._state.commandHistory[this._state.commandHistoryIndex];
                // this.commandInput.setValue(cmd);
                // this._screen.render();
            } else if (key.ctrl && key.name === "c") {
                this.commandInput.clearValue();
                // this._screen.render();
                // this._state.commandHistoryIndex = this._state.commandHistory.length;
            } else {
                    // this._state.commandHistoryIndex = this._state.commandHistory.length;
                }
        }
    }]);

    return CommandBox;
}(_react2.default.Component);

exports.default = CommandBox;