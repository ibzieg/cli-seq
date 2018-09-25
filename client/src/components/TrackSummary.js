import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';

import '../styles/track.css';

export default class TrackSummary extends Component {

    render() {
        return (
            <div style={{...this.props.style}} className="track-summary">
                <h4>{`${this.props.track.enabled ? '✔' : '✘'}`}</h4>
            </div>
        );
    }
}

