import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';

import { Navigation, Footer } from './components/navigation.component';

import Landing from './components/public/landing.component';
import ExternalLogin from './components/public/extlogin.component';
import About from './components/public/about.component';
import QRCode from './components/public/qrcode.component';
import AccessingResults from './components/public/accessing-results.component';

import NewUser from './components/private/newuser.component';
import Dashboard from './components/private/dashboard.component';
import Scheduler from './components/private/scheduler.component';

import Admin from './components/admin/admin.component';

import Error404 from './components/404.component';

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
    };
    this.landing = withTracker(Landing);
    this.extlogin = withTracker(ExternalLogin);
    this.about = withTracker(About);
    this.qrcode = withTracker(QRCode);
    this.accessingResults = withTracker(AccessingResults);

    this.newUser = withTracker(NewUser);
    this.dashboard = withTracker(Dashboard);
    this.scheduler = withTracker(Scheduler);

    this.admin = withTracker(Admin);
  }
  componentDidMount() {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
  }
  render() {
    return (
        <Router>
          <div className='App'>
            <Navigation authed={!this.state.auth.unauthed} />

            <Switch>
              <Route path='/' exact component={this.landing} />
              <Route path='/extlogin' component={this.extlogin}/>
              <Route path='/about' component={this.about} />
              <Route path='/qrcode' component={this.qrcode} />
              <Route path='/accessing-results' component={this.accessingResults}/>

              <Route path='/newuser' component={this.newUser} />
              <Route path='/dashboard' component={this.dashboard} />
              <Route path='/scheduler' component={this.scheduler} />
              
              <Route path='/admin' component={this.admin} />

              <Route>
                <Error404/>
              </Route>
            </Switch>

            <Footer/>
          </div>
        </Router>
    );
  }
}
