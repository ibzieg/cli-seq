import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';


import '../styles/scene.css';
import SceneSummary from "../components/SceneSummary";
import TrackSummary from "../components/TrackSummary";

class SceneView extends Component {

    get performanceId() {
        return parseInt(this.props.location.performanceId)-1;
    }

    get sceneId() {
        return this.props.location.sceneId;
    }

    get performance() {
        return this.props.sequencerDefinition.performances[this.performanceId];
    }

    get scene() {
        if (this.performance) {
            return this.performance.scenes[this.sceneId];
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

    get tracks() {
        if (this.scene) {
            return this.scene.tracks;
        } else {
            return [];
        }
    }

    render() {

        let w = `${100.0 / (this.tracks.length+1)}%`;

        return (
            <div className="scene-container">
                <SceneSummary style={{width: w}} options={this.options}/>
                { this.tracks.map((track, i) => {
                    return (<NavLink key={i}
                                     style={{width: w}}
                                     className="scene-summary"
                                     to={`/performances/${this.performanceId+1}/scene/${this.sceneId+1}/track/${i+1}/options`}
                                     activeClassName="scene-summary-route">
                        <TrackSummary first={this.props.location.sceneId === 0} track={track}/>
                    </NavLink>);
                }) }
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

export default connect(mapStateToProps, mapDispatchToProps)(SceneView);
