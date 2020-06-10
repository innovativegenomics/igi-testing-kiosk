import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { loadUser } from '../../../actions/authActions';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Navbar from '../../navbar.component';
import AppointmentLookup from './appointmentlookup.component';

export default class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: {
                user: {},
                loaded: false,
                unauthed: false,
                success: false
            },
            tabIndex: 0
        }
    }
    componentDidMount() {
        loadUser().then(res => this.setState({auth: {...res, loaded: true}}));
    }
    render() {
        if(!this.state.auth.loaded) {
            return <div>Loading User</div>;
        } else if(this.state.auth.unauthed) {
            return <Redirect to='/' />;
        } else if(this.state.auth.user.admin < 1) {
            return <Redirect to='/dashboard' />
        }
        return (
            <div style={{backgroundColor: ''}}>
                <Navbar authed={true} admin={this.state.auth.user.admin} />
                <Tabs onSelect={i => this.setState({tabIndex: i})}>
                    <TabList className='nav nav-tabs'>
                        <Tab className='nav-item'><a className={`nav-link text-primary ${this.state.tabIndex===0?'active border-bottom-0':''}`}>Appointment Lookup</a></Tab>
                    </TabList>
                    <TabPanel>
                        <AppointmentLookup auth={this.state.auth}/>
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}
