import React, { Component } from 'react';
import './navbar.css';

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.navRef = React.createRef();
    }
    componentDidMount() {
        let h = this.navRef.current.offsetHeight;
        this.props.heightChangeCallback(h);
    }
    render() {
        return (
            <nav className='navbar fixed-top navbar-light navbar-bg p-3' ref={this.navRef} style={{fontFamily: 'Raleway'}}>
                <ul className='navbar-nav mx-auto'>
                    <li className='igi-header font-weight-light'>
                        IGI Testing Kiosk
                    </li>
                </ul>
            </nav>
        );
    }
}

export default Navbar;
