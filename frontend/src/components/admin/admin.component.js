import React, { Component } from 'react';
import { Redirect, Route, Link } from 'react-router-dom';
import { Nav, Spinner } from 'react-bootstrap';

import { getAdminLevel, getSettings } from '../../actions/adminActions';
import SlotSearch from './slotsearch.component';
import AdminUsers from './adminusers.component';
import Statistics from './statistics.component';
import Scanner from './scanner.component';
import Study from './study.component';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    const path = props.location.pathname.split('/');
    this.state = {
      settings: null,
      loaded: false,
      level: null,
      active: path[path.length-1],
    };
  }
  componentDidMount = async () => {
    const [admin, settings] = await Promise.all([getAdminLevel(), getSettings()]);
    this.setState({loaded: true, level: admin.level, settings: settings.settings});
  }
  render() {
    if(!this.state.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if(this.state.loaded && !this.state.level) {
      window.open('/api/admin/login', '_self');
      return <br />;
    } else if(!this.state.settings) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if(this.props.match.path === this.props.location.pathname) {
      return <Redirect to={`${this.props.match.path}/search`} />
    }



    return (
      <div>
        <Nav variant='tabs' activeKey={this.state.active}>
          <Nav.Item>
            <Nav.Link as={Link} eventKey='search' to='search' onClick={e => this.setState({active: 'search'})}>Appointment Search</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=20?'':'d-none'}>
            <Nav.Link as={Link} eventKey='stats' to='stats' onClick={e => this.setState({active: 'stats'})}>Statistics</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=30?'':'d-none'}>
            <Nav.Link as={Link} eventKey='admins' to='admins' onClick={e => this.setState({active: 'admins'})}>Manage Admins</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=40?'':'d-none'}>
            <Nav.Link as={Link} eventKey='study' to='study' onClick={e => this.setState({active: 'study'})}>Study</Nav.Link>
          </Nav.Item>
        </Nav>

        <Route
          exact
          path={`${this.props.match.path}/search`}
          render={(props) => {
            return <SlotSearch {...props} level={this.state.level} settings={this.state.settings} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/admins`}
          render={(props) => {
            return <AdminUsers {...props} level={this.state.level} settings={this.state.settings} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/stats`}
          render={(props) => {
            return <Statistics {...props} level={this.state.level} settings={this.state.settings} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/scanner`}
          render={(props) => {
            return <Scanner {...props} level={this.state.level} settings={this.state.settings} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/study`}
          render={(props) => {
            return <Study {...props} level={this.state.level} settings={this.state.settings} />;
          }}
        />
      </div>
    );
  }
}
