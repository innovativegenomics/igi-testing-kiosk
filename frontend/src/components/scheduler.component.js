import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';

import Navbar from './navbar.component';
import './scheduler.css';
import Calendar from './calendar.component';

export default class Scheduler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0,
            selectedDate: new Date().toISOString(),
            formattedValue: '',
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
    handleChange = (value, formattedValue) => {
        this.setState({
            selectedDate: value,
            formattedValue: formattedValue
        });
    }
    render() {
        return (
            <div>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='position-absolute overflow-hidden scheduler' style={{minHeight: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <div className='d-flex flex-column justify-content-center h-100 align-items-center pt-3'>
                        <Calendar/>
                    </div>
                </div>
            </div>
        );
    }
}
