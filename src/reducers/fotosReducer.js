import { FETCH_FOTOS,
         LOADING } from '../actions/types';

const INITIAL_STATE = { loading : true };

export default ( state = INITIAL_STATE, action ) => {

//console.log("action fotos reducer", action);

switch (action.type){
case FETCH_FOTOS:
   return {...state, ["loading"] : false, ["fotos"]: action.payload, ["currentPage"]: action.payload.titulo };
case LOADING:
   return {...state, ["loading"] : true };
default:
   return {...state};
}

}