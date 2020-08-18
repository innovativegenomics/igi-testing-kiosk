import React, { Component } from 'react';
import { Navbar, Nav, Form, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { TrackedLink } from '../tracker';

import igiFast from '../media/IGI-FAST.png';
import berkeleyLogo from '../media/berkeley_logo.png';
import './navigation.css';

class LogoutLink extends Component {
  render() {
    return (
      <a className={'btn btn-primary ' + ((this.props.visible) ? '' : 'd-none')} href={this.props.address}>CalNet Logout</a>
    );
  }
}

export class Navigation extends Component {
  render() {
    let calnetid;
    try {
      calnetid = this.props.auth.user.calnetid;
    } catch(err) {
      calnetid = '';
    }
    return (
      <Navbar bg='white' expand='md' className='mb-2 border-bottom'>
        <Navbar.Brand>
          <Link to='/'><img src={igiFast} style={{width: '15rem'}}/></Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          <Nav className='mr-auto'>
            <Nav.Link as={TrackedLink} to='/about' action='navbar'>About</Nav.Link>
            <Nav.Link as={TrackedLink} to='/dashboard' action='navbar' className={this.props.authed?'':'d-none'}>Appointments</Nav.Link>
            <Nav.Link as={TrackedLink} to='/accessing-results' action='navbar' className={this.props.authed?'':'d-none'}>Accessing Results</Nav.Link>
          </Nav>
          <Form inline className={this.props.authed?'':'d-none'}>
            <Nav.Link as={TrackedLink} ext to='/api/users/logout' className='btn btn-primary text-white'>
              {calnetid.substring(0,1)==='E'?
                'Logout'
                :
                'CalNet Logout'
              }
            </Nav.Link>
          </Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export class Footer extends Component {
  render() {
    return (
      <div>
        <Card className='position-fixed fixed-bottom d-table p-0 border-1'>
          <Card.Body className='p-3'>
            <TrackedLink to='mailto:igi-fast@berkeley.edu?subject=Website Issue' ext action='report issue'>Report an issue</TrackedLink>
          </Card.Body>
        </Card>
        <Card className='position-fixed fixed-bottom d-table p-0 border-1' style={{left: 'auto', right: '0'}}>
          <Card.Body className='p-0'>
            <img style={{width:'8rem', left: 0}} src={berkeleyLogo} />
          </Card.Body>
        </Card>
      </div>
    );
  }
}
