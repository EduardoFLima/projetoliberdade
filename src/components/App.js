import React, { Component } from 'react';
import { Route, Switch, TransitionGroup, withRouter } from 'react-router-dom';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import firebase from 'firebase';
import {connect} from 'react-redux';
import { appendScriptTag } from '../util/util';
import configuration from '../resources/config/config';
import config from 'react-global-configuration';

import Content from './common/content';
import Videos from './videos';
import Fotos from './fotos';
import Contato from './contato';
import Home from './home';

import { FIREBASE_API_KEY,
         GOOGLE_MAPS_API_KEY } from '../util/constants';

import { fetchPageInfo } from '../actions/index';

class App extends Component {

  constructor(props){
    super(props);

    config.set(configuration);

    firebase.initializeApp(config.get(FIREBASE_API_KEY));
    
  }

  componentDidMount () {    
    appendScriptTag(`https://maps.googleapis.com/maps/api/js?key=${config.get(GOOGLE_MAPS_API_KEY)}` );
  }

  render() {
    return (
      <Switch>

        <Route render={({ location }) => (
          <ReactCSSTransitionReplace
            transitionName="contentanimation"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}
          >
            <div key={location.pathname}>
              <Switch location={location}>
                <Route path="/missao/:id" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="missao" />}/>
                <Route path="/missao" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="missao" />}/>
                <Route path="/equipe/:id" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="equipe" />}/>
                <Route path="/equipe" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="equipe" />}/>
                <Route path="/servicos/:id" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="servicos" />}/>
                <Route path="/servicos" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="servicos" />}/>
                <Route path="/hippussuit/:id" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="hippussuit" />}/>
                <Route path="/hippussuit" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="hippussuit" />}/>
                <Route path="/fotos" component={Fotos} />
                <Route path="/videos" component={Videos} />
                <Route path="/contato" component={Contato} />
                <Route path="/historia/:id" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="historia" />}/>
                <Route path="/historia" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="historia" />}/>
                
                <Route path="/" component={Home} />
              </Switch>
            </div>
          </ReactCSSTransitionReplace>
        )} />
      </Switch>
    );
  }
}

export default withRouter(connect(null, { fetchPageInfo })(App));