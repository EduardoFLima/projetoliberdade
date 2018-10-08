import { FETCH_HEADER } from '../actions/types';

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {

    //console.log("reducer header - ", action);

    switch (action.type) {
        case FETCH_HEADER:
            return { ...state, ["headerInfo"]: action.payload };
        default:
            return { ...state };
    }

}