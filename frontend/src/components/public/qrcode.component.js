import React, { Component } from 'react';
import qrcode from 'qrcode';
import qs from 'qs';

import { getUser } from '../../actions/authActions';

export default class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: ''
    };
  }
  render() {
    if (this.state.img === '') {
      const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
      if (query.uid) {
        const scanUrl = window.location.protocol + '//' + window.location.host + '/admin/scanner?uid=' + query.uid;
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
              <img src={this.state.img} style={{ width: '100%' }} alt='QR code' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
