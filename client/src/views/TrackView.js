import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';

import { Switch, Route, Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';

import ReactJson from 'react-json-view';

import '../styles/scene-options.css';
import TrackOptions from "../components/TrackOptions";
import TrackSequenceData from "../components/TrackSequenceData";

class TrackView extends Component {

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
        const params = this.props.match.params;



        return (
            <div>
                <div>
                    <h2>{`Track ${params.trackId}`}</h2>
                </div>
                <div className="track-tab-container">
                    <NavLink
                        className="track-tab color-tone1"
                        to={`/performances/${params.perfId}/scene/${params.sceneId}/track/${params.trackId}/options`}
                        activeClassName="track-tab-route color-white">
                        <h3>OPTIONS</h3>
                    </NavLink>
                    <NavLink
                        className="track-tab color-tone1"
                        to={`/performances/${params.perfId}/scene/${params.sceneId}/track/${params.trackId}/sequence`}
                        activeClassName="track-tab-route color-white">
                        <h3>SEQUENCE DATA</h3>
                    </NavLink>
                </div>
                <div>
                    <Switch>
                        <Switch>
                            <Route path="/performances/:perfId/scene/:sceneId/track/:trackId/options" component={TrackOptions} />
                            <Route path="/performances/:perfId/scene/:sceneId/track/:trackId/sequence" component={TrackSequenceData} />
                        </Switch>
                    </Switch>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TrackView);
