import React, { Component } from 'react';
import { PhoneNumberFormat as PNF } from 'google-libphonenumber';
import { PhoneNumberUtil } from 'google-libphonenumber';

import Navbar from '../navbar.component';
import { connect } from 'react-redux';

import { updateUser } from '../../actions/authActions';

class NewUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: props.auth.user.firstname || '',
            lastname: props.auth.user.lastname || '',
            email: props.auth.user.email,
            phone: props.auth.user.phone || '',
            alertemail: props.auth.user.alertemail,
            alertphone: props.auth.user.alertphone,
        };
        this.state.isValid = this.validateState();
    }
    saveUserData = () => {
        if(this.validateState()) {
            this.props.updateUser({...this.state, phone: (this.state.phone === '') ? null : this.state.phone});
            this.props.history.push('/dashboard');
        }
    }
    validateState = update => {
        const stateCopy = {...this.state, ...update};
        var isValidNumber = false;
        try {
            isValidNumber = PhoneNumberUtil.getInstance().isValidNumber(PhoneNumberUtil.getInstance().parse(stateCopy.phone, 'US'));
        } catch(err) {
            isValidNumber = (stateCopy.phone === '');
        }
        const valid = stateCopy.firstname !== '' &&
                stateCopy.lastname !== '' &&
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(stateCopy.email) &&
                isValidNumber;
        return valid;
    }
    updateFirstName = e => {
        const update = {firstname: e.target.value};
        update.isValid = this.validateState(update);
        this.setState(update);
    }
    updateLastName = e => {
        const update = {lastname: e.target.value};
        update.isValid = this.validateState(update);
        this.setState(update);
    }
    updateEmail = e => {
        const update = {email: e.target.value};
        update.isValid = this.validateState(update);
        this.setState(update);
    }
    updatePhone = e => {
        const update = {phone: e.target.value};
        update.isValid = this.validateState(update);
        this.setState(update);
    }
    render() {
        return (
            <div>
                <Navbar/>
                <div style={{backgroundColor: '#eeeeee'}}>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col-8 p-3'>
                                <div className='card'>
                                    <div className='card-body'>
                                        <h5 className='card-title text-center'>User Info</h5>
                                        <form>
                                            <div className='form-group row'>
                                                <label htmlFor='firstname' className='col-3 col-form-label'>First Name</label>
                                                <div className='col-9'>
                                                    <input type='text' className='form-control' id='firstname' placeholder='firstname' onChange={this.updateFirstName} value={this.state.firstname}/>
                                                </div>
                                            </div>
                                            <div className='form-group row'>
                                                <label htmlFor='lastname' className='col-3 col-form-label'>Last Name</label>
                                                <div className='col-9'>
                                                    <input type='text' className='form-control' id='lastname' placeholder='lastname' onChange={this.updateLastName} value={this.state.lastname}/>
                                                </div>
                                            </div>
                                            <div className='form-group row'>
                                                <label htmlFor='email' className='col-3 col-form-label'>Email</label>
                                                <div className='col-9'>
                                                    <input type='email' className='form-control' id='email' placeholder='email' onChange={this.updateEmail} value={this.state.email}/>
                                                </div>
                                            </div>
                                            <div className='form-group row'>
                                                <label htmlFor='phone' className='col-3 col-form-label'>Phone(mobile)</label>
                                                <div className='col-9'>
                                                    <input type='text' className='form-control' id='phone' placeholder='(123) 456 7891' onChange={this.updatePhone} value={this.state.phone}/>
                                                </div>
                                            </div>
                                        </form>
                                        <button className='btn btn-primary' onClick={this.saveUserData} disabled={!this.state.isValid}>Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, { updateUser })(NewUser);
