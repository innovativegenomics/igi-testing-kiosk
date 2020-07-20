/*global grecaptcha*/
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';
import qs from 'qs';

import { externalSetPassword } from '../../actions/authActions';

export default class Create extends Component {
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
              <p className='h1 font-weight-light text-center'>Set a new password</p>
              <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validate={values => {
                  const errors = {};

                  if(!values.password) {
                    errors.password = 'Password cannot be blank!';
                  } else if (values.password.length < 8) {
                    errors.password = 'Password must have at least 8 characters!';
                  } else if (!/\d/.test(values.password)) {
                    errors.password = 'Password must contain at least one number';
                  }

                  if(values.password !== values.confirmPassword && values.password) {
                    errors.confirmPassword = `Passwords don't match!`;
                  }

                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
                  const uid = query.uid;
                  grecaptcha.ready(async () => {
                    try {
                      const token = await grecaptcha.execute(this.props.siteKey, {action: 'create'});
                      const { success } = await externalSetPassword(values, uid, token);
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
                      <Form.Label>New password</Form.Label>
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
                    <Form.Group>
                      <Form.Label>Confirm password</Form.Label>
                      <Form.Control
                        type='password'
                        name='confirmPassword'
                        placeholder='confirm password'
                        className={(errors.confirmPassword && touched.confirmPassword)?'border-danger':''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.confirmPassword}
                      />
                      <p className={`m-0 text-danger ${errors.confirmPassword?'':'d-none'}`}>
                        {errors.confirmPassword && touched.confirmPassword && errors.confirmPassword}
                      </p>
                    </Form.Group>
                    <Button type='submit' disabled={isSubmitting}>Submit</Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Body className={this.state.success!==true?'d-none':''}>
              <p className='h1 font-weight-light'>Password set successfully!</p>
              <p>
                Your password was set successfully! You can now log in.
                The first time you log in, you will be asked to enter
                your information for the study.
              </p>
              <Link to='/extlogin' className='btn btn-primary'>Log in</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col></Col>
      </Row>
    );
  }
}
