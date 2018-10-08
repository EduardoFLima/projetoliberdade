import React, { Component } from 'react';
import { Route, Switch, TransitionGroup, withRouter } from 'react-router-dom';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {connect} from 'react-redux';

import Content from './common/content';
import Fotos from './fotos';
import Contato from './contato';
import Home from './home';

import { fetchPageInfo } from '../actions/index';

/*import 'font-awesome/css/font-awesome.min.css';
import '../../node_modules/font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';*/

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
                <Route path="/fotos" component={Fotos} page="fotos" />
                <Route path="/contato" render={(props)=><Contato {...props} fetchMethod={this.props.fetchPageInfo} page="contato" />}/>
                <Route path="/historia" render={(props)=><Content {...props} fetchMethod={this.props.fetchPageInfo} page="historia" />}/>                
                <Route path="/" component={Home} page="home" />
              </Switch>
            </div>
          </ReactCSSTransitionReplace>
        )} />
      </Switch>
    );
  }

  render2() {
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