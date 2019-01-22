import React from 'react';
import axios from 'axios';
import '../stylesheets/Footer.less';
import {isEmptyObject} from '../util/util.js';
import { Dropdown, Menu, Icon } from 'antd';
import tip from '../assets/images/tip.png';
import sendImage from '../assets/images/send-image.png';
import operateIcon from '../assets/images/open-operate.png';
import operateIconActive from '../assets/images/open-operate-active.png';
import abIcon from '../assets/images/ab-icon.png';
// import guide from '../assets/images/setting-guide.png';
export default class Footer extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isShift: false,
      jobnoList: [],
      isShowOperate: true,    // 显示报价栏
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
  // 获取工号 1. 保险公司点击显示 2. 首页显示
  getJobNo = (insuranceItem) => {
    let {cid} = this.props
    let params = `?customerId=${cid}`
    let isInsurance = false
    if (insuranceItem && isEmptyObject(insuranceItem)) {
      isInsurance = true
      params = `${params}&supplierId=${insuranceItem.id}&all=1`
    }
    axios({
      method: 'get',
      url: `http://insbak.ananyun.net/zongan/GetSettingJobNos${params}`
      // url: `http://pre2.insbak.ananyun.net/zongan/GetSettingJobNos${params}`
    }).then(({data}) => {
      if (data.ResultCode === 1 && data.jobNos && data.jobNos.length) {
        let  jobnoList = data.jobNos.map((item) => {
          if (isInsurance) {
            return ({
              id: item.SupplierId,
              name: item.Remark && item.Remark.length ? `${item.Remark}-${item.LoginName}` : item.LoginName,
              icon: `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item.SupplierId}.jpg`,
              PartnerId: item.PartnerId,
              jobnoid: item.JobNOId
            })
          } else {
            let LoginName = item.Remark && item.Remark.length ? `-${item.Remark}-${item.LoginName}` :`-${item.LoginName}`
            return ({
              id: item.SupplierId,
              name: item.Partner.PartnerName + LoginName,
              icon: `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item.SupplierId}.jpg`,
              PartnerId: item.PartnerId,
              jobnoid: item.JobNOId
            })
          }
        })
        if (isInsurance) {
          self.setState({
            chooseTitle: item.name,
            isShowJobNo: true,
            chooseList: jobnoList
          })
        } else {
          self.setState({
            jobnoList: jobnoList
          })
        }
      }
    })
  }
  render () {
    let {baseInfo} = this.props;
    let {isShowOperate} = this.state;
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
            <img className='left-icon' src={sendImage} onClick={this.showSendImage}></img>
            <img className='left-icon' src={isShowOperate ? operateIconActive : operateIcon} onClick={this.showOperate}></img>
            <img className='left-icon' src={abIcon} onClick={this.abOperate}></img>
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