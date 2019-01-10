import React from 'react';
import '../stylesheets/SubmitOffer.css';
import {Upload, Icon, Modal, Switch, message, Select } from 'antd';
const { hasCommercialInsurance, isEmptyObject, filterInsurance } = require('../util/util.js');
import {
    get_price_info  // 获取报价信息
} from '../services/index';
import closeIcon from '../assets/images/close.png';
const Option = Select.Option;
// const {insuranceCpList} = require('../util/dataSource')

// const businessInsurance = ['车损险', '三者险', '司机责任险', '乘客责任险', '盗抢险'];   // 商业险
export default class SubmitOffer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coverageList: [],
            supplierName: '',
            fileList: [],
            previreImage: '',
            previewVisible: false,
            allInsuranceFee: 0,
            allRebatefee: 0,
            allPurefee: 0,
            // biBeginDate: '20180808',    //商业起保日期
            // ciBeginDate: '20180808',    //交强起保日期
            biBeginDate: '',    //商业起保日期
            ciBeginDate: '',    //交强起保日期
            cipremium: 0,   //交强险保费
            bipremium: 0,   //商业险保费
            showcicommission: 0,    //交强险费率
            showbicommission: 0,    //商业险费率
            carshiptax: 0,      //车船税
            showcarshiptax: 0,      //车船税费率
            // supplierid: 9811,       //保险公司id
            // supplierid: null,       //保险公司id
            ciCommission: 0,        //交强佣金
            biCommission: 0,        // 商业佣金
            carshipCommission: 0,   // 车船佣金
            commission: 0,   //总佣金
            totalpremium: 0,  //总保费
            pureFee: 0,      //净费
            comprehensivePoint: 0,  //综合点位
            imageurls: [],
            supplierId: null,
            baseInfo: {},
            isSeparate: false,    //是否价税分离
            allInsuranceCp: [],     //所有的保险公司
            priceId: '',
            fromHistory: false,
            // queryPriceInfo: {}
            isHasBi: false,     // 是否有交强险
            isShowDetail: false,    // 是否显示明细
            totalList: [],          // 全部险种列表
            additionList: [],       // 附加险种列表
            mainList: [],            // 主险列表
            isShowRefuseModal: false,   // 是否显示拒绝弹窗
            defaultValue:'',
            isShowToast: false,
            confirmLoading: false,
            submitParams: null,
            checkStatus: true
        }
    };
    componentWillReceiveProps (nextProps) {
        let self = this;
        if (nextProps.baseData && nextProps.baseData !== this.props.baseData) {
            this.state.baseInfo = nextProps.baseData;
            if (nextProps.baseData.supplierId !== 0) {
                this.state.supplierName = this.props.changesupplierIdToName(nextProps.baseData.supplierId)
            }
            this.getCoverageList()
            if (nextProps.baseData.coverageList && nextProps.baseData.coverageList.length > 0) {
                let tmp = JSON.parse(nextProps.baseData.coverageList)
                let addtionTmp = []
                let mainTmp = []
                let result = [];
                // 保费置零
                tmp.map((item) => {
                    if (item.InsDetailId != 10501) {
                        item.InsuredPremium = 0;
                        result.push(item)
                    }
                })
                this.setState({
                    totalList: result,
                    additionList: addtionTmp,
                    mainList: mainTmp 
                })
            }
        }
        // 使用此历史报价
        if (this.props.queryPriceInfo !== nextProps.queryPriceInfo) {
            // this.setState({
            //     queryPriceInfo: {}
            // })
            this.useHistoryPrice(nextProps.queryPriceInfo)
        }
        if (nextProps.allInsuranceCp !== this.props.allInsuranceCp || nextProps.priceId !== this.props.priceId) {
            let tmpallInsuranceCp = nextProps.allInsuranceCp;
            this.state.priceId = nextProps.priceId;
            if (this.state.baseInfo && this.state.baseInfo.supplierIdList && this.state.baseInfo.supplierIdList.indexOf('')  < 0) {
                // let tmp = [];
                // if (this.state.baseInfo.supplierIdList && this.state.baseInfo.supplierIdList.length ===1 ){
                //     this.setState({
                //         supplierId: Number(this.state.baseInfo.supplierIdList[0])
                //     })
                // }
                // this.state.baseInfo.supplierIdList.map((item, index) => {
                //     tmpallInsuranceCp.map((ite) => {
                //         if (ite.id === item) {
                //             tmp.push(ite)
                //         }
                //     })
                // })
                // this.state.allInsuranceCp = tmp
                // this.setState({
                //     allInsuranceCp: tmp
                // })
                // 更改 1. 保险公司全显示； 2. 选择了保险公司，则选择的保险公司显示在最上面
                let checkedSupplierIdList = this.state.baseInfo.supplierIdList;
                let tmp = []
                tmp = tmpallInsuranceCp.filter((item) => {
                    return checkedSupplierIdList.indexOf(item.id) > -1
                })
                tmpallInsuranceCp.map((item) => {
                    if (checkedSupplierIdList.indexOf(item.id) < 0) {
                        tmp.push(item)
                    }
                })
                this.state.allInsuranceCp = tmp
                this.setState({
                    allInsuranceCp: tmp
                })
            } else {
                this.state.allInsuranceCp = tmpallInsuranceCp
                this.setState({
                    allInsuranceCp: tmpallInsuranceCp
                })
            }
            // 获取报价信息
            if (this.state.priceId && this.state.allInsuranceCp && this.state.allInsuranceCp.length === 1 && !isEmptyObject(this.props.queryPriceInfo)) {
                this.getPriceInfo();
            }
        }
        if (nextProps.refreshData !== this.props.refreshData) {
            this.refreshData()
        }
    };
    refreshData () {
        this.setState({
            supplierId: null,
            totalpremium: 0,
            imageurls: [],
            cipremium: 0,
            bipremium: 0,
            showcicommission: 0,
            showbicommission: 0,
            commission: 0,
            carshiptax: 0,
            showcarshiptax: 0,
            ciCommission: 0,
            biCommission: 0,
            carshipCommission: 0,
            isSeparate: false,
            checkStatus: false,
            pureFee: 0,
            comprehensivePoint: 0,
            fileList: [],
            mainList: [],
            totalList: [],
            defaultValue:'',
            biBeginDate: '',
            ciBeginDate: ''
        })
    }
    //使用历史报价
    useHistoryPrice = (info) => {
        if (this.hasSomeCommission(1)) {
            this.state.cipremium = info.cipremium;
            this.state.showcicommission = info.showcicommission;
            this.state.ciCommission = info.cicommission;
            this.state.ciBeginDate = info.cibegindate || 0;
            
        }
        if (this.hasSomeCommission(2)) {
            this.state.bipremium = info.bipremium;
            this.state.showbicommission = info.showbicommission;
            this.state.biCommission = info.bicommission;
            this.state.biBeginDate = info.bibegindate || 0;
        }
        if (this.hasSomeCommission(3)) {
            this.state.carshiptax = info.carshiptax;
            this.state.showcarshiptax = info.showcarshiptax;
            this.state.carshipCommission = info.carshiptaxcommission;
        }
        let {
            cipremium,
            showcicommission,
            ciCommission,
            bipremium,
            showbicommission,
            biCommission,
            carshiptax,
            showcarshiptax,
            carshipCommission
        } = this.state;
        let tmptotalpremium = Number(cipremium) + Number(bipremium) + Number(carshiptax);
        let tmpcommission = Number(ciCommission) + Number(biCommission) + Number(carshipCommission);
        let tmppureFee = tmptotalpremium - tmpcommission;
        let tmp = Number(cipremium) + Number(bipremium);
        let tmpcomprehensivePoint = 0
        if (tmp > 0) {
            tmpcomprehensivePoint = tmpcommission / tmp * 100;
        }
        this.setState({
            totalpremium: Math.round(tmptotalpremium * 100) / 100,
            commission: Math.round(tmpcommission * 100) / 100,
            pureFee: Math.round(tmppureFee * 100) / 100,
            comprehensivePoint: Math.round(tmpcomprehensivePoint * 100) / 100,
            fromHistory: true,
            supplierId: info.supplierId,
            isSeparate: info.isSeparate || false
        })
    }
    // 
    getCoverageList = (list) => {
        let tmpCoverageList
        let tmpCoverage = []
        let tmpBaseInfo = this.state.baseInfo;
        if (list && list.length > 0) {
            tmpCoverageList = JSON.parse(list);
        } else {
            if (!tmpBaseInfo.coverageList || tmpBaseInfo.coverageList.length === 0) {
                return;
            }
            tmpCoverageList = JSON.parse(tmpBaseInfo.coverageList);
        }
        let tmpInsDetailId = tmpCoverageList.length && tmpCoverageList.map((item, index) => {
            return Number(item.InsDetailId);
        })
        if (tmpInsDetailId.indexOf(10501) > -1 || tmpInsDetailId.indexOf(11) > -1) {
            tmpCoverage.push({
                type: 1,
                feeTitle: '交强保费',
                rebateTitle: '交强返佣点位',
                commissionTitle: '交强佣金',
                beginDateTitle: '起保日期'
            })
            tmpCoverage.push({
                type: 3,
                feeTitle: '车船税保费',
                rebateTitle: '车船税返佣点位',
                commissionTitle: '车船税佣金'
            })
        }
        // if (tmpBaseInfo.vvtaxstate === 1) {
        //     tmpCoverage.push({
        //         type: 3,
        //         feeTitle: '车船税保费',
        //         rebateTitle: '车船税返佣点位',
        //         commissionTitle: '车船税佣金'
        //     })
        // }
        if (hasCommercialInsurance(tmpCoverageList)) {
            this.setState({
                isHasBi: true
            })
            tmpCoverage.push({
                type: 2,
                feeTitle: '商业保费',
                rebateTitle: '商业保费返佣点位',
                commissionTitle: '商业佣金',
                beginDateTitle: '起保日期'
            })
        }
        this.setState({
            coverageList: tmpCoverage
        })
    }
    // 起保日期
    changeDate = (e, type) => {
        let date = e.target.value;
        if (type === 1) {
            this.setState({
                ciBeginDate: date
            })
        } else if (type === 2) {
            this.setState({
                biBeginDate: date
            })
        }
    }

    // 输入变化时计算输出
    calculateFee = (e, type, itemType, num) => {
        let value
        if (num != undefined && num >= 0) {
            value = num
        } else {
            value = e.target.value;
        }
        if (type === 'fee') {
            switch (itemType) {
                case 1:
                    this.state.cipremium = value;
                    break;
                case 2:
                    this.state.bipremium = value;
                    break;
                case 3:
                    this.state.carshiptax = value
                    break;
                default:
                    break
            }
        } else if (type === 'rebate') {
            switch (itemType) {
                case 1:
                    this.state.showcicommission = value;
                    break;
                case 2:
                    this.state.showbicommission = value;
                    break;
                case 3:
                    this.state.showcarshiptax = value;
                    break;
                default:
                    break;
            }
        }
        this.calculateResult();
    }
    // 计算各项值
    // 价税分离时计算公式如下：
    // 小数点才用四舍五入
    // 交强佣金 = 交强保费 * 交强返佣点/1.06
    // 商业佣金 = 商业保费 * 商业返佣点/1.06
    // 车船税不变
    // 总保费 = 交强保费+商业保费+车船税
    // 总佣金 = 交强佣金+商业佣金+车船税佣金
    // 净保费 = 总保费-总佣金
    // 综合点位 = 总佣金/（交强+商业）*100
    calculateResult = () => {
        const {isSeparate, cipremium, bipremium, carshiptax, showcicommission, showbicommission, showcarshiptax} = this.state;
        let tmpciCommission, tmpbiCommission, tmpcarshipCommission, tmptotalpremium, tmpcommission, tmppureFee, tmpcomprehensivePoint;
        if (isSeparate) {
            tmpciCommission = Number(cipremium)*Number(showcicommission)/106;
            tmpbiCommission = Number(bipremium)*Number(showbicommission)/106;
        } else {
            tmpciCommission = Number(cipremium)*Number(showcicommission)/100;
            tmpbiCommission = Number(bipremium)*Number(showbicommission)/100;
        }
        tmpcarshipCommission = Number(carshiptax)*Number(showcarshiptax)/100;
        tmptotalpremium = Number(cipremium) + Number(bipremium) + Number(carshiptax);
        tmpcommission = tmpciCommission + tmpbiCommission + tmpcarshipCommission;
        tmppureFee = tmptotalpremium - tmpcommission;
        let tmp = Number(cipremium) + Number(bipremium);
        if (tmp > 0) {
            tmpcomprehensivePoint = tmpcommission / tmp * 100;
        } else {
            tmpcomprehensivePoint = 0
        }
        this.setState({
            ciCommission: Math.round(tmpciCommission * 100) / 100,
            biCommission: Math.round(tmpbiCommission * 100) / 100,
            carshipCommission: Math.round(tmpcarshipCommission * 100) / 100,
            totalpremium: Math.round(tmptotalpremium * 100) / 100,
            commission: Math.round(tmpcommission * 100) / 100,
            pureFee: Math.round(tmppureFee * 100) / 100,
            comprehensivePoint: Math.round(tmpcomprehensivePoint * 100) / 100,
        })

    }
    // 获取选中的保险公司id
    getSelectedValue = () => {
        let obj = document.getElementById('choosedInsurance'); //定位id
        let index = obj.selectedIndex; // 选中索引
        let text = obj.options[index].text; // 选中文本
        let insuranceCpId = obj.options[index].value; // 选中值
        this.state.supplierId = Number(insuranceCpId);
        this.getPriceInfo();
    }
    handleOk = () => {
        let {submitParams} = this.state
        this.props.getPrice(submitParams);
    }
    dealCancel = () => {
        this.setState({
            isShowToast: false,
        });
    }
    getPrice = () => {
        let self = this;
        const {
            supplierId,
            totalpremium,
            imageurls,
            cipremium,
            bipremium,
            showcicommission,
            showbicommission,
            commission,
            carshiptax,
            showcarshiptax,
            priceid,
            ciCommission,
            biCommission,
            carshipCommission,
            biBeginDate,
            ciBeginDate,
            isSeparate,
            totalList,
            isHasBi,
            checkStatus
        } = this.state;
        if (!supplierId) {
            message.info('请选择保险公司!!');
            return;
        }
        let params = {
            supplierid: supplierId,
            totalpremium: Number(totalpremium),
            imageurls,
            cipremium: Number(cipremium),
            bipremium: Number(bipremium),
            showcicommission: Number(showcicommission),
            showbicommission: Number(showbicommission),
            commission: Number(commission),
            carshiptax: Number(carshiptax),
            showcarshiptax: Number(showcarshiptax),
            cicommission: Number(ciCommission),
            bicommission: Number(biCommission),
            carshiptaxcommission: Number(carshipCommission),
            bibegindate: biBeginDate,
            cibegindate: ciBeginDate,
            priceid: this.props.priceId,
            separate: isSeparate,
            checkStatus: checkStatus
            // coverageList: JSON.stringify(totalList)
        }
        if (isHasBi) {
            let totalBi = 0;

            totalList.map((item) => {
                if (item.InsuredPremium && Number(item.InsuredPremium) > 0) {
                    totalBi = totalBi + Number(item.InsuredPremium) * 100
                }
            })
            if (totalBi/100 != bipremium) {
                params.coveragelist = JSON.stringify(totalList);
                this.setState({
                    isShowToast: true,
                    submitParams: params
                })
                return;
            }
            
        }
        // this.refreshData();
        params.coveragelist = JSON.stringify(totalList);
        this.props.getPrice(params);
    };
    cancel = () => {
        this.props.closeSubmit();
    };
    uploadImage = () => {
        console.log('上传图片')
    }
    handleCancel = () => {
        this.setState({
            previewVisible: false
        })
    };
    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        })
    };
    handleChange = ({fileList}) => {
        this.setState({fileList});
        let tmpFile = fileList.map((item, index) => {
            if (item.status === 'done') {
                let tmp = 'https://openapi.youbaolian.cn/' + item.response.resultMap.uri;
                return tmp
            }
        });
        if (tmpFile[tmpFile.length - 1] != null) {
            // this.setState({
            //     imageurls: tmpFile
            // });
            this.state.imageurls = tmpFile;
        }
    };
    // 是否价税分离
    onChangeSwitch = (checked) => {
        // this.setState({
        //     isSeparate: checked
        // })
        this.state.isSeparate = checked;
        this.calculateResult();
    }
    // 核保状态
    changeCheckStatus = (checked) => {
        this.setState({
            checkStatus: checked
        })
    }
    handlePaste = (e) => {
        const _this = this;
        const clipboardData = e.clipboardData;
        if (!(clipboardData && clipboardData.items)) {//是否有粘贴内容
            return;
        }
        for (let i = 0, len = clipboardData.items.length; i < len; i++) {
            const item = clipboardData.items[i];
            if (item.kind === "string" && item.type == "text/plain") {
                item.getAsString(function (str) {
                    // console.log(str);
                })
            } else if (item.kind === "file") {
                const blob = item.getAsFile();
                const url = 'https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/';
                const extension = blob.type.match(/\/([a-z0-9]+)/i)[1].toLowerCase();
                const fileName = 'paste_' + Date.now();
                const formData = new FormData();
                // formData.append("partnerId", baseInfo.partnerId);
                formData.append("file", blob, fileName + '.' + extension);
                formData.append("extension", extension);
                formData.append("mimetype", blob.type);
                formData.append("submission-type", 'paste');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.onload = function () {
                    if (xhr.status == 200) {
                        console.log(xhr.responseText);
                        const response = JSON.parse(xhr.responseText);
                        _this.state.fileList.push({
                            uid: fileName,
                            name: fileName + '.' + extension,
                            status: 'done',
                            url: 'https://openapi.youbaolian.cn/' + response.resultMap.uri,
                            response: response
                        });
                        _this.handleChange({fileList: _this.state.fileList});
                        _this.setState({fileList: _this.state.fileList});
                    }
                }
                xhr.onerror = function (ev) {
                    console.log(ev);
                };
                xhr.send(formData);
            }
        }
    };
    // 是否含有某种保险
    hasSomeCommission = (type) => {
        let has = false;
        this.state.coverageList.map((item) => {
            if (item.type === type ) {
                has = true
            }
        })
        return has;
    };
    formCoverageName = (code) => {
        switch(code.toString()) {
            case '10001':
            case '30001':
                return '车损险';
                break;
            case '10002':
            case '30002':
                return '三者险';
                break;
            case '10004':
            case '30004':
                return '司机责任险';
                break;
            case '10005':
            case '30005':
                return '乘客责任险';
                break;
            case '10003':
            case '30003':
                return '盗抢险';
                break;
            case '20202':
            case '30202':
                return '划痕险';
                break;
            case '20201':
                return '玻璃险';
                break;
            case '20203':
            case '30203':
                return '自燃险';
                break;
            case '20204':
            case '30204':
                return '涉水险';
                break;
            case '20205':
                return '指定修理厂险';
                break;
            case '20210':
                return '无法找到第三方特约险';
                break;
            default:
                return '';
                break;
        }
    };
    formateCoverageList (list) {
        if (list && list.length === 0) {
            return;
        }
        let tmp = JSON.parse(list)
        let addtionTmp = []
        let mainTmp = []
        let InsDetailIdList = tmp.map((item, index) => {
            return Number(item.InsDetailId)
        })
        let formateTmp = [];
        tmp.map((item) => {
            if (item.InsDetailId == 10501) {
                return;
            }
            item.ins = this.formCoverageName(item.InsDetailId);
            if (item.InsDetailId == 20201) {
                formateTmp.push({
                    ins: this.formCoverageName(item.InsDetailId),
                    InsDetailId: item.InsDetailId,
                    Amount: item.Amount,
                    InsuredPremium: item.InsuredPremium,
                    flag: item.flag
                })
            } else {
                formateTmp.push({
                    ins: this.formCoverageName(item.InsDetailId),
                    InsDetailId: item.InsDetailId,
                    Amount: item.Amount,
                    InsuredPremium: item.InsuredPremium
                })
            }
            
        })
        // formateTmp.map((item) => {
        //     if (Number(item.InsDetailId) < 30000 && Number(item.InsDetailId) !== 10501) {
        //         mainTmp.push(item)
        //         let temp3 = Number(item.InsDetailId) + 20000;
        //         let temp2 = Number(item.InsDetailId) + 10000;
        //         if (InsDetailIdList.indexOf(temp3) > -1 || InsDetailIdList.indexOf(temp2) > -1) {
        //             let tmpItem = formateTmp.filter((ite) => {
        //                 return ite.InsDetailId == temp3 || ite.InsDetailId == temp2
        //             })
        //             addtionTmp[item.InsDetailId] = tmpItem
        //         }
        //     }
        // })
        let result = formateTmp.filter((item) => {
            return Number(item.InsDetailId) !== 10501
        })
        this.setState({
            totalList: result,
            additionList: addtionTmp,
            mainList: mainTmp 
        })

    };
    // 获取去报价信息
    getPriceInfo = () => {
        const {supplierId, allInsuranceCp, priceId} = this.state;
        let tmpsupplierId = supplierId || allInsuranceCp[0].id;
        // let tmpsupplierId = 9822;
        let self = this;
        let params = `priceId=${priceId}&supplierId=${tmpsupplierId}`;
        get_price_info(params).then(res => {
            console.log('get_price_info: ', res)
            if (res.returnCode === 2) {
                if (res.dto) {
                    let info = res.dto;
                    // if (self.hasSomeCommission(1)) {
                        self.state.cipremium = info.ciPremium;
                        self.state.showcicommission = info.showcicommission;
                        self.state.ciCommission = info.ciCommission;
                        self.state.ciBeginDate = info.ciBeginDate;
                        
                    // }
                    // if (self.hasSomeCommission(2)) {
                        self.state.bipremium = info.biPremium;
                        self.state.showbicommission = info.showbicommission;
                        self.state.biCommission = info.biCommission;
                        self.state.biBeginDate = info.biBeginDate;
                    // }
                    // if (self.hasSomeCommission(3)) {
                        self.state.carshiptax = info.carshiptax;
                        self.state.showcarshiptax = info.showcarshiptax;
                        self.state.carshipCommission = info.carshipCommission;
                    // }
                    let {
                        cipremium,
                        showcicommission,
                        ciCommission,
                        bipremium,
                        showbicommission,
                        biCommission,
                        carshiptax,
                        showcarshiptax,
                        carshipCommission
                    } = self.state;
                    let tmptotalpremium = Number(cipremium) + Number(bipremium) + Number(carshiptax);
                    let tmpcommission = Number(ciCommission) + Number(biCommission) + Number(carshipCommission);
                    let tmppureFee = tmptotalpremium - tmpcommission;
                    let tmp = Number(cipremium) + Number(bipremium);
                    let tmpcomprehensivePoint = 0
                    if (tmp > 0) {
                        tmpcomprehensivePoint = tmpcommission / tmp * 100;
                    }
                    self.setState({
                        totalpremium: Math.round(tmptotalpremium * 100) / 100,
                        commission: Math.round(tmpcommission * 100) / 100,
                        pureFee: Math.round(tmppureFee * 100) / 100,
                        comprehensivePoint: Math.round(tmpcomprehensivePoint * 100) / 100
                    })
                    // 险种详情
                    let coverageList = info.coverageList
                    this.getCoverageList(coverageList);
                    self.formateCoverageList(coverageList)
                } else {
                    let tmp = JSON.parse(self.state.baseInfo.coverageList)
                    let addtionTmp = []
                    let mainTmp = []
                    let result = [];
                    // 保费置零
                    tmp && tmp.length && tmp.map((item) => {
                        if (item.InsDetailId != 10501) {
                            item.InsuredPremium = 0;
                            result.push(item)
                        }
                    })
                    self.setState({
                        totalList: result,
                        additionList: addtionTmp,
                        mainList: mainTmp,
                        cipremium: 0,
                        bipremium: 0,
                        showcicommission: 0,
                        showbicommission: 0,
                        commission: 0,
                        carshiptax: 0,
                        showcarshiptax: 0,
                        ciCommission: 0,
                        biCommission: 0,
                        carshipCommission: 0
                    })
                    self.getCoverageList();
                    this.calculateResult();
                }
            }
        })
    }
    dealChange = (value) => {
        this.setState({defaultValue:value})
        this.state.supplierId = Number(value);
        this.getPriceInfo();
    }
    
    handleBlur = () => {
        console.log('blur');
    }
    
    handleFocus = () => {
        console.log('focus');
    }
    toggleDetailShow = () => {
        let { isShowDetail } = this.state;
        this.setState({
            isShowDetail: !isShowDetail
        })
    }
    changeFee = (e, item) => {
        let fee = e.target.value;
        if (isNaN(fee)) {
            message.info('请输入数字！');
            return;
        }
        // 
        if (fee.indexOf('.') > 0 && fee.indexOf('.') === fee.length-4) {
            message.info('小数位最多只能两位！');
            return;
        }
        let { totalList } = this.state;
        let tmp = [];
        totalList.map((ite, idx) => {
            if (item.InsDetailId === ite.InsDetailId) {
                ite.InsuredPremium = fee;
            }
            tmp.push(ite)
        })
        let totalBi = 0;
        tmp.map((item) => {
            if(item.InsuredPremium && item.InsuredPremium > 0) {
                totalBi = totalBi +  Number(item.InsuredPremium) * 100
            }
        })
        this.calculateFee('', 'fee', 2, totalBi/100);
        this.setState({
            totalList: tmp
        })
    }
    render() {
        const {
            coverageList,
            previewVisible,
            previewImage,
            fileList,
            biBeginDate,
            ciBeginDate,
            cipremium,   //交强险保费
            bipremium,   //商业险保费
            showcicommission,    //交强险返佣点
            showbicommission,    //商业险返佣点
            carshiptax,      //车船税
            showcarshiptax,      //车船税返佣点
            commission,   //总佣金
            totalpremium,  //总保费
            ciCommission,        //交强佣金
            biCommission,        // 商业佣金
            carshipCommission,   // 车船佣金
            pureFee,
            comprehensivePoint,
            supplierId,
            supplierName,
            isSeparate,
            allInsuranceCp,
            fromHistory,
            isHasBi,
            isShowDetail,
            totalList,
            mainList,
            additionList,
            defaultValue,
            isShowToast,
            confirmLoading,
            checkStatus
        } = this.state;
        const {isShowSubmit, baseData } = this.props;
        const uploadButton = (
            <div>
                <Icon type="plus"/>
            </div>
        );
        // debugger
        return (
            <div className='submit-offer-container' onPaste={this.handlePaste}
                 style={{display: isShowSubmit ? 'block' : 'none'}}>
                <div className='submit-offer-content'>
                    <div className='submit-title-container'>
                        <span className='submit-title'>提交报价</span>
                        {/* <span className='submit-title-close' onClick={this.cancel}>×</span> */}
                        <img src={closeIcon} alt="" className='submit-title-close' onClick={this.cancel}/>
                    </div>
                    <div className='submit-content'>
                        <div>
                            <span className='isSepate'>是否价税分离</span>
                            <Switch checked={isSeparate} onChange={this.onChangeSwitch} />
                            <span className='isSepate' style={{marginLeft: '20px'}}>核保状态</span>
                            <Switch checked={checkStatus} onChange={this.changeCheckStatus}/>
                        </div>
                        <div>
                            
                        </div>
                        <div className='insurance-company'>
                            <span className='insurance-title'>保险公司</span>
                            {/* {
                                baseData.supplierIdList && baseData.supplierIdList.length === 1 && baseData.supplierIdList[0] !== ''
                                ? <span>{allInsuranceCp[0] && allInsuranceCp[0].name || ''}</span>
                                : 
                            } */}
                            {
                                fromHistory
                                ? <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="请选择投保的保险公司"
                                    optionFilterProp="children"
                                    value={defaultValue || '请选择投保的保险公司'}
                                    onChange={this.dealChange}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    className='insurance-select'
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        allInsuranceCp && allInsuranceCp.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.id}>{item.name}</Option>
                                            )
                                        })
                                    }
                                </Select>
                                : <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="请选择投保的保险公司"
                                    optionFilterProp="children"
                                    value={defaultValue || '请选择投保的保险公司'}
                                    onChange={this.dealChange}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    className='insurance-select'
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        allInsuranceCp && allInsuranceCp.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.id}>{item.searchName}</Option>
                                            )
                                        })
                                    }
                                </Select>
                            }
                            
                        </div>
                        <ul>
                            {
                                coverageList.map((item, index) => {
                                    return (
                                        <li className='submit-item-container' key={index}>
                                            <div className='submit-item'>
                                                <span className='fee'>{item.feeTitle}</span>
                                                <input
                                                    onChange={(e) => this.calculateFee(e, 'fee', item.type)}
                                                    className='submit-default'
                                                    type="text"
                                                    placeholder='0'
                                                    maxLength="12"
                                                    value={item.type === 1 && cipremium > 0 ? cipremium : (item.type === 2 && bipremium > 0) ?  bipremium : (item.type === 3 && carshiptax > 0) ? carshiptax : ''}
                                                />
                                            </div>
                                            <div className='submit-item'>
                                                <span className='fee'>{item.rebateTitle}</span>
                                                <input
                                                    onChange={(e) => this.calculateFee(e, 'rebate', item.type)}
                                                    className='submit-default'
                                                    type="text"
                                                    placeholder='0'
                                                    maxLength="2"
                                                    value={item.type === 1 && showcicommission > 0 ? showcicommission : item.type === 2 && showbicommission > 0 ?  showbicommission : item.type === 3 && showcarshiptax > 0 ? showcarshiptax : ''}
                                                /><span className='sign'>%</span>
                                            </div>
                                            <div className='submit-item'>
                                                <span className='fee'>{item.commissionTitle}</span>
                                                <input
                                                    className='submit-default'
                                                    type="text"
                                                    placeholder='0'
                                                    value={item.type === 1 ? ciCommission : item.type === 2 ? biCommission : item.type ===3 ? carshipCommission : ''}
                                                    readOnly="true"
                                                />
                                            </div>
                                            {/* <div className='submit-item'>
                                                {
                                                    item.type !== 3
                                                    ? <div>
                                                        <span className='fee'>{item.beginDateTitle}</span>
                                                        <input
                                                            onChange={(e) => this.changeDate(e, item.type)}
                                                            className='submit-default'
                                                            type="text"
                                                            placeholder='20180808'
                                                            value={item.type === 1 ? ciBeginDate : item.type === 2 ?  biBeginDate : ''}
                                                        />
                                                    </div>
                                                    : null
                                                }
                                                
                                            </div> */}
                                        </li>
                                    )
                                })
                            }

                        </ul>
                        {
                            isHasBi
                            ?   (
                                    <div className='insurance-detail-wrapper'>
                                        <span className='insurance-title' onClick={this.toggleDetailShow}>{isShowDetail ? '收起' : '展开'}明细</span>
                                        {
                                            isShowDetail
                                            ? (
                                                <div className='insurance-container'>
                                                    <ul>
                                                        {
                                                            totalList.map((item, index) => {
                                                                return(
                                                                    <li className="item-container" key={index}>
                                                                        {
                                                                            Number(item.InsDetailId) > 30000
                                                                            ? <span className='item ins'>{item.ins}不计免赔</span>
                                                                            : <span className='item ins'>{item.ins}{item.Amount ? '(' + Number(item.Amount).toFixed(2) + ')' : ''}</span>
                                                                        }
                                                                        <input
                                                                            onChange={(e) => this.changeFee(e, item)}
                                                                            className='item input-style'
                                                                            type="text"
                                                                            placeholder='0'
                                                                            maxLength="12"
                                                                            value={item.InsuredPremium || ''}
                                                                            // onKeyUp={(e)=> {e.target.value.replace(/[^\d{1,}(\.\d{0,2})?$]/g,'')}}
                                                                        />
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                        
                                                    </ul>
                                                </div>
                                              )
                                            : null
                                        }
                                    </div>
                                )
                            :   null
                        }
                        
                        <div className='sub-image-container'>
                            <span className='sub-image-title' style={{marginBottom: '10px'}}>报价截图<span style={{fontSize: '12px'}}>（支持CTRL+V粘贴您QQ截取的报价图片）</span></span>
                            <div className="clearfix">
                                <Upload
                                    action="https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                    onChange={this.handleChange}
                                >
                                    {fileList.length >= 3 ? null : uploadButton}
                                </Upload>
                                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                    <img alt="example" style={{width: '100%'}} src={previewImage}/>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className='submit-footer'>
                        <div className='submit-footer-content'>
                            <div className='submit-footer-item'>
                                <span>总保费： </span>
                                <span className='sub-fee'>{totalpremium}元</span>
                            </div>
                            <div className='submit-footer-item'>
                                <span>总返佣： </span>
                                <span className='sub-fee'>{commission}元</span>
                            </div>
                            <div className='submit-footer-item'>
                                <span>净费： </span>
                                <span className='sub-fee'>{pureFee}元</span>
                            </div>
                            <div className='submit-footer-item'>
                                <span>综合点位： </span>
                                <span className='sub-fee'>{comprehensivePoint}</span>
                            </div>
                        </div>
                        <div className='submit-operate-container'>
                            <button className='submit-btn-default submit-submit' onClick={this.getPrice}>提交</button>
                            <button className='submit-btn-default submit-default' onClick={this.cancel}>取消</button>
                        </div>
                    </div>
                    <Modal title="提示"
                        visible={isShowToast}
                        onOk={this.handleOk}
                        confirmLoading={confirmLoading}
                        onCancel={this.dealCancel}
                        okText="确定"
                        cancelText='取消'
                    >
                        <p>保费总金额和明细金额计算不一致, 是否继续提交？？</p>
                    </Modal>
                </div>
            </div>
        )
    }
}
