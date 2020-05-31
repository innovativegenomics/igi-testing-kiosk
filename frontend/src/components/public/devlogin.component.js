import React, { Component } from 'react';

import Navbar from '../navbar.component';

export default class DevLogin extends Component {
    render() {
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar/>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col-5'>
                            <div className='card'>
                                <div className='card-body'>
                                <form action='/api/users/login'>
                                    <div className="form-group">
                                        <label for="devuserInput">Development Username</label>
                                        <input type="text" className="form-control" id="devuserInput" name='devuser' placeholder="Enter development username"/>
                                    </div>
                                    <button className='btn btn-primary' type='submit'>Dev Login</button>
                                </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
