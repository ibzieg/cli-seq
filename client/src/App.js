import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import reducer from './store/reducer';

import { createStore, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import ActionCreators from './store/action-creators';

import SequencerView from './views/SequencerView';


const store = createStore(reducer);

class App extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        this.connectWebSocket();
    }

    connectWebSocket() {
        this.connection = new WebSocket(`ws://${window.location.hostname}:3001/sequencer/state`);

        this.connection.onopen = (event) => {
            store.dispatch(ActionCreators.setConnectionStatus(true));
        };

        this.connection.onmessage = (message) => {
            store.dispatch(ActionCreators.setSequencerDefinition(JSON.parse(message.data)));
        };

        this.connection.onclose = (event) => {
            store.dispatch(ActionCreators.setConnectionStatus(false));
        };

    }

    render() {
        return (
            <Provider store={store}>
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">paraseq</h1>
                </header>

                <SequencerView />

            </div>
            </Provider>
        );
    }
}



export default App;
