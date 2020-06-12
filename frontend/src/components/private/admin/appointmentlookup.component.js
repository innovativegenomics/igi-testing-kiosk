import React, { Component } from 'react';
import moment from 'moment';

import { getAppointmentsByName } from '../../../actions/adminActions';

export default class AppointmentLookup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            success: false,
            sortBy: 'Appointment Date',
            search: ''
        };
    }
    updateSearch = v => {
        this.setState({search: v});
    }
    componentDidMount() {
        getAppointmentsByName('').then(res => {
            this.setState({...res});
        });
    }
    render() {
        const resultRows = [];
        this.state.results.forEach((v, i) => {
            resultRows.push(<tr key={i}>
                <td>{i}</td>
                <td>{v.calnetid}</td>
                <td>{`${v.firstname} ${v.lastname}`}</td>
                <td>{moment(v.slot).format('dddd, MMMM D h:mm A')}</td>
                <td>{v.location}</td>
            </tr>);
        });
        return (
            <div className='container mt-3'>
                <form className='mb-3 form-inline'>
                    <label className='mr-3'>Search</label>
                    <input type='text' className='form-control' value={this.state.search} onChange={e => this.updateSearch(e.target.value)}/>
                    <label className='ml-5 mr-3'>Sort By</label>
                    <select className='form-control' value={this.state.sortBy} onChange={e => this.setState({sortBy: e.target.value})}>
                        <option>Appointment Date</option>
                    </select>
                </form>
                <table className='table table-hover'>
                    <thead>
                        <tr>
                            <th scope='col'>#</th>
                            <th scope='col'>User ID</th>
                            <th scope='col'>Name</th>
                            <th scope='col'>Appointment Slot</th>
                            <th scope='col'>Appointment Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultRows}
                    </tbody>
                </table>
            </div>
        );
    }
}
