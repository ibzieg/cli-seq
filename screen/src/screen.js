import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';

import App from './App';

let _instance = null;

class Screen {

  /***
   * Deprecated.
   * @returns {*}
   * @constructor
   */
  static get Instance() {
    return _instance;
  }

  static get instance() {
    return _instance;
  }

  static create(options) {
    if (_instance instanceof Screen) {
      throw new Error('Screen instance has already been created');
    } else {
      _instance = new Screen(options);
    }
  }

  constructor(options) {
    this.options = options;

    const screen = blessed.screen({
      autoPadding: true,
      dockBorders: true,
      smartCSR: true,
      title: 'paraseq'
    });

    screen.key(['escape', 'q', 'C-c'], (ch, key) => {
      if (this.options.onExit) {
        this.options.onExit();
      } else {
        return process.exit(0);
      }
    });

    this.component = render(
      <App
        onCommandInput={this.options.onCommandInput}
        onExit={this.options.onExit}
      />, screen);
  }

  log(text) {
    this.component.addLogLine(text);
  }

  updateState(state) {
    // TODO move this into event emitter?
    this.component.updateState(state);
  }

  updateScene(scene) {
    this.component.updateScene(scene);
  }

  updateControllerMap(controllerMap) {
    // TODO;
  }

}

module.exports = Screen;
