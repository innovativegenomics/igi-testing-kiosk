import React, { Component } from 'react';
import axios from 'axios';
import $ from 'jquery';
import Popper from 'popper.js';

import './dashboard.css';
import Navbar from '../navbar.component';
import { connect } from 'react-redux';

import { setUserLoading, setUserUnauthed, setUserData } from '../../actions/authActions';

class PopoverButton extends Component {
    render() {
        if(this.props.disabled) {
            return (
                <span className='d-inline-block' data-toggle='popover' data-trigger='hover' data-content={this.props.disabledContent}>
                    <button className={`btn btn-lg btn-outline-${this.props.color}`} style={{pointerEvents: 'none'}} type='button' disabled>{this.props.buttonText}</button>
                </span>
            );
        } else {
            return (
                <span className='d-inline-block' data-toggle='popover' data-trigger='hover' data-content={this.props.enabledContent}>
                    <button onClick={this.props.onClick} className={`btn btn-lg btn-outline-${this.props.color}`} type='button'>{this.props.buttonText}</button>
                </span>
            );
        }
    }
}

class Dashboard extends Component {
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
        $(function () {
            $('[data-toggle="popover"]').popover()
        });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    handleSchedule = () => {
        this.props.history.push('/scheduler');
    }
    render() {
        console.log(this.props.auth);
        return (
            <div>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='position-absolute overflow-hidden dashboard' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <div className='d-flex flex-column justify-content-center h-100'>
                        <div className='p-2'>
                            <button className='btn btn-lg btn-outline-success' data-toggle='popover' data-trigger='hover' data-content={(this.props ? 'You have an upcoming appointment' : 'You have no upcoming appointments')}>
                                View my appointments
                            </button>
                        </div>
                        <div className='p-2'>
                            <PopoverButton onClick={this.handleSchedule} disabled={this.state.upcomingAppointment} color='primary' enabledContent='' buttonText='Schedule new appointment' disabledContent={'You can only have one future scheduled appointment at a time. If you would like to reschedule your current appointment, click \'View my appointments\'.'}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(Dashboard);
