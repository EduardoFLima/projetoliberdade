import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { HashRouter } from 'react-router-dom';
import reducers from './reducers';
import ReduxThunk from 'redux-thunk';

import Header from './components/header';
import Footer from './components/footer';
import App from './components/App';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/react-responsive-carousel/lib/styles/carousel.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/mdbreact/dist/css/mdb.css';
import '../style/style.css';

const createStoreWithMiddleware = applyMiddleware(ReduxThunk)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <HashRouter>
      <div>
        <Header />
        <App />
        <Footer/>
      </div>
    </HashRouter>
  </Provider>
  , document.querySelector('.mainContainer'));
