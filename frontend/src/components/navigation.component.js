import React, { Component } from 'react';
import { Navbar, Nav, Form, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
    return (
      <Navbar bg='white' expand='sm' className='mb-2 border-bottom'>
        <Navbar.Brand>
          <Link to='/'><img src={igiFast} style={{width: '15rem'}}/></Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          <Nav className='mr-auto'>
            <Nav.Link as={Link} to='/about'>About</Nav.Link>
            <Nav.Link as={Link} to='/dashboard' className={this.props.authed?'':'d-none'}>Appointments</Nav.Link>
            <Nav.Link as={Link} to='/accessing-results' className={this.props.authed?'':'d-none'}>Accessing Results</Nav.Link>
          </Nav>
          <Form inline className={this.props.authed?'':'d-none'}>
            <Nav.Link href='/api/users/logout' className='btn btn-primary text-white'>CalNet Logout</Nav.Link>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      // <nav className='navbar navbar-expand-lg navbar-light p-3' style={{ fontFamily: 'Raleway' }}>
      //   <Link to='/'><div className='navbar-brand igi-header font-weight-light mx-auto'>IGI <i>FAST</i></div></Link>
      //   <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      //     <span className="navbar-toggler-icon"></span>
      //   </button>
      //   <div className='collapse navbar-collapse' id='navbarCollapse'>
      //     <ul className="navbar-nav mr-auto">
      //       <li className='nav-item pl-5'>
      //         <Link className='lead' to='/about'>About</Link>
      //       </li>
      //       <li className={`nav-item pl-5 ${(!this.props.authed && !this.props.admin) ? '' : 'd-none'}`}>
      //         <a className='lead' href={'/api/admin/login' + (this.props.devuser?'?devuser='+this.props.devuser:'')}>Admin</a>
      //       </li>
      //       <li className={`nav-item pl-5 ${(this.props.admin) ? '' : 'd-none'}`}>
      //         <Link className='lead' to={'/admin/dashboard'}>Dashboard</Link>
      //       </li>
      //       <li className={`nav-item pl-5 ${(this.props.authed && !this.props.admin) ? '' : 'd-none'}`}>
      //         <Link className='lead' to={'/dashboard'}>Appointment</Link>
      //       </li>
      //     </ul>
      //     <form className='form-inline'>
      //       <LogoutLink visible={this.props.authed || this.props.showLogout} address={this.props.admin?'/api/admin/logout':'/api/users/logout'} />
      //     </form>
      //   </div>
      // </nav>
    );
  }
}

export class Footer extends Component {
  render() {
    return (
      <div>
        <Card className='position-fixed fixed-bottom d-table p-0 border-0'>
          <Card.Body className='p-3'>
            <a href='mailto:igi-fast@berkeley.edu?subject=Website Issue' style={{color: '#5758FF'}}>Report an issue</a>
          </Card.Body>
        </Card>
        <Card className='position-fixed fixed-bottom d-table p-0 border-0' style={{left: 'auto', right: '0'}}>
          <Card.Body className='p-0'>
            <img style={{width:'8rem', left: 0}} src={berkeleyLogo} />
          </Card.Body>
        </Card>
      </div>
    );
  }
}
