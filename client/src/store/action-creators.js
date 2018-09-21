import ActionTypes from './action-types';

const ActionCreators = {

    setSequencerDefinition: function (def) {
        return {
            type: ActionTypes.SET_SEQUENCER_DEFINITION,
            payload: {...def}
        }
    },

    setConnectionStatus: function (status) {
        return {
            type: ActionTypes.SET_CONNECTION_STATUS,
            payload: status === true
        }
    }

};

export default ActionCreators;