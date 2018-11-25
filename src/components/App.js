import React, { Component } from 'react';
import { Route, Switch, TransitionGroup, withRouter } from 'react-router-dom';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from 'react-redux';

import Content from './common/content';
import Fotos from './fotos';
import Contato from './contato';
import Home from './home';

import { fetchPageInfo } from '../actions/index';

class App extends Component {

  constructor(props){
    super(props);
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
                <Route path="/missao" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="missao" />}/>
                <Route path="/equipe" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="equipe" />}/>
                <Route path="/servicos" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="servicos" />}/>
                <Route path="/hippussuit" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="hippussuit" />}/>
                <Route path="/videos" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="videos" />}/>
                <Route path="/fotos"   render={(props)=><Fotos {...props} fetchMethod={this.props.fetchPageInfo} page="fotos" />}/>
                <Route path="/contato" render={(props)=><Contato {...props} fetchMethod={this.props.fetchPageInfo} page="contato" />}/>
                <Route path="/historia" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="historia" />}/>
                <Route path="/" render={(props)=><Home {...props} fetchMethod={this.props.fetchPageInfo} page="home" />}/>
              </Switch>
            </div>
          </ReactCSSTransitionReplace>
        )} />
      </Switch>
    );
  }
}

export default withRouter(connect(null, { fetchPageInfo })(App));