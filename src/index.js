import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import reducers from './reducers';
import ReduxThunk from 'redux-thunk';

import Header from './components/header';
import Footer from './components/footer';
import App from './components/App';

const createStoreWithMiddleware = applyMiddleware(ReduxThunk)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <div>
        <Header/>
        <App />
        <Footer/>
      </div>
    </BrowserRouter>
  </Provider>
  , document.querySelector('.myContainer'));
