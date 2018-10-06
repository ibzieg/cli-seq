import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';

import ReactJson from 'react-json-view';

import '../styles/scene-options.css';

class TrackOptions extends Component {

    get trackId() {
        return parseInt(this.props.match.params.trackId)-1;
    }

    get performance() {
        return this.props.sequencerDefinition.performances[parseInt(this.props.match.params.perfId) - 1];
    }

    get scene() {
        if (this.performance) {
            return this.performance.scenes[parseInt(this.props.match.params.sceneId) - 1]
        } else {
            return {};
        }
    }

    get track() {
        if (this.scene && this.scene.tracks) {
            return this.scene.tracks[this.trackId];
        } else {
            return {};
        }
    }

    render() {
        return (
            <div className="track-options">
                <ReactJson src={this.track}/>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {
        sequencerDefinition
    } = state;
    return {
        sequencerDefinition
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSequencerDefinition: bindActionCreators(ActionCreators.setSequencerDefinition, dispatch),
        setConnectionStatus: bindActionCreators(ActionCreators.setConnectionStatus, dispatch)
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackOptions);
