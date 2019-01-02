import React from 'react';
import '../stylesheets/MpModal.less';
import {Icon, Button } from 'antd';
export default class MpMpdal extends React.Component {
  constructor (props) {
    super(props);
  }
  cancel = () => {
    this.props.cancel();
  }
  sure = () => {
    this.props.sure();
  }
  render () {
    let {title, isShowFooter} = this.props;
    return(
      <div className='modal-wrapper'>
        <div className='modal-container'>
          <div className='title-wrapper'>
            <span>{title || ''}</span>
            <Icon type="close" onClick={this.cancel} />
          </div>
          <div className='modal-content-container'>
            {this.props.children}
          </div>
          {
            isShowFooter
            ? null
            : <div className='modal-footer'>
                <Button type="primary" className='foot-btn' onClick={this.sure}>确认</Button>
                <Button className='foot-btn' onClick={this.cancel}>取消</Button>
              </div>
          }
        </div>
      </div>
    )
  }
}