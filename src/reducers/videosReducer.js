import { FETCH_VIDEOS,
         LOADING } from '../actions/types';

const INITIAL_STATE = { loading : true };

export default ( state = INITIAL_STATE, action ) => {

//console.log("action videos reducer", action);

switch (action.type){
    case FETCH_VIDEOS:
        return {...state, ["loading"]:false, ["videos"]: action.payload, ["currentPage"]: action.payload.titulo };
    case LOADING:
        return {...state, ["loading"] : true };
    default:
        return {...state};
}

}