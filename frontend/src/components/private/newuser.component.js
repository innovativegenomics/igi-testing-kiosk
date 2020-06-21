import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import { validate as validateEmail } from 'email-validator';
import { postcodeValidator } from 'postcode-validator';
import moment from 'moment';

import ToSModal from './tos.component';

import { getUser, createUser } from '../../actions/authActions';
import { Redirect } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

const STATE_CODES = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
  'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
  'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
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
    placeholder: 'MM/DD/YYYY',
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
    type: 'PHONE',
    title: 'Phone',
    placeholder: '(123) 456 7891',
    required: false,
    validFunc: v => {
      try {
        return PhoneNumberUtil.getInstance().isValidNumber(PhoneNumberUtil.getInstance().parse(v, 'US'));
      } catch (err) {
        return false;
      }
    }
  },
  addressLabel: {
    type: 'LABEL',
    title: 'Local Residence'
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
    required: true,
    validFunc: v => v.length < 81
  },
  zip: {
    type: 'TEXT',
    title: 'Zip Code',
    required: true,
    validFunc: v => v.length < 21 && postcodeValidator(v, 'US')
  },
};

class TextInput extends Component {
  isValid = v => {
    return (!this.props.required && v === '') || (v !== '' && this.props.validFunc(v));
  }
  render() {
    return (
      <div className={`form-group row ${this.props.required ? 'required' : ''}`}>
        <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
        <div className='col-md-9'>
          <input type='text' className={`form-control ${(this.props.valid || this.props.value === '') ? '' : 'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder || this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off' />
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
    if (this.isDateSupported()) {
      return (
        <div className={`form-group row ${this.props.required ? 'required' : ''}`}>
          <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
          <div className='col-md-9'>
            <input type='date' className={`form-control ${(this.props.valid || this.props.value === '') ? '' : 'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder || this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off' />
          </div>
        </div>
      );
    } else {
      return (
        <div className={`form-group row ${this.props.required ? 'required' : ''}`}>
          <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
          <div className='col-md-9'>
            <input type='text' className={`form-control ${(this.props.valid || this.props.value === '') ? '' : 'border-danger'}`} id={this.props.name} placeholder={this.props.placeholder || this.props.title} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value} autoComplete='off' autoCorrect='off' />
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
      <div className={`form-group row ${this.props.required ? 'required' : ''}`}>
        <label htmlFor={this.props.name} className='col-md-3 col-form-label'>{this.props.title}</label>
        <div className='col-md-9'>
          <select id={this.props.name} className={`form-control ${(this.props.valid || this.props.value === '') ? '' : 'border-danger'}`} onChange={e => this.props.update(e.target.value, this.isValid(e.target.value))} value={this.props.value}>
            <option value=''>--none--</option>
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

export default class NewUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      unauthed: false,
      success: false,
      showTerms: true,
      questions: [null, null, null, null],
      showNoReturnError: false,
      showConsentError: false,
      canReturn: false,
    };
    for (var i in USER_INFO) {
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
    this.setState({ showTerms: false });
    if (!this.state.questions[0]) {
      return this.setState({ showConsentError: true });
    }
  }
  disagree = () => {
    this.setState({ showTerms: false });
    window.open('/api/users/logout', '_self');
  }
  submit = () => {
    // create user
    if (!this.state.canReturn) {
      return this.setState({ showNoReturnError: true });
    }
    const payload = {};
    Object.keys(this.state.user).forEach(k => {
      if (this.state.user[k].type === 'LABEL') {
        return;
      } else if (this.state.user[k].type === 'DATE') {
        console.log(this.state.user[k].value);
        payload[k] = moment.utc(this.state.user[k].value).set('hour', 0).set('minute', 0).set('second', 0);
      } else if(this.state.user[k].type === 'PHONE') {
        payload[k] = PhoneNumberUtil.getInstance().format(PhoneNumberUtil.getInstance().parse(this.state.user[k].value, 'US'), PhoneNumberFormat.E164);
      } else {
        payload[k] = this.state.user[k].value;
      }
    });
    payload.questions = this.state.questions;
    createUser(payload).then(res => {
      if (!res) {
        // Handle error!
      } else {
        this.setState({ success: true });
      }
    });
  }

  componentDidMount() {
    getUser().then(res => {
      this.setState({ unauthed: res.unauthed, success: res.success });
    });
  }

  render() {
    if (this.state.unauthed) {
      return <Redirect to='/' />
    } else if (this.state.success) {
      return <Redirect to='/dashboard' />
    }
    var isValid = true;
    const formItems = [];
    Object.keys(this.state.user).forEach(k => {
      if (!this.state.user[k].valid) {
        isValid = false;
      }
      switch (this.state.user[k].type) {
        case 'TEXT':
          formItems.push(<TextInput required={this.state.user[k].required}
            title={this.state.user[k].title}
            validFunc={this.state.user[k].validFunc}
            valid={this.state.user[k].valid}
            value={this.state.user[k].value}
            update={(value, valid) => {
              const update = { ...this.state.user };
              update[k].value = value;
              update[k].valid = valid;
              this.setState({ user: update });
            }}
            placeholder={this.state.user[k].placeholder}
            name={k}
            key={k} />);
          break;
        case 'PHONE':
          formItems.push(<TextInput required={this.state.user[k].required}
            title={this.state.user[k].title}
            validFunc={this.state.user[k].validFunc}
            valid={this.state.user[k].valid}
            value={this.state.user[k].value}
            update={(value, valid) => {
              const update = { ...this.state.user };
              update[k].value = value;
              update[k].valid = valid;
              this.setState({ user: update });
            }}
            placeholder={this.state.user[k].placeholder}
            name={k}
            key={k} />);
          break;
        case 'DATE':
          formItems.push(<DateInput required={this.state.user[k].required}
            title={this.state.user[k].title}
            validFunc={this.state.user[k].validFunc}
            valid={this.state.user[k].valid}
            value={this.state.user[k].value}
            update={(value, valid) => {
              const update = { ...this.state.user };
              update[k].value = value;
              update[k].valid = valid;
              this.setState({ user: update });
            }}
            placeholder={this.state.user[k].placeholder}
            name={k}
            key={k} />);
          break;
        case 'SELECT':
          formItems.push(<SelectInput required={this.state.user[k].required}
            title={this.state.user[k].title}
            validFunc={this.state.user[k].validFunc}
            valid={this.state.user[k].valid}
            value={this.state.user[k].value}
            update={(value, valid) => {
              const update = { ...this.state.user };
              update[k].value = value;
              update[k].valid = valid;
              this.setState({ user: update });
            }}
            options={this.state.user[k].options}
            placeholder={this.state.user[k].placeholder}
            name={k}
            key={k} />);
          break;
        case 'LABEL':
          formItems.push(<p className='lead w-100 text-center' key={k}>{this.state.user[k].title}</p>);
          break;
      }
    });
    return (
      <div>
        <div>
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
                      <div className='form-group row'>
                        <label htmlFor='clearedToReturn' className='col-md-3 col-form-label'>
                          I confirm that I have been approved to return to campus.
                                                </label>
                        <input type='checkbox' onChange={e => this.setState({ canReturn: !this.state.canReturn })} value={this.state.canReturn} />
                      </div>
                    </form>
                    <div className='row'>
                      <div className='col-md-2'>
                        <button className='btn btn-primary' onClick={this.submit} disabled={!isValid}>Submit</button>
                      </div>
                      <div className='col-md-9'>
                        <p className='m-0'>
                          By clicking “submit” I affirm that I have read and understood the above consent
                          document, and have answered all questions truthfully and accurately.
                                                </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToSModal onAccept={this.agree}
          onClose={this.disagree}
          questions={this.state.questions}
          select={(i, v) => {
            console.log(i + ';' + v);
            const questions = this.state.questions;
            questions[i] = v;
            this.setState({ questions: questions })
          }
          } show={this.state.showTerms} />
        <Modal show={this.state.showNoReturnError}>
          <Modal.Header>
            <Modal.Title>
              Alert
                        </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You must be approved for on-campus work to participate in this study. If you receive approval at a later
              date, you may complete this enrollment process again.
                        </p>
            <p>
              If you have questions related to your health or receiving clinical COVID-19 testing, please see
                            <a href='https://uhs.berkeley.edu/coronavirus-covid-19-information'>https://uhs.berkeley.edu/coronavirus-covid-19-information</a>.
                        </p>
            <p>
              If you have other questions related to this study, please contact the study coordinator, Alexander
                            Ehrenberg, at <a href='mailto:igistudy@berkeley.edu'>igistudy@berkeley.edu</a>.
                        </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={e => window.open('/api/users/logout', '_self')}>Ok</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showConsentError} backdrop='static' keyboard={false} size='lg'>
          <Modal.Header>
            <Modal.Title>
              Alert
                        </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You have indicated that you do not wish to have your saliva samples and associated data to detect SARS-
              CoV-2 infection and be contacted with your results. As such, you are declining to enroll in this study. You
              may enroll at a later date if you change your mind or this was done in error.
                        </p>
            <p>
              If you have questions related to your health or receiving clinical COVID-19 testing, please see
                            <a href='https://uhs.berkeley.edu/coronavirus-covid-19-information'>https://uhs.berkeley.edu/coronavirus-covid-19-information</a>.
                        </p>
            <p>
              If you have other questions related to this study, please contact the study coordinator, Alexander
                            Ehrenberg, at <a href='mailto:igistudy@berkeley.edu'>igistudy@berkeley.edu</a>.
                        </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={e => window.open('/api/users/logout', '_self')}>Ok</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
