import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

import Navbar from '../navbar.component';
import { getAdminLevel } from '../../actions/adminActions';
import SlotSearch from './slotsearch.component';
import AdminUsers from './adminusers.component';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      level: null,
      selected: 'slot-search',
    };
  }
  componentDidMount = async () => {
    const admin = getAdminLevel();
    this.setState({loaded: true, level: (await admin).level});
  }
  render() {
    if(!this.state.loaded) {
      return <div>Loading...</div>;
    } else if(this.state.loaded && !this.state.level) {
      return <Redirect to='/' />
    }

    return (
      <div>
        <Navbar admin={this.state.level} showLogout={true} />
        <Nav variant='tabs' defaultActiveKey='slot-search' onSelect={k => this.setState({selected: k})}>
          <Nav.Item>
            <Nav.Link eventKey='slot-search'>Appointment Search</Nav.Link>
          </Nav.Item>
          <Nav.Item className={this.state.level>=30?'':'d-none'}>
            <Nav.Link eventKey='admin-users'>Manage Admins</Nav.Link>
          </Nav.Item>
        </Nav>
        {this.state.selected === 'slot-search'?<SlotSearch level={this.state.level} />:<br />}
        {this.state.selected === 'admin-users'?<AdminUsers level={this.state.level} />:<br />}
      </div>
    );
  }
}
