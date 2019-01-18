import React from 'react';
import axios from 'axios';
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
import EnquireRecord from './EnquireRecord';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MpModal from '../components/MpModal';
import qs from 'query-string';
import { Scrollbars } from 'react-custom-scrollbars';
import CheckModal from './CheckModal';
import SubmitPrice from './SubmitPrice';
import GeneratePolicy from './GeneratePolicy';
import { openNavUrl, date, translateIdToName } from '../util/util.js';
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
      isShowToast: false,   // 是否显示提示
      recordList: [],  // 报价记录
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
    // 抢单
    if (status === 301) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '抢单'
      })
    }
    // 确认报价
    if (status === 2 && item.buttonstatus === -1 && item.checkStatus === 1) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '确认报价'
      })
    }
    // 发送支付方式
    if (status === 23 && item.buttonstatus === -2) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '发送支付方式'
      })
    }
    // 业务员已缴费并生成保单
    if (status === 37 && item.buttonstatus === -3) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '业务员已缴费并生成保单'
      })
    }
    // 完成保单
    if (status === 40 && item.buttonstatus === 3) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '完成保单'
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
  // 消息列表button操作
  operateFrom = (item) => {
    let self = this;
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
    // 确认报价
    if (baseInfo.status === 2 && item.buttonstatus === -1 && item.checkStatus === 1) {
      confirm({
        title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
        okText: "确认",
        cancelText: "取消",
        onOk() {
          //确认报价---------------------//替客户操作
          self.confirmPrice(item)
          return;
        },
        onCancel() {}
      });
    }
    // 发送支付方式
    if (baseInfo.status === 23 && item.buttonstatus === -2) {
      this.setState({
        isShowPayType: true
      })
    }
    // 业务员已缴费并生成保单  付款弹窗
    if (baseInfo.status === 37 && item.buttonstatus === -3) {
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
    }
    // 完成保单
    if (baseInfo.status === 40 && item.buttonstatus === 3) {
      confirm({
        title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
        okText: "确认",
        cancelText: "取消",
        onOk() {
          self.finishOrder()
        },
        onCancel() {}
      });
    }
  };
  finishOrder = () => {
    let {priceId, cid, baseInfo} = this.state;
    let self = this;
    finish_policy(priceId, cid).then((res) => {
      let msgContent = {};
      msgContent.type = "IM";
      msgContent.target = 'C_' + baseInfo.userid;
      msgContent.msg = 'replyContent';
      msgContent.time = Date.now();
      localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
      // self.getNodeData();
      self.getMessageList();
      self.getPriceDetail()
    }, (err) => {
      console.log(pageName, ' error ', err)
    }).catch((err) => {
      console.log(pageName, ' catch error ', err)
    })
  }
  confirmPrice = (item) => {
    let {cid, baseInfo} = this.state;
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
      // refresh messageList & refresh order status
      self.getMessageList();
      self.getPriceDetail();
    }).catch((err) => {
      console.log(err)
    })
  }
  // 关闭发送支付方式弹窗
  closePayType = (type) => {
    this.setState({
      isShowPayType: false
    })
    if (type && type === 1) {
      this.getMessageList();
      this.getPriceDetail();
    }
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
    this.setState({
      isShowSubmit: true
    })
  };
  // 关闭报价弹窗
  closeSumitPriceModal = (type) => {
    this.setState({
      isShowSubmit: false
    })
    // 刷新messagelist priceDetail
    if (type) {
      this.getMessageList();
      this.getPriceDetail()	
    }
  }
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
  closeGeneratePolicy = (type) => {
    this.setState({
      isShowModal: false
    })
    if (type) {
      this.getMessageList()
      this.getPriceDetail()
    }
  }
  // 获取报价记录
  queryInsuredPrice = () => {
    let {baseInfo} = this.state;
    let params = {
        LicenseNo: baseInfo.licenseNo,
        QueryType: 0,
        InsName: '',
        PartnerId: baseInfo.partnerId,
        PriceType: 2,
        addStartTime: date().add(-3, 'd').format('YYYY-MM-DD'),
        addEndTime: date().format('YYYY-MM-DD hh:mm:ss'),
        Paging: {
          TakeCount: 10,
          SkipCount: 0
        }
    }
    let self = this;
    axios({
      method: 'post',
      url: 'http://insuredapi.youbaolian.cn/api/insured?action=QueryInsuredPrice',
      // url: 'http://mock-insuredapi.youbaolian.cn/api/insured?action=QueryInsuredPrice',
      data: JSON.stringify(params)
    }).then(({data}) => {
      if (data.ResultCode === 0 && data.data && data.data.length) {
        let list =  []
        data.data.map((item) => {
          if (item.UpdateTime > date().add(-3, 'd').format('YYYY-MM-DD') && item.data && item.data.length) {
            item.data.map((ite) => {
              let coverageList = ite.data.map((tmp) => {
                return ({
                  DetailId: tmp.DetailId,
                  InsuredPremium: tmp.InsuredPremium,
                  name: translateIdToName(tmp.DetailId)
                })
              })
              list.push({
                UpdateTime: ite.UpdateTime.slice(0, 10),
                PriceItemId: ite.PriceItemId,
                BIDiscount: ite.BIDiscount,
                BIPremium: ite.BIPremium,
                CIPremium: ite.CIPremium,
                CarshipTax: ite.CarshipTax,
                SupplierName: ite.SupplierName,
                TotalPrice: ite.TotalPrice,
                SupplierId: ite.SupplierId,
                coverageList: coverageList,
                CICarTotal: ite.CIPremium + ite.CarshipTax
              })
            })
          }
        })
        console.log(list)
        self.setState({
          recordList: list
        })
      }
    })
  }
  // 使用此报价
  usePrice = (info) => {
    this.state.queryPriceInfo = info;
    this.openInsertModal();
  };
  changeTab = (activeKey) => {
    // 获取报价记录
    if (+activeKey === 4) {
      this.queryInsuredPrice()
    }
  }
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
      fromRecord,
      isShowToast,
      recordList
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
            <Tabs defaultActiveKey="1" onChange={this.changeTab}>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehu tab-icon' /><span>基本信息</span></span>} key="1">
                <BaseInfo showRobModal={this.showRobModal} allInsuranceCp={allInsuranceCp} btnClick={this.btn1Click} baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehuziliao-copy tab-icon' /><span>询价人资料</span></span>} key="2">
                <QueryInfo baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-tupian-copy tab-icon' /><span>聊天图片</span></span>} key="3">
                <ChatImageList priceId={priceId} handlePreview={this.handlePreview} allImageList={allImageList} />
              </TabPane>
              <TabPane style={{position: 'relative'}} tab={<span className='tab-container'><i className='iconfont icon-shizhong tab-icon' /><span>报价记录</span></span>} key="4">
                <EnquireRecord recordList={recordList} usePrice={this.usePrice} />
              </TabPane>
            </Tabs>
          </div>
        </div>
        <SendImage isSendImage={isSendImage} hideSendImage={this.hideSendImage} sendImage={this.sendImage}></SendImage>
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
            // sendPayType={this.sendPayType}
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
          ? <SubmitPrice
              priceId={priceId}
              baseInfo={baseInfo}
              queryPriceInfo={queryPriceInfo}
              fromRecord={fromRecord}
              allInsuranceCp={allInsuranceCp}
              getMessageList={this.getMessageList}
              getPriceDetail={this.getPriceDetail}
              closeSumitPriceModal={this.closeSumitPriceModal}
            />
          : null
        }
        {
          isShowModal
          ? <GeneratePolicy baseInfo={baseInfo} close={this.closeGeneratePolicy} priceId={priceId}/>
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