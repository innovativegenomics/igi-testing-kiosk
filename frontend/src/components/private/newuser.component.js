import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Container, Form, Col, Row, Card, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import moment from 'moment';
import { postcodeValidator } from 'postcode-validator';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';


import { TrackedLink } from '../../tracker';
import ToSModal from './tos.component';
import { createUser } from '../../actions/authActions';

class TextInput extends Component {
  render() {
    return (
      <Form.Group as={Row} className={this.props.required?'required':''}>
        <Form.Label column md='3' lg='2'>
          {this.props.label}
        </Form.Label>
        <Col>
          <Form.Control
            type='text'
            name={this.props.name}
            placeholder={this.props.placeholder}
            className={(this.props.errors[this.props.name] && this.props.touched[this.props.name])?'border-danger':''}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            value={this.props.values[this.props.name]}
          />
          <p className={`m-0 text-danger ${this.props.errors[this.props.name]?'':'d-none'}`}>
            {this.props.errors[this.props.name] && this.props.touched[this.props.name] && this.props.errors[this.props.name]}
          </p>
        </Col>
      </Form.Group>
    );
  }
}

class EmailInput extends Component {
  render() {
    return (
      <Form.Group as={Row} className={this.props.required?'required':''}>
        <Form.Label column md='3' lg='2'>
          {this.props.label}
        </Form.Label>
        <Col>
          <Form.Control
            type='email'
            name={this.props.name}
            placeholder={this.props.placeholder}
            className={(this.props.errors[this.props.name] && this.props.touched[this.props.name])?'border-danger':''}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            value={this.props.values[this.props.name]}
          />
          <p className={`m-0 text-danger ${this.props.errors[this.props.name]?'':'d-none'}`}>
            {this.props.errors[this.props.name] && this.props.touched[this.props.name] && this.props.errors[this.props.name]}
          </p>
        </Col>
      </Form.Group>
    );
  }
}

class NumberInput extends Component {
  render() {
    return (
      <Form.Group as={Row} className={this.props.required?'required':''}>
        <Form.Label column md='3' lg='2'>
          {this.props.label}
        </Form.Label>
        <Col>
          <Form.Control
            type='number'
            min='0'
            step='1'
            name={this.props.name}
            placeholder={this.props.placeholder}
            className={(this.props.errors[this.props.name] && this.props.touched[this.props.name])?'border-danger':''}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            value={this.props.values[this.props.name]}
          />
          <p className={`m-0 text-danger ${this.props.errors[this.props.name]?'':'d-none'}`}>
            {this.props.errors[this.props.name] && this.props.touched[this.props.name] && this.props.errors[this.props.name]}
          </p>
        </Col>
      </Form.Group>
    );
  }
}

class SelectInput extends Component {
  render() {
    return (
      <Form.Group as={Row} className={this.props.required?'required':''}>
        <Form.Label column md='3' lg='2'>
          {this.props.label}
        </Form.Label>
        <Col>
          <Form.Control
            as='select'
            name={this.props.name}
            className={(this.props.errors[this.props.name] && this.props.touched[this.props.name])?'border-danger':''}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            value={this.props.values[this.props.name]}
          >
            {this.props.options.map(v => <option>{v}</option>)}
          </Form.Control>
          <p className={`m-0 text-danger ${this.props.errors[this.props.name]?'':'d-none'}`}>
            {this.props.errors[this.props.name] && this.props.touched[this.props.name] && this.props.errors[this.props.name]}
          </p>
        </Col>
      </Form.Group>
    );
  }
}

class DateInput extends Component {
  render() {
    return (
      <Form.Group as={Row} className={this.props.required?'required':''}>
        <Form.Label column md='3' lg='2'>
          {this.props.label}
        </Form.Label>
        <Col>
          <Form.Control
            type='date'
            placeholder='MM/DD/YYYY'
            name={this.props.name}
            className={(this.props.errors[this.props.name] && this.props.touched[this.props.name])?'border-danger':''}
            onChange={this.props.handleChange}
            onBlur={this.props.handleBlur}
            value={this.props.values[this.props.name]}
          />
          <p className={`m-0 text-danger ${this.props.errors[this.props.name]?'':'d-none'}`}>
            {this.props.errors[this.props.name] && this.props.touched[this.props.name] && this.props.errors[this.props.name]}
          </p>
        </Col>
      </Form.Group>
    );
  }
}

export default class NewUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [true, true, true, true, null],
      showToS: true,
      showDeclineTerms: false,
      success: null
    };
  }
  agree = () => {
    this.setState({ showToS: false });
    if (!this.state.questions[0]) {
      return this.setState({ showDeclineTerms: true });
    }
  }
  disagree = () => {
    this.setState({ showToS: false, showDeclineTerms: true });
  }
  render() {
    if (!this.props.auth.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (this.props.auth.unauthed) {
      return <Redirect to='/' />
    } else if (this.state.success || this.props.auth.success) {
      return <Redirect to='/dashboard' />
    }

    if(this.state.success === true) {
      return <Redirect to='/dashboard' />;
    }

    return (
      <>
        <Container>
          <Row className='justify-content-center'>
          <Col>
          <Card>
          <Card.Body>
            <Card.Title className='text-center'>New User Form</Card.Title>
            <Formik
              initialValues={{
                firstname: '',
                middlename: '',
                lastname: '',
                sex: '--none--',
                dob: '',
                street: '',
                city: '',
                state: 'CA',
                zip: '',
                county: '',
                email: '',
                phone: '',
                affiliation: '--none--',
                pbuilding: '',
                housing: '--none--',
                residents: 0
              }}
              validate={values => {
                const errors = {};
                if (!values.firstname) {
                  errors.firstname = 'Required';
                }
                if (!values.lastname) {
                  errors.lastname = 'Required';
                }
                if (values.sex === '--none--') {
                  errors.sex = 'Required';
                }

                if(values.dob === '') {
                  errors.dob = 'Required';
                } else if(moment(values.dob).isBefore(moment().set('year', 1900))) {
                  errors.dob = 'Invalid';
                } else if(moment(values.dob).isAfter(moment().subtract(18, 'years'))) {
                  errors.dob = 'You must be 18 or older to participate in the study. In the future, we will be updating the study to allow those under 18 to enroll. If you have questions, please contact Alex Ehrenberg at igi-fast@berkeley.edu';
                }

                if(!values.street) errors.street = 'Required';
                if(!values.city) errors.city = 'Required';
                if(!values.zip) errors.zip = 'Required'; else if (!postcodeValidator(values.zip, 'US')) errors.zip = 'Invalid';
                if(!values.county) errors.county = 'Required';

                if (!values.email) {
                  errors.email = 'Required';
                } else if (
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                  errors.email = 'Invalid email address';
                }

                if(!values.phone) {
                  errors.phone = 'Required';
                } else if(!PhoneNumberUtil.getInstance().isValidNumber(PhoneNumberUtil.getInstance().parse(values.phone, 'US'))) {
                  errors.phone = 'Invalid';
                }

                if(values.affiliation === '--none--') errors.affiliation = 'Required';

                if(values.housing === '--none--') errors.housing = 'Required';

                return errors;
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const payload = {
                  ...values,
                  phone: PhoneNumberUtil.getInstance().format(PhoneNumberUtil.getInstance().parse(values.phone, 'US'), PhoneNumberFormat.E164)
                };
                payload.questions = this.state.questions;
                const res = await createUser(payload);
                if(!res.success) {
                  this.setState({ success: false });
                  setSubmitting(false);
                } else {
                  await this.props.reloadProfile();
                  this.setState({ success: true });
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                submitCount,
                isValid,
                /* and other goodies */
              }) => (
                <Form onSubmit={handleSubmit}>
                  <TextInput
                    name='firstname'
                    placeholder='first name'
                    label='First name'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <TextInput
                    name='middlename'
                    placeholder='middle name'
                    label='Middle name'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                  <TextInput
                    name='lastname'
                    placeholder='last name'
                    label='Last name'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <SelectInput
                    name='sex'
                    label='Sex'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    options={['--none--', 'Female', 'Male', 'Other', 'Unspecified']}
                    required
                  />
                  <DateInput
                    name='dob'
                    label='Date of Birth'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <p className='text-center lead'>Address of local residence</p>
                  <TextInput
                    name='street'
                    placeholder='street'
                    label='Street'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <TextInput
                    name='city'
                    placeholder='city'
                    label='City'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <SelectInput
                    name='state'
                    label='State'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    options={[
                      'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
                      'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
                      'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
                      'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
                      'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
                    ]}
                    required
                  />
                  <TextInput
                    name='zip'
                    placeholder='zip'
                    label='Zip code'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <TextInput
                    name='county'
                    placeholder='county'
                    label='County'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <p className='text-center lead'>Contact</p>
                  <EmailInput
                    name='email'
                    placeholder='email'
                    label='Email'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <TextInput
                    name='phone'
                    placeholder='(123) 456 7890'
                    label='Phone number'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <SelectInput
                    name='affiliation'
                    label='Campus affiliation'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    options={['--none--', 'Undergraduate student', 'Graduate student', 'Academic staff', 'Non-Academic Staff']}
                    required
                  />
                  <TextInput
                    name='pbuilding'
                    placeholder='primary building'
                    label='Primary campus building'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                  <SelectInput
                    name='housing'
                    label='Housing situation'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    options={[
                      '--none--',
                      'Campus dorm',
                      'Campus apartment',
                      'Greek housing',
                      'Co-operative housing',
                      'Off-campus apartment/house',
                      'Experiencing homelessness'
                    ]}
                    required
                  />
                  <NumberInput
                    name='residents'
                    placeholder='individuals'
                    label='How many individuals do you live with? (same mailing address)'
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    required
                  />
                  <Alert variant='warning' className={submitCount>0&&!isValid?'':'d-none'}>
                    Some fields aren't completely filled out!
                    Please go back and fix the displayed issues.
                  </Alert>
                  <Alert variant='danger' className={this.state.success===false?'':'d-none'}>
                    There was an error submitting the form. Please try again!
                    If the problem persists, please click the "Report an issue"
                    link at the bottom of the page.
                  </Alert>
                  <Row>
                    <Col sm='auto'>
                      <Button type='submit' disabled={isSubmitting}>Submit</Button>
                    </Col>
                    <Col>
                      <p className='m-0'>
                        By clicking “submit” I affirm that I have read and understood
                        the above consent document, and have answered all questions truthfully and accurately.
                      </p>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </Card.Body>
          </Card>
          </Col>
          </Row>
        </Container>
        <ToSModal onAccept={this.agree}
          onClose={this.disagree}
          questions={this.state.questions}
          select={(i, v) => {
            const questions = this.state.questions;
            questions[i] = v;
            this.setState({ questions: questions });
          }
          } show={this.state.showToS}
        />
        <Modal show={this.state.showDeclineTerms} backdrop='static' keyboard={false} size='lg'>
          <Modal.Header>
            <Modal.Title>Declined Study Terms</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className='lead'>
              You have indicated that you do not wish to have your
              saliva samples and associated data to detect SARS-CoV-2
              infection and be contacted with your results. As such, 
              you are declining to enroll in this study. You may 
              enroll at a later date if you change your mind or this 
              was done in error.
            </p>
            <p className='lead'>
              If you have questions related to your health or
              receiving clinical COVID-19 testing, please
              see <TrackedLink ext to='https://uhs.berkeley.edu/coronavirus-covid-19-information'>https://uhs.berkeley.edu/coronavirus-covid-19-information</TrackedLink>
            </p>
            <p className='lead'>
              If you have other questions related to this study, please
              contact the study coordinator, Alexander Ehrenberg, at <TrackedLink ext to='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</TrackedLink>.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <TrackedLink className='btn btn-primary' ext to='/api/users/logout'>Ok</TrackedLink>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

