import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Navbar from '../navbar.component';
import moment from 'moment';

import { loadSchedule } from '../../actions/scheduleActions';
import { requestSlot } from '../../actions/authActions';

class AppointmentTable extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const slots = this.props.slots;
        if(Object.keys(slots).length === 0) {
            return <table className='table'></table>
        }
        const head = [];
        const body = [];
        for(var k in slots) {
            head.push(<th scope='col' key={k}>{k}</th>);
        }
        for(var i in slots[Object.keys(slots)[0]]) {
            const row = [];
            for(var k in slots) {
                const m = moment(slots[k][i].time);
                const loc = k;
                row.push(<td key={`${i}${k}`}><button onClick={e => this.props.request(loc, m)} className={`btn ${(slots[k][i].open > 0) ? 'btn-primary' : 'btn-secondary'}`} disabled={!(slots[k][i].open > 0)}>{m.format('h:mm A')}</button></td>);
            }
            body.push(<tr key={`${i}${k}`}>{row}</tr>);
        }
        return (
            <table className='table'>
                <thead>
                    <tr className='text-center'>
                        {head}
                    </tr>
                </thead>
                <tbody className='text-center'>
                    {body}
                </tbody>
            </table>
        );
    }
}

class Scheduler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestedLocation: '',
            requestedSlot: ''
        };
    }
    componentDidMount() {
        if(!this.props.schedule.loaded) {
            this.props.loadSchedule(this.props.auth.user.nextappointment);
        }
    }
    requestTimeSlot = (location, slot) => {
        console.log(`${location} ${slot}`);
        this.setState({requestedLocation: location, requestedSlot: slot});
        this.props.requestSlot(location, slot);
    }
    render() {
        console.log(`${this.state.requestedLocation} ${this.props.auth.user.location}`);
        console.log(`${this.state.requestedSlot} ${this.props.auth.user.appointmentslot}`);
        if(this.state.requestedLocation === this.props.auth.user.location && this.props.auth.user.appointmentslot === this.state.requestedSlot) {
            return <Redirect to='/dashboard'/>;
        }
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col text-center'>
                            <p className='display-4'>Available appointment slots</p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col text-center'>
                            <p className='h2 font-weight-light'>Choose a time slot</p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col'>
                            <AppointmentTable slots={this.props.schedule.slotsAvailable} request={this.requestTimeSlot}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    schedule: state.schedule
});

export default connect(mapStateToProps, { loadSchedule, requestSlot })(Scheduler);
