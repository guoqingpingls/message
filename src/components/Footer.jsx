import React from 'react';
import axios from 'axios';
import ChooseJobNo from '../views/ChooseJobNo'
import Iframe from './Iframe'
import '../stylesheets/Footer.less';
import {isEmptyObject} from '../util/util.js';
import { Dropdown, Menu, Icon, Row, Col, Tooltip, Modal } from 'antd';
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
      // jobnoList: [],
      isShowOperate: true,    // 显示报价栏
      isShowJobnoModal: false,
      isShowInsuranceModal: false,
      isShowIframe: false,    // 显示Iframe
      iframeSrc: '',
      allInsuranceCp: [],
      // isShowJobNo: false
    }
  }
  // componentDidMount () {
  //   this.getJobNo()
  // }
  // componentWillReceiveProps (nextProps) {
  //   if (this.props.allInsuranceCp !== nextProps.allInsuranceCp) {
  //     this.setState({
  //       allInsuranceCp: nextProps.allInsuranceCp
  //     })
  //   }
  // }
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
        this.replyRemark()
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
    this.props.getJobNo(insuranceItem)
  }
  // 关闭保司 &&　选择工号 弹窗
  closeModal = () => {
    let {isShowJobnoModal, isShowInsuranceModal} = this.state;
    if (isShowJobnoModal || isShowInsuranceModal) {
      this.setState({
        isShowJobnoModal: false,
        isShowInsuranceModal: false
      })
    }
  }
  // 显示选择工号弹窗
  showJobnoModal = (e) => {
    e.stopPropagation();
    this.setState({
      isShowJobnoModal: true,
      isShowInsuranceModal: false
    })
  }
  // 去ai报价
  toAiQuote = (item) => {
    let { baseInfo, priceId } = this.props;
    let currUrl = 'http://' + location.host;
    let id = item.id
    // let url = `http://insbak.ananyun.net/LitePaperOffer/AiQuote?itemid=${baseInfo.priceitemid}&priceId=${priceId}&supId=${item.id}&jobnoid=${item.jobnoid || ''}`;
    let url = `${currUrl}/LitePaperOffer/AiQuote?itemid=${baseInfo.priceitemid}&priceId=${priceId}&supId=${item.id}&jobnoid=${item.jobnoid || ''}`;
    console.log(url)
    this.setState({
        isShowIframe: true,
        iframeSrc: url
    }) 
  }
  // 显示选择保司弹窗
  showInsuranceModal = (e) => {
    e.stopPropagation();
    this.setState({
      isShowJobnoModal: false,
      isShowInsuranceModal: true
    })
  }
  // 显示modal提示
  showModalInfo = (message) => {
    Modal.error({
      title: '提示',
      okText: '知道了',
      content: (
        <div>
          <p>{message}</p>
        </div>
      ),
      onOk() {},
    });
  }
  // 关闭工号跳转提示
  closeIframe = () => {
    let {isShowIframe} = this.state;
    this.setState({
      isShowIframe: false
    })
  }
  // 关闭工号选择弹窗
  cancelChoose = () => {
    this.props.closeJobNo()
  }
  // 常用回复
  alwaysUseReplay = (e) => {
    let content = e.item.props.children;
    this.props.replyRemark(content);
  }
  render () {
    let {
      baseInfo,
      allInsuranceCp,
      chooseTitle,
      isShowJobNo,
      jobnoList,
      chooseList
    } = this.props;
    let {
      isShowOperate,
      isShowJobnoModal,
      isShowInsuranceModal,
      isShowIframe,
      iframeSrc
    } = this.state;
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
        {
          isShowOperate
          ? <Row className='get-price-container'>
              {
                baseInfo.supplierList && baseInfo.supplierList.length
                ? <Col style={{float: 'left','borderRight': 'solid 1px #eee','padding':'0px 10px'}}>
                    <span className='title'>客户已指定保司：</span>
                    {
                      baseInfo.supplierList.map((item, index) => {
                        return (
                          <Tooltip placement="top" title='选择报价工号' key={index}>
                            <div className='insurance-container' onClick={() => {this.getJobNo(item)}}>
                              <img src={item.icon} className='icon'/>
                              <span className='insurance-name'>{item.name}</span>
                            </div>
                          </Tooltip>
                        )
                      })
                    }
                    <div className='down-arrow'></div>
                </Col>
                : null
              }
              <Col style={{float: 'left','padding':'0px 10px'}}>
                <span className='title'>常用工号：</span>
                {
                  jobnoList && jobnoList.length
                  ? <div style={{display: 'inline-block'}}>
                      {
                        jobnoList.slice(0, 2).map((item, index) => {
                          return (
                            <Tooltip placement="top" title='点击去报价' key={index}>
                              <div className='insurance-container' onClick={() => {this.toAiQuote(item)}}>
                                <img src={item.icon} className='icon'/>
                                <span className='insurance-name'>{item.name}</span>
                              </div>
                            </Tooltip>
                          )
                        })
                      }
                      {
                        jobnoList.length > 2
                        ? <div className='popover-modal insurance-container'>
                            <Tooltip placement="top" title='更多工号'><Icon type="ellipsis" className="more-icon" onClick={(e) => {this.showJobnoModal(e)}} /></Tooltip>
                              {
                                isShowJobnoModal && jobnoList.length > 2
                                ? <div className='popover-content'>
                                    <div className='popover-title'>常用工号</div>
                                    <div className='always-use-content'>
                                      {
                                        jobnoList.slice(2, jobnoList.length).map((item, index) => {
                                          return (
                                            <div key={index} className='item-content' onClick={() => {this.toAiQuote(item)}}>
                                              <img src={item.icon} className='content-icon' alt=""/>
                                              {item.name}
                                            </div>
                                          )
                                        }) 
                                      }
                                    </div>
                                  </div>
                                : null
                              }
                              {
                                isShowJobnoModal
                                ? <div className='bottom-triangle'></div>
                                : null
                              } 
                            </div>
                            : null
                      }
                    </div>
                  : <span className='empty-tip'>设置常用保险公司工号可进行快速报价</span>
                }
              </Col>
              <Col style={{float: 'right'}}>
                <div className='right-container'>
                  <Tooltip placement="top" title='点击设置常用工号'>
                    <Icon type="setting" style={{'paddingRight':'10px'}} className='set-icon' onClick={this.toHome} />
                  </Tooltip>
                  <div className='ver-line'></div>
                  <div className='popover-modal' style={{padding: '0px 10px',width:'auto'}}>
                    <div className='right-item active' onClick={(e) => {this.showInsuranceModal(e)}}>常用保司</div>
                    {
                      isShowInsuranceModal
                      ? <div className='popover-content' style={{bottom: '40px'}}>
                          <div className='popover-title'>常用保司</div>
                          <div className='always-use-content'>
                          {
                            allInsuranceCp && allInsuranceCp.length
                            ? allInsuranceCp.map((item, index) => {
                                return (
                                  <div key={index} className='item-content' onClick={() => {this.getJobNo(item)}}>
                                    <img src={item.imageUrl} className='content-icon' alt=""/>
                                    {item.name}
                                  </div>
                                )
                            }) 
                            : <span style={{color: '#ccc'}}>暂未配置常用保司</span>
                          }
                          </div>
                        </div>
                      : null
                    }
                    {
                      isShowInsuranceModal
                      ? <div className='bottom-triangle' style={{bottom: '40px'}}></div>
                      : null
                    } 
                  </div>
                  <div className='ver-line'></div>
                  <div className='right-item active'  style={{padding: '0px 10px',width:'auto'}} onClick={this.btn1Click}>体验快速报价</div>
                </div>
              </Col>
            </Row>
          : null
        }
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
        {
          isShowIframe
          ? <Iframe iframeSrc={iframeSrc} showModalInfo={this.showModalInfo} closeIframe={this.closeIframe}/>
          : null
        }
        {
          isShowJobNo
          ? <ChooseJobNo toAiQuote={this.toAiQuote} chooseList={chooseList} chooseTitle={chooseTitle} cancelChoose={this.cancelChoose}/>
          : null
        }
      </div>
    )
  }
}