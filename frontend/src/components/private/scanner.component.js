import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import qs from 'qs';
import moment from 'moment';

import { loadUser } from '../../actions/authActions';
import { getSlot } from '../../actions/adminActions';

import Navbar from '../navbar.component';

export default class Scanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: {
                user: {},
                loaded: false,
                unauthed: false,
                success: false
            },
            errors: [],
            success: false,
            loaded: false,
            slot: {}
        };
    }
    componentDidMount() {
        loadUser().then(res => this.setState({auth: {...res, loaded: true}}));
        const uid = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).uid;
        if(uid) {
            getSlot(uid).then(res => this.setState({...res, loaded: true}));
        } else {
            alert('No UID');
        }
    }
    render() {
        if(!this.state.auth.loaded) {
            return <div>Loading...</div>;
        } else if(this.state.auth.unauthed) {
            return <Redirect to='/' />;
        } else if(this.state.auth.user.admin < 1) {
            return <Redirect to='/dashboard' />;
        } else if(!this.state.loaded) {
            return <div>Loading...</div>;
        } else if(!this.state.success) {
            return <h1>Error loading content. Please reload the page.</h1>;
        }

        const hasErrors = this.state.errors.length > 0;
        var errorMessage = '';
        if(this.state.errors.includes('INVALID_UID')) {
            errorMessage = 'The user has an invalid QR code. It is not associated with an appointment.';
        } else if(this.state.errors.includes('COMPLETED')) {
            errorMessage = 'The user has already completed this appointment.';
        } else if(this.state.errors.includes('INACTIVE')) {
            errorMessage = 'This appointment has been cancelled, or was never made.';
        } else if(this.state.errors.includes('WRONG_TIME')) {
            errorMessage = 'The user is here at the wrong time. Their slot begins ' + moment(this.state.slot.slot).format('dddd, MMMM Do YYYY, h:mm:ss a');
        }
        return (
            <div>
                <Navbar authed={true} admin={this.state.auth.user.admin}/>
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
                            <p className='lead'>Appointment slot: {this.state.slot.slot?moment(this.state.slot.slot).format('dddd, MMMM Do YYYY, h:mm:ss a'):''}</p>
                            <p className='lead'>Name: {this.state.slot.firstname} {this.state.slot.lastname}</p>
                            <p className='lead'>Appointment location: {this.state.slot.location}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
