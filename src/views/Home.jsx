import React from 'react';
import axios from 'axios';
import { Popover, Tooltip, Row, Col, Tabs, Modal, message, Menu, Dropdown, Icon, Avatar, Upload, Radio, Alert} from 'antd';
// import HistoryList from './HistoryList';
// import ChatImageList from './ChatImageList';
// import BaseInfo from './BaseInfo';
// import SubmitOffer from './SubmitOffer';
// import SendImage from './SendImage';
// import FormModal from './FormModal';
// import QueryInfo from './QueryInfo';
// import Iframe from './Iframe';
// import EnquireRecord from './EnquireRecord';
// import ChooseJobNo from './ChooseJobNo';
// import qs from 'query-string';
// import { Scrollbars } from 'react-custom-scrollbars';
// import request from 'request';
// import config from '../config'
// import CheckModal from './CheckModal';
import {
    get_preprice_ins_inspreprices_priceDetails, //基本信息
    get_preprice_ins_message, //获取询价信息
    post_preprice_ins_message, //提交询价信息
    submit_policy,  // 提交保单
    confirm_pay,    // 确认缴费
    finish_policy,   // 完成保单
    submit_to_get_price,    // 提交报价
    reply_remark_api,    // 回复
    // get_historical_price,    // 获取历史报价
    get_insurance_cp_list,      //获取保险公司列表
    transfer_search,    //转接查询
    transfer_to_others,         // 转接
    confirm_price,          // 确认报价
    get_address,            // 获取自取地址
    payoff,                 // 付款
    close_order,            // 拒绝
    confirm_orders,            // 抢单
    confirm_pay_type,           // 发送支付方式
    parse_image,                // 识别图片
} from '../services/index';
import '../stylesheets/Home.css';
import '../assets/css/iconfont.css';
import choose from '../assets/images/choose.png';
import tip from '../assets/images/tip.png';
import sendImage from '../assets/images/send-image.png';
import closeIcon from '../assets/images/close.png';
import chooseActive from '../assets/images/choose-active.png';
import customer from '../assets/images/customer.png';
import abIcon from '../assets/images/ab-icon.png';
import operateIcon from '../assets/images/open-operate.png';
import operateIconActive from '../assets/images/open-operate-active.png';
import guide from '../assets/images/setting-guide.png';
const { insuranceInString, changesupplierIdToName, date, openNavUrl } = require('../util/util.js');
const TabPane = Tabs.TabPane;
const pageName = 'Home';
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowPayModal: false,
            defaultImageUri: 'https://openapi.youbaolian.cn/',
            // defaultImageUri: 'http://192.168.5.48:8866/',
            allInsuranceCp: [],
            baseInfo: {},
            messageList: [],
            priceId: null,
            timeStamp: null,
            isShowModal: false,
            isShowSubmit: false,
            previewVisible: false,
            previewImage: '',
            historicalPriceList: [],
            queryPriceInfo: {},
            isShowInfo: false,
            infoImage: '',
            isShowCheckModal: false,
            showModal: false,
            submitForm: {},
            isShowBg: false,
            hasChoosed: [0, 1, 2, 3],
            imagesInArr: [],
            allImageList: [],
            // showTransferModal: false,
            isTransfering: false,
            transferList: [],
            refreshData: false,
            isSendImage: false,
            chooseValue: null,
            fileList: [],
            ispreviewImage: false,
            previewImageuri: '',
            addressList: [],
            payType: 1,     // 缴费方式 1 业务员， 2 代理
            isShowPayType: false,       // 是否显示支付方式
            payLink: '',    // 支付连接
            isShowConfirmModal: false,
            cid: null,          // saas端customerid
            isShowRobBtn: false,
            isShowAbnormal: false,      // 异常操作弹窗
            isShift: false,             // 是不是shift
            flag: 1,
            isShowJobnoModal: false,        // 是否显示选择工号弹窗
            isShowInsuranceModal: false,    // 是否显示选择保司弹窗
            recordList: [],
            isGetJobNo: true,   // 是否获取工号
            jobnoList: [],
            isGetAllInsurance: true,
            isShowOperate: true,    // 是否显示报价操作栏
            isShowSettingGuide: false,  // 设置引导图片
            isShowJobNo: false,       // 是否显示工号选择页
            chooseTitle: '',        // 选择工号
            chooseList: [],
            isShowIframe: false,
            iframeSrc: '',
        };
        window.addEventListener('storage', (event) => {
            console.log(event);
            this.getNodeData();
        });
    };
    componentWillMount() {
        // this.getAllInsuranceCp();
    };
    componentDidMount() {
        this.getNodeData();
        this.refs.scrollbars.scrollToBottom();
        // 获取saas端customerid
        // this.setState({
        //     cid: 1,
        //     isShowRobBtn: true
        // })
        // let tmp = sessionStorage.getItem('insbakUserInfo') || '';
        let { cid } = this.props.location.query;
        if (cid && cid.length > 0) {
            this.setState({
                cid: cid,
                isShowRobBtn: true
            })
        } else {
            this.setState({
                isShowRobBtn: false
            })
        }
    };
    // 控制人员消息显示
    setIm = () => {
        const { priceId } = this.props.location.query; //从URL获取询价ID
        var insimlist=sessionStorage.getItem("insimlist");
        if(insimlist){
            var imList= JSON.parse(insimlist);
            imList=imList.filter(function(f){return f.priceId!=priceId});
            if(imList.length){
                $("#event_xj .count").html(imList.length);
                sessionStorage.setItem("insimlist", JSON.stringify(imList));
            }
        }
    };
    componentDidUpdate() {
        this.refs.scrollbars.scrollToBottom();
    };
    // 获取保险公司
    getAllInsuranceCp = () => {
        let {isGetAllInsurance, baseInfo} = this.state;
        if (!isGetAllInsurance) {
            return;
        }
        get_insurance_cp_list(baseInfo.partnerId).then((res) => {
            let cpList = res.dtoList;
            let tmpCpList = [];
            cpList.map((item, index) => {
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
            this.setState({
                allInsuranceCp: tmpCpList
            })
        }).catch((err) => {
            console.log('cpList: ', err)
        })
    };
    // 把公司id转成公司name
    changesupplierIdToName = (supplierId) => {
        let cpList = this.state.allInsuranceCp;
        let supplierName = '';
        cpList.map((item, index) => {
            if (item.id === Number(supplierId)) {
                supplierName = item.name;
                return supplierName;
            }
        });
        return supplierName;
    };

    getNodeData = () => {
        const { priceId } = this.props.location.query; //从URL获取询价ID
        priceId ? this.state.priceId = priceId : '';
        let self = this;
        if (priceId) {
            Promise.all([get_preprice_ins_inspreprices_priceDetails(priceId), get_preprice_ins_message(priceId)])
                .then(data => {
                    let tmp = data[1].dtoList;
                    let messageList = []
                    tmp.map((item) => {
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
                                item.coverageInfo = resultCoverage
                            }
                        }
                        messageList.push(item)
                    })
                    if (data[0].dtoList[0].supplierIdList && data[0].dtoList[0].supplierIdList.length) {
                        let supplierList = data[0].dtoList[0].supplierIdList.map((item) => {
                            return ({
                                name: changesupplierIdToName(item),
                                id: item,
                                icon:  `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item}.jpg`
                            })
                        })
                        data[0].dtoList[0].supplierList = supplierList
                    }
                    
                    this.setState({ baseInfo: data[0].dtoList[0], messageList: messageList.reverse() }, () => { this.getImagesList(); this.getJobNo(); this.getAllInsuranceCp() })
                    // self.getAllInsuranceCp(data[0].dtoList[0].partnerId);
                });
        } else {
            // this.setState({baseInfo: _baseInfo, messageList: _messageList})
        }
    };
    // 获取询价详情
    getEnquireDetail = () => {
        let priceId = this.state.priceId
        let self = this;
        get_preprice_ins_inspreprices_priceDetails(priceId).then((res) => {
            if (res.dtoList[0].supplierIdList && res.dtoList[0].supplierIdList.length) {
                let supplierList = res.dtoList[0].supplierIdList.map((item) => {
                    return ({
                        name: changesupplierIdToName(item),
                        id: item,
                        icon:  `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item}.jpg`
                    })
                })
                res.dtoList[0].supplierList = supplierList
            }
            self.setState({
                baseInfo: res.dtoList[0]
            })
        })
    };
    getImagesList = () => {
        let messageList = this.state.messageList;
        let tmpImageList = [];
        messageList.length && messageList.map((item) => {
            if (item.imageuris && item.imageuris.length > 0) {
                tmpImageList.push({
                    name: item.cname,
                    senddate: item.senddate,
                    imageuris: item.imageuris,
                    usertype: item.usertype
                })
            }
        })
        this.setState({
            allImageList: tmpImageList
        })
    }
    // 提交报价
    btnClick = () => {
        this.setState({
            isShowSubmit: true
        })
        // if (Number(this.state.baseInfo.status) === 1 || Number(this.state.baseInfo.status) === 2) {
        //     this.setState({
        //         isShowSubmit: true
        //     })
        // } else {
        //     message.config({
        //         top: 580,
        //         duration: 2
        //     })
        //     message.info('当前订单不可报价', 2);
        // }
    };
    // getHistoricalPrice = () => {
    //     if (this.state.baseInfo.licenseNo) {
    //         let tmp = {
    //             licenseNo: this.state.baseInfo.licenseNo
    //         };
    //         let params = qs.stringify(tmp);
    //         get_historical_price(params).then((res) => {
    //             if (res.dtoList.length) {
    //                 this.setState({
    //                     historicalPriceList: res.dtoList
    //                 })
    //             }
    //         }).catch((err) => {
    //             console.log('err: ', err)
    //         })
    //     }
    // };
    // 去ai报价
    toAiQuote = (item) => {
        let { baseInfo } = this.state;
        let currUrl = ('http://' + location.host);
        let id = item.id
        // let url = `${currUrl}/LitePaperOffer/AiQuote?itemid=${baseInfo.priceitemid}&priceId=${this.state.priceId}&supId=${item.id}&jobnoid=${item.jobnoid || ''}`;
        let url = `http://insbak.ananyun.net/LitePaperOffer/AiQuote?itemid=${baseInfo.priceitemid}&priceId=${this.state.priceId}&supId=${item.id}&jobnoid=${item.jobnoid || ''}`;
        // window.open(url)
        console.log(url)
        this.setState({
            isShowIframe: true,
            iframeSrc: url
        })
        
    }
    btn1Click = () => {
        const { baseInfo } = this.state;
        // http://testinsbak.ananyun.net/LitePaperOffer/AddOffer?isGuide=true&s=list&itemid=询价单详情id&priceId=询价单id&SupplierId=指定的保险公司id&VehicleLicenceCode=编码后的车牌号&VehicleFrameNo=车架号&EngineNo=发动机号&OwnerName=姓名&OwnerIDCard=证件号&OwnerAddress=地址&OwnerMobile=手机&carImageFront=行驶证正面
        const currUrl = ('http://' + location.host);
        // let id = supplierId == undefined ? '' : supplierId;
        // const url = currUrl + "/LitePaperOffer/AddOffer?isGuide=true&s=list&itemid=" + baseInfo.priceitemid + '&priceId=' + this.state.priceId + "&SupplierId=" + id + "&VehicleLicenceCode=" + baseInfo.licenseNo + "&VehicleFrameNo=" + baseInfo.frameNo + "&EngineNo=" + baseInfo.engineno + "&OwnerName=" + baseInfo.ownerName + "&OwnerIDCard=" + baseInfo.ownerID + '&OwnerAddress=' + baseInfo.userAddress + '&OwnerMobile=' + baseInfo.userMobile + '&carImageFront=' + baseInfo.carImageFront;
        const url = currUrl + "/LitePaperOffer/AddOffer?isGuide=true&s=list&itemid=" + baseInfo.priceitemid + '&priceId=' + this.state.priceId + '&carImageFront=' + baseInfo.carImageFront;
        if (baseInfo.licenseNo) {
            openNavUrl(url, baseInfo.licenseNo + '-报价');
        } else {
            openNavUrl(url, baseInfo.priceno + '-报价');
        }
    }
    insertTicket = () => {
        let self = this;

        confirm({
            title: '是否需要录入保单呢?',
            okText: "确认",
            cancelText: "取消",
            onOk() {
                let urlParmas = '';
                if (self.state.submitForm.biPolicyNo) {
                    urlParmas += self.state.submitForm.biPolicyNo + ',';
                }
                if (self.state.submitForm.ciPolicyNo) {
                    urlParmas += self.state.submitForm.ciPolicyNo;
                }
                let url = config.url + '/Policy/Lot?insno=' + urlParmas + '&SalesmanId=' + self.state.baseInfo.usersDetail.customerId;
                openNavUrl(url, '录入保单');
            },
            onCancel() {
                console.log('cancel');
            },
        });
    }
    closeSubmit = () => {
        this.setState({
            isShowSubmit: false
        })
    }
    replyRemark = (content) => {
        // if (this.state.flag === 2) {
        //     return;
        // }
        let replyContent;
        if (content) {
            replyContent = content;
        } else {
            replyContent = this.refs.reply.value;
        }
        if (replyContent.trim().length === 0) {
            message.config({
                top: 580,
                duration: 2
            })
            message.info('消息内容不能为空', 2);
            return;
        }
        this.refs.reply.value = ''
        console.log('content: ',replyContent, ' value: ', this.refs.reply.value )
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
        // this.state.flag = 2
        // setTimeout(() => {
        //     this.state.flag = 1
        // }, 200)
        reply_remark_api(params).then((res) => {
            const { baseInfo } = this.state;
            if (content) {
                console.log(content);
            } else {
                self.refs.reply.value = '';
            }
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = replyContent;
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));

            self.getNodeData();

        }).catch((err) => {
            console.log('err: ', err);
        })

    };
    // 提交报价
    getPrice = (params) => {
        this.setState({
            isShowBg: true
        })
        const { baseInfo, cid } = this.state;
        let self = this;
        params.cid = cid;
        submit_to_get_price(params).then((res) => {
            self.closeSubmit();
            self.setState({
                isShowBg: false,
                refreshData: true
            })
            if (self.refs.submitOffer) {
                self.refs.submitOffer.refreshData()
                self.refs.submitOffer.dealCancel()
            }
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = 'replyContent';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            self.getNodeData();
        }).catch((err) => {
            console.log('catch error: ', err);
            self.setState({
                isShowBg: false
            })
        })
    }
    /**
        当状态为6的时候发起结算
   */
    insFrom = (item, messageList, m) => {
        var self = this;
        var customerId = self.state.baseInfo.usersDetail.customerId;
        var userId = self.state.baseInfo.userid;
        var configs = messageList.reverse().filter(function (item) { return item.remarks == '已确认此报价' });
        var params = {
            PayType: self.state.baseInfo.paymentMethod, // 1 业务员 2 代理
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
        var infos = item.info.split(',');
        confirm({
            title: '如果系统开启了人工询价保单自动结算模式，录单后将自动执行下游结算操作，请确保录入的费用信息和给业务员沟通的费用信息一致，以免后续产生不必要的麻烦，您确认要继续操作么？',
            okText: "确认",
            cancelText: "取消",
            onOk() {
                if (m == 10) {
                    var info = infos.filter(function (item) { return item.indexOf('商业险保单号') > -1 });
                    if (info && info.length > 0) {
                        params['InsuranceNo'] = info[0].substring(info[0].lastIndexOf('单号') + 2);  //商业单号
                    }
                } else if (m == 11) {

                    var info = infos.filter(function (item) { return item.indexOf('交强险保单号') > -1 });
                    if (info && info.length > 0) {
                        params['InsuranceNo'] = info[0].substring(info[0].lastIndexOf('单号') + 2);  //交强险单号
                    }
                }
                if (configs && configs.length > 0) {
                    var config = configs[0].config;
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
                var str = JSON.stringify(params);
                let currUrl = ('http://' + location.host);
                var url = currUrl + '/Policy/Add?p=' + str;
                window.open(url, null, "dialogWidth=100%;dialogHeight=520px;scroll=yes;status=0");
            },
            onCancel() {
            },
        });
    };
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
        debugger;
        let btnStatus = item.buttonstatus;
        let { baseInfo, priceId, cid } = this.state;
        if (btnStatus < -3 || btnStatus > 3) {
            message.info('当前状态下不可操作！！！')
            return;
        } else if (baseInfo.status === 23 && btnStatus === -2) {
            this.showPayType()
        } else if (baseInfo.status === 37 && btnStatus === -3) {
            //付款弹窗---------------------//替客户操作
            var self = this;
            confirm({
                title: '该操作仅当是业务员没有按照标准流程操作，您替业务员完成的一些行为，您确认要替业务员进行操作么？（例如：业务员在微信做了支付了，在微信确认报价了...）',
                okText: "确认",
                cancelText: "取消",
                onOk() {
                    self.setState({
                        isShowModal: true
                    });
                    // self.setState({
                    //     isShowPayModal: true
                    // });
                    // self.getAddress();
                },
                onCancel() {}
            });
        } else if (baseInfo.status === 2 && btnStatus === -1) {
            var self = this;
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
            // 确认缴费
            // confirm_pay(priceId, baseInfo.priceitemid, cid).then((res) => {
            //     let msgContent = {};
            //     msgContent.type = "IM";
            //     msgContent.target = 'C_' + baseInfo.userid;
            //     msgContent.msg = 'replyContent';
            //     msgContent.time = Date.now();
            //     localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            //     this.getNodeData();
            // }, (err) => {
            //     console.log(pageName, ' error ', err);
            // }).catch((err) => {
            //     console.log(pageName, ' catch error ', err);
            // })
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
            var self = this;
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
    submitForm = (params) => {
        this.setState({
            isShowBg: true
        })
        this.state.submitForm = params;
        const tmpParams = qs.stringify(params);
        const { baseInfo } = this.state;
        submit_policy(tmpParams).then((res) => {
            // 提交保单成功之后，弹窗消失
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = 'replyContent';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            this.setState({
                isShowBg: false,
                isShowModal: false,
            });
            this.getNodeData();
        }).catch((err) => {
            this.setState({
                isShowModal: false,
                isShowBg: false
            });
        })
        // 提交保单成功之后，弹窗消失
    };
    onCancel = () => {
        this.setState({
            isShowModal: false
        })
    };
    formStatus = (status) => {
        if (status === 301) {
            return '待接单';
        } else if (status === 1) {
            return '待报价';
        } else if (status === 2) {
            return '已报价';
        } else if (status === 23) {
            return '已确认报价'
        } else if (status === 37) {
            return '待缴费'
        } else if (status === 35) {
            return '已付款'
        } else if (status === 24) {
            return '已确认付款'
        } else if (status === 40) {
            return '已出保单'
        } else if (status === 99) {
            return '已完成'
        } else if (status === -9) {
            return '已关闭'
        };
    };
    handleCancel = () => {
        this.setState({ ispreviewVisible: false })
    };
    handlePreview = (images, imageUrl) => {
        this.setState({
            previewVisible: true,
            previewImage: imageUrl,
            imagesInArr: images
        })
    };
    showInfo = (info) => {
        this.setState({
            isShowInfo: true,
            infoImage: info
        })
    };
    cancelShowInfo = () => {
        this.setState({
            isShowInfo: false
        })
    };
    // 使用此报价
    usePrice = (info) => {
        // info.status = this.state.baseInfo.status;
        this.state.queryPriceInfo = info;
        this.btnClick();
    };
    // 清空queryPriceInfo
    clearQueryPriceInfo = () => {
        this.state.queryPriceInfo = {};
    }
    refuseOrder = () => {
        let refuseReason = this.refs.refuseReason.value || '';
        //const { cid } = this.state;
        if (refuseReason.trim().length === 0) {
            message.info('请输入拒绝原因！！')
            return
        }
        let params = {
            id: this.state.priceId,
            closeReason: refuseReason
            //cid:cid
        }
        let self = this;
        close_order(params).then((res) => {
            console.log(res)
            if (res.returnCode === 1) {
                self.setState({
                    // isShowRefuseModal: false,
                    isShowAbnormal: false
                })
                var str = ('您的询价单已经被关闭，关闭原因是：'+refuseReason);
                self.replyRemark(str);
                self.getNodeData();
            }
        })
    }
    // 异常操作
    abOperate = () => {
        let { baseInfo } = this.state;
        //if (Number(baseInfo.status) === 1 || Number(baseInfo.status) === 2) {
            this.getTransferData()
            this.setState({
                isShowAbnormal: true
            })
        //}
    }
    // 获取转接数据
    getTransferData = () => {
        let { baseInfo } = this.state;
        let partnerId = baseInfo.partnerId;
        let self = this;
        transfer_search(partnerId).then((res) => {
            if (res.resultCode === 22) {
                let list = res.pageInfo.list;
                self.setState({
                    transferList: list
                })
            } else {
                self.setState({
                    transferList: []
                })
            }
        }).catch((err) => {
            console.log('transfer: ', err)
            self.setState({
                transferList: []
            })
        })
    }
    // 转接查询
    transferToOthner = () => {
        let { baseInfo } = this.state;
        if (Number(baseInfo.status) === 1 || Number(baseInfo.status) === 2) {
            let self = this;
            let partnerId = baseInfo.partnerId;
            transfer_search(partnerId).then((res) => {
                if (res.resultCode === 22) {
                    let list = res.pageInfo.list;
                    self.setState({
                        transferList: list,
                        // showTransferModal: true
                    })
                }
            })
        } else　{
            message.config({
                top: 580,
                duration: 2
            })
            message.info('当前订单不可转接', 2);
        }
    }
    // 转接
    transferToOthers = (item) => {
        let { baseInfo } = this.state;
        this.setState({
            isTransfering: true
        })
        let self = this;
        let params = {
            id: this.state.priceId,
            customerid: item.customerid
        }
        transfer_to_others(params).then((res) => {
            if (res.returnCode === 2) {
                self.setState({
                    // showTransferModal: false,
                    isTransfering: false,
                    isShowAbnormal: false
                })
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
    // 常用回复
    alwaysUseReplay = (e) => {
        let content = e.item.props.children;
        this.replyRemark(content);
    }
    showCheck = (imageUrl) => {
        this.setState({
            previewVisible: true,
            previewImage: imageUrl
        })
    }
    // val === 1是刷新页面
    hideCheckModal = (val) => {
        if (val && val === 1) {
            this.getNodeData();
        }
        this.setState({
            previewVisible: false,
            previewImage: ''
        })
        this.refs.checkModal.resetChooseIndex()
    }
    // show 上传图片弹窗
    showSendImage = () => {
        this.setState({
            isSendImage: true
        })
    }
    // hide 上传图片弹窗
    hideSendImage = () => {
        this.setState({
            isSendImage: false
        })
    }
    // 发送图片消息
    sendImage = (fileList) => {
        if (fileList && fileList.lenght === 0) {
            return;
        }
        let tmpList = [], tmpUri;
        fileList.map((item) => {
            if (item.status === 'done' && item.response && item.response.resultMap && item.response.resultMap.uri) {
                tmpUri = this.state.defaultImageUri + item.response.resultMap.uri
                tmpList.push(tmpUri)
            }
        })
        let self = this;
        let params = {
            priceid: this.state.priceId,
            carinfoid: this.state.baseInfo.carinfoid,
            info: '',
            usertype: 2,
            imageuris: tmpList,
            cid: this.state.cid
        };
        reply_remark_api(params).then((res) => {
            const { baseInfo } = self.state;
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = '';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            self.getNodeData();
            self.hideSendImage();
        }).catch((err) => {
            console.log('err: ', err);
        })
    }
    changeChoose = (e) => {
        this.setState({
            chooseValue: e.target.value,
        });
    }
    changePaytype = (e) => {
        this.setState({
            payType: e.target.value,
        });
    }
    handleChange = ({fileList}) => {
        this.setState({fileList});
        let tmpFile = fileList.map((item, index) => {
            if (item.status === 'done') {
                let tmp = 'https://openapi.youbaolian.cn/' + item.response.resultMap.uri;
                this.analysisImageCode(tmp)
                return tmp
            }
        });
        if (tmpFile[tmpFile.length - 1] != null) {
            this.state.imageurls = tmpFile;
        }
    }
    // 识别图片
    analysisImageCode (uri) {
        let self = this
        parse_image(uri).then((res) => {
            console.log(res)
            if (res.CODE === 200) {
                self.setState({
                    payLink: res.SUCCESS
                })
            }
        })
    }
    handleImagePreview = (file) => {
        this.setState({
            previewImageuri: file.url || file.thumbUrl,
            ispreviewImage: true
        })
    };
    dealCancel = (file) => {
        this.setState({
            previewImageuri: '',
            ispreviewImage: false
        })
    };
    // 获取自取地址
    getAddress = () => {
        let partnerId = this.state.baseInfo.partnerId;
        let self = this;
        get_address(partnerId).then((res) => {
            if(res.returnCode === 0) {
                let partneraddress = res.dtoList[0].partneraddress;
                let addressList = [];
                partneraddress.map((item, index) => {
                    let addressInfo = JSON.parse(item.address);
                    addressList.push({
                        address: addressInfo.address,
                        phone: addressInfo.phoneNum,
                        workTime: JSON.parse(addressInfo.workTime)[0] + '-' + JSON.parse(addressInfo.workTime)[1]
                    })
                })
                self.setState({
                    addressList: addressList
                })
            }
        }).catch((err) => {
            console.log('1111')
        })
    };
    closeModal = () => {
        this.setState({
            isShowPayModal: false
        })
    };
    sendPayMsg= (cid) => {
        let msgContent = {};
        msgContent.type = "IM";
        msgContent.target = 'C_' + cid;
        msgContent.msg = '支付链接已发送到您关注的微信公众号，请留意信息提示，并进行相关支付操作[isgivemeorder]';
        msgContent.time = Date.now();
        localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
    };
    payoff = () => {
        let {baseInfo, fileList, addressList, chooseValue, priceId, defaultImageUri} = this.state;
        if (chooseValue < 0 || chooseValue == undefined) {
            message.warning('请选择自提地址');
            return;
        }
        let tmpFileList = []
        fileList.map((item) => {
            if (item.response.resultMap && item.response.resultMap.uri) {
                let uri = defaultImageUri + item.response.resultMap.uri;
                tmpFileList.push(uri)
            }
        })
        if (tmpFileList.length === 0) {
            message.warning('请上传凭证截图');
            return;
        }
        let params = {
            deliverytype: 0,    // 自提
            priceid: priceId,
            imageuris: tmpFileList,
            carinfoid: baseInfo.carinfoid,
            info: '',
            address: addressList[chooseValue].address,
            mobile: addressList[chooseValue].phone,
            workTime: addressList[chooseValue].workTime,
            // paymentMethod: payType
        }
        let self = this;
        payoff(params).then((res) => {
            if (res.returnCode === 1) {
                self.sendPayMsg(baseInfo.userid);
                self.closeModal();
                self.getNodeData();
            } else {
                message.warning(res.message);
            }
        })
    }
    // 抢单
    robPrice = () => {
        let {cid, priceId, baseInfo} = this.state;
        let params = `?customerId=${cid}&priceId=${priceId}`
        let self = this;
        confirm_orders(params).then((res) => {
            self.setState({
                isShowConfirmModal: false
            })
            let msgContent = {};
            msgContent.type = "IM";
            msgContent.target = 'C_' + baseInfo.userid;
            msgContent.msg = '';
            msgContent.time = Date.now();
            localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
            self.getNodeData()
        })
    }
    getPaylink = (e) => {
        let target = e.target.value;
        console.log(target)
        this.state.payLink = target
    }
    showPayType = () => {
        this.setState({
            isShowPayType: true
        })
    }
    closePayType = () => {
        this.setState({
            isShowPayType: false
        })
    }
    sendPayType = () => {
        let {payType, fileList, payLink, priceId, defaultImageUri, baseInfo, cid} = this.state;
        let params = {
            paymentMethod: payType,
            priceid: priceId,
            priceitemid: baseInfo.priceitemid,
            // imageList: fileList,
            // payLink: payLink
        }
        if (payType === 1 && fileList.length === 0 && payLink.length === 0) {
            if (fileList.length === 0 && payLink.length === 0) {
                message.info('请上传二维码或者填写支付链接');
                return;
            }
            return;
        }
        if (payType === 1 && fileList.length > 0) {
            params.payCode = defaultImageUri + fileList[0].response.resultMap.uri
        }
        if (payType === 1 && payLink.length > 0) {
            params.payLink = payLink
        }
        let self = this
        params.cid = cid
        confirm_pay_type(params).then((res) => {
            if (res.returnCode === 200) {
                let msgContent = {};
                msgContent.type = "IM";
                msgContent.target = 'C_' + baseInfo.userid;
                msgContent.msg = '';
                msgContent.time = Date.now();
                localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
                self.getNodeData()
                self.closePayType()
            } else {
                message.info(res.message);
            }
        })
    }
    showRobModal = () => {
        this.setState({
            isShowConfirmModal: true
        })
    }
    sureConfirm = () => {
        this.robPrice()
    }
    cancelConfirm = () => {
        this.setState({
            isShowConfirmModal: false
        })
    }
    closeAbnormal = () => {
        this.setState({
            isShowAbnormal: false
        })
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
            // console.log('1111')
        } else if (e.keyCode === 13) {
            e.cancelBubble = true;
            e.preventDefault();
            e.stopPropagation();
            if (flag === 1) {
                this.replyRemark()
            }
            // console.log('2222')
        }
    }
    changeTab = (activeKey) => {
        if (+activeKey === 4) {
            this.queryInsuredPrice()
        }
    }

    // 获取报价记录
    queryInsuredPrice = () => {
        let {baseInfo} = this.state;
        // let params = {
        //     // LicenseNo: '鲁AC525G',
        //     LicenseNo: baseInfo.licenseNo,
        //     QueryType: 0,
        //     InsName: '', // 订单号
        //     PartnerId: baseInfo.partnerId,
        //     CustomerId: baseInfo.customerId,
        //     // PriceType: 2,
        //     addStartTime: date().add(-3, 'd').format('YYYY-MM-DD hh:mm:ss'),
        //     addEndTime: date().format('YYYY-MM-DD hh:mm:ss'),
        //     Paging: {
        //       TakeCount: 10,
        //       SkipCount: 0
        //     }
        // }
        let params = {
            // LicenseNo: '冀AG3011',
            LicenseNo: baseInfo.licenseNo,
            QueryType: 0,
            InsName: '', // 订单号
            PartnerId: baseInfo.partnerId,
            // CustomerId: baseInfo.customerId,
            // CustomerId: '140678',
            PriceType: 2,
            addStartTime: date().add(-3, 'd').format('YYYY-MM-DD'),
            addEndTime: date().format('YYYY-MM-DD hh:mm:ss'),
            Paging: {
              TakeCount: 10,
              SkipCount: 0
            }
        }
        let self = this;
        let list = []
        axios({
            method: 'post',
            url: 'http://insuredapi.youbaolian.cn/api/insured?action=QueryInsuredPrice',
            // url: 'http://mock-insuredapi.youbaolian.cn/api/insured?action=QueryInsuredPrice',
            data: JSON.stringify(params)
          }).then(({data}) => {
            if (data.ResultCode === 0 && data.data && data.data.length) {
                data.data.map((item) => {
                    if (item.UpdateTime > date().add(-3, 'd').format('YYYY-MM-DD') && item.data && item.data.length) {
                        item.data.map((ite) => {
                            let coverageList = []
                            // let name = ''
                            ite.data.map((ite) => {
                                // name = insuranceInString(ite.DetailId)
                                coverageList.push({
                                    DetailId: ite.DetailId,
                                    InsuredPremium: ite.InsuredPremium,
                                    name: insuranceInString(ite.DetailId)
                                })
                            })
                            list.push({
                                UpdateTime: (ite.UpdateTime.indexOf('T')>-1? ite.UpdateTime.replace('T',' '): ite.UpdateTime),
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
                        self.setState({
                            recordList: list
                        })
                    }
                })
                
            }
            // if (data.ResultCode === 0 && data.data && data.data[0] && data.data[0].data && data.data[0].data.length) {
            //     let resultList = [];
            //     // let list = data.data[0].data;
            //     let tmpList = data
            //     list.map((item) => {
            //         // formate coverageList
            //         let coverageList = []
            //         let name = ''
            //         item.data.map((ite) => {
            //             name = insuranceInString(ite.DetailId)
            //             coverageList.push({
            //                 DetailId: ite.DetailId,
            //                 InsuredPremium: ite.InsuredPremium,
            //                 name: name
            //             })
            //         })
            //         resultList.push({
            //             AddTime: item.AddTime.slice(0, 10),
            //             PriceItemId: item.PriceItemId,
            //             BIDiscount: item.BIDiscount,
            //             BIPremium: item.BIPremium,
            //             CIPremium: item.CIPremium,
            //             CarshipTax: item.CarshipTax,
            //             SupplierName: item.SupplierName,
            //             TotalPrice: item.TotalPrice,
            //             SupplierId: item.SupplierId,
            //             coverageList: coverageList,
            //             CICarTotal: item.CIPremium + item.CarshipTax
            //         })
            //     })
            //     console.log(resultList)
            //     self.setState({
            //         recordList: resultList
            //     })
            // }
          })
    }
    // 关闭弹窗
    closePopover = () => {
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
    // 显示选择保司弹窗
    showInsuranceModal = (e) => {
        e.stopPropagation();
        this.setState({
            isShowJobnoModal: false,
            isShowInsuranceModal: true
        })
    }
    // 获取常用工号
    getJobNo = () => {
        let {baseInfo, isGetJobNo, cid} = this.state;
        let jobnoList = []
        let self = this;
        if (isGetJobNo) {
            this.state.isGetJobNo = false;
            axios({
                method: 'get',
                // headers: {"Access-Control-Allow-Origin": "*"},
                url: `http://insbak.ananyun.net/zongan/GetSettingJobNos?customerId=${cid}`
                // url: `http://pre2.insbak.ananyun.net/zongan/GetSettingJobNos?customerId=${cid}`
            }).then(({data}) => {
                // console.log(res)
                if (data.ResultCode === 1 && data.jobNos && data.jobNos.length) {
                    let  jobnoList = []
                    data.jobNos.map((item) => {
                        // if (item.BindLoginUrl && item.BindLoginUrl.length) {
                            let LoginName = item.Remark && item.Remark.length ? `-${item.Remark}-${item.LoginName}` :`-${item.LoginName}`
                            jobnoList.push({
                                id: item.SupplierId,
                                name: item.Partner.PartnerName + LoginName,
                                icon: `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item.SupplierId}.jpg`,
                                PartnerId: item.PartnerId,
                                jobnoid: item.JobNOId
                            })
                        // }
                    })
                    self.setState({
                        jobnoList: jobnoList
                    })
                }
                console.log(jobnoList)
            })
        }
    }
    showOperate = () => {
        let { isShowOperate } = this.state;
        this.setState({
            isShowOperate: !isShowOperate
        })
    }
    cancalSettingGuide = () => {
        this.setState({
            isShowSettingGuide: false
        })
    }
    // showSettingGuide = () => {
    //     // this.setState({
    //     //     isShowSettingGuide: true
    //     // })
    //     let currUrl = ('http://' + location.host)
    //     openNavUrl(`${currUrl}/Home/Index?jobno=true`)
    // }
    toHome = () => {
        // let url = 'http://insbak.ananyun.net/Home/Index?jobno=true'
        //let currUrl = ('http://' + location.host)
        //openNavUrl(`${currUrl}/home/Index?jobno=true`, '车险平台', 1)
        var url= "http://" + window.location.host + '/home/index?jobno=true';
        var _req = {
            customerId: 0,
            type: 0,
            id: '0',
            url: url,
            title: '车险平台',
            jsCode: ""
        };
        try {
            window.IAgencyWebCall("OpenUrl", JSON.stringify(_req), "");
        } catch (e) {
            window.open(url);
        }
    }
    showChoose = (item) => {

        let self = this;
        let {cid} = this.state;
        let jobnoList;
        axios({
            method: 'get',
            url: `http://insbak.ananyun.net/zongan/GetSettingJobNos?customerId=${cid}&supplierId=${item.id}&all=1`
            // url: `http://pre2.insbak.ananyun.net/zongan/GetSettingJobNos?customerId=${cid}&supplierId=${item.id}&all=1`
        }).then(({data}) => {
            if (data.ResultCode === 1 && data.jobNos && data.jobNos.length) {
                let jobnoList = []
                data.jobNos.map((item) => {
                    //if (item.BindLoginUrl && item.BindLoginUrl.length) {
                        jobnoList.push({
                            id: item.SupplierId,
                            name: item.Remark && item.Remark.length ? `${item.Remark}-${item.LoginName}` : item.LoginName,
                            icon: `http://f2.ananyun.net/BakSite/Resources/img/logo/small/${item.SupplierId}.jpg`,
                            PartnerId: item.PartnerId,
                            jobnoid: item.JobNOId
                        })
                    //}
                });
                self.setState({
                    chooseTitle: item.name,
                    isShowJobNo: true,
                    chooseList: jobnoList
                })
            } else {
                message.info('该保司未配置工号')
            }
        })
    }
    cancelChoose = () => {
        let {isShowJobNo} = this.state;
        this.setState({
            isShowJobNo: false,
            chooseList: []
        })
    }
    closeIframe = () => {
        let {isShowIframe} = this.state;
        this.setState({
            isShowIframe: false
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
    render() {
        const {
            chooseList,
            isShowJobNo,
            refreshData,
            transferList,
            isTransfering,
            allImageList,
            imagesInArr,
            hasChoosed,
            isShowBg, allInsuranceCp,
            isShowCheckModal,
            queryPriceInfo,
            messageList,
            isShowModal,
            priceId,
            isShowSubmit,
            baseInfo,
            previewImage,
            previewVisible,
            historicalPriceList,
            isSendImage,
            isShowPayModal,
            chooseValue,
            fileList,
            previewImageuri,
            ispreviewImage,
            addressList,
            payType,
            isShowPayType,
            isShowConfirmModal,
            isShowRobBtn,
            isShowAbnormal,
            payLink,
            isShowJobnoModal,
            isShowInsuranceModal,
            recordList,
            jobnoList,
            isShowOperate,
            isShowSettingGuide,
            chooseTitle,
            isShowIframe,
            iframeSrc,
        } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus"/>
            </div>
        );
        //  缴费对应： 业务员已缴费
        // 报价： 确认此报价
        const buttonStatusValue = ['', '已确认缴费，生成保单', '生成保单', '完成保单', '已确认收到', '保单已生成', '保单已完成'];
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
            </Menu>)
        const message = messageList && messageList.map((item, index) => {
            // usertype === 1 小程序
            // usertype === 2 saas
            if (item.usertype === 1) {
                return (
                    <li className='left-message-container' key={index}>
                        <div className='avatar-container'>
                            <Avatar size="large" icon="user" style={{ backgroundColor: '#108ee9' }} />
                        </div>
                        <div className='receive-message'>
                            <div className='left-receive'>
                                <span className="left-time">{item.name} {item.senddate}</span>
                            </div>
                            <div className='receive-message-info'>
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
                                <button onClick={() => { this.showRobModal() }}
                                    style={{ display: item.remarks === '待接单' && baseInfo.status === 301 ? '' : 'none' }}
                                    className='message-btn-default btn-can-click'>
                                    抢单
                                </button>
                                <button onClick={() => { this.operateFrom(item) }}
                                    style={{ display: item.buttonstatus > 0 ? '' : 'none' }}
                                    className={(item.buttonstatus > 3 ||((baseInfo.status === 40 || baseInfo.status === 99) && buttonStatusValue[item.buttonstatus]=='已确认缴费，生成保单')) ? 'message-btn-default' : 'message-btn-default btn-can-click'}>
                                    {buttonStatusValue[item.buttonstatus]}
                                </button>
                                <button
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
                                </button>
                            </div>
                        </div>

                    </li>
                )
            }
            if (item.usertype === 2) {
                return (
                    <li className='right-message-container' key={index}>

                        <div className='send-message'>
                            <div className='right-sender'>
                                <span className="right-time">{item.senddate} {item.cname}</span>
                            </div>
                            <div className='send-message-info'>
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
                                <button
                                    onClick={() => {this.operateFrom(item)}}
                                    className={item.buttonstatus > 3 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                                    style={{display: item.buttonstatus > 0 ? '' : 'none'}}
                                >
                                    {buttonStatusValue[item.buttonstatus]}
                                </button>
                                {/* 报价： 确认此报价  */}
                                <button
                                    onClick={() => {this.operateFrom(item)}}
                                    className={item.buttonstatus === -1 && baseInfo.status !== 2 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                                    style={{display: item.checkStatus === 1 && item.buttonstatus === -1 ? '' : 'none'}}
                                >
                                    确认此报价
                                </button>
                                {/* 缴费对应： 发送支付方式 */}
                                <button
                                    onClick={() => {this.operateFrom(item)}}
                                    className={item.buttonstatus === -2 && baseInfo.status !== 23 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                                    style={{display: item.buttonstatus === -2 ? '' : 'none'}}
                                >
                                    发送支付方式
                                </button>
                                {/* 缴费对应： 选择支付方式 */}
                                <button
                                    onClick={() => {this.operateFrom(item)}}
                                    className={(item.buttonstatus === -3)  && baseInfo.status !== 37 ? 'message-btn-default' : 'message-btn-default btn-can-click'}
                                    style={{display: item.buttonstatus === -3 ? '' : 'none'}}
                                >
                                    业务员已经缴费并生成保单
                                </button>
                                
                                <a
                                    onClick={() => {this.insFrom(item, messageList, 11)}}
                                   
                                    style={{'marginRight':'10px',display: (((baseInfo.status == 40 && buttonStatusValue[item.buttonstatus]=='保单已完成' || buttonStatusValue[item.buttonstatus]=='完成保单') || item.buttonstatus === 6)  && (item.info.indexOf('交强险保单号') > -1)) ? '' : 'none'}}
                                >录入交强保单</a>
                                <a
                                    onClick={() => { this.insFrom(item, messageList, 10) }}
                                    
                                    style={{display: (((baseInfo.status == 40 && buttonStatusValue[item.buttonstatus]=='保单已完成' || buttonStatusValue[item.buttonstatus]=='完成保单') || item.buttonstatus === 6) && (item.info.indexOf('商业险保单号') > -1)) ? '' : 'none'}}
                                >录入商业保单</a>
                            </div>
                        </div>
                        <div className='avatar-container'>
                            <div className='div-avatar'>
                                <img src={customer} alt="" className='avatar-iamge' />
                            </div>
                        </div>
                    </li>
                )
            }
        });
        return (
            <div className='content-wrapper' onClick={this.closePopover}>
                <div className='content-container'>
                    <div className='left-container'>
                        <div className='header'>
                            <div>
                                <span className='name'>{baseInfo.licenseNo || ''}</span>
                                {/* <div className='check-status-container'>
                                    <div className='check-status-item'><img className='check-status-image' src={baseInfo.confirImage && baseInfo.confirImage.indexOf('1') > -1 ? chooseActive : choose} alt="" /><span className='check-status-span' style={{ color: baseInfo.confirImage && baseInfo.confirImage.indexOf('1') > -1 ? '#108ee9' : '#000' }}>行驶证正面已核对</span></div>
                                    <div className='check-status-item'><img className='check-status-image' src={baseInfo.confirImage && baseInfo.confirImage.indexOf('2') > -1 ? chooseActive : choose} alt="" /><span className='check-status-span' style={{ color: baseInfo.confirImage && baseInfo.confirImage.indexOf('2') > -1 ? '#108ee9' : '#000' }}>行驶证反面已核对</span></div>
                                    <div className='check-status-item'><img className='check-status-image' src={baseInfo.confirImage && baseInfo.confirImage.indexOf('3') > -1 ? chooseActive : choose} alt="" /><span className='check-status-span' style={{ color: baseInfo.confirImage && baseInfo.confirImage.indexOf('3') > -1 ? '#108ee9' : '#000' }}>身份证正面已核对</span></div>
                                    <div className='check-status-item'><img className='check-status-image' src={baseInfo.confirImage && baseInfo.confirImage.indexOf('4') > -1 ? chooseActive : choose} alt="" /><span className='check-status-span' style={{ color: baseInfo.confirImage && baseInfo.confirImage.indexOf('4') > -1 ? '#108ee9' : '#000' }}>身份证反面已核对</span></div>
                                </div> */}
                            </div>
                            <span className='status'>当前状态: <span>{this.formStatus(baseInfo.status)}</span></span>
                        </div>
                        <div className='meassge-container'>
                            <Scrollbars ref="scrollbars">
                                <ul id='message-content'>
                                    {message}
                                </ul>
                            </Scrollbars>
                        </div>
                        <div className='footer-container'>
                            {
                                isShowOperate
                                ? <Row className='get-price-contianer'>
                                    {
                                        baseInfo.supplierList && baseInfo.supplierList.length
                                        ? <Col style={{float: 'left','borderRight': 'solid 1px #eee','padding':'0px 10px'}}>
                                            <span className='title'>客户已指定保司：</span>
                                            {
                                                baseInfo.supplierList.map((item, index) => {
                                                    return (
                                                        <Tooltip placement="top" title='选择报价工号' key={index}>
                                                            <div className='insurance-container' onClick={() => {this.showChoose(item)}}>
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
                                        {/* <Icon type="setting" className='set-icon' onClick={this.showSettingGuide} /> */}
                                        <span className='title'>常用工号：</span>
                                        {
                                            jobnoList && jobnoList.length
                                            ?  <div style={{display: 'inline-block'}}>
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
                                                    <Tooltip placement="top" title='更多工号'><Icon type="ellipsis more-icon" onClick={(e) => {this.showJobnoModal(e)}} /></Tooltip>
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
                                            {/* <div className="right-item"><Icon type="setting set-icon" />设置常用保司</div> */}
                                            {/* <div className='right-item active'>常用保司</div> */}
                                            <div className='popover-modal' style={{padding: '0px 10px',width:'auto'}}>
                                                {/* <Icon type="ellipsis more-icon" onClick={this.showJobnoModal} /> */}
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
                                                                    <div key={index} className='item-content' onClick={() => {this.showChoose(item)}}>
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
                                    placeholder=""
                                    onKeyDown={(e) => { this.keyDown(e) }}>
                                </textarea>
                                <div className='operate-container'>
                                    <div className='left' onClick={this.btnClick}>
                                        <span>插入报价</span>
                                    </div>
                                    <div className='right'>
                                        <button className='btn-default' onClick={() => { this.replyRemark() }}>回复</button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            <TabPane tab={<span className='tab-container'><i className='iconfont icon-shizhong tab-icon' /><span>报价记录</span></span>} key="4">
                                {/* <HistoryList status={baseInfo.status} usePrice={this.usePrice} historicalPriceList={historicalPriceList} /> */}
                                <EnquireRecord recordList={recordList} usePrice={this.usePrice} />
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <SendImage isSendImage={isSendImage} hideSendImage={this.hideSendImage} sendImage={this.sendImage}></SendImage>
                <FormModal ref='formModal' priceId={priceId} isShowModal={isShowModal} submitForm={this.submitForm}
                    onCancel={this.onCancel} baseData={baseInfo} />
                <SubmitOffer ref="submitOffer" clearQueryPriceInfo={this.clearQueryPriceInfo} allInsuranceCp={allInsuranceCp} queryPriceInfo={queryPriceInfo} priceId={priceId} closeSubmit={this.closeSubmit} isShowSubmit={isShowSubmit}
                    baseData={baseInfo} getPrice={this.getPrice} changesupplierIdToName={this.changesupplierIdToName} refreshData={refreshData} />
                <div className='info-modal' style={{ display: previewVisible ? 'block' : 'none', zIndex: '11' }} onClick={this.hideCheckModal}>
                    <CheckModal ref='checkModal' getEnquireDetail={this.getEnquireDetail} hideCheckModal={this.hideCheckModal} priceId={priceId} imageSrc={previewImage} imagesInArr={imagesInArr} baseInfo={baseInfo}/>
                </div>
                <div className='bg-container' style={{ display: isShowBg ? 'block' : 'none', backgroundColor: 'rgba(7, 17, 27, 0.4)' }}>
                    <div className='bg-content'>
                        <Icon type="loading" className='bg-icon' />
                        <span className='bg-title'>正在提交</span>
                    </div>
                </div>
                <div className="pay-modal-container" style={{display: isShowPayModal ? 'block' : 'none'}}>
                    <div className='modal-container'>
                        <div className='head'>
                            <span>确认缴费</span>
                            <Icon onClick={this.closeModal} type="close" style={{fontSize: '22px'}}/>
                        </div>
                        <div className="content">
                            <div className='ziti-container'>
                                <div className='tip-title'>自提地址</div>
                                <RadioGroup onChange={this.changeChoose} value={chooseValue}>
                                    {
                                        addressList && addressList.length > 0
                                        ? (
                                            addressList.map((item, index) => {
                                                return <Radio className='radio-style' value={index} key={index}>{item.address} {item.phone} {item.workTime}</Radio>
                                            })
                                        )
                                        : <div style={{margin: '20px auto', fontSize: '16px'}}>暂未配置自取地址</div>
                                    }
                                </RadioGroup>
                            </div>
                            <div className='upload-container'>
                                <span className='sub-image-title' style={{marginBottom: '10px'}}>上传凭证截图</span>
                                <div className="clearfix">
                                    <Upload
                                        action="https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={this.handleImagePreview}
                                        onChange={this.handleChange}
                                    >
                                        {fileList.length >= 3 ? null : uploadButton}
                                    </Upload>
                                    <Modal visible={ispreviewImage} footer={null} onCancel={this.dealCancel}>
                                        <img alt="example" style={{width: '100%'}} src={previewImageuri}/>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                        <div className='foot'>
                            <button className='btn cancel' onClick={this.closeModal}>取消</button>
                            <button className='btn' onClick={this.payoff}>确认</button>
                        </div>
                    </div>
                </div>
                <div className="pay-type-wrapper" style={{display: isShowPayType ? 'block' : 'none'}}>
                    <div className='pay-type-content'>
                        <div className='title-container'>
                            <span>支付方式</span>
                            <img src={closeIcon} alt="" className='close' onClick={this.closePayType}/>
                        </div>
                        <div className='content-container'>
                            <RadioGroup onChange={this.changePaytype} value={this.state.payType}>
                                <Radio className='pay-radio' value={1}>支付给保险公司</Radio>
                                <Radio className='pay-radio' value={2}>支付给代理（取您配置的支付方式）</Radio>
                                <Radio className='pay-radio' value={3}>代理垫付</Radio>
                            </RadioGroup>
                            {
                                payType === 1
                                ?   <div className='pay-info'>
                                        <div className='upload-container'>
                                            <span className='sub-image-title' style={{marginBottom: '10px'}}>保险公司支付二维码<span style={{color: "#f00"}}>(推荐上传微信支付码)</span></span>
                                            <div className="clearfix">
                                                <Upload
                                                    action="https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/"
                                                    listType="picture-card"
                                                    fileList={fileList}
                                                    onPreview={this.handleImagePreview}
                                                    onChange={this.handleChange}
                                                >
                                                    {fileList.length === 1 ? null : uploadButton}
                                                </Upload>
                                                <Modal visible={ispreviewImage} footer={null} onCancel={this.dealCancel}>
                                                    <img alt="example" style={{width: '100%'}} src={previewImageuri}/>
                                                </Modal>
                                            </div>
                                            <span className='pay-link-title'>保险公司支付链接</span>
                                            <input type="text" className='pay-link' onChange={this.getPaylink} value={payLink}/>
                                        </div>
                                    </div>
                                :   null
                            }
                            
                        </div>
                        <div className='footer-container' style={{minHeight: '60px',flexDirection: 'row'}}>
                            <button className='default' onClick={this.closePayType}>取消</button>
                            <button className='default active' onClick={this.sendPayType}>确认</button>
                        </div>
                    </div>
                </div>
                <Modal title="接单提示"
                    visible={isShowConfirmModal}
                    onOk={this.sureConfirm}
                    okText='确定'
                    cancelText='取消'
                    onCancel={this.cancelConfirm}
                    >
                    <p>您确认要接此订单么？</p>
                </Modal>
                <div className='abnormal-wrapper' style={{display: isShowAbnormal ? 'block' : 'none'}}>
                    <div className='abnormal-container'>
                        <div className='abnormal-title-contianer'>
                            <span>关闭或转接</span>
                            <img src={closeIcon} alt="" className='close' onClick={this.closeAbnormal}/>
                        </div>
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
                                <button className='refuse-btn' onClick={this.refuseOrder}>关闭</button>
                            </div>
                            {/* <span className='seperate-line'></span> */}
                            <div className="tip-content">
                                <img src={tip} className="tip-icon"/>
                                <span>转接</span>
                            </div>
                            <div className='transfer-contianer'>
                                <div className='transfer-list' style={{display: transferList.length > 0 ? 'inline-block' : 'none'}}>
                                    <Scrollbars>
                                        <ul>
                                            {
                                                transferList.length && transferList.map((item, index) => {
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
                                <div style={{display: transferList.length === 0 ? 'inline-block' : 'none'}} className='no-transfer'>
                                    暂无可转接人员
                                </div>
                            </div>
                            <div className='bg-container' style={{ display: isTransfering ? 'block' : 'none', backgroundColor: 'rgba(7, 17, 27, 0.4)' }}>
                                <div className='bg-content'>
                                    <Icon type="loading" className='bg-icon' />
                                    <span className='bg-title'>正在转接</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='abnormal-wrapper' style={{display: isShowSettingGuide ? 'block' : 'none'}}>
                    <div className='abnormal-container'>
                        <div className='abnormal-title-contianer'>
                            <span>设置常用保司</span>
                            <img src={closeIcon} alt="" className='close' onClick={this.cancalSettingGuide}/>
                        </div>
                        <div className='setting-container'>
                            <img style={{width: '100%'}} src={guide}/>
                            <button className='setting-btn' onClick={this.toHome}>去设置</button>
                        </div>
                    </div>
                </div>
                {
                    isShowJobNo
                    ? <ChooseJobNo toAiQuote={this.toAiQuote} chooseList={chooseList} chooseTitle={chooseTitle} cancelChoose={this.cancelChoose}/>
                    : null
                }
                {
                    isShowIframe
                    ? <Iframe iframeSrc={iframeSrc} showModalInfo={this.showModalInfo} closeIframe={this.closeIframe}/>
                    : null
                }
            </div>
        )
    }
}
