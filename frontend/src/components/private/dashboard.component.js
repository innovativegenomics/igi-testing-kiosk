import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Navbar from '../navbar.component';
import { connect } from 'react-redux';

import { cancelSlot, loadSlot } from '../../actions/scheduleActions';
import { testVerifyUser } from '../../actions/authActions';

class ToSModal extends Component {
    render() {
        return (
            <div className='modal fade' id='ToSModal' tabIndex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='exampleModalLabel'>Testing Terms of Service</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            There are no terms of service yet. Just click <b>I Agree</b>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Disagree</button>
                            <button type='button' className='btn btn-primary' data-dismiss='modal' onClick={e => this.props.agree()}>I Agree</button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
    handleSchedule = () => {
        this.props.history.push('/scheduler');
    }
    render() {
        console.log(this.props.schedule);
        if(!this.props.auth.user.testverified) {
            return (
                <div style={{backgroundColor: '#eeeeee'}}>
                    <Navbar/>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='display-4'>Dashboard</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <button className='btn btn-outline-success btn-lg' data-toggle='modal' data-target='#ToSModal'>Sign up for testing</button>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <Link className='btn btn-outline-danger btn-lg' to='/screening'>Get screened</Link>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center p-4'>
                                <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
                            </div>
                        </div>
                    </div>
                    <ToSModal agree={r => this.props.testVerifyUser()} />
                </div>
            );
        } else if (!this.props.schedule.slot.slot) {
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
                                <Link className='btn btn-outline-danger btn-lg' to='/screening'>Get screened</Link>
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
                                <Link className='btn btn-outline-danger btn-lg' to='/screening'>Get screened</Link>
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

export default connect(mapStateToProps, { cancelSlot, loadSlot, testVerifyUser })(Dashboard);
