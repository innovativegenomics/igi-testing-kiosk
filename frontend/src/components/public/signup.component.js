/*global grecaptcha*/
import React, { Component } from 'react';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';
import { Formik } from 'formik';

import { TrackedLink } from '../../tracker';
import { externalSignup } from '../../actions/authActions';

export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: null
    };
  }
  render() {
    return (
      <Container>
        <Card>
          <Card.Body className={(this.state.success===true)?`d-none`:``}>
            <p className='h1 font-weight-light'>
              IGI FAST Sign Up
            </p>
            <p>
              If you are interested in participating in the IGI FAST 
              study, but don't have a CalNet ID, you can sign up here.
              Please fill out the information below. Then, our study 
              coordinator will approve your request, and you will get 
              an email with instructions on how to create your account
              and schedule your first appointment. If you have any
              questions, you can contact our study coordinator, Alex Ehrenberg,
              at <TrackedLink ext to='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</TrackedLink>.
            </p>
            <Row>
              <Col lg={8}>
                <Formik
                  initialValues={{ name: '', email: '', confirmEmail: '', jobDescription: '', employer: '', workFrequency: '' }}
                  validate={values => {
                    const errors = {};
                    if(!values.name) {
                      errors.name = 'Required';
                    }

                    if (!values.email) {
                      errors.email = 'Required';
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                    ) {
                      errors.email = 'Invalid email address';
                    }

                    if(values.email !== values.confirmEmail && values.email) {
                      errors.confirmEmail = `Emails don't match!`;
                    }

                    return errors;
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    const {confirmEmail, ...data} = values;
                    console.log(this.props.siteKey);
                    grecaptcha.ready(async () => {
                      try {
                        const token = await grecaptcha.execute(this.props.siteKey, {action: 'signup'});
                        console.log(token);
                        const { success } = await externalSignup(data, token);
                        setSubmitting(false);
                        if(!success) {
                          alert(`Looks like that email address has already been used...`);
                        }
                        this.setState({
                          success: success
                        });
                      } catch(err) {
                        console.error('Error getting token');
                        console.error(err);
                        alert(`Oops! There was a problem. Please try again!`);
                      }                   
                    });
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
                    /* and other goodies */
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Full name</Form.Label>
                        <Col>
                          <Form.Control
                            type='text'
                            name='name'
                            placeholder='full name'
                            className={(errors.name && touched.name)?'border-danger':''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.name}
                          />
                          <p className={`m-0 text-danger ${errors.name?'':'d-none'}`}>
                            {errors.name && touched.name && errors.name}
                          </p>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Email</Form.Label>
                        <Col>
                          <Form.Control
                            type='email'
                            name='email'
                            placeholder='email'
                            className={(errors.email && touched.email)?'border-danger':''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                          />
                          <p className={`m-0 text-danger`}>
                            {errors.email && touched.email && errors.email}
                          </p>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Confirm email</Form.Label>
                        <Col>
                          <Form.Control
                            type='email'
                            name='confirmEmail'
                            placeholder='confirm email'
                            className={(errors.confirmEmail && touched.confirmEmail)?'border-danger':''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.confirmEmail}
                          />
                          <p className={`m-0 text-danger`}>
                            {errors.confirmEmail && touched.confirmEmail && errors.confirmEmail}
                          </p>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Job description</Form.Label>
                        <Col>
                          <Form.Control
                            as='textarea'
                            name='jobDescription'
                            rows='3'
                            placeholder='job description'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.jobDescription}
                          />
                          <Form.Text muted>
                            What does your job on the UC Berkeley campus entail?
                          </Form.Text>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Employer</Form.Label>
                        <Col>
                          <Form.Control
                            type='text'
                            name='employer'
                            placeholder='employer'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.employer}
                          />
                          <Form.Text muted>
                            Who is your employer?
                          </Form.Text>
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row}>
                        <Form.Label column lg={3}>Time on campus</Form.Label>
                        <Col>
                          <Form.Control
                            type='text'
                            name='workFrequency'
                            placeholder='time on campus'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.workFrequency}
                          />
                          <Form.Text muted>
                          How frequently do you expect to work on the UC Berkeley campus?
                          </Form.Text>
                        </Col>
                      </Form.Group>
                      <p>
                        By clicking "Sign up", I affirm that I am (1) approved by UC Berkeley to work
                        inside campus buildings as a government employee, other
                        UC campus or UCOP employee, contractor, or other service
                        worker and (2) expect to work on campus at least 2 days
                        per month.
                      </p>
                      <Button variant='primary' type='submit' disabled={isSubmitting}>Sign up</Button>
                    </Form>
                  )}
                </Formik>
              </Col>
              <Col lg></Col>
            </Row>
          </Card.Body>
          <Card.Body className={(this.state.success === true?``:`d-none`)}>
            <p className='h1 font-weight-light'>
              Request received!
            </p>
            <p>
              You have successfully requested to join the study!
              Our study coordinator will review your request, 
              and will notify you within 3 business days regarding 
              your request to enroll. If you are eligible for the 
              study, you will then be prompted to create an account 
              and schedule a testing appointment.
            </p>
            <p>
              If you have any questions or concerns, please contact the study
              coordinator, Alex Ehrenberg, at <TrackedLink ext to='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</TrackedLink>.
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}
