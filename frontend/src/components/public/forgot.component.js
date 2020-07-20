/*global grecaptcha*/
import React, { Component } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';

import { externalForgotPassword } from '../../actions/authActions';

export default class Forgot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      success: null
    };
  }
  render() {
    return (
      <Row>
        <Col></Col>
        <Col lg={5} md={6} sm={7}>
          <Card>
            <Card.Body className={this.state.success!==true?'':'d-none'}>
              <p className='h1 font-weight-light text-center'>Forgot password</p>
              <p>
                Enter your email below, and we'll send you an email with
                instructions for reseting your password.
              </p>
              <Formik
                initialValues={{ email: '' }}
                validate={values => {
                  const errors = {};

                  if(!values.email) {
                    errors.email = 'email required';
                  }

                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  grecaptcha.ready(async () => {
                    try {
                      const token = await grecaptcha.execute(this.props.siteKey, {action: 'forgot'});
                      const { success } = await externalForgotPassword(values, token);
                      this.setState({success: success});
                      setSubmitting(false);
                      if(!success) {
                        alert(`Oops! There was a problem. Please try again!`);
                      }
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
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type='email'
                        name='email'
                        placeholder='email'
                        className={(errors.email && touched.email)?'border-danger':''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      <p className={`m-0 text-danger ${errors.email?'':'d-none'}`}>
                        {errors.email && touched.email && errors.email}
                      </p>
                    </Form.Group>
                    <Button type='submit' disabled={isSubmitting}>Submit</Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Body className={this.state.success!==true?'d-none':''}>
              <p className='h1 font-weight-light'>Forgot password email sent</p>
              <p>
                You should receive an email shortly with instructions on how
                to reset your password. Make sure to check spam if you aren't
                receiving the email.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col></Col>
      </Row>
    );
  }
}
