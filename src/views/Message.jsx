import React from 'react';
import '../stylesheets/Message.less';
import { Avatar } from 'antd';
import customer from '../assets/images/customer.png';

export default class Message extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
    }
  }
  handlePreview = (imageuri, ite) => {
    this.props.handlePreview(imageuri, ite);
  }
  operateFrom = (item) => {
    this.props.operateFrom(item);
  }
  insFrom = (item, messageList, m) => {
    this.props.insFrom(item, messageList, m)
  }
  render () {
    let {messageList, baseInfo} = this.props;
    let {btnArray} = this.state;
    const buttonStatusValue = ['', '已确认缴费，生成保单', '生成保单', '完成保单', '已确认收到', '保单已生成', '保单已完成'];
    let message = messageList.map((item, index) => {
      // usertype === 1 小程序
      // usertype === 2 saas
      if (item.usertype === 1) {
        return (
          <li className='message-container' key={index}>
            <div className='avatar-container'>
              <Avatar size="large" icon="user" style={{ backgroundColor: '#108ee9' }} />
            </div>
            <div className='message'>
              <div>
                <span className="time">{item.name} {item.senddate}</span>
              </div>
              <div className='message-info left-message-info'>
                <div style={{ fontSize: '13px' }} dangerouslySetInnerHTML = {{ __html:item.info.replace(/\s+/g,'<br/>')}}></div>
                  <div className='image-container'>
                    {
                      item.imageuris && item.imageuris.length && item.imageuris.map((ite, idx) => {
                        return (
                          <div className='single-image-container' style={{ display: 'inline-block' }} key={idx}>
                            <img src={ite} key={idx} alt="tupian" onClick={() => {
                              this.handlePreview(item.imageuris, ite)
                            }} className='message-image' />
                          </div>
                        )
                      })
                    }
                  </div>
                  <span className='message-status'>{item.remarks || ''}</span>
                  {/* <span className='message-status'>{btnArray[0] && btnArray[0].btnText || ''}</span> */}
                  {
                    item.btnArray && item.btnArray.length
                    ? item.btnArray.map((ite, idx) => {
                      return (
                        <button key={idx} onClick={() => { this.operateFrom(ite) }}
                          className={ite.btnClassName}>
                          {ite.btnText}
                        </button>
                      )
                    })
                    : null
                  }
                  {/* {
                    item.buttonstatus > 0
                    ? <button onClick={() => { this.operateFrom(item) }}
                      style={{ display: item.buttonstatus > 0 ? '' : 'none' }}
                      className={item.buttonstatus > 3 ? 'message-btn-default' : 'message-btn-default btn-can-click'}>
                      {buttonStatusValue[item.buttonstatus]}
                    </button>
                    : null
                  } */}
                  {/* <button onClick={() => { this.operateFrom(item) }}
                    style={{ display: item.buttonstatus > 0 ? '' : 'none' }}
                    className={item.buttonstatus > 3 ? 'message-btn-default' : 'message-btn-default btn-can-click'}>
                    {buttonStatusValue[item.buttonstatus]}
                  </button> */}
                  {/* <button
                    onClick={() => {this.operateFrom(item)}}
                    className={item.buttonstatus === -3 && baseInfo.status !== 37 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                    style={{display: item.buttonstatus === -3 ? '' : 'none'}}
                  >
                    业务员已经缴费并生成保单
                  </button>
                  <button
                    onClick={() => {this.operateFrom(item)}}
                    className={item.buttonstatus === -2 && baseInfo.status !== 23 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                    style={{display: item.buttonstatus === -2 ? '' : 'none'}}
                  >
                    发送支付方式
                  </button> */}
              </div>
            </div>
          </li>
        )
      }
      if (item.usertype === 2) {
        return (
          <li className='message-container right-container' key={index}>
            <div className='message'>
              <div>
                <span className="time right-time">{item.senddate} {item.cname}</span>
              </div>
              <div className='message-info right-message-info'>
                <span className='message-status' style={{ textAlign: 'right', left: '-120px' }}>{item.remarks || ''}</span>
                <div style={{ fontSize: '13px' }} dangerouslySetInnerHTML = {{ __html:item.info.replace(/\s+/g,'<br/>')}}></div>
                {
                  item.coverageInfo && item.coverageInfo.length > 0
                  ? item.coverageInfo.map((ite, idx) => {
                    return(<div key={idx}>{ite.info}</div>)
                  })
                  : null
                }
                <div className='image-container'>
                  {
                    item.imageuris && item.imageuris.length && item.imageuris.map((ite1, idx1) => {
                      return (
                        <div className='single-image-container' style={{ display: 'inline-block' }} key={idx1}>
                          <img src={ite1} key={idx1} alt="tupian" onClick={() => {
                            this.handlePreview(item.imageuris, ite1)
                          }} className='message-image' />
                        </div>
                      )
                    })
                  }
                </div>
                {
                  item.btnArray && item.btnArray.length
                  ? item.btnArray.map((ite, idx) => {
                    return (
                      <button key={idx} onClick={() => { this.operateFrom(ite) }}
                        className={ite.btnClassName}>
                        {ite.btnText}
                      </button>
                    )
                  })
                  : null
                }
                {/* <button
                  onClick={() => {this.operateFrom(item)}}
                  className={item.buttonstatus > 3 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                  style={{display: item.buttonstatus > 0 ? '' : 'none'}}
                >
                  {buttonStatusValue[item.buttonstatus]}
                </button> */}
                {/* 报价： 确认此报价  */}
                {/* <button
                  onClick={() => {this.operateFrom(item)}}
                  className={item.buttonstatus === -1 && baseInfo.status !== 2 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                  style={{display: item.buttonstatus === -1 ? '' : 'none'}}
                >
                  确认此报价
                </button> */}
                  {/* 缴费对应： 发送支付方式 */}
                {/* <button
                  onClick={() => {this.operateFrom(item)}}
                  className={item.buttonstatus === -2 && baseInfo.status !== 23 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                  style={{display: item.buttonstatus === -2 ? '' : 'none'}}
                >
                  发送支付方式
                </button> */}
                {/* 缴费对应： 选择支付方式 */}
                {/* <button
                  onClick={() => {this.operateFrom(item)}}
                  className={item.buttonstatus === -3 && baseInfo.status !== 37 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                  style={{display: item.buttonstatus === -3 ? '' : 'none'}}
                >
                  业务员已经缴费并生成保单
                </button> */}
                {/* <button
                  onClick={() => {this.insFrom(item, messageList, 11)}}
                  className='message-btn-default  btn-can-click'
                  style={{display: (item.buttonstatus == 6 && (item.info.indexOf('交强险保单号') > -1)) ? '' : 'none'}}
                >交强险录单</button>
                <button
                  onClick={() => { this.insFrom(item, messageList, 10) }}
                  className='message-btn-default  btn-can-click'
                  style={{display: (item.buttonstatus == 6 && (item.info.indexOf('商业险保单号') > -1)) ? '' : 'none'}}
                >商业险录单</button> */}
              </div>
            </div>
            <div className='avatar-container right-avatar'>
              <div className='div-avatar'>
                <img src={customer} alt="" className='avatar-iamge' />
              </div>
            </div>
          </li>
        )
      }
    })
    return (
      <ul className='message-wrapper'>
        {
          messageList && messageList.length
          ? message
          : <li>暂无消息</li>
        }
      </ul>
     
    )
  }
}