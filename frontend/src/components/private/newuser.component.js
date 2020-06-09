import React, { Component } from 'react';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { validate as validateEmail } from 'email-validator';
import { postcodeValidator } from 'postcode-validator';
import moment from 'moment';

import Navbar from '../navbar.component';
import ToS from './tos.component';

import { createUser } from '../../actions/authActions';
import { Redirect } from 'react-router-dom';

const STATE_CODES = [
    'AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA',
    'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA',
    'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
    'MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT',
    'VT','VI','VA','WA','WV','WI','WY'
   ];

class ToSModal extends Component {
    render() {
        return (
            <div className='modal fade' id='ToSModal' tabIndex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='exampleModalLabel'>Consent to Participate in IGI Healthy Campus Initiative</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <Tos />
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Disagree</button>
                            <button type='button' className='btn btn-primary' data-dismiss='modal' onClick={e => this.props.agree()}>I Agree</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class UserInfo extends Component {
    render() {
        const stateOptions = [];
        for(var s of STATE_CODES) {
            stateOptions.push(<option key={s}>{s}</option>);
        }
        return (
            <div className='card'>
                <div className='card-body'>
                    <h5 className='card-title text-center'>New User Info</h5>
                    <div className='row'>
                        <div className='col'>
                            <p className='lead'>
                                Please make sure your name matches the name on your Cal ID card.
                            </p>
                        </div>
                    </div>
                    <form>
                        <div className='form-group row required'>
                            <label htmlFor='firstname' className='col-md-3 col-form-label'>First Name</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.firstname.valid?'':'border-danger'}`} id='firstname' placeholder='first name' onChange={this.props.updateFirstName} value={this.props.firstname.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label htmlFor='middlename' className='col-md-3 col-form-label'>Middle Name</label>
                            <div className='col-md-9'>
                            <input type='text' className={`form-control ${this.props.middlename.valid?'':'border-danger'}`} id='middlename' placeholder='middle name' onChange={this.props.updateMiddleName} value={this.props.middlename.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='lastname' className='col-md-3 col-form-label'>Last Name</label>
                            <div className='col-md-9'>
                            <input type='text' className={`form-control ${this.props.lastname.valid?'':'border-danger'}`} id='lastname' placeholder='last name' onChange={this.props.updateLastName} value={this.props.lastname.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='dob' className='col-md-3 col-form-label'>Date of Birth</label>
                            <div className='col-md-9'>
                            <input type='text' className={`form-control ${this.props.dob.valid?'':'border-danger'}`} id='dob' placeholder='MM-DD-YYYY' onChange={this.props.updateDOB} value={this.props.dob.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='email' className='col-md-3 col-form-label'>Email</label>
                            <div className='col-md-9'>
                                <input type='email' className={`form-control ${this.props.email.valid?'':'border-danger'}`} id='email' placeholder='email' onChange={this.props.updateEmail} value={this.props.email.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label htmlFor='phone' className='col-md-3 col-form-label'>Phone(mobile)</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.phone.valid?'':'border-danger'}`} id='phone' placeholder='(123) 456 7891' onChange={this.props.updatePhone} value={this.props.phone.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='sex' className='col-md-3 col-form-label'>Sex</label>
                            <div className='col-md-9'>
                                <select id='sex' className={`form-control ${this.props.sex.valid?'':'border-danger'}`} onChange={this.props.updateSex} value={this.props.sex.value}>
                                    <option></option>
                                    <option>Female</option>
                                    <option>Male</option>
                                    <option>Other</option>
                                    <option>Unspecified</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='race' className='col-md-3 col-form-label'>Race</label>
                            <div className='col-md-9'>
                                <select id='race' className={`form-control ${this.props.race.valid?'':'border-danger'}`} onChange={this.props.updateRace} value={this.props.race.value}>
                                    <option></option>
                                    <option>American Indian/Alaska Native</option>
                                    <option>Asian</option>
                                    <option>Black</option>
                                    <option>Hawaiian/Pacific Islander</option>
                                    <option>White</option>
                                    <option>Other</option>
                                    <option>Unknown</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label htmlFor='pbuilding' className='col-md-3 col-form-label'>Primary Building</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.pbuilding.valid?'':'border-danger'}`} id='pbuilding' placeholder='primary building' onChange={this.props.updatePBuilding} value={this.props.pbuilding.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row text-center'>
                            <p className='lead w-100'>
                                Address
                            </p>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='street' className='col-md-3 col-form-label'>Street</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.street.valid?'':'border-danger'}`} id='street' placeholder='street' onChange={this.props.updateStreet} value={this.props.street.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='city' className='col-md-3 col-form-label'>City</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.city.valid?'':'border-danger'}`} id='city' placeholder='city' onChange={this.props.updateCity} value={this.props.city.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='state' className='col-md-3 col-form-label'>State</label>
                            <div className='col-md-9'>
                                <select id='state' className={`form-control ${this.props.state.valid?'':'border-danger'}`} onChange={this.props.updateState} value={this.props.state.value}>
                                    <option></option>
                                    {stateOptions}
                                </select>
                            </div>
                        </div>
                        <div className='form-group row required'>
                            <label htmlFor='zip' className='col-md-3 col-form-label'>Zip Code</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.zip.valid?'':'border-danger'}`} id='zip' placeholder='zip' onChange={this.props.updateZip} value={this.props.zip.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label htmlFor='county' className='col-md-3 col-form-label'>County</label>
                            <div className='col-md-9'>
                                <input type='text' className={`form-control ${this.props.county.valid?'':'border-danger'}`} id='county' placeholder='county' onChange={this.props.updateCounty} value={this.props.county.value} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
                            </div>
                        </div>
                    </form>
                    <div className='row'>
                        <div className='col-md-2'>
                            <button className='btn btn-primary' data-toggle='modal' data-target='#ToSModal' disabled={!this.props.isValid}>Save</button>
                        </div>
                        <div className='col-md-9'>
                            <p className='m-0'>By clicking 'Save' you agree to having your information stored in a secure server, and that it will be provided to UHS upon request.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default class NewUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: {
                value: '',
                valid: false
            },
            middlename: {
                value: '',
                valid: true
            },
            lastname: {
                value: '',
                valid: false
            },
            dob: {
                value: '',
                valid: false
            },
            street: {
                value: '',
                valid: false
            },
            city: {
                value: '',
                valid: false
            },
            state: {
                value: '',
                valid: false
            },
            county: {
                value: '',
                valid: true
            },
            zip: {
                value: '',
                valid: false
            },
            sex: {
                value: '',
                valid: false
            },
            race: {
                value: '',
                valid: false
            },
            pbuilding: {
                value: '',
                valid: false
            },
            email: {
                value: '',
                valid: false
            },
            phone: {
                value: '',
                valid: true
            },
        };
    }
    updateFirstName = e => {
        this.setState({firstname: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateMiddleName = e => {
        this.setState({middlename: {value: e.target.value, valid: true}})
    }
    updateLastName = e => {
        this.setState({lastname: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateDOB = e => {
        this.setState({dob: {value: e.target.value, valid: moment.utc(e.target.value).isValid()}});
    }
    updateStreet = e => {
        this.setState({street: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateCity = e => {
        this.setState({city: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateState = e => {
        this.setState({state: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateCounty = e => {
        this.setState({county: {value: e.target.value, valid: true}})
    }
    updateZip = e => {
        this.setState({zip: {value: e.target.value, valid: postcodeValidator(e.target.value, 'US')}})
    }
    updateSex = e => {
        this.setState({sex: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateRace = e => {
        this.setState({race: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updatePBuilding = e => {
        this.setState({pbuilding: {value: e.target.value, valid: e.target.value !== ''}})
    }
    updateEmail = e => {
        this.setState({email: {value: e.target.value, valid: validateEmail(e.target.value)}});
    }
    updatePhone = e => {
        try {
            this.setState({phone: {value: e.target.value, valid: e.target.value === '' || PhoneNumberUtil.getInstance().isValidNumber(PhoneNumberUtil.getInstance().parse(e.target.value, 'US'))}});
        } catch(err) {
            this.setState({phone: {value: e.target.value, valid: e.target.value === ''}});
        }
    }

    agree = () => {
        // create user!
        const payload = {};
        for(var k in this.state) {
            payload[k]=this.state[k].value;
        }
        this.props.createUser(payload);
    }
    render() {
        if(this.props.auth.created) return <Redirect to='/dashboard' />;
        var isValid = true;
        for(var i in this.state) {
            if(!this.state[i].valid) {
                isValid = false;
                break;
            }
        }
        return (
            <div>
                <Navbar/>
                <div style={{backgroundColor: '#eeeeee'}}>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col-md-8 p-3'>
                                <UserInfo firstname={this.state.firstname}
                                            middlename={this.state.middlename}
                                            lastname={this.state.lastname}
                                            dob={this.state.dob}
                                            street={this.state.street}
                                            city={this.state.city}
                                            state={this.state.state}
                                            county={this.state.county}
                                            zip={this.state.zip}
                                            sex={this.state.sex}
                                            race={this.state.race}
                                            pbuilding={this.state.pbuilding}
                                            email={this.state.email}
                                            phone={this.state.phone}
                                            isValid={isValid}
                                            updateFirstName={this.updateFirstName}
                                            updateMiddleName={this.updateMiddleName}
                                            updateLastName={this.updateLastName}
                                            updateDOB={this.updateDOB}
                                            updateStreet={this.updateStreet}
                                            updateCity={this.updateCity}
                                            updateState={this.updateState}
                                            updateCounty={this.updateCounty}
                                            updateZip={this.updateZip}
                                            updateSex={this.updateSex}
                                            updateRace={this.updateRace}
                                            updatePBuilding={this.updatePBuilding}
                                            updateEmail={this.updateEmail}
                                            updatePhone={this.updatePhone}/>
                            </div>
                        </div>
                    </div>
                </div>
                <ToSModal agree={this.agree} />
            </div>
        );
    }
}
