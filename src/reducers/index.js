import { combineReducers } from 'redux';
import PageReducer from './pageReducer';
import HeaderReducer from './headerReducer';

const rootReducer = combineReducers({
  header : HeaderReducer,
  page : PageReducer
});

export default rootReducer;
