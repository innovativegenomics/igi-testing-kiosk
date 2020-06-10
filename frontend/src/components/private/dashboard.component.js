import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';

import { loadUser } from '../../actions/authActions';
import { loadSlot, cancelSlot } from '../../actions/scheduleActions';

import Navbar from '../navbar.component';

export default class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: {
                user: {},
                loaded: false,
                unauthed: false,
                success: false
            },
            slot: {
                slot: {},
                success: false,
                loaded: false
            },
        };
    }
    requestCancel = e => {
        cancelSlot().then(res => {
            if(res.success) {
                this.setState({slot: {...this.state.slot, loaded: false}});
                loadSlot().then(res => this.setState({slot: {...res, loaded: true}}));
            } else {
                alert(`Couldn't cancel your appointment! Please try again.`);
            }
        });
    }
    componentDidMount() {
        loadUser().then(res => this.setState({auth: {...res, loaded: true}}));
        loadSlot().then(res => this.setState({slot: {...res, loaded: true}}));
    }
    render() {
        if(!this.state.auth.loaded) {
            return <div>Loading User</div>;
        } else if(this.state.auth.unauthed) {
            return <Redirect to='/' />;
        } else if(!this.state.auth.success) {
            return <Redirect to='/newuser'/>;
        } else if(!this.state.slot.loaded) {
            return <div>Loading schedule</div>;
        }
        console.log(this.state.slot);
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar authed={true}/>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col text-center'>
                            <p className='display-4'>Next {(this.state.slot.slot.location)?'':'Open'} Appointment</p>
                        </div>
                    </div>
                    <div className='row justify-content-center mb-3'>
                        <div className='col text-center'>
                            <p className='h1 font-weight-light'>
                                {(this.state.slot.slot.location)? '': 'Week of '}
                                {(this.state.slot.slot.location)? moment(this.state.slot.slot.slot).format('dddd, MMMM D h:mm A'):moment(this.state.slot.slot.slot).format('dddd, MMMM D')}
                                {(this.state.slot.slot.location)?` at ${this.state.slot.slot.location}`:''}
                            </p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col text-center mb-3'>
                            <Link className='btn btn-outline-success btn-lg' to='/scheduler'>{(this.state.slot.slot.location)?'Change time and location':'Select time and location'}</Link>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col text-center mb-3'>
                            <button className={`btn btn-outline-danger btn-lg ${this.state.slot.slot.location?'':'d-none'}`} onClick={this.requestCancel}>Cancel Appointment</button>
                        </div>
                    </div>
                    {/* <div className='row justify-content-center'>
                        <div className='col text-center mb-3'>
                            <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }
}
