import React, { Component } from 'react';
import Navbar from './navbar.component';
import './scheduler.css';

export default class Scheduler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0,
        };
    }
    navHeightChange = h => {
        this.setState({navHeight: h, height: window.innerHeight - h});
    }
    onResize = () => {
        this.setState({height: window.innerHeight - this.state.navHeight});
    }
    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    render() {
        return (
            <div>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='position-absolute overflow-hidden scheduler' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                
                </div>
            </div>
        );
    }
}
