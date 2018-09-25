import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';

import '../styles/scene.css';

export default class SceneSummary extends Component {

    render() {
        return (
            <div style={{...this.props.style}} className="scene-summary">
                <h4>{`${this.props.options.root ? this.props.options.root : '-'}`}</h4>
            </div>
        );
    }
}

