import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { validate as validateEmail } from 'email-validator';
import { postcodeValidator } from 'postcode-validator';
import moment from 'moment';

import Navbar from '../navbar.component';
import ToS from './tos.component';

import { loadUser, createUser } from '../../actions/authActions';
import { Redirect } from 'react-router-dom';

const STATE_CODES = [
    'AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA',
    'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA',
    'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
    'MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT',
    'VT','VI','VA','WA','WV','WI','WY'
   ];

const USER_INFO = {
    firstname: {
        type: 'TEXT',
        title: 'First Name',
        required: true,
        validFunc: v => v.length < 41,
    },
    middlename: {
        type: 'TEXT',
        title: 'Middle Name',
        required: false,
        validFunc: v => v.length < 41,
    },
    lastname: {
        type: 'TEXT',
        title: 'Last Name',
        required: true,
        validFunc: v => v.length < 81,
    },
    dob: {
        type: 'DATE',
        title: 'Date of Birth',
        placeholder: 'MM-DD-YYYY',
        required: true,
        validFunc: v => true
    },
    sex: {
        type: 'SELECT',
        title: 'Sex',
        required: true,
        options: ['Female', 'Male', 'Other', 'Unspecified'],
        validFunc: v => true
    },
    race: {
        type: 'SELECT',
        title: 'Race',
        required: true,
        options: ['American Indian/Alaska Native',
                    'Asian',
                    'Black',
                    'Hawaiian/Pacific Islander',
                    'White',
                    'Other',
                    'Unknown'],
        validFunc: v => true
    },
    pbuilding: {
        type: 'TEXT',
        title: 'Primary Building',
        required: true,
        validFunc: v => v.length < 256
    },
    email: {
        type: 'TEXT',
        title: 'Email',
        required: true,
        validFunc: v => validateEmail(v)
    },
    phone: {
        type: 'TEXT',
        title: 'Phone',
        placeholder: '(123) 456 7891',
        required: false,
        validFunc: v => {
            try {
                return PhoneNumberUtil.getInstance().isValidNumber(PhoneNumberUtil.getInstance().parse(v, 'US'));
            } catch(err) {
                return false;
            }
        }
    },
    addressLabel: {
        type: 'LABEL',
        title: 'Address'
    },
    street: {
        type: 'TEXT',
        title: 'Street',
        required: true,
        validFunc: v => v.length < 256
    },
    city: {
        type: 'TEXT',
        title: 'City',
        required: true,
        validFunc: v => v.length < 41
    },
    state: {
        type: 'SELECT',
        title: 'State',
        required: true,
        options: STATE_CODES,
        validFunc: v => true
    },
    county: {
        type: 'TEXT',
        title: 'County',
        required: false,
        validFunc: v => v.length < 81
    },
    zip: {
        type: 'TEXT',
        title: 'Zip Code',
        required: true,
        validFunc: v => v.length < 21 && postcodeValidator(v, 'US')
    },
};

class ToSModal extends Component {
    render() {
        return (
            <div className='modal fade' id='ToSModal' tabIndex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                <div className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='exampleModalLabel'>Consent to Participate in IGI Healthy Campus Initiative</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ToS />
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

class TextInput extends Component {
    isValid = v => {
        return (!this.props.required && v === '') || (v !== '' && this.props.validFunc(v));
    }
    render() {
        return (
            <div className={`form-group row ${this.props.required?'required':''}`}>
                <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
                <div className='col-md-9'>
                    <input type='text' className={`form-control ${(this.props.valid || this.props.value === '')?'':'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder||this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off'/>
                </div>
            </div>
        );
    }
}

TextInput.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    valid: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    update: PropTypes.func.isRequired,
    validFunc: PropTypes.func.isRequired
}

class DateInput extends Component {
    isDateSupported = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'date');
        input.setAttribute('value', 'a');
        return (input.value !== 'a');
    }
    isValid = v => {
        return (!this.props.required && v === '') || (moment.utc(v).isValid() && this.props.validFunc(v));
    }
    render() {
        if(this.isDateSupported()) {
            return (
                <div className={`form-group row ${this.props.required?'required':''}`}>
                    <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
                    <div className='col-md-9'>
                        <input type='date' className={`form-control ${(this.props.valid || this.props.value === '')?'':'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder||this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off'/>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={`form-group row ${this.props.required?'required':''}`}>
                    <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
                    <div className='col-md-9'>
                        <input type='text' className={`form-control ${(this.props.valid || this.props.value === '')?'':'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder||this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off'/>
                    </div>
                </div>
            );
        }
    }
}

DateInput.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    valid: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    update: PropTypes.func.isRequired,
    validFunc: PropTypes.func.isRequired
}

class SelectInput extends Component {
    isValid = v => {
        return (!this.props.required && v === '') || (this.props.options.includes(v) && this.props.validFunc(v));
    }
    render() {
        const optionElements = [];
        this.props.options.forEach(o => {
            optionElements.push(<option key={o}>{o}</option>);
        })
        return (
            <div className={`form-group row ${this.props.required?'required':''}`}>
                <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
                <div className='col-md-9'>
                    <select id={this.props.name} className={`form-control ${(this.props.valid || this.props.value === '')?'':'border-danger'}`} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} value={this.props.value}>
                        <option value='' selected>--none--</option>
                        {optionElements}
                    </select>
                </div>
            </div>
        );
    }
}

SelectInput.propTypes = {
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    valid: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    options: PropTypes.array.isRequired,
    update: PropTypes.func.isRequired,
    validFunc: PropTypes.func.isRequired
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
            user: {},
            unauthed: false,
            success: false
        };
        for(var i in USER_INFO) {
            this.state.user[i] = {
                placeholder: USER_INFO[i].placeholder,
                required: USER_INFO[i].required,
                title: USER_INFO[i].title,
                type: USER_INFO[i].type,
                value: '',
                options: USER_INFO[i].options,
                valid: !USER_INFO[i].required,
                validFunc: USER_INFO[i].validFunc
            }
        }
    }

    agree = () => {
        // create user!
        const payload = {};
        Object.keys(this.state.user).forEach(k => {
            if(this.state.user[k].type === 'LABEL') {
                return;
            } else if(this.state.user[k].type === 'DATE') {
                payload[k] = moment.utc(this.state.user[k].value).toDate();
            } else {
                payload[k] = this.state.user[k].value;
            }
        });
        createUser(payload).then(res => {
            if(!res) {
                // Handle error!
            } else {
                this.setState({success: true});
            }
        });
    }

    componentDidMount() {
        loadUser().then(res => {
            this.setState({unauthed: res.unauthed, success: res.success});
        });
    }

    render() {
        if(this.state.unauthed) {
            return <Redirect to='/' />
        } else if(this.state.success) {
            return <Redirect to='/dashboard' />
        }
        var isValid = true;
        const formItems=[];
        Object.keys(this.state.user).forEach(k => {
            if(!this.state.user[k].valid) {
                isValid = false;
            }
            switch(this.state.user[k].type) {
                case 'TEXT':
                    formItems.push(<TextInput required={this.state.user[k].required}
                                                title={this.state.user[k].title}
                                                validFunc={this.state.user[k].validFunc}
                                                valid={this.state.user[k].valid}
                                                value={this.state.user[k].value}
                                                update={(value, valid) => {
                                                    const update = {...this.state.user};
                                                    update[k].value = value;
                                                    update[k].valid = valid;
                                                    this.setState({user: update});
                                                }}
                                                placeholder={this.state.user[k].placeholder}
                                                name={k}
                                                key={k}/>);
                    break;
                case 'DATE':
                    formItems.push(<DateInput required={this.state.user[k].required}
                        title={this.state.user[k].title}
                        validFunc={this.state.user[k].validFunc}
                        valid={this.state.user[k].valid}
                        value={this.state.user[k].value}
                        update={(value, valid) => {
                            const update = {...this.state.user};
                            update[k].value = value;
                            update[k].valid = valid;
                            this.setState({user: update});
                        }}
                        placeholder={this.state.user[k].placeholder}
                        name={k}
                        key={k}/>);
                    break;
                case 'SELECT':
                    formItems.push(<SelectInput required={this.state.user[k].required}
                        title={this.state.user[k].title}
                        validFunc={this.state.user[k].validFunc}
                        valid={this.state.user[k].valid}
                        value={this.state.user[k].value}
                        update={(value, valid) => {
                            const update = {...this.state.user};
                            update[k].value = value;
                            update[k].valid = valid;
                            this.setState({user: update});
                        }}
                        options={this.state.user[k].options}
                        placeholder={this.state.user[k].placeholder}
                        name={k}
                        key={k}/>);
                    break;
                case 'LABEL':
                    formItems.push(<p className='lead w-100 text-center' key={k}>{this.state.user[k].title}</p>);
                    break;
            }
        });
        return (
            <div>
                <Navbar/>
                <div style={{backgroundColor: '#eeeeee'}}>
                    <div className='container'>
                        <div className='row justify-content-center'>
                            <div className='col-md-8 p-3'>
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
                                        {formItems}
                                        </form>
                                        <div className='row'>
                                            <div className='col-md-2'>
                                                <button className='btn btn-primary' data-toggle='modal' data-target='#ToSModal' disabled={!isValid}>Save</button>
                                            </div>
                                            <div className='col-md-9'>
                                                <p className='m-0'>By clicking 'Save' you agree to having your information stored in a secure server, and that it will be provided to UHS upon request.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToSModal agree={this.agree} />
            </div>
        );
    }
}
