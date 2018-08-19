import { FETCH_PAGE,
    LOADING } from '../actions/types';

const INITIAL_STATE = { loading : true };

export default ( state = INITIAL_STATE, action ) => {

    //console.log("action", action);
    
    switch (action.type){
        case FETCH_PAGE:
            return {...state, ["loading"]:false, ["pageInfo"]: action.payload };
        case LOADING:
            return {...state, ["loading"] : true };
        default:
            return {...state};
    }

}