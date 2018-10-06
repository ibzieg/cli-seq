import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';
import { Switch, Route, Redirect } from 'react-router';


import ReactJson from 'react-json-view';

import '../styles/track.css';

export default class TrackSummary extends Component {

    render() {
        return (
            <div style={{...this.props.style}} className="track-summary">
                { this.props.first ?
                    <h4>{`${this.props.track.enabled ? '✔' : '✘'}`}</h4>
                    : <div style={{display: 'flex', justifyContent: 'flex-start', fontSize: 10}}>
                        <ReactJson
                            style={{}}
                            src={this.props.track}
                            name={null}
                            indentWidth={2}
                            shouldCollapse={(f) => {
                                switch(f.name) {
                                    case "graphData":
                                    case "sequenceData":
                                        return true;
                                    default:
                                        return false;
                                }
                            }}
                            displayDataTypes={false}
                            displayObjectSize={false}
                        />
                    </div>
                }
            </div>
        );
    }
}

