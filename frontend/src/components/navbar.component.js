import React, { Component } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';

class LogoutLink extends Component {
  render() {
    return (
      <a className={'btn btn-primary ' + ((this.props.visible) ? '' : 'd-none')} href={this.props.address}>CalNet Logout</a>
    );
  }
}

export default class Navbar extends Component {
  render() {
    return (
      <nav className='navbar navbar-expand-lg navbar-light navbar-bg p-3' style={{ fontFamily: 'Raleway' }}>
        <div className='navbar-brand igi-header font-weight-light mx-auto'><Link to='/'>IGI <i>FAST</i></Link></div>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarCollapse'>
          <ul className="navbar-nav mr-auto">
            <li className='nav-item pl-5'>
              <Link className='text-white lead' to='/about'>About</Link>
            </li>
            <li className={`nav-item pl-5 ${(!this.props.authed && !this.props.admin) ? '' : 'd-none'}`}>
              <a className='text-white lead' href={'/api/admin/login' + (this.props.devuser?'?devuser='+this.props.devuser:'')}>Admin</a>
            </li>
            <li className={`nav-item pl-5 ${(this.props.admin) ? '' : 'd-none'}`}>
              <Link className='text-white lead' to={'/admin/dashboard'}>Dashboard</Link>
            </li>
            <li className={`nav-item pl-5 ${(this.props.authed && !this.props.admin) ? '' : 'd-none'}`}>
              <Link className='text-white lead' to={'/dashboard'}>Appointment</Link>
            </li>
          </ul>
          <form className='form-inline'>
            <LogoutLink visible={this.props.authed || this.props.showLogout} address={this.props.admin?'/api/admin/logout':'/api/users/logout'} />
          </form>
        </div>
      </nav>
    );
  }
}
