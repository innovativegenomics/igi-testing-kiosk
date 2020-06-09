import React, { Component } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';

class LogoutLink extends Component {
    render() {
        return (
            <a className={'btn btn-danger ' + ((this.props.visible) ? '' : 'd-none')} href={this.props.address}>CalNet Logout</a>
        );
    }
}

export default class Navbar extends Component {
    render() {
        return (
            <nav className='navbar navbar-expand-lg navbar-light navbar-bg p-3' style={{fontFamily: 'Raleway'}}>
                <div className='navbar-brand igi-header font-weight-light mx-auto'>IGI Healthy Campus App</div>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarCollapse'>
                    <ul className="navbar-nav mr-auto">
                        <li className='nav-item pl-5'>
                            <Link className='text-white lead' to='/about'>About</Link>
                        </li>
                        <li className={`nav-item pl-5 ${(this.props.authed)?'':'d-none'}`}>
                            <Link className='text-white lead' to='/dashboard'>Dashboard</Link>
                        </li>
                        <li className={`nav-item pl-5 ${(this.props.authed)?'':'d-none'}`}>
                            <Link className='text-white lead' to='/screening'>Screening</Link>
                        </li>
                    </ul>
                    <form className='form-inline'>
                        <LogoutLink visible={this.props.authed} address='/api/users/logout' />
                    </form>
                </div>
            </nav>
        );
    }
}
