import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';

import { loadUser } from '../../actions/authActions';

import Navbar from '../navbar.component';

export default class Dashboard extends Component {
    constructor(props) {
        this.state = {
            auth: {
                user: {},
                loaded: false,
                unauthed: false,
                success: false
            },
            slot: {
                loaded: false
            },
        };
    }
    componentDidMount() {
        loadUser().then(res => this.setState({auth: {...res, loaded: true}}));
        // loadSlot().then(res => );
    }
    render() {
        if(!this.state.auth.loaded) {
            return <div>Loading User</div>;
        } else if(this.state.auth.unauthed) {
            return <Redirect to='/' />
        } else if(!this.state.auth.success) {
            return <Redirect to='/newuser'/>
        } else if(!this.state.slot.loaded) {
            return <div>Loading schedule</div>;
        }
        // if (!this.props.schedule.slot.slot) {
        //     if(!this.props.schedule.slotLoading && !this.props.schedule.slotLoaded) {
        //         this.props.loadSlot();
        //     }
        //     return (
        //         <div style={{backgroundColor: '#eeeeee'}}>
        //             <Navbar/>
        //             <div className='container'>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <p className='display-4'>Next Available Appointment</p>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <p className='h1 font-weight-light'>{moment(this.props.auth.user.nextappointment).format('dddd, MMMM D')}</p>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center p-4'>
        //                         <Link className='btn btn-outline-success btn-lg' to='/scheduler'>Select time and location</Link>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <Link className='btn btn-outline-danger btn-lg' to='/screening'>Screening Questionaire</Link>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center p-4'>
        //                         <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     );
        // } else {
        //     return (
        //         <div style={{backgroundColor: '#eeeeee'}}>
        //             <Navbar/>
        //             <div className='container'>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <p className='display-4'>Next Scheduled Appointment</p>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <p className='h1 font-weight-light'>{moment(this.props.auth.user.nextappointment).format('dddd, MMMM D')}</p>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //     <p className='h1 font-weight-light'>{moment(this.props.schedule.slot.slot).format('h:mm A')} at {this.props.schedule.slot.location}</p>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center p-4'>
        //                         <Link className='btn btn-outline-success btn-lg' to='/scheduler'>Change appointment time or location</Link>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <button className='btn btn-outline-warning btn-lg' onClick={this.props.cancelSlot}>Cancel appointment</button>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center p-4'>
        //                         <Link className='btn btn-outline-danger btn-lg' to='/screening'>Screening Questionaire</Link>
        //                     </div>
        //                 </div>
        //                 <div className='row justify-content-center'>
        //                     <div className='col text-center'>
        //                         <Link className='btn btn-outline-primary btn-lg' to='/settings'>Account settings</Link>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     );
        // }
    }
}
