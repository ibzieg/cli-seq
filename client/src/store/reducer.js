import ActionTypes from './action-types';

const initialState = {
    wsConnected: false,
    sequencerDefinition: {
        performances: []
    }
};

function applySetSequencerDefinition(state, action) {
    return {
        ...state,
        sequencerDefinition: action.payload
    }
}

function applySetConnectionStatus(state, action) {
    return {
        ...state,
        wsConnected: action.payload
    }
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case ActionTypes.SET_SEQUENCER_DEFINITION:
            return applySetSequencerDefinition(state, action);
        case ActionTypes.SET_CONNECTION_STATUS:
            return applySetConnectionStatus(state, action);
        default:
            return state;
    }
}

export default reducer;