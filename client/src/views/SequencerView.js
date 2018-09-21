import React, { Component } from 'react';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActionCreators from '../store/action-creators';



class SequencerView extends Component {

    render() {
        return (
            <div>
                <div>
                    { this.props.wsConnected ?
                        <span style={{color: 'green'}}>Connected</span>
                        : <div>
                            <span style={{color: 'red'}}>Disconnected</span>
                        </div>
                    }
                </div>
                <div>
                    {this.props.sequencerDefinition.performances.map((value, index) =>
                        <div key={index}>
                            <h1>{`Performance ${index} has ${value.scenes.length} scenes`}</h1>
                            <p>
                                {JSON.stringify(value.scenes[0].options)}
                            </p>
                        </div>
                    )}
                </div>
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

function mapDispatchToProps(dispatch) {
    return {
        setSequencerDefinition: bindActionCreators(ActionCreators.setSequencerDefinition, dispatch),
        setConnectionStatus: bindActionCreators(ActionCreators.setConnectionStatus, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SequencerView);
