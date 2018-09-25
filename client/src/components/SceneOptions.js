import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';

import ReactJson from 'react-json-view';

import '../styles/scene-options.css';

class SceneOptions extends Component {

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

    get options() {
        if (this.scene) {
            return this.scene.options;
        } else {
            return {};
        }
    }

    render() {
        return (
            <div className="scene-options">
                <h2>{`Scene ${this.props.match.params.sceneId} options`}</h2>
                <ReactJson src={this.options}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(SceneOptions);
