import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';

import './navbar.css';

export default class NavbarClass extends Component {
  render() {
    return (
      <Navbar expand='sm' className='navbar-bg' style={{backgroundColor: '#003262'}}>
        <Navbar.Brand className='igi-header font-weight-light mx-auto'>
          IGI <i>FAST</i>
        </Navbar.Brand>
        <Navbar.Toggle/>
        <Navbar.Collapse>
          <Nav className='mr-auto'>
            <Nav.Link className='ml-3 lead'>
              <Link to='/about' className='text-white'>
                About
              </Link>
            </Nav.Link>
            <Nav.Link className={'ml-3 lead' + (this.props.authed?'':' d-none')}>
              <Link to='/dashboard' className='text-white'>
                Dashboard
              </Link>
            </Nav.Link>
          </Nav>
          <Form inline>
            <Button className={(this.props.authed?'':' d-none')} onClick={e => window.open('/api/users/logout', '_self')}>
              CalNet Logout
            </Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
