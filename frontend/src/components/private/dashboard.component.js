import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Navbar from '../navbar.component';
import { connect } from 'react-redux';

import { cancelSlot, loadSlot } from '../../actions/scheduleActions';

class Dashboard extends Component {
    handleSchedule = () => {
        this.props.history.push('/scheduler');
    }
    render() {
        if (!this.props.schedule.slot.slot) {
            if(!this.props.schedule.slotLoading && !this.props.schedule.slotLoaded) {
                this.props.loadSlot();
            }
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
                                <Link className='btn btn-outline-danger btn-lg' to='/screening'>Screening Questionaire</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
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
            <p className='h1 font-weight-light'>{moment(this.props.schedule.slot.slot).format('h:mm A')} at {this.props.schedule.slot.location}</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-success btn-lg' to='/scheduler'>Change appointment time or location</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <button className='btn btn-outline-warning btn-lg' onClick={this.props.cancelSlot}>Cancel appointment</button>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-danger btn-lg' to='/screening'>Screening Questionaire</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    schedule: state.schedule
});

export default connect(mapStateToProps, { cancelSlot, loadSlot })(Dashboard);
