import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from "react-redux";
import ActionCreators from "../store/action-creators";

class ConnectionManager extends Component {

    componentDidMount() {
        this.connectWebSocket();
    }

    connectWebSocket() {
        this.connection = new WebSocket(`ws://${window.location.hostname}:3001/sequencer/state`);

        this.connection.onopen = (event) => {
            this.props.setConnectionStatus(true);
        };

        this.connection.onmessage = (message) => {
            this.props.setSequencerDefinition(JSON.parse(message.data));
        };

        this.connection.onclose = (event) => {
            this.props.setConnectionStatus(false);
        };

    }

    render() {
        return (
            <div>
                <div>
                    { this.props.wsConnected ?
                        <h2 className="color-success">✔connected</h2>
                        : <span>
                            <h2  className="color-error">✘disconnected</h2>
                            <button onClick={this.props.connect}>Connect</button>
                        </span>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {
        wsConnected
    } = state;
    return {
        wsConnected
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSequencerDefinition: bindActionCreators(ActionCreators.setSequencerDefinition, dispatch),
        setConnectionStatus: bindActionCreators(ActionCreators.setConnectionStatus, dispatch)
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionManager);
