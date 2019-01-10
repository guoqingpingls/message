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
import request from 'request';
import config from '../config'
import CheckModal from './CheckModal';
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
export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowPayModal: false,
            defaultImageUri: 'https://openapi.youbaolian.cn/',
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
        };
        window.addEventListener('storage', (event) => {
            this.getNodeData();
        });
    };
    componentDidMount() {
        let { priceId, cid } = this.props.location.query; // 地址中获取priceId cid
        this.state.priceId = priceId;
        this.state.cid = cid;
        this.getEnquireDetail()
        this.refs.scrollbars.scrollToBottom();
    };
    componentDidUpdate() {
        this.refs.scrollbars.scrollToBottom();
    };
    // 获取配置了工号的保险公司
    getAllInsuranceCp = (partnerId) => {
        get_insurance_cp_list(partnerId).then((res) => {
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
            Promise.all([get_price_detail(priceId), get_message_list(priceId)])
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
                    this.setState({ baseInfo: data[0].dtoList[0], messageList: messageList.reverse() }, () => { this.getHistoricalPrice(); this.getImagesList() })
                    self.getAllInsuranceCp(data[0].dtoList[0].partnerId);
                });
        } else {
            // this.setState({baseInfo: _baseInfo, messageList: _messageList})
        }
    };
    // 获取询价详情
    getEnquireDetail = () => {
        let { priceId } = this.state;
        let self = this;
        get_price_detail(priceId).then((res) => {
            if (res.returnCode === 0) {
                self.setState({
                    baseInfo: res.dtoList[0]
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    };
    // 获取消息列表
    getMessageList = () => {
        let { priceId } = this.state;
    }
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
        if (Number(this.state.baseInfo.status) === 1 || Number(this.state.baseInfo.status) === 2) {
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
    getHistoricalPrice = () => {
        if (this.state.baseInfo.licenseNo) {
            let tmp = {
                licenseNo: this.state.baseInfo.licenseNo
            };
            let params = qs.stringify(tmp);
            get_historical_price(params).then((res) => {
                if (res.dtoList.length) {
                    this.setState({
                        historicalPriceList: res.dtoList
                    })
                }
            }).catch((err) => {
                console.log('err: ', err)
            })
        }
    };

    btn1Click = (supplierId) => {
        const { baseInfo } = this.state;
        // http://testinsbak.ananyun.net/LitePaperOffer/AddOffer?isGuide=true&s=list&itemid=询价单详情id&priceId=询价单id&SupplierId=指定的保险公司id&VehicleLicenceCode=编码后的车牌号&VehicleFrameNo=车架号&EngineNo=发动机号&OwnerName=姓名&OwnerIDCard=证件号&OwnerAddress=地址&OwnerMobile=手机&carImageFront=行驶证正面
        const currUrl = ('http://' + location.host);
        let id = supplierId == undefined ? '' : supplierId;
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
    replyRemark = (replyContent) => {
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
        info.status = this.state.baseInfo.status;
        this.state.queryPriceInfo = info;
        this.btnClick();
    };
    refuseOrder = (str) => {
        // 关闭弹窗
        this.replyRemark(str);
        this.getNodeData();
    }
    // 异常操作
    abOperate = () => {
        let { baseInfo } = this.state;
        // this.getTransferData()
        this.setState({
            isShowAbnormal: true
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
    sendPayType = (params) => {
        let {baseInfo} = this.state;
        let self = this
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
    keyDown = (e, content) => {
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
                this.replyRemark(content)
            }
        }
    }
    render() {
        const {
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
            defaultImageUri,
            cid
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
                        <Footer ref='footer' baseInfo={baseInfo} abOperate={this.abOperate} replyRemark={this.replyRemark} alwaysUseReplay={this.alwaysUseReplay} showSendImage={this.showSendImage} keyDown={this.keyDown}/>
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
                                <HistoryList status={baseInfo.status} usePrice={this.usePrice} historicalPriceList={historicalPriceList} />
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <SendImage isSendImage={isSendImage} hideSendImage={this.hideSendImage} sendImage={this.sendImage}></SendImage>
                <FormModal ref='formModal' priceId={priceId} isShowModal={isShowModal} submitForm={this.submitForm}
                    onCancel={this.onCancel} baseData={baseInfo} />
                <SubmitOffer ref="submitOffer" allInsuranceCp={allInsuranceCp} queryPriceInfo={queryPriceInfo} priceId={priceId} closeSubmit={this.closeSubmit} isShowSubmit={isShowSubmit}
                    baseData={baseInfo} getPrice={this.getPrice} changesupplierIdToName={this.changesupplierIdToName} refreshData={refreshData} />
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
                    ? <AbOperate title='异常操作' baseInfo={baseInfo}></AbOperate>
                    : null
                }
                <Modal title="接单提示"
                    visible={isShowConfirmModal}
                    onOk={this.sureConfirm}
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