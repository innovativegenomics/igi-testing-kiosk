import React, { Component } from 'react';
import './dashboard.css';
import Navbar from './navbar.component';

export default class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0
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
                <div className='position-absolute overflow-hidden dashboard' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <div className='d-flex flex-column justify-content-center h-100'>
                        <div className='p-2'>
                            <button className='btn btn-outline-success'>
                                View my appointments
                            </button>
                        </div>
                        <div className='p-2'>
                            <button className='btn btn-outline-primary'>
                                Schedule new appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
