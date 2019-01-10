import React from 'react';
import '../stylesheets/AbOperate.less'
import MpModal from '../components/MpModal';
import tip from '../assets/images/tip.png';
import {Icon, Modal, message} from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import {
  transfer_to_others,
  transfer_search,
  close_order
} from '../services/index';
export default class AbOperate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTransfering: false,
      dataList: []
    }
  }
  componentDidMount () {
    this.getTransferData()
  }
  getTransferData = () => {
    let { baseInfo } = this.props;
    let partnerId = baseInfo.partnerId;
    let self = this;
    transfer_search(partnerId).then((res) => {
        if (res.resultCode === 22) {
            let list = res.pageInfo.list;
            self.setState({
              dataList: list
            })
        } else {
        }
    }).catch((err) => {
        console.log('transfer: ', err)
    })
  }
  // 发送支付方式
  sure = () => {
  }
  // 取消
  cancel = () => {
    this.props.closeAbModal()
  }
  // 转接给其他人
  transferToOthers = (item) => {
    let { baseInfo, priceId } = this.props;
    this.setState({
      isTransfering: true
    })
    let self = this;
    let params = {
      id: priceId,
      customerid: item.customerid
    }
    transfer_to_others(params).then((res) => {
      if (res.returnCode === 2) {
        var tip = baseInfo.customerName + "给您转发了一个新的报价[isgivemeorder]"
        var msg = { type: 'SaaS', target: baseInfo.customerId, msg: tip, "time": new Date().getTime() }
        localStorage.setItem("_receiveMsgKey", JSON.stringify(msg));
        let currUrl = ('http://' + location.host);
        location.href = currUrl + '/LitePaperOffer/list?source=3'
      } else {
        self.setState({
          isTransfering: false
        })
        message.config({
          top: 200,
          duration: 2
        })
        message.info('转接失败', 2);
      }
    })
  }
  refuseOrder = () => {
    let {baseInfo, priceId} = this.props;
    let refuseReason = this.refs.refuseReason.value || '';
    if (refuseReason.trim().length === 0) {
      message.info('请输入拒绝原因！！')
      return
    }
    let params = {
      id: priceId,
      closeReason: refuseReason
    }
    let self = this;
    close_order(params).then((res) => {
      if (res.returnCode === 1) {
        var str = ('您的询价单已经被关闭，关闭原因是：'+refuseReason);
        self.props.replyRemark(str, true)
        self.props.closeAbModal(1)
      } else {
        message.info(res.message, 2);
      }
    })
  }
  render () {
    let {isTransfering, dataList} = this.state;
    return (
      <MpModal title='异常操作' cancel={this.cancel} isShowFooter={true}>
        <div className='abnormal-content'>
          <div className="tip-content">
            <img src={tip} className="tip-icon"/>
            <span>
              关闭此订单
              <span style={{color: '#aaa'}}> (建议针对不规范的流程，如果已经通过其他流程提供服务，可进行关闭)</span>
            </span>
          </div>
          <div className='abnormal-refuse-content'>
            <textarea ref="refuseReason" className='refuse-text' row='6' maxLength='100' placeholder="请输入关闭原因"/>
          </div>
          <div className='refuse-footer'>
            <button className='refuse-btn' onClick={this.refuseOrder}>关闭订单</button>
          </div>
          <div className="tip-content">
            <img src={tip} className="tip-icon"/>
            <span>转接</span>
          </div>
          <div className='transfer-contianer'>
          {
            dataList && dataList.length
            ? <div className='transfer-list'>
                <Scrollbars>
                  <ul>
                    {
                      dataList.map((item, index) => {
                        return (
                          <li className='transfer-item' key={index}>
                            {item.realname}
                            <button className='transfer-btn' onClick={() => this.transferToOthers(item)}>转接</button>
                          </li>
                        )
                      })
                    }
                  </ul>
                </Scrollbars>
              </div>
            : <div className='no-transfer'>
                暂无可转接人员
              </div>
          }
          </div>
          {
            isTransfering
            ? <div className='bg-container' style={{backgroundColor: 'rgba(7, 17, 27, 0.4)' }}>
              <div className='bg-content'>
                <Icon type="loading" className='bg-icon' />
                <span className='bg-title'>正在转接</span>
              </div>
            </div>
            : null
          }
        </div>
      </MpModal>
    )
  }
}