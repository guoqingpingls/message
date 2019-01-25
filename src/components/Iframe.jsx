import React from 'react';
// import MpModal from '../component/MpModal';
import '../stylesheets/Iframe.less';
import {message, Spin, Icon} from 'antd';
const { openNavUrl } = require('../util/util.js');
export default class Iframe extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount () {
    let self = this;
    window.receiveMessageFromIndex = function ( {data} ) {
      self.props.closeIframe();
      if(data != undefined){
        if (!data.ret && data.msg && data.msg.length) {
          self.props.showModalInfo(data.msg)
        }
      }
    }
    //监听message事件
    window.addEventListener("message", receiveMessageFromIndex, false);
  }
  componentWillUnmount () {
    window.removeEventListener("message", receiveMessageFromIndex, false);
  }
  cancel = () => {
    this.props.closeIframe();
  }
  render () {
    let {iframeSrc} = this.props;
    return (
      <div className='iframe-wrapper'>
        <div className='iframe-content'>
          <Icon type="close" onClick={this.cancel} className='close-icon' />
          <Spin tip='正在引导去报价页面 ...' size='large'></Spin>
        </div>
        <iframe className='iframe-container' id='calculation' src={iframeSrc} />
      </div>
    )
  }
}