/*global grecaptcha*/
import React, { Component } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';

import { externalLogin } from '../../actions/authActions';

export default class ExtLogin extends Component {
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
            <Card.Body>
              <p className='h1 font-weight-light text-center'>Login without a CalNet ID</p>
              <Alert variant='danger' className={(this.state.success===false)?'':'d-none'}>
                Incorrect email or password
              </Alert>
              <Formik
                initialValues={{ email: '', password: '' }}
                validate={values => {
                  const errors = {};

                  if(!values.email) {
                    errors.email = 'email required!';
                  }

                  if(!values.password) {
                    errors.password = `password required!`;
                  }

                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  grecaptcha.ready(async () => {
                    try {
                      const token = await grecaptcha.execute(this.props.siteKey, {action: 'login'});
                      const { success } = await externalLogin(values, token);
                      setSubmitting(false);
                      this.setState({success: success});
                      if(!success) {
                      } else {
                        await this.props.reloadProfile();
                        this.props.history.push('/dashboard');
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
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type='password'
                        name='password'
                        placeholder='password'
                        className={(errors.password && touched.password)?'border-danger':''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                      />
                      <p className={`m-0 text-danger ${errors.password?'':'d-none'}`}>
                        {errors.password && touched.password && errors.password}
                      </p>
                    </Form.Group>
                    <Button type='submit' disabled={isSubmitting}>Submit</Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
        <Col></Col>
      </Row>
    );
  }
}
