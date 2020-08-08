import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';
import axios from 'axios';

import { Navigation, Footer } from './components/navigation.component';

import Landing from './components/public/landing.component';
import About from './components/public/about.component';
import QRCode from './components/public/qrcode.component';
import AccessingResults from './components/public/accessing-results.component';
import Signup from './components/public/signup.component';
import Create from './components/public/create.component';
import ExtLogin from './components/public/extlogin.component';
import Forgot from './components/public/forgot.component';
import Reset from './components/public/reset.component';

import NewUser from './components/private/newuser.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';
import Reconsent from './components/private/reconsent.component';

import Admin from './components/admin/admin.component';

import Error404 from './components/404.component';

import { getUser } from './actions/authActions';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

import { withTracker } from './tracker';

const trackingId = 'UA-170146726-1'; // Replace with your Google Analytics tracking ID
ReactGA.initialize(trackingId, {
  gaOptions: {
    siteSpeedSampleRate: 100, // record everything
  }
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: {
        user: {},
        loaded: false,
        unauthed: false,
        success: false
      },
      devmode: false,
      siteKey: ''
    };
    this.landing = withTracker(Landing);
    this.about = withTracker(About);
    this.qrcode = withTracker(QRCode);
    this.accessingResults = withTracker(AccessingResults);
    this.signup = withTracker(Signup);
    this.create = withTracker(Create);
    this.extlogin = withTracker(ExtLogin);
    this.forgot = withTracker(Forgot);
    this.reset = withTracker(Reset);

    this.newUser = withTracker(NewUser);
    this.dashboard = withTracker(Dashboard);
    this.scheduler = withTracker(Scheduler);
    this.reconsent = withTracker(Reconsent);

    this.admin = withTracker(Admin);

    this.error404 = withTracker(Error404);
  }
  updateUser = values => {
    this.setState({
      auth: {
        ...this.state.auth,
        user: {
          ...this.state.auth.user,
          ...values
        }
      }
    })
  }
  reloadProfile = async () => {
    this.setState({loaded: false});
    await getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
  }
  componentDidMount = async () => {
    const user = await getUser();
    const { data: { devmode } } = await axios.get('/api/utils/devmode');
    const { data: { siteKey } } = await axios.get('/api/utils/sitekey');
    this.setState({
      auth: {
        ...user,
        loaded: true
      },
      devmode: devmode,
      siteKey: siteKey
    });
  }
  render() {
    return (
        <Router>
          <div className='App'>
            <Navigation authed={!this.state.auth.unauthed && this.state.auth.loaded} />
            
            <Switch>
              <Route path='/' exact render={props => (
                <this.landing {...props} auth={this.state.auth} devmode={this.state.devmode} />
              )} />
              <Route path='/about' render={props => (
                <this.about {...props} auth={this.state.auth} />
              )} />
              <Route path='/qrcode' render={props => (
                <this.qrcode {...props} auth={this.state.auth} />
              )} />
              <Route path='/accessing-results' render={props => (
                <this.accessingResults {...props} auth={this.state.auth} />
              )} />
              <Route path='/signup' render={props => (
                <this.signup {...props} auth={this.state.auth} siteKey={this.state.siteKey} />
              )} />
              <Route path='/create' render={props => (
                <this.create {...props} auth={this.state.auth} siteKey={this.state.siteKey} />
              )} />
              <Route path='/extlogin' render={props => (
                <this.extlogin {...props} auth={this.state.auth} siteKey={this.state.siteKey} reloadProfile={this.reloadProfile} />
              )} />
              <Route path='/forgot' render={props => (
                <this.forgot {...props} auth={this.state.auth} siteKey={this.state.siteKey} />
              )} />
              <Route path='/reset' render={props => (
                <this.reset {...props} auth={this.state.auth} siteKey={this.state.siteKey} />
              )} />

              <Route path='/newuser' render={props => (
                <this.newUser {...props} auth={this.state.auth} reloadProfile={this.reloadProfile} />
              )} />
              <Route path='/dashboard' render={props => (
                <this.dashboard {...props} auth={this.state.auth} />
              )} />
              <Route path='/scheduler' render={props => (
                <this.scheduler {...props} auth={this.state.auth} />
              )} />
              <Route path='/reconsent' render={props => (
                <this.reconsent {...props} auth={this.state.auth} updateUser={this.updateUser} />
              )} />
              
              <Route path='/admin' render={props => (
                <this.admin {...props} auth={this.state.auth} />
              )} />


              <Route component={this.error404}/>
            </Switch>

            <Footer/>
          </div>
        </Router>
    );
  }
}
