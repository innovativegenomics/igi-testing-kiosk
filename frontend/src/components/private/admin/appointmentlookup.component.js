import React, { Component } from 'react';

export default class AppointmentLookup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: {},
            sortBy: 'Appointment Date',
            search: ''
        };
    }
    updateSearch = v => {
        this.setState({search: v});
    }
    componentDidMount() {

    }
    render() {
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
                        <tr>
                            <td>1</td>
                            <td>andycate</td>
                            <td>Andrew Doudna Cate</td>
                            <td>Wednesday, June 10 at 10:00 AM</td>
                            <td>Stanley Hall</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
