import { FETCH_HOME_PAGE,
         LOADING } from '../actions/types';

const INITIAL_STATE = { loading: true };

export default ( state = INITIAL_STATE, action ) => {

    //console.log("reducer homepage - ", action);

    switch (action.type){
        case FETCH_HOME_PAGE:
            return { ...state, ["loading"] : false, ["home"]: action.payload } ;
        case LOADING:
            return {...state, ["loading"] : true };
        default:
            return {...state};
    }

}