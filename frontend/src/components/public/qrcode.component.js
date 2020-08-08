import React, { Component } from 'react';
import qrcode from 'qrcode';
import moment from 'moment';
import qs from 'qs';

import { getUser } from '../../actions/authActions';

export default class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: '',
      query: qs.parse(this.props.location.search, { ignoreQueryPrefix: true })
    };
  }
  render() {
    if (this.state.img === '') {
      if (this.state.query.uid) {
        const scanUrl = window.location.protocol + '//' + window.location.host + '/admin/scanner?uid=' + this.state.query.uid;
        console.log(scanUrl);
        qrcode.toDataURL(scanUrl).then(res => {
          this.setState({ img: res });
        });
      }
    }
    return (
      <div>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-md-5'>
              <p className='h1 font-weight-light text-center'>
                {this.state.query.time?moment(this.state.query.time).format('MMMM Do, h:mm A'):''}
              </p>
              <p className='h1 font-weight-light text-center'>
                {this.state.query.location}
              </p>
              <img src={this.state.img} style={{ width: '100%' }} alt='QR code' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
