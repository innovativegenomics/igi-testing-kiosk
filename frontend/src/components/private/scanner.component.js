import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import qs from 'qs';
import moment from 'moment';

import { getSlotInfo, finishAppointment } from '../../actions/adminActions';

import Navbar from '../navbar.component';

class Scanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            appointmentslot: null,
            location: '',
            firstname: '',
            lastname: '',
            loaded: false,
            processed: false,
        };
    }
    processUser = uid => {
        finishAppointment(uid).then(r => {
            this.setState({processed: r});
        });
    }
    render() {
        const uid = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).uid;
        if(this.props.auth.user.admin < 1) {
            return <Redirect to='/dashboard' />;
        }
        if(!this.state.loaded) {
            console.log('begin load');
            if(uid) {
                getSlotInfo(uid).then(res => {
                    this.setState({
                        ...res,
                        loaded: true
                    });
                }).catch(err => {
                    console.log('could not get appointment');
                });
            }
            return (
                <div style={{backgroundColor: '#eeeeee'}}>
                    <Navbar/>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <p className='display-4'>Scan Result</p>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col text-center'>
                                <div className='h2 alert alert-warning'>Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        const hasErrors = this.state.errors.length > 0;
        var errorMessage = '';
        if(this.state.errors.includes('INVALID_UID')) {
            errorMessage = 'The user has an invalid QR code. It is not associated with an appointment.';
        } else if(this.state.errors.includes('COMPLETED')) {
            errorMessage = 'The user has already completed this appointment.';
        } else if(this.state.errors.includes('INACTIVE')) {
            errorMessage = 'This appointment has been cancelled.';
        } else if(this.state.errors.includes('WRONG_TIME')) {
            errorMessage = 'The user is here at the wrong time. Their slot begins ' + moment(this.state.appointmentslot).format('dddd, MMMM Do YYYY, h:mm:ss a');
        } else if(this.state.errors.includes('NOT_SCREENED')) {
            errorMessage = 'This user has not completed the screening questionaire in the past four hours.';
        } else if(this.state.errors.includes('SCREENING_FAILED')) {
            errorMessage = 'The user has answered Yes to at least one of the questions on the screening questionaire in the past four hours. Please direct them to the Tang center immediately.';
        }
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar/>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col text-center'>
                            <p className='display-4'>Scan Result</p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className={`col-md-6 text-center ${hasErrors ? '' : 'd-none'}`}>
                            <div className='h3 font-weight-light alert alert-danger'>Not clear to proceed</div>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className={`col-md-6 text-center ${hasErrors ? 'd-none' : ''}`}>
                            <div className='h3 font-weight-light alert alert-success'>Clear to proceed</div>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className={`col-md-6 text-center ${(this.props.auth.user.admin > 1 && !this.state.errors.includes('INVALID_UID')) ? '' : 'd-none'}`}>
                            <button className='btn btn-lg btn-primary' onClick={e => this.processUser(uid)} disabled={this.state.processed}>User Processed</button>
                            <div className={`alert alert-success ${this.state.processed ? '' : 'd-none'}`}>Done!</div>
                        </div>
                    </div>
                    <div className={`row justify-content-center ${hasErrors?'':'d-none'}`}>
                        <div className='col-md-6 text-center'>
                            <p className='h4 border-bottom'>Error</p>
                        </div>
                    </div>
                    <div className={`row justify-content-center ${hasErrors?'':'d-none'}`}>
                        <div className='col-md-6 text-center'>
                            <p className='lead'>{errorMessage}</p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-md-6 text-center'>
                            <p className='h4 border-bottom'>Details</p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-md-6 text-center'>
                            <p className='lead'>Appointment slot: {moment(this.state.appointmentslot).format('dddd, MMMM Do YYYY, h:mm:ss a')}</p>
                            <p className='lead'>Name: {this.state.firstname} {this.state.lastname}</p>
                            <p className='lead'>Appointment location: {this.state.location}</p>
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

export default connect(mapStateToProps)(Scanner);
