import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';

import Navbar from './navbar.component';
import './scheduler.css';
import DatePicker from './datepicker.component';

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
                <div className='position-absolute overflow-hidden scheduler' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <Form>
                        <Form.Group>
                            <DatePicker value={this.state.selectedDate} onChange={this.handleDateChange}/>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        );
    }
}
