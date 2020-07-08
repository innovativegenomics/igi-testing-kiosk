import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';

export default class ExternalLogin extends Component {
  render() {
    return (
      <Row className='justify-content-center'>
        <Col md='2'/>
        <Col md>
          <Card>
            <Card.Body>
              <p className='display-4 text-center'>IGI FAST Sign In</p>
              <Formik
                initialValues={{ email: '', password: '' }}
                validate={values => {
                  const errors = {};

                  if (!values.email) {
                    errors.email = '*Required';
                  } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                  ) {
                    errors.email = 'Invalid email address';
                  }

                  if(!values.password) {
                    errors.password='*Required';
                  }

                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                  }, 400);
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
                    <Form.Group as={Row} className='mb-0'>
                      <Form.Label column sm={2}>Email</Form.Label>
                      <Col>
                        <Form.Control
                          type='email'
                          name='email'
                          placeholder='email'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                          className={(touched.email && errors.email)?'border-danger':''}
                        />
                        <p className='text-danger'>{errors.email && touched.email && errors.email}</p>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-0'>
                      <Form.Label column sm={2}>Password</Form.Label>
                      <Col>
                        <Form.Control
                          type='password'
                          name='password'
                          placeholder='password'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.password}
                          className={(touched.password && errors.password)?'border-danger':''}
                        />
                        <Row className='mb-0'>
                          <Col sm='auto' className={(touched.password && errors.password)?'':'d-none'}>
                            <p className='text-danger'>{errors.password && touched.password && errors.password}</p>
                          </Col>
                          <Col>
                            {/* <Link>Forgot password</Link> */}
                          </Col>
                        </Row>
                      </Col>
                    </Form.Group>
                    <Row className='align-items-center'>
                      <Col sm='auto'>
                        <Button type='submit' disabled={isSubmitting}>
                          Sign in
                        </Button>
                      </Col>
                      <Col>
                        <Link to='/newaccount'>Don't have an account? Create one!</Link>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>


              {/* <Form>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type='email' placeholder='email'/>
                </Form.Group>
              </Form> */}
            </Card.Body>
          </Card>
        </Col>
        <Col md='2'/>
      </Row>
    );
  }
}
