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
        unauthed: true,
        success: false
      },
    }
  }
  componentDidMount() {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
  }
  render() {
    return (
        <Router>
          <div className='App'>
            <Navigation authed={!this.state.auth.unauthed} />

            <Route path='/' exact component={withTracker(Landing)} />
            <Route path='/about' component={withTracker(About)} />
            <Route path='/qrcode' component={withTracker(QRCode)} />
            <Route path='/accessing-results' component={withTracker(AccessingResults)}/>

            <Route path='/newuser' component={withTracker(NewUser)} />
            <Route path='/dashboard' component={withTracker(Dashboard)} />
            <Route path='/scheduler' component={withTracker(Scheduler)} />
            <Route path='/admin' component={withTracker(Admin)} />

            <Footer/>
          </div>
        </Router>
    );
  }
}
