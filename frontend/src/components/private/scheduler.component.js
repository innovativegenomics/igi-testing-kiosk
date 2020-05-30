import React, { Component } from 'react';
import { connect } from 'react-redux';
import Navbar from '../navbar.component';

import { loadSchedule } from '../../actions/scheduleActions';

class Scheduler extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if(!this.props.schedule.loaded) {
            this.props.loadSchedule(this.props.auth.user.nextappointment);
        }
    }
    render() {
        console.log(this.props.schedule.slotsAvailable);
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='container'>

                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    schedule: state.schedule
});

export default connect(mapStateToProps, { loadSchedule })(Scheduler);
