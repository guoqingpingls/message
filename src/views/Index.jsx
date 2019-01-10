import React from 'react';
import { Tabs, Modal, message, Menu, Dropdown, Icon, Avatar, Upload, Radio } from 'antd';
import ChatImageList from './ChatImageList';
import BaseInfo from './BaseInfo';
import SubmitOffer from './SubmitOffer';
import SendImage from './SendImage';
import FormModal from './FormModal';
import QueryInfo from './QueryInfo';
import Message from './Message';
import PayType from './PayType';
import AbOperate from './AbOperate';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MpModal from '../components/MpModal';
import qs from 'query-string';
import { Scrollbars } from 'react-custom-scrollbars';
import CheckModal from './CheckModal';
import SubmitPrice from './SubmitPrice';
import { openNavUrl } from '../util/util.js';
import {
    get_price_detail, //获取询价基本信息
    get_message_list, //获取消息列表
    post_preprice_ins_message, //提交询价信息
    submit_policy,  // 提交保单
    confirm_pay,    // 确认缴费
    finish_policy,   // 完成保单
    submit_to_get_price,    // 提交报价
    reply_remark_api,    // 回复
    get_historical_price,    // 获取历史报价
    get_insurance_cp_list,      //获取保险公司列表
    transfer_search,    //转接查询
    transfer_to_others,         // 转接
    confirm_price,          // 确认报价
    get_address,            // 获取自取地址
    payoff,                 // 付款
    close_order,            // 拒绝
    confirm_orders,            // 抢单
    confirm_pay_type,           // 发送支付方式
} from '../services/index';
import '../stylesheets/Home.css';
import '../assets/css/iconfont.css';
import choose from '../assets/images/choose.png';
import tip from '../assets/images/tip.png';
import sendImage from '../assets/images/send-image.png';
import closeIcon from '../assets/images/close.png';
import chooseActive from '../assets/images/choose-active.png';
const TabPane = Tabs.TabPane;
const pageName = 'Home';
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
export default class Index extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      defaultImageUri: 'https://openapi.youbaolian.cn/',
      allInsuranceCp: [],
      baseInfo: {},
      messageList: [],
      priceId: null,
      isShowModal: false,
      isShowSubmit: false,
      previewVisible: false,
      previewImage: '',
      historicalPriceList: [],
      queryPriceInfo: {},
      showModal: false,
      submitForm: {},
      isShowBg: false,
      imagesInArr: [],
      allImageList: [],
      refreshData: false,
      isSendImage: false,
      payType: 1,     // 缴费方式 1 业务员， 2 代理
      isShowPayType: false,       // 是否显示支付方式
      cid: null,          // saas端customerid
      isShowAbnormal: false,      // 异常操作弹窗
      isShowRobTip: false,    // 显示接单提示
      fromRecord: false,    //是否从报价记录获取数据
      isFirstGet: true, // 获取保险公司列表只需要获取一次
      allInsuranceCp: [],   // 当前商户的保险公司列表
  };
  }
  componentDidMount () {
    // 从地址栏获取priceId cid
    let {priceId, cid} = this.props.location.query;
    this.state.priceId = priceId;
    this.state.cid = cid;
    this.getPriceDetail()
    this.getMessageList()
    this.refs.scrollbars.scrollToBottom();
  }
  componentDidUpdate() {
    this.refs.scrollbars.scrollToBottom();
  };
  getPriceDetail = () => {
    let { priceId, baseInfo } = this.state;
    let self = this;
    get_price_detail(priceId).then((res) => {
      if (res.returnCode === 0) {
        if (!baseInfo.status) {
          self.state.baseInfo = res.dtoList[0]
          self.getMessageList()
        }
        if (self.state.isFirstGet) {
          self.getAllInsuranceCp(res.dtoList[0].partnerId);
          self.state.isFirstGet = false
        }
        self.setState({
          baseInfo: res.dtoList[0]
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  }
  getMessageList = () => {
    let {priceId, baseInfo} = this.state;
    if (!baseInfo.status) {
      return;
    }
    let self = this;
    get_message_list(priceId).then((res) => {
      if (res.returnCode === 0 && res.dtoList && res.dtoList.length) {
          let messageList = res.dtoList.map((item) => {
            if (item.config && item.config.length > 0) {
              let temp = JSON.parse(item.config);
              if (temp.coverageList && temp.coverageList.length > 0) {
                  let tmpCoverage = JSON.parse(temp.coverageList);
                  let resultCoverage = []
                  tmpCoverage.map((ite) => {
                    if (ite.InsDetailId == '10501') {
                      return;
                    }
                    if (ite.InsDetailId == '20201') {
                      let tip = ite.flag == 1 ? '(国产玻璃)' : '(进口玻璃)'
                      let InsuredPremium = ite.InsuredPremium && Number(ite.InsuredPremium) > 0 ? '——保费：' + Number(ite.InsuredPremium).toFixed(2) : ''
                      let info = ite.ins + tip + InsuredPremium
                      resultCoverage.push({
                        info: info
                      })
                    } else {
                      let amount = ite.Amount && Number(ite.Amount) > 0 ? `(${Number(ite.Amount).toFixed(2)})` : ''
                      let tip = ite.InsDetailId < 30000 ? amount : '不计免赔'
                      let InsuredPremium = ite.InsuredPremium && Number(ite.InsuredPremium) > 0 ? '——保费: ' + Number(ite.InsuredPremium).toFixed(2) : ''
                      let info = ite.ins + tip + InsuredPremium
                      resultCoverage.push({
                        info: info
                      })
                    }
                  })
                  item.coverageInfo = resultCoverage;
                }
              }
              // 消息操作按钮
              item.btnArray = self.getBtnArray(item, baseInfo.status)
              return item
          })
          console.log(messageList)
          self.setState({
            messageList: messageList.reverse()
          })
      }
    })
  }
  getBtnArray = (item, status) => {
    let btnArray = []
    if (status === 301) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '抢单'
      })
    }
    return btnArray;
  }
  // 回复消息
  // updatePriceDetail 是否更新price detail
  replyRemark = (replyContent, updatePriceDetail) => {
    if (replyContent.trim().length === 0) {
      message.config({
          top: 580,
          duration: 2
      })
      message.info('消息内容不能为空', 2);
      return;
    }
    this.refs.footer.clearvalue()
    let d = new Date()
    let messageList = this.state.messageList.concat([{
      id: this.state.cid,
      usertype: 2,
      name: this.state.baseInfo.customerName,
      senddate: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
      info: replyContent
    }])
    this.setState({
      messageList: messageList
    })
    let params = {
      priceid: this.state.priceId,
      carinfoid: this.state.baseInfo.carinfoid,
      info: replyContent,
      usertype: 2,
      cid: this.state.cid
    };
    let self = this;
    reply_remark_api(params).then((res) => {
      const { baseInfo } = this.state;
      let msgContent = {};
      msgContent.type = "IM";
      msgContent.target = 'C_' + baseInfo.userid;
      msgContent.msg = replyContent;
      msgContent.time = Date.now();
      localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
      // self.getNodeData();
      self.getMessageList();
      if (updatePriceDetail) {
        self.getPriceDetail()
      }
    }).catch((err) => {
      console.log('err: ', err);
    })
  };
  // 打开异常操作弹窗
  abOperate = () => {
    this.setState({
      isShowAbnormal: true
    })
  }
  // 关闭异常操作弹窗
  closeAbModal = (type) => {
    if (type && type === 1) {
      // refresh data
      // 发送消息会刷新消息列表
      // this.getMessageList()
      this.getPriceDetail()
    }
    this.setState({
      isShowAbnormal: false
    })
  }
  // buttonStatus 1-6
  /**
   * 1.确认缴费
   * 2.生成保单
   * 3.完成保单
   * 4.已确认收到
   * 5.保单已生成
   * 6.保单已完成
   */
  operateFrom = (item) => {
    let btnStatus = item.buttonstatus;
    let { baseInfo, priceId, cid } = this.state;
    // 抢单
    if (baseInfo.status === 301) {
      // this.robPrice();
      this.setState({
        isShowRobTip: true
      })
      return;
    }
    let self = this;
    if (btnStatus < -3 || btnStatus > 3) {
      message.info('当前状态下不可操作！！！')
      return;
    } else if (baseInfo.status === 23 && btnStatus === -2) {
      this.showPayType()
    } else if (baseInfo.status === 37 && btnStatus === -3) {
      //付款弹窗---------------------//替客户操作
      confirm({
        title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
        okText: "确认",
        cancelText: "取消",
        onOk() {
          self.setState({
            isShowModal: true
          });
        },
        onCancel() {}
      });
    } else if (baseInfo.status === 2 && btnStatus === -1) {
      confirm({
        title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
        okText: "确认",
        cancelText: "取消",
        onOk() {
          //确认报价---------------------//替客户操作
          let params = {
            priceid: item.priceid,
            priceitemid: item.priceitemid,
            config: item.config,
            id: item.id,
            cid: cid
          }
          confirm_price(params).then((res) => {
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = 'replyContent';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            self.getNodeData();
          }).catch((err) => {
            console.log(err)
          })
        },
        onCancel() {}
      });
    } else if (baseInfo.status === 35 && btnStatus === 1) {
      this.setState({
        isShowModal: true
      });
    } else if (baseInfo.status === 24 && btnStatus === 2) {
      // 生成保单
      this.setState({
        isShowModal: true
      });
    } else if (baseInfo.status === 40 && btnStatus === 3) {
      // 完成保单-------------------------//替客户操作
      // 暂时设定的id
      confirm({
        title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
        okText: "确认",
        cancelText: "取消",
        onOk() {
          finish_policy(priceId, cid).then((res) => {
            console.log(pageName, ' res ', res)
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = 'replyContent';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            self.getNodeData();
          }, (err) => {
            console.log(pageName, ' error ', err)
          }).catch((err) => {
            console.log(pageName, ' catch error ', err)
          })
        },
        onCancel() {}
      });
    } else {
      message.info('当前状态下不可操作！！！')
    }
  };
  showPayType = () => {
    this.setState({
      isShowPayType: true
    })
  }
  // 抢单
  robPrice = () => {
    let {cid, priceId, baseInfo} = this.state;
    let params = `?customerId=${cid}&priceId=${priceId}`
    let self = this;
    confirm_orders(params).then((res) => {
      self.setState({
        isShowRobTip: false
      })
      let msgContent = {};
      msgContent.type = "IM";
      msgContent.target = 'C_' + baseInfo.userid;
      msgContent.msg = '';
      msgContent.time = Date.now();
      localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
      // self.getNodeData()
      self.getMessageList();
      self.getPriceDetail();
    })
  }
  // 取消抢单
  cancelConfirm = () => {
    this.setState({
      isShowRobTip: false
    })
  }
  // 显示报价弹窗
  openInsertModal = () => {
    let {baseInfo} = this.state;
    if (Number(baseInfo.status) === 1 || Number(baseInfo.status) === 2) {
      this.setState({
        isShowSubmit: true
      })
    } else {
      message.config({
        top: 580,
        duration: 2
      })
      message.info('当前订单不可报价', 2);
    }
  };
  // 获取保险公司
  getAllInsuranceCp = (partnerId) => {
    let tmpCpList =  []
    let self = this;
    get_insurance_cp_list(partnerId).then((res) => {
      if (res.dtoList && res.dtoList.length) {
        res.dtoList.map((item, index) => {
          if (item.supplier.length === 0) {
            return;
          }
          let tmpSup = []
          item.supplier.map((ite, idx) => {
            ite.searchName = item.code + '-' + ite.name;
            tmpSup.push(ite)
          })
          tmpCpList = tmpCpList.concat(tmpSup);
        });
        console.log(tmpCpList)
        self.setState({
          allInsuranceCp: tmpCpList
        })
      }
    }).catch((err) => {
      console.log('cpList: ', err)
    })
  };
  render() {
    const {
      refreshData,
      allImageList,
      imagesInArr,
      isShowBg, 
      allInsuranceCp,
      queryPriceInfo,
      messageList,
      isShowModal,
      priceId,
      isShowSubmit,
      baseInfo,
      previewImage,
      previewVisible,
      isSendImage,
      payType,
      isShowPayType,
      isShowConfirmModal,
      isShowAbnormal,
      defaultImageUri,
      cid,
      isShowRobTip,
      fromRecord
    } = this.state;
    return (
      <div className='content-wrapper'>
        <div className='content-container'>
          <div className='left-container'>
            <Header baseInfo={baseInfo} />
            <div className='meassge-container'>
              <Scrollbars ref="scrollbars">
                <Message messageList={messageList} baseInfo={baseInfo} handlePreview={this.handlePreview} operateFrom={this.operateFrom} insFrom={this.insFrom} />
              </Scrollbars>
            </div>
            <Footer ref='footer' openInsertModal={this.openInsertModal} baseInfo={baseInfo} abOperate={this.abOperate} replyRemark={this.replyRemark} alwaysUseReplay={this.alwaysUseReplay} showSendImage={this.showSendImage} keyDown={this.keyDown}/>
          </div>
          <div className='right-container'>
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehu tab-icon' /><span>基本信息</span></span>} key="1">
                <BaseInfo showRobModal={this.showRobModal} allInsuranceCp={allInsuranceCp} btnClick={this.btn1Click} baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehuziliao-copy tab-icon' /><span>询价人资料</span></span>} key="2">
                <QueryInfo baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-tupian-copy tab-icon' /><span>聊天图片</span></span>} key="3">
                <ChatImageList priceId={priceId} handlePreview={this.handlePreview} allImageList={allImageList} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-shizhong tab-icon' /><span>历史报价</span></span>} key="4">
                {/* <HistoryList status={baseInfo.status} usePrice={this.usePrice} historicalPriceList={historicalPriceList} /> */}
              </TabPane>
            </Tabs>
          </div>
        </div>
        <SendImage isSendImage={isSendImage} hideSendImage={this.hideSendImage} sendImage={this.sendImage}></SendImage>
        <FormModal ref='formModal' priceId={priceId} isShowModal={isShowModal} submitForm={this.submitForm}
          onCancel={this.onCancel} baseData={baseInfo} />
        {/* <SubmitOffer ref="submitOffer" allInsuranceCp={allInsuranceCp} queryPriceInfo={queryPriceInfo} priceId={priceId} closeSubmit={this.closeSubmit} isShowSubmit={isShowSubmit}
          baseData={baseInfo} getPrice={this.getPrice} changesupplierIdToName={this.changesupplierIdToName} refreshData={refreshData} /> */}
        <div className='info-modal' style={{ display: previewVisible ? 'block' : 'none' }} onClick={this.hideCheckModal}>
          <CheckModal getEnquireDetail={this.getEnquireDetail} hideCheckModal={this.hideCheckModal} priceId={priceId} imageSrc={previewImage} imagesInArr={imagesInArr} baseInfo={baseInfo}/>
        </div>
        <div className='bg-container' style={{ display: isShowBg ? 'block' : 'none', backgroundColor: 'rgba(7, 17, 27, 0.4)' }}>
          <div className='bg-content'>
            <Icon type="loading" className='bg-icon' />
            <span className='bg-title'>正在提交</span>
          </div>
        </div>
        {
          isShowPayType
          ? <PayType
            title="支付方式"
            closePayType={this.closePayType}
            sendPayType={this.sendPayType}
            defaultImageUri={defaultImageUri}
            priceId={priceId}
            cid={cid}
            baseInfo={baseInfo}
          ></PayType>
          : null
        }
        {
          isShowAbnormal
          ? <AbOperate title='异常操作' priceId={priceId} baseInfo={baseInfo} closeAbModal={this.closeAbModal} replyRemark={this.replyRemark}></AbOperate>
          : null
        }
        {
          isShowSubmit
          ? <SubmitPrice priceId={priceId} baseInfo={baseInfo} fromRecord={fromRecord} allInsuranceCp={allInsuranceCp}/>
          : null
        }
        <Modal title="接单提示"
          visible={isShowRobTip}
          onOk={this.robPrice}
          okText='确定'
          cancelText='取消'
          onCancel={this.cancelConfirm}
        >
          <p>您确认要接此订单么？</p>
        </Modal>
      </div>
    )
}
}