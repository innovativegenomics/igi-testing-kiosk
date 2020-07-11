import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';

import { Navigation, Footer } from './components/navigation.component';

import Landing from './components/public/landing.component';
import About from './components/public/about.component';
import QRCode from './components/public/qrcode.component';
import AccessingResults from './components/public/accessing-results.component';

import NewUser from './components/private/newuser.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';
import Reconsent from './components/private/reconsent.component';

import Admin from './components/admin/admin.component';

import { getUser } from './actions/authActions';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

import withTracker from './withTracker';

const trackingId = 'UA-170146726-1'; // Replace with your Google Analytics tracking ID
ReactGA.initialize(trackingId, {
  gaOptions: {
    siteSpeedSampleRate: 100,
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
    };
    this.landing = withTracker(Landing);
    this.about = withTracker(About);
    this.qrcode = withTracker(QRCode);
    this.accessingResults = withTracker(AccessingResults);

    this.newUser = withTracker(NewUser);
    this.dashboard = withTracker(Dashboard);
    this.scheduler = withTracker(Scheduler);
    this.reconsent = withTracker(Reconsent);

    this.admin = withTracker(Admin);
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
  componentDidMount() {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
  }
  render() {
    return (
        <Router>
          <div className='App'>
            <Navigation authed={!this.state.auth.unauthed} />

            <Route path='/' exact render={props => (
              <this.landing {...props} auth={this.state.auth} />
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

            <Route path='/newuser' render={props => (
              <this.newUser {...props} auth={this.state.auth} />
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

            <Footer/>
          </div>
        </Router>
    );
  }
}
