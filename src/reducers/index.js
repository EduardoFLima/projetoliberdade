import { combineReducers } from 'redux';
import PageReducer from './pageReducer';
import ContatoReducer from './contatoReducer';
import FotosReducer from './fotosReducer';
import VideosReducer from './videosReducer';
import HomePageReducer from './homeReducer';
import HeaderReducer from './headerReducer';

const rootReducer = combineReducers({
  header : HeaderReducer,
  page : PageReducer,
  contatoPage : ContatoReducer,
  fotosPage : FotosReducer,
  videosPage : VideosReducer,
  homePage : HomePageReducer
});

export default rootReducer;
