import React from 'react';
import '../stylesheets/Footer.less';
import { Dropdown, Menu, Icon } from 'antd';
import tip from '../assets/images/tip.png';
import sendImage from '../assets/images/send-image.png';
export default class Footer extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isShift: false,
    }
  }
  alwaysUseReplay = () => {
    this.props.alwaysUseReplay();
  }
  showSendImage = () => {
    this.props.showSendImage()
  }
  replyRemark = () => {
    let content = this.refs.reply.value;
    this.props.replyRemark(content)
  }
  keyDown = (e) => {
    let { isShift } = this.state;
    let self = this;
    let flag = 1
    if (e.keyCode === 16 || isShift) {
        self.state.isShift = true
        setTimeout(() => {
            self.state.isShift = false
        }, 200)
    } else if (e.keyCode === 13) {
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
        if (flag === 1) {
        this.props.replyRemark(content)
        }
    }
  }
  clearvalue = () => {
    this.refs.reply.value = ''
  }
  abOperate = () => {
    this.props.abOperate()
  }
  // 显示报价弹窗
  insertPrice = () => {
    this.props.openInsertModal()
  }
  render () {
    let {baseInfo} = this.props;
    const menu = (
      <Menu onClick={this.alwaysUseReplay}>
        <Menu.Item>已收到您的询价，很高兴为你效劳！</Menu.Item>
        <Menu.Item>不用验车</Menu.Item>
        <Menu.Item>需要验车</Menu.Item>
        <Menu.Item>已收到您的款项</Menu.Item>
        <Menu.Item>请您提供一下行驶证正副本</Menu.Item>
        <Menu.Item>请问您需要怎么给您邮寄保单？</Menu.Item>
        <Menu.Item>请您提供一下身份证正反面信息</Menu.Item>
        <Menu.Item>请先认证业务员，在小程序内点击-我-点击去认证</Menu.Item>
      </Menu>
    )
    return (
      <div className='footer-container'>
        <div className='always-container'>
          <div className='left'>
            <img className='left-icon' src={sendImage} onClick={this.showSendImage} />
          </div>
          <Dropdown  overlay={menu} placement="bottomRight">
            <div className='always-use'>
              <span style={{ color: '#666666' }}>快捷回复</span> <Icon type="down" />
            </div>
          </Dropdown>
        </div>
        <div className='input-container'>
          <textarea ref='reply' className='input-content' type="text" cols='7'
            placeholder="请输入..."
            onKeyDown={(e) => { this.keyDown(e) }}>
          </textarea>
          <div className='operate-container'>
            {/* <div className='left' onClick={this.abOperate} style={{ visibility: (Number(baseInfo.status) != -9) ? 'visible' : 'hidden' }}>
              <img src={tip} className="left-tip"/>
              <span>关闭或转接</span>
            </div> */}
            <div className='left' onClick={this.insertPrice}>
              {/* <img src={tip} className="left-tip"/> */}
              <span>插入报价</span>
            </div>
            <div className='right'>
              <button className='btn-default' onClick={() => { this.replyRemark() }}>发表回复</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}