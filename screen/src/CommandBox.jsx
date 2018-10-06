import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import colors from 'colors';

export default class CommandBox extends React.Component {

    componentDidMount() {
        setTimeout(()=> {
            this.refs.commandInput.focus();
        },0);

        this.props.emitter.on('log', this.appendLog.bind(this));

    }

    appendLog(text) {
        this.refs.log.insertBottom(text);
        this.refs.log.setScrollPerc(100);
        this.setState(); // force render
    }

    render() {

        return (

              <box top={this.props.top}
                     left={this.props.left}
                     width={this.props.width}
                     height={this.props.height}
                     // border={{type: 'line'}}
                     style={{
                         border: {fg: 'white'}}}>
                  <box
                      // top={this.props.top+1}
                      ref='log'
                      top={0}
                      left={0}
                      scrollable={true}
                      width={this.props.width}
                      height={this.props.height-3}
                      border={{type: 'line'}}
                      style={{
                          border: {fg: 'white'}}}>

                  </box>
                  <textbox
                      top={this.props.height-4}
                      left={0}
                      width={this.props.width}
                      height={3}
                      ref='commandInput'
                      scrollable={true}
                      inputOnFocus={true}
                      keys={true}
                      mouse={true}
                      border={{type: 'line'}}
                      style={{
                          border: {fg: 'white'}}}
                      onKeypress={this.handleKeypress.bind(this)}
                      onSubmit={(value) => {
                          //this.appendLog(value);
                          this.refs.commandInput.clearValue();
                          this.refs.commandInput.focus();
                          if (value === "exit") {
                              this.props.onExit();
                          } else {
                              if (this.props.onCommandInput) {
                                  this.props.onCommandInput(value);
                              }
                          }
                      }}
                  >
                  </textbox>

                </box>);
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

    handleKeypress(ch, key) {

        //this.appendLog(key.name);

        const fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12"];
        if (fkeys.indexOf(key.name) >= 0) {
            // if (typeof this.options.onFunctionKey === "function") {
            //     this.options.onFunctionKey(fkeys.indexOf(key.name));
            // }
        } else
        if (key.name === "up" || (key.ctrl && key.name === "p")) {
            // this._state.commandHistoryIndex = Math.max(this._state.commandHistoryIndex - 1, 0);
            // let cmd = this._state.commandHistory[this._state.commandHistoryIndex];
            // this.commandInput.setValue(cmd);
            // this._screen.render();
        } else if (key.name === "down" || (key.ctrl && key.name === "n")) {
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

}