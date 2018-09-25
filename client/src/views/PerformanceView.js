import React, { Component } from 'react';


import { Switch, Route, Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';

import '../styles/performance.css';

import SceneView from './SceneView';
import SceneOptions from '../components/SceneOptions';
import TrackView from "./TrackView";

class PerformanceView extends Component {

    get performance() {
        if (this.props.match.params.id >= 1) {
            return this.props.sequencerDefinition.performances[parseInt(this.props.match.params.id) - 1];
        }
    }

    render() {
        return (
            <div>
                { this.performance ?
                    <div>
                        <div className="performance-header">
                        {this.performance["name"]}
                        </div>
                        <div className="performance-content">
                            <div className="performance-tabs-container" >
                                {this.performance.scenes.map((value, index) =>
                                    <div className="performance-tab-wrapper">
                                        <NavLink key={index}
                                                 className="performance-tab color-tone1"
                                                 to={`/performances/${this.props.match.params.id}/scene/${index+1}`}
                                                 activeClassName="performance-tab-route color-white">
                                            { this.performance.selectedScene === index ?
                                                <h3 className="color-success">{`SCENE ${index+1}`}</h3>
                                                : <h3>{`SCENE ${index+1}`}</h3>}
                                        </NavLink>
                                        <Route path="/"
                                               location={{
                                                   ...this.props.location,
                                                   performanceId: this.props.match.params.id,
                                                   sceneId: index
                                               }}
                                               component={SceneView}/>
                                    </div>
                                )}
                            </div>
                            <div className="performance-content-detail">
                                <Switch>
                                    <Route path="/performances/:perfId/scene/:sceneId/track/:trackId" component={TrackView} />
                                    <Route path="/performances/:perfId/scene/:sceneId" component={SceneOptions} />
                                    <Redirect exact={true} from="/" to="/performances/1/scene/1"/>
                                    <Redirect exact={true} from="/performances" to="/performances/1/scene/1" />
                                </Switch>
                            </div>
                        </div>
                    </div>
                    : <div></div>
                }
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

export default connect(mapStateToProps, mapDispatchToProps)(PerformanceView);
