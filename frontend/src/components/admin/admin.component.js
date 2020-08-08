import React, { Component } from 'react';
import { Redirect, Route, Link } from 'react-router-dom';
import { Nav, Spinner } from 'react-bootstrap';

import { getAdminLevel } from '../../actions/adminActions';
import SlotSearch from './slotsearch.component';
import AdminUsers from './adminusers.component';
import Statistics from './stats/statistics.component';
import Scanner from './scanner.component';
import Study from './study.component';
import Days from './days.component';
import Participants from './participants.component';
import ExtUsers from './extusers.component';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    const path = props.location.pathname.split('/');
    this.state = {
      loaded: false,
      level: null,
      active: path[path.length-1],
    };
  }
  componentDidMount = async () => {
    const [admin] = await Promise.all([getAdminLevel()]);
    this.setState({loaded: true, level: admin.level});
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
          <Nav.Item className={this.state.level>=20?'':'d-none'}>
            <Nav.Link as={Link} eventKey='participants' to='participants' onClick={e => this.setState({active: 'participants'})}>Participants</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=30?'':'d-none'}>
            <Nav.Link as={Link} eventKey='days' to='days' onClick={e => this.setState({active: 'days'})}>Days</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=30?'':'d-none'}>
            <Nav.Link as={Link} eventKey='extusers' to='extusers' onClick={e => this.setState({active: 'extusers'})}>External Users</Nav.Link>
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
            return <SlotSearch {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/days`}
          render={(props) => {
            return <Days {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/extusers`}
          render={(props) => {
            return <ExtUsers {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/admins`}
          render={(props) => {
            return <AdminUsers {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/stats`}
          render={(props) => {
            return <Statistics {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/participants`}
          render={(props) => {
            return <Participants {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/scanner`}
          render={(props) => {
            return <Scanner {...props} level={this.state.level} />;
          }}
        />
        <Route
          exact
          path={`${this.props.match.path}/study`}
          render={(props) => {
            return <Study {...props} level={this.state.level} />;
          }}
        />
      </div>
    );
  }
}
