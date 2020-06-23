import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default class AccessingResults extends Component {
  render() {
    return (
      <div>
        <Container>
          <p className='display-4 text-center'>Accessing Results</p>
          <p>
            All results will be sent to the email you used to register for this study using Virtru encryption.
            Please make sure to look for emails from <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a> with the subject line “Your IGI
            FAST Study Result” each week you get tested.
          </p>
          <p>
            You may also receive a phone call from a blocked or unknown number if your sample tests
            positive or inconclusive.
          </p>
          <p>
            Virtru is an email encryption service that we use to securely communicate your data to you.
            While it can be frustrating to have to go through extra steps to read the message, it is important
            that we protect your information. In most cases, you will only need to complete the below steps
            once. If you have cookies disabled or use alias emails, you may need to complete these steps
            multiple times.
          </p>
          <p>
            When you get a Virtru-encypted email, it will look like this:
          </p>
          <img src={}/>
        </Container>
      </div>
    );
  }
}
