/*const React = require('react');
const blessed = require('blessed');
const render = require('react-blessed').render;*/

import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import PerformanceController from './PerformanceController';
//import data from './saved-state';

import EventEmitter from 'events';

// Rendering a simple centered box
export default class App extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            data: {},
            scene: { options: {}, tracks: []},
            log: []
        };

        this.eventEmitter = new EventEmitter();
    }

    addLogLine(text) {
        if (this._mounted) {
            this.eventEmitter.emit('log',text);
        }
    }

    updateState(data) {
        if (this._mounted) {
            this.setState({data: data});
        }
    }

    updateScene(scene) {
        if (this._mounted) {
            this.setState({scene: scene});
        }
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        return (
            <PerformanceController
                data={this.state.data}
                scene={this.state.scene}
                log={this.state.log}
                emitter={this.eventEmitter}
                onCommandInput={this.props.onCommandInput}
                onExit={this.props.onExit}
            />
        );
    }
}
