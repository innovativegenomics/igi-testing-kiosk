import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Navbar from '../navbar.component';
import { connect } from 'react-redux';

import { cancelAppointment } from '../../actions/authActions';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0,
        };
    }
    handleSchedule = () => {
        this.props.history.push('/scheduler');
    }
    render() {
        if (!this.props.auth.user.appointmentslot) {
            return (
                <div style={{backgroundColor: '#eeeeee'}}>
                    <Navbar/>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='display-4'>Next Available Appointment</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='h1 font-weight-light'>{moment(this.props.auth.user.nextappointment).format('dddd, MMMM D')}</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-success btn-lg' to='/scheduler'>Select time and location</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <Link className='btn btn-outline-primary btn-lg' to='/'>Account settings</Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{backgroundColor: '#eeeeee'}}>
                    <Navbar/>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='display-4'>Next Scheduled Appointment</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='h1 font-weight-light'>{moment(this.props.auth.user.nextappointment).format('dddd, MMMM D')}</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
            <p className='h1 font-weight-light'>{moment(this.props.auth.user.appointmentslot).format('h:mm A')} at {this.props.auth.user.location}</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-success btn-lg' to='/scheduler'>Change appointment time or location</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <button className='btn btn-outline-warning btn-lg' onClick={this.props.cancelAppointment}>Cancel appointment</button>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-primary btn-lg' to='/newuser'>Account settings</Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, { cancelAppointment })(Dashboard);
