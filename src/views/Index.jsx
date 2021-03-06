import React from 'react';
import axios from 'axios';
import { Tabs, Modal, message, Icon } from 'antd';
import ChatImageList from './ChatImageList';
import BaseInfo from './BaseInfo';
import QueryInfo from './QueryInfo';
import Message from './Message';
import PayType from './PayType';
import AbOperate from './AbOperate';
import EnquireRecord from './EnquireRecord';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { Scrollbars } from 'react-custom-scrollbars';
import CheckModal from './CheckModal';
import SubmitPrice from './SubmitPrice';
import SendImageModal from './SendImageModal';
import GeneratePolicy from './GeneratePolicy';
import { date, translateIdToName, insuranceIdToName, isEmptyObject, sendIM } from '../util/util.js';
import {
    get_price_detail, //获取询价基本信息
    get_message_list, //获取消息列表
    finish_policy,   // 完成保单
    reply_remark_api,    // 回复
    get_insurance_cp_list,      //获取保险公司列表
    confirm_price,          // 确认报价
    confirm_orders,            // 抢单
} from '../services/index';
import '../stylesheets/Index.less';
import '../assets/css/iconfont.css';
import choose from '../assets/images/choose.png';
import tip from '../assets/images/tip.png';
import sendImage from '../assets/images/send-image.png';
const TabPane = Tabs.TabPane;
const pageName = '主页';
const confirm = Modal.confirm;
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
      isShowCheckModal: false,
      previewImage: '',
      queryPriceInfo: {},
      showModal: false,
      imagesInArr: [],
      isSendImage: false,
      payType: 1,     // 缴费方式 1 业务员， 2 代理
      isShowPayType: false,       // 是否显示支付方式
      cid: null,          // saas端customerid
      isShowAbnormal: false,      // 异常操作弹窗
      isShowRobTip: false,    // 显示接单提示
      fromRecord: false,    //是否从报价记录获取数据
      allInsuranceCp: [],   // 当前商户的保险公司列表
      recordList: [],  // 报价记录
      chatImageList: [],  // 聊天图片
      chooseTitle: [],  // 常用保司 name
      isShowJobNo: false,
      jobnoList: [],
      chooseList: [],
      isGetData: false,
      loadingText: '',
      isShowReqLoading: false, // 是否显示请求loading
    };
  }
  componentWillMount () {
    let obj = this.props;
    this.dealUrlParams(obj)
  }
  componentWillReceiveProps(nextProps) {
    let obj = nextProps
    this.dealUrlParams(obj)
  };
  componentDidMount () {
    this.getPriceDetail()
    this.getMessageList()
    this.getAllInsuranceCp()
    this.getJobNo()
    this.refs.scrollbars.scrollToBottom();
  }
  componentDidUpdate() {
    this.refs.scrollbars.scrollToBottom();
  };
  dealUrlParams = (obj) => {
    let {pItemId, sId, priceId, cid, rId, pId} = obj.location.query;
    this.state.pId = pId
    this.state.priceId = priceId;
    this.state.cid = cid;
    // this.state.rId = rId;
    let queryObj = sessionStorage.getItem('queryObj');
    if (!!queryObj) {
      queryObj = JSON.parse(queryObj)
    } else {
      queryObj = {}
    }
    // rId不存在 不作处理
    // 都存在 rid相等 不做处理
    if (!rId || (!!rId && !!queryObj.rId && rId === queryObj.rId)) {
      return
    }
    // rId存在 session不存在 处理数据
    // 都存在 rid不相等 处理数据
    if ((!!rId && !queryObj.rId) || (!!rId && !!queryObj.rId && rId !== queryObj.rId)) {
      this.state.queryParams = {
        pItemId: pItemId,
        sId: sId,
        rId: rId,
        priceId: priceId
      }
      this.state.isGetData = true
      sessionStorage.setItem('queryObj', JSON.stringify(this.state.queryParams))
      this.openInsertModal()
      return
    }
  }
  getPriceDetail = () => {
    let { priceId, baseInfo } = this.state;
    let self = this;
    get_price_detail(priceId).then((res) => {
      if (res.returnCode === 0) {
        if (!baseInfo.status) {
          self.state.baseInfo = res.dtoList[0]
          self.getMessageList()
        }
        if (!!res.dtoList[0].supplierIdList) {
          let supplierList = res.dtoList[0].supplierIdList.map((item) => {
            return ({
              name: insuranceIdToName(item),
              id: item,
              icon:  `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item}.jpg`
            })
          })
          res.dtoList[0].supplierList = supplierList
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
        this.getChatImages(res.dtoList)
        let messageList = res.dtoList.reverse().map((item, index) => {
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
          item.btnArray = self.getBtnArray(item, baseInfo.status, index)
          return item
        })
        self.setState({
          messageList: messageList
        })
      }
    })
  }
  // 获取保险公司
  getAllInsuranceCp = (type) => {
    let {allInsuranceCp} = this.state;
    let tmpCpList =  []
    let self = this;
    let pId = this.state.pId || this.props.location.query.pId;
    if (allInsuranceCp.length > 0) {
      return;
    }
    get_insurance_cp_list(pId).then((res) => {
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
        self.setState({
          allInsuranceCp: tmpCpList
        })
        self.state.allInsuranceCp = tmpCpList
        if (type) {
          self.setState({
            isShowSubmit: true
          })
        }
      }
    }).catch((err) => {
      console.log('cpList: ', err)
    })
  };
  // 获取工号 1. 保险公司点击显示 2. 首页显示
  getJobNo = (insuranceItem) => {
    let cid = this.state.cid || this.props.location.query;
    let params = `?customerId=${cid}`
    let isInsurance = false
    if (insuranceItem && isEmptyObject(insuranceItem)) {
      isInsurance = true
      params = `${params}&supplierId=${insuranceItem.id}&all=1`
    }
    let self = this;
    axios({
      method: 'get',
      url: `http://insbak.ananyun.net/zongan/GetSettingJobNos${params}`
      // url: `http://pre2.insbak.ananyun.net/zongan/GetSettingJobNos${params}`
    }).then(({data}) => {
      console.log(data)
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
            chooseTitle: insuranceItem.name,
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
  // 获取消息操作按钮
  getBtnArray = (item, status, index) => {
    let btnArray = []
    // 抢单
    if (status === 301 && index === 0) {
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
        btnText: '完成保单',
        key: 'COMPLETE_ORDER'
      })
    }
    if (item.buttonstatus === 3 || item.buttonstatus === 6) {
      btnArray.push({
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '交强录单',
        key: 'CI_RECORD'
      },{
        btnClassName: 'message-btn-default btn-can-click',
        btnText: '商业录单',
        key: 'BI_RECORD'
      })
    }
    return btnArray;
  }
  // 消息列表button操作
  operateFrom = (item, key) => {
    let self = this;
    let btnStatus = item.buttonstatus;
    let { baseInfo, priceId, cid } = this.state;
    // 抢单
    if (baseInfo.status === 301) {
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
    if (baseInfo.status === 40 && item.buttonstatus === 3 && key === 'COMPLETE_ORDER') {
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
    // 交强录单
    if (key === 'CI_RECORD') {
      this.recordSheet(item.info.split(','), 11)
    }
    // 商业录单
    if (key === 'BI_RECORD') {
      this.recordSheet(item.info.split(','), 10)
    }
  };
  // 回复消息
  // updatePriceDetail 是否更新price detail
  replyRemark = (replyContent, updatePriceDetail) => {
    let {messageList, baseInfo, priceId, cid} = this.state;
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
    messageList.unshift({
      id: cid,
      usertype: 2,
      name: baseInfo.customerName,
      senddate: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
      info: replyContent
    })
    this.setState({
      messageList
    })
    let params = {
      priceid: priceId,
      carinfoid: baseInfo.carinfoid,
      info: replyContent,
      usertype: 2,
      cid: cid
    };
    let self = this;
    reply_remark_api(params).then((res) => {
      sendIM(baseInfo.userid, replyContent)
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
      this.getMessageList()
      this.getPriceDetail()
    }
    this.setState({
      isShowAbnormal: false
    })
  }
  // 录单
  recordSheet = (infos, m) => {
    let {messageList, baseInfo} = this.state
    let self = this;
    let customerId = baseInfo.usersDetail.customerId;
    let userId = baseInfo.userid;
    let configs = messageList.reverse().filter(function (item) { return item.remarks == '已确认此报价' });
    let params = {
      PayType: baseInfo.paymentMethod, // 1 业务员 2 代理
      SalemanId: customerId, //业务员ID
      Source: 3, //3：小程序报价，2，直连
      AutomaticType: 18, //小程序自动落单
      UnNav: 1,  //页面不需要左侧菜单
      InsuranceType: m, //10:商业，11：交强
      SalesmanSettleRate: 0,  //业务员保单手续费比例
      SalesmanVVTaxSettleRate: 0, //业务员车船税手续费比例
      insFeeType: 2, //2全费，1净费
      UserId: userId,     //通知给的用户id
      AutoSettlement: 0  //是否自动结佣，展示拿不到
    };
    confirm({
      title: '如果系统开启了人工询价保单自动结算模式，录单后将自动执行下游结算操作，请确保录入的费用信息和给业务员沟通的费用信息一致，以免后续产生不必要的麻烦，您确认要继续操作么？',
      okText: "确认",
      cancelText: "取消",
      onOk() {
        if (m == 10) {
          let info = infos.filter(function (item) { return item.indexOf('商业险保单号') > -1 });
          if (info && info.length > 0) {
            params['InsuranceNo'] = info[0].substring(info[0].lastIndexOf('单号') + 2);  //商业单号
          }
        } else if (m == 11) {
          let info = infos.filter(function (item) { return item.indexOf('交强险保单号') > -1 });
          if (info && info.length > 0) {
            params['InsuranceNo'] = info[0].substring(info[0].lastIndexOf('单号') + 2);  //交强险单号
          }
        }
        if (configs && configs.length > 0) {
          let config = configs[0].config;
          if (config && config.indexOf('{') > -1) {
            config = JSON.parse(config);
            if (m == 10) { //商业险
              params['SalesmanSettleRate'] = config.showbicommission;

            } else if (m == 11) { //交强险
              params['SalesmanSettleRate'] = config.showcicommission;
              params['SalesmanVVTaxSettleRate'] = config.showcarshiptax;
            }
            if (config.isSeparate) {
              params['insFeeType'] = 1;
            } else {
              params['insFeeType'] = 2;
            }
          }
        }
        let str = JSON.stringify(params);
        let currUrl = ('http://' + location.host);
        let url = currUrl + '/Policy/Add?p=' + str;
        window.open(url, null, "dialogWidth=100%;dialogHeight=520px;scroll=yes;status=0");
      },
      onCancel() {
      },
    });
  }
  finishOrder = () => {
    let {priceId, cid, baseInfo} = this.state;
    let self = this;
    finish_policy(priceId, cid).then((res) => {
      sendIM(baseInfo.userid, 'replyContent')
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
    let self = this;
    confirm_price(params).then((res) => {
      sendIM(baseInfo.userid, 'replyContent')
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
      sendIM(baseInfo.userid, '')
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
    let {allInsuranceCp} = this.state
    if (allInsuranceCp.length > 0) {
      this.setState({
        isShowSubmit: true
      })
    } else {
      this.getAllInsuranceCp(1)
    }

  };
  // 关闭报价弹窗
  closeSubmitPriceModal = (type) => {
    this.setState({
      isShowSubmit: false
    })
    // 刷新messagelist priceDetail
    if (type) {
      this.getMessageList();
      this.getPriceDetail()	
    }
  }
  // 关闭生成保单弹窗
  closeGeneratePolicy = (type) => {
    this.setState({
      isShowModal: false
    })
    if (type) {
      this.getMessageList()
      this.getPriceDetail()
    }
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
    // 获取聊天图片
    // if (+activeKey === 3) {
    //   this.getChatImages()
    // }
  }
  // 获取聊天图片
  getChatImages = (messageList) => {
    // let {messageList} = this.state
    let list = []
    messageList.map((item) => {
      if (item.imageuris && item.imageuris.length > 0) {
        list.push({
          name: item.cname,
          senddate: item.senddate,
          imageuris: item.imageuris,
          usertype: item.usertype
        })
      }
    })
    console.log(list)
    this.setState({
      chatImageList: list
    })
  }
  // 显示发送图片弹窗
  showSendImage = () => {
    this.setState({
      isSendImage: true
    })
  }
  hideSendImage = (type) => {
    this.setState({
      isSendImage: false
    })
    if (type) {
      // refresh messagelist
      this.getMessageList()
    }
  }
  closeModal = () => {
    this.refs.footer.closeModal()
  }
  closeJobNo = () => {
    this.setState({
      isShowJobNo: false
    })
  }
  // 点击图片
  handlePreview = (images, imageUrl) => {
    this.setState({
      isShowCheckModal: true,
      previewImage: imageUrl,
      imagesInArr: images
    })
  };
  // 关闭图片识别弹窗
  hideCheckModal = (val) => {
    // this.refs.checkModal.resetChooseIndex()
    if (val && val === 1) {
      this.getPriceDetail();
    }
    this.setState({
      isShowCheckModal: false,
      previewImage: ''
    })
  }
  // 显示loading
  showReqLoading = (text) => {
    let {isShowReqLoading} = this.state;
    this.setState({
      isShowReqLoading: true,
      loadingText: text || ''
    })
  }
  // hide loading
  hideReqLoading = () => {
    let {isShowReqLoading} = this.state;
    this.setState({
      isShowReqLoading: false
    })
  }
  render() {
    let {
      imagesInArr, 
      allInsuranceCp,
      queryPriceInfo,
      messageList,
      isShowModal,
      priceId,
      isShowSubmit,
      baseInfo,
      previewImage,
      isShowCheckModal,
      isSendImage,
      payType,
      isShowPayType,
      isShowConfirmModal,
      isShowAbnormal,
      defaultImageUri,
      cid,
      isShowRobTip,
      fromRecord,
      recordList,
      chatImageList,
      jobnoList,
      chooseTitle,
      isShowJobNo,
      chooseList,
      isGetData,
      loadingText,
      isShowReqLoading
    } = this.state;
    return (
      <div className='content-wrapper' onClick={this.closeModal}>
        <div className='content-container'>
          <div className='left-container'>
            <Header baseInfo={baseInfo} />
            <div className='meassge-container'>
              <Scrollbars ref="scrollbars">
                <Message
                  messageList={messageList}
                  baseInfo={baseInfo}
                  handlePreview={this.handlePreview}
                  operateFrom={this.operateFrom}
                />
              </Scrollbars>
            </div>
            <Footer
              ref='footer'
              chooseTitle={chooseTitle}
              isShowJobNo={isShowJobNo}
              jobnoList={jobnoList}
              chooseList={chooseList}
              allInsuranceCp={allInsuranceCp}
              priceId={priceId}
              baseInfo={baseInfo}
              openInsertModal={this.openInsertModal}
              closeJobNo={this.closeJobNo}
              getJobNo={this.getJobNo}
              abOperate={this.abOperate}
              replyRemark={this.replyRemark}
              alwaysUseReplay={this.alwaysUseReplay}
              showSendImage={this.showSendImage}
              keyDown={this.keyDown}
            />
          </div>
          <div className='right-tab-container'>
            <Tabs defaultActiveKey="1" onChange={this.changeTab}>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehu tab-icon' /><span>基本信息</span></span>} key="1">
                <BaseInfo allInsuranceCp={allInsuranceCp} baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-kehuziliao-copy tab-icon' /><span>询价人资料</span></span>} key="2">
                <QueryInfo baseData={baseInfo} />
              </TabPane>
              <TabPane tab={<span className='tab-container'><i className='iconfont icon-tupian-copy tab-icon' /><span>聊天图片</span></span>} key="3">
                <ChatImageList priceId={priceId} chatImageList={chatImageList} handlePreview={this.handlePreview} />
              </TabPane>
              <TabPane style={{position: 'relative'}} tab={<span className='tab-container'><i className='iconfont icon-shizhong tab-icon' /><span>报价记录</span></span>} key="4">
                <EnquireRecord recordList={recordList} usePrice={this.usePrice} />
              </TabPane>
            </Tabs>
          </div>
        </div>
        {
          isShowCheckModal
          ? <CheckModal
              ref="checkModal"
              priceId={priceId}
              imageSrc={previewImage}
              imagesInArr={imagesInArr}
              baseInfo={baseInfo}
              showReqLoading={this.showReqLoading}
              hideReqLoading={this.hideReqLoading}
              hideCheckModal={this.hideCheckModal}
            />
          : null
        }
        {
          isShowPayType
          ? <PayType
            title="支付方式"
            defaultImageUri={defaultImageUri}
            priceId={priceId}
            cid={cid}
            baseInfo={baseInfo}
            closePayType={this.closePayType}
          ></PayType>
          : null
        }
        {
          isShowAbnormal
          ? <AbOperate
              title='异常操作'
              priceId={priceId}
              baseInfo={baseInfo}
              closeAbModal={this.closeAbModal}
              replyRemark={this.replyRemark}
            />
          : null
        }
        {
          isShowSubmit
          ? <SubmitPrice
              isGetData={isGetData}
              priceId={priceId}
              baseInfo={baseInfo}
              fromRecord={fromRecord}
              allInsuranceCp={allInsuranceCp}
              queryPriceInfo={queryPriceInfo}
              showReqLoading={this.showReqLoading}
              hideReqLoading={this.hideReqLoading}
              getMessageList={this.getMessageList}
              getPriceDetail={this.getPriceDetail}
              closeSubmitPriceModal={this.closeSubmitPriceModal}
            />
          : null
        }
        {
          isShowModal
          ? <GeneratePolicy baseInfo={baseInfo} priceId={priceId} close={this.closeGeneratePolicy} />
          : null
        }
        {
          isSendImage
          ? <SendImageModal
              priceId={priceId}
              baseInfo={baseInfo}
              cid={cid}
              defaultImageUri={defaultImageUri}
              showReqLoading={this.showReqLoading}
              hideReqLoading={this.hideReqLoading}
              hideSendImage={this.hideSendImage}
            />
          : null
        }
        <Modal
          title="接单提示"
          okText='确定'
          cancelText='取消'
          visible={isShowRobTip}
          onOk={this.robPrice}
          onCancel={this.cancelConfirm}
        >
          <p>您确认要接此订单么？</p>
        </Modal>
        {
          isShowReqLoading
          ? <Loading loadingText={loadingText}/>
          : null
        }
      </div>
    )
  }
}