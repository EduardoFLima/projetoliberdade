import { FETCH_CONTATO,
        LOADING } from '../actions/types';

const INITIAL_STATE = { loading : true };

export default ( state = INITIAL_STATE, action ) => {

    //console.log("action contato reducer", action);

    switch (action.type){
        case FETCH_CONTATO:
            return {...state, ["loading"]:false, ["contato"]: action.payload };
        case LOADING:
            return {...state, ["loading"] : true };
        default:
            return {...state};
    }

}