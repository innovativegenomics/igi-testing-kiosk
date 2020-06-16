import React, { Component } from 'react';
import qrcode from 'qrcode';
import qs from 'qs';

import { Container, Row, Col } from 'react-bootstrap';

import Navbar from '../navbar.component';

export default class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: '',
      authed: false,
      loaded: false,
      loading: false
    };
  }
  render() {
    if (this.state.img === '') {
      const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
      if (query.uid) {
        const scanUrl = window.location.protocol + '//' + window.location.host + '/scanner?uid=' + query.uid;
        console.log(scanUrl);
        qrcode.toDataURL(scanUrl, { errorCorrectionLevel: 'H' }).then(res => {
          this.setState({ img: res });
        });
      }
    }
    return (
      <div>
        <Navbar authed={this.state.authed} />
        <Container>
          <Row className='justify-content-center'>
            <Col md='5'>
              <img src={this.state.img} style={{ width: '100%' }} alt='QR code' />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
