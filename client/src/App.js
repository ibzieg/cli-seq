import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';



class App extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            data: {
                performances: []
            }
        }
    }

    componentDidMount() {
        this.connection = new WebSocket(`ws://${window.location.hostname}:3001/sequencer/state`);

        this.connection.onmessage = (message) => {
            this.setState({
                data: JSON.parse(message.data)
            });
        };
        console.log(window.location.hostname);
    }

    getSeq() {
        fetch('/sequencer').then((res) => {
            res.json().then((data) => {
                this.setState({data: data});
            });
        });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <div>
                    {this.state.data.performances.map((value, index) =>
                        <div key={index}>
                            <h1>{`Performance ${index} has ${value.scenes.length} scenes`}</h1>
                            <p>
                                {JSON.stringify(value.scenes[0].options)}
                            </p>
                        </div>
                    )}
                </div>
                <p className="App-intro">
                    To geeeet started, edit <code>src/App.js</code> and save to reload.
                </p>
                <button onClick={() => { this.getSeq();}}>fetch</button>
            </div>
        );
    }
}

export default App;
