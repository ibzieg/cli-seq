/******************************************************************************
 * Copyright 2018 Ian Bertram Zieg
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { NavLink } from 'react-router-dom';

import ActionCreators from '../store/action-creators';
import '../styles/sequencer.css';

import PerformanceView from './PerformanceView';

class SequencerView extends Component {

    render() {
        return (
            <div>
                <div className="sequencer-tabs-container" >
                    {this.props.sequencerDefinition.performances.map((value, index) =>
                        <NavLink key={index}
                                 className="sequencer-tab color-tone1"
                                 to={`/performances/${index+1}`}
                                 activeClassName="sequencer-tab-route color-white">
                            { this.props.sequencerDefinition.selectedPerformance === index ?
                                <h2 className="color-success">{`P${index+1}`}</h2>
                                : <h2>{`P${index+1}`}</h2>}
                        </NavLink>
                    )}
                </div>
                <Switch>
                    <Route path="/performances/:id" component={PerformanceView} />
                    <Redirect exact={true} from="/" to="/performances/1"/>
                    <Redirect exact={true} from="/performances" to="/performances/1" />
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {
        wsConnected,
        sequencerDefinition
    } = state;
    return {
        wsConnected,
        sequencerDefinition
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSequencerDefinition: bindActionCreators(ActionCreators.setSequencerDefinition, dispatch),
        setConnectionStatus: bindActionCreators(ActionCreators.setConnectionStatus, dispatch)
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SequencerView);
