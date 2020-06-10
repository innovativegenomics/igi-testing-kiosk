import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Navbar from '../navbar.component';
import moment from 'moment';

import { loadUser } from '../../actions/authActions';
import { loadSchedule, requestSlot } from '../../actions/scheduleActions';

import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import './calendar.css';

class DateButton extends Component {
    render() {
        if(this.props.grey) {
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm text-secondary' disabled>{this.props.day}</button></div>
            );
        } else if(this.props.invisible) {
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm invisible' disabled>{this.props.day}</button></div>
            );
        }else if(this.props.active) {
            if(this.props.selected) {
                return (
                    <div className='col m-0 p-0'><button className='btn btn-outline-success border-0 btn-circle btn-sm active' onClick={e => this.props.onClick()}>{this.props.day}</button></div>
                );
            } else {
                return (
                    <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm active' onClick={e => this.props.onClick()}>{this.props.day}</button></div>
                );
            }
        } else{
            return (
                <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm' disabled>{this.props.day}</button></div>
            );
        }
    }
}

class Calendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            month: moment().startOf('month').startOf('day')
        };
    }

    render() {
        const lastMonth = this.state.month.clone().subtract(1, 'month');
        const startDay = this.state.month.day();
        let btns = [];
        for(var i = 0;i < 6;i++){
            let btnRow = [];
            for(var d = 0;d < 7;d++) {
                let day = i*7+d;
                if(day<startDay) {
                    btnRow.push(<DateButton grey={true} day={lastMonth.daysInMonth()-startDay+1+day} key={day}/>);
                } else if(day>=startDay && day < this.state.month.daysInMonth()+startDay) {
                    const active = !this.props.days.every(e => !e.startOf('day').isSame(this.state.month.clone().set('date', day-startDay+1).startOf('day')));
                    const dayMoment = this.state.month.clone().set('day', day-startDay+1);
                    btnRow.push(<DateButton active={active} selected={dayMoment.isSame(this.props.day)} day={day-startDay+1} onClick={e => this.props.setDay(dayMoment)} key={day}/>);
                } else {
                    btnRow.push(<DateButton invisible={true} day={day-startDay+1} key={day}/>);
                }
            }
            btns.push(<div className='row m-0 p-0' key={i}>{btnRow}</div>);
        }
        return (
            <div className='card text-center' style={{width: '22rem'}}>
                <div className='card-header'>
                    <div className='btn-group'>
                        <button className='btn btn-light' onClick={() => this.setState({month: this.state.month.subtract(1, 'month')})}><BsChevronLeft/></button>
                        <p className='lead p-2 m-0' style={{lineHeight: 1.2}}>{this.state.month.format('MMMM YYYY')}</p>
                        <button className='btn btn-light' onClick={() => this.setState({month: this.state.month.add(1, 'month')})}><BsChevronRight/></button>
                    </div>
                </div>
                <div className='card-body'>
                    <div className='row m-0 p-0'>
                        <div className='col m-0 p-0'><p className='lead'>S</p></div>
                        <div className='col m-0 p-0'><p className='lead'>M</p></div>
                        <div className='col m-0 p-0'><p className='lead'>T</p></div>
                        <div className='col m-0 p-0'><p className='lead'>W</p></div>
                        <div className='col m-0 p-0'><p className='lead'>T</p></div>
                        <div className='col m-0 p-0'><p className='lead'>F</p></div>
                        <div className='col m-0 p-0'><p className='lead'>S</p></div>
                    </div>
                    {btns}
                </div>
            </div>
        );
    }
}

class AppointmentTable extends Component {
    render() {
        const slots = this.props.slots;
        const body = [];
        for(var i in slots) {
            const m = moment(i);
            if(m.isSame(this.props.day, 'day'))
                body.push(<tr key={`${i}`}><td><button data-toggle='modal' data-target='#confirmModal' onClick={e => this.props.request(m)} className={`btn ${(slots[i] > 0) ? 'btn-primary' : 'btn-secondary'}`} disabled={!(slots[i] > 0)}>{m.format('h:mm A')}</button></td></tr>);
        }
        return (
            <table className='table'>
                <thead>
                    <tr className='text-center'>
                        <th scope='col'>{this.props.location}</th>
                    </tr>
                </thead>
                <tbody className='text-center'>
                    {body}
                </tbody>
            </table>
        );
    }
}

class ConfirmModal extends Component {
    render() {
        return (
            <div className="modal fade" id='confirmModal' tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Modal title</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>Confirm that you would like to reserve this time slot</p>
                    <p className='lead'>{this.props.selected?this.props.selected.format('dddd, MMMM D h:mm A'):''} at {this.props.location}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.props.onSubmit}>Save changes</button>
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
            </div>
        );
    }
}

export default class Scheduler extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: {
                user: {},
                loaded: false,
                unauthed: false,
                success: false
            },
            schedule: {
                open: {},
                success: false,
                loaded: false,
            },
            location: '',
            day: null,
            selected: null,
            success: false
        };
    }
    componentDidMount() {
        loadUser().then(res => this.setState({auth: {...res, loaded: true}}));
        loadSchedule().then(res => this.setState({schedule: {...res, loaded: true}}));
    }
    submitRequest = e => {
        console.log(this.state.selected);
        console.log(this.state.location);
        requestSlot(this.state.selected, this.state.location).then(res => {
            if(!res.success) {
                alert('Unable to assign you that slot. Please try again!');
            } else {
                this.setState({success: true});
            }
        });
    }
    render() {
        if(this.state.success) {
            return <Redirect to='/dashboard' />;
        }
        if(!this.state.auth.loaded) {
            return <div>Loading User</div>;
        } else if(this.state.auth.unauthed) {
            return <Redirect to='/' />;
        } else if(!this.state.auth.success) {
            return <Redirect to='/newuser'/>;
        } else if(!this.state.schedule.loaded) {
            return <div>Loading schedule</div>;
        } else if(!this.state.schedule.success) {
            return <div>Failed to load the schedule! Please try reloading the page.</div>;
        }
        const locationOptions = [];
        Object.keys(this.state.schedule.open).forEach(k => {
            locationOptions.push(<option key={k}>{k}</option>);
        });
        const slots = Object.keys(this.state.schedule.open[this.state.location] || {}).map(v => moment(v));
        return (
            <div>
                <Navbar authed={true} admin={this.state.auth.user.admin}/>
                <div className='container'>
                    <div className='row justify-content-center m-3'>
                        <div className='col-sm-4'>
                            <select className='form-control' onChange={e => this.setState({location: e.target.value, day: null})}>
                                <option value=''>--location--</option>
                                {locationOptions}
                            </select>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <Calendar days={slots} setDay={d => this.setState({day: d})} day={this.state.day} />
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-8'>
                            {this.state.day?<AppointmentTable slots={this.state.schedule.open[this.state.location]} location={this.state.location} day={this.state.day} request={e => this.setState({selected: e})}/>:<br />}
                        </div>
                    </div>
                </div>
                <ConfirmModal selected={this.state.selected} location={this.state.location} onSubmit={this.submitRequest} />
            </div>
        );
    }
}
