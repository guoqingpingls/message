import React from 'react';
import MpModal from '../components/MpModal.jsx';
import {Switch, Select, Icon, Upload, Modal, Button, message } from 'antd';
import '../stylesheets/SubmitPrice.less';
const { hasCommercialInsurance, isEmptyObject, filterInsurance, isHasCommercial, translateIdToName } = require('../util/util.js');
const Option = Select.Option;
import {
  get_price_info,
  submit_to_get_price
} from '../services/index';
import { type } from 'os';
const pageName = '提交报价'
export default class SubmitPrice extends React.Component{
  // 数据三个来源
  // baseInfo 基础数据 渲染ui 无填充
  // queryInfo 报价记录数据  渲染ui 有填充
  // renewalInfo  续保数据 渲染ui  有填充
  constructor (props) {
    super(props);
    this.state = {
      isSeparate: false,  // 是否价税分离
      checkStatus: true,  // 核保状态
      defaultValue: '',   
      supplierId: null,     // choose 保险公司id
      cipremium: 0,   //交强险保费
      bipremium: 0,   //商业险保费
      showcicommission: 0,    //交强险费率
      showbicommission: 0,    //商业险费率
      carshiptax: 0,      //车船税
      showcarshiptax: 0,      //车船税费率
      ciCommission: 0,        //交强佣金
      biCommission: 0,        // 商业佣金
      carshipCommission: 0,   // 车船佣金
      commission: 0,   //总佣金
      totalpremium: 0,  //总保费
      pureFee: 0,      //净费
      comprehensivePoint: 0,  //综合点位
      isHasBi: false,     // 是否含有商业险
      isShowDetail: false,    // 是否显示商业险明细
      fileList: [],    // 预览图片列表
      previewImage: '',   // 预览图片
      previewVisible: false,    // 显示预览modal
      isShowToast: false,     // 是否显示商业险 !== 明细和 的提示
      recordId: null,

      commercialItems: [],    // 保险项目
      info: {},   // baseInfo queryInfo renewalInfo
      dataType: 0, // 0 baseInfo, 1 queryInfo, 2 renewalInfo
    }
  }
  componentDidMount () {
    let { baseInfo, queryPriceInfo } = this.props;
    if (isEmptyObject(queryPriceInfo)) {
      this.state.dataType = 1
      this.state.recordId = queryPriceInfo.SupplierId;
      this.state.supplierId = queryPriceInfo.SupplierId;
      this.dealBaseData(queryPriceInfo, true)
    } else {
      this.dealBaseData(baseInfo, false)
    }
  }
  // 获取保险项id
  getCoverageIds = (list) => {
    let InsDetailIdList = list.map((item) => {
      if (item.DetailId) {
        return +item.DetailId
      } else if (item.InsDetailId) {
        return +item.InsDetailId
      }
    })
    return InsDetailIdList
  }
  // 获取保险项
  getCoverageItems = (InsDetailIdList, isFill) =>　{
    let {info} = this.state;
    let items = []
    if (InsDetailIdList.indexOf(10501) > -1) {
      items.push({
        type: 1,
        feeTitle: '交强保费',
        rebateTitle: '交强返佣点位',
        commissionTitle: '交强佣金',
      },
      {
        type: 3,
        feeTitle: '车船税保费',
        rebateTitle: '车船税返佣点位',
        commissionTitle: '车船税佣金'
      })
    }
    if (isHasCommercial(InsDetailIdList)) {
      this.state.isHasBi = true
      items.push({
        type: 2,
        feeTitle: '商业保费',
        rebateTitle: '商业保费返佣点位',
        commissionTitle: '商业佣金',
      })
    }
    if (isFill) {
      // 数据填充
      //  queryInfo BIPremium  BICommission  CIPremium  CICommission ShowBICommission  ShowCICommission  CarshipTax  还差 showcarshiptax carshipCommission 
      //renewalInfo biPremium  biCommission  ciPremium  ciCommission showbicommission  showcicommission  carshiptax  showcarshiptax  carshipCommission
      this.state.cipremium = info.ciPremium || info.CIPremium || 0;
      this.state.showcicommission = info.showcicommission || info.ShowCICommission || 0;
      this.state.ciCommission = info.ciCommission || info.CICommission || 0;
      this.state.bipremium = info.biPremium || info.BIPremium || 0;
      this.state.showbicommission = info.showbicommission || info.ShowBICommission || 0;
      this.state.biCommission = info.biCommission || info.BICommission || 0;
      this.state.carshiptax = info.carshiptax || info.CarshipTax || 0;
      this.state.showcarshiptax = info.showcarshiptax || 0;
      this.state.carshipCommission = info.carshipCommission || 0;
      this.calculateResult();
    }
    return items;
  }
  // 获取商业险明细
  getBIDetail = (list, isFill) => {
    let {dataType} = this.state;
    let result = []
    if (list.length) {
      list.map((item) => {
        // renewalInfo: DetailId　　　InsuredAmount　　InsuredPremium      Flag
        // baseInfo   : InsDetailId  Amount                               flag
        // queryInfo  ：DetailId　　　InsuredAmount　　InsuredPremium      Flag
        let id = dataType === 0 ? item.InsDetailId : item.DetailId
        let amount = dataType === 0 ? item.Amount : item.InsuredAmount
        let InsuredPremium = dataType === 0 ? 0 : item.InsuredPremium
        let flag = dataType === dataType === 0 ? item.flag : item.Flag
        if (+id === 20201) {
          result.push({
            ins: translateIdToName(id),
            InsDetailId: id,
            Amount: amount,
            InsuredPremium: item.InsuredPremium || 0,
            flag: item.flag
          })
        }
        if (+id !== 10501 &&  +id !== 20201) {
          result.push({
            ins: translateIdToName(id),
            InsDetailId: id,
            Amount: amount,
            InsuredPremium: item.InsuredPremium || 0,
          })
        }
      })
    }
    return result;
  }
  dealUntreatedData = (list) => {
    let newList = []
    list.map((item) => {
      if (item.IsNotDeductible) {
        newList.push({
          DetailId: +item.InsDetailId < 20000 ? +item.InsDetailId + 20000 : +item.InsDetailId + 10000,
          InsuredPremium: item.NcfPremium,
          InsuredAmount: 0,
        })
      }
      newList.push({
        DetailId: item.InsDetailId,
        InsuredPremium: item.InsuredPremium,
        InsuredAmount: item.Amount,
        Flag: item.Flag
      })
    })
    return newList
  }
  // 处理baseInfo数据
  dealBaseData = (info, isFill, isChangeInsurance) => {
    // 获取保险项
    // 如果有queryInfo renewalInfo baseInfo 
    if (info.coverageList && typeof info.coverageList === 'string') {
      info.coverageList = JSON.parse(info.coverageList)
    }
    this.state.info = info
    let tmpList = info.coverageList || []
    if (tmpList.length === 0) {
      return;
    }
    // 如果是未处理的数据
    if (isChangeInsurance) {
      tmpList = this.dealUntreatedData(tmpList)
    }
    // 获取保险公司id列表
    let InsDetailIdList = this.getCoverageIds(tmpList).sort();
    // 获取保险项
    let items = this.getCoverageItems(InsDetailIdList, isFill)
    // 有商业险，获取明细
    let totalList = []
    if (this.state.isHasBi) {
      totalList = this.getBIDetail(tmpList, isFill)
    }
    this.setState({
      totalList: totalList,
      commercialItems: items
    })
  }
  // 提交报价
  submit = () => {
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
    let {priceId} = this.props;
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
      priceid: priceId,
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
    params.coveragelist = JSON.stringify(totalList);
    this.submitPrice(params);
    
  };
  submitPrice = (params) => {
    let self = this;
    let {baseInfo} = this.props;
    submit_to_get_price(params).then((res) => {
      self.props.closeSubmitPriceModal(1) // 关闭弹窗
      // 清空数据
      // self.refreshData()
      self.dealCancel()
      // send IM
      let msgContent = {};
      msgContent.type = "IM";
      msgContent.target = 'C_' + baseInfo.userid;
      msgContent.msg = 'replyContent';
      msgContent.time = Date.now();
      localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
    })
  }
  // 商业险 !== 商业明细和 取消
  dealCancel = () => {
    this.setState({
      isShowToast: false,
    });
  }
  // 商业险 !== 商业明细和 继续
  handleOk = () => {
    let {submitParams} = this.state
    this.submitPrice(submitParams);
  }
  // 关闭弹窗
  cancel = () => {
    this.props.closeSubmitPriceModal()
  }
  // 保险公司改变
  dealChange = (value) => {
    this.setState({defaultValue:value, recordId: null})
    this.state.supplierId = Number(value);
    this.getPriceInfo();
  }
  // 获取去报价信息
  getPriceInfo = () => {
    let {supplierId} = this.state;
    let {allInsuranceCp, priceId, baseInfo} = this.props;
    let tmpsupplierId = supplierId || allInsuranceCp[0].id;
    let self = this;
    let params = `priceId=${priceId}&supplierId=${tmpsupplierId}`;
    get_price_info(params).then(res => {
      console.log(res)
      if (res.returnCode === 2) {
        this.state.dataType = 2
        if (res.dto) {
          self.dealBaseData(res.dto, true, true)
        } else {
          self.resetData()
        }
      }
    })
  }
  // // 数据置零
  resetData = () => {
    let {totalList} = this.state;
    // 商业险保费置0
    let result = []
    result = totalList.length && totalList.map((item) => {
      if (item.InsDetailId != 10501) {
        item.InsuredPremium = 0;
        result.push(item)
      }
    })
    this.setState({
      cipremium: 0,
      bipremium: 0,
      showcicommission: 0,
      showbicommission: 0,
      carshiptax: 0,
      showcarshiptax: 0,
      ciCommission: 0,
      biCommission: 0,
      carshipCommission: 0,
      commission: 0,
      totalpremium: 0,
      pureFee: 0,
      comprehensivePoint: 0,
      totalList: result
    })
    
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
  // 是否显示商业险明细
  toggleDetailShow = () => {
    let { isShowDetail } = this.state;
    this.setState({
        isShowDetail: !isShowDetail
    })
  }
  // 上传图片
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
      this.state.imageurls = tmpFile;
    }
  };
  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      previewVisible: false
    })
  };
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
  // 是否价税分离
  onChangeSwitch = (checked) => {
    this.state.isSeparate = checked;
    this.calculateResult();
  }
  // 核保状态
  changeCheckStatus = (checked) => {
    this.setState({
      checkStatus: checked
    })
  }
  // 明细更改
  changeFee = (e, item) => {
    let fee = e.target.value;
    if (isNaN(fee)) {
      message.info('请输入数字！');
      return;
    }
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
  render () {
    let {
      isSeparate,
      checkStatus,
      defaultValue,
      coverageList,
      cipremium,   //交强险保费
      bipremium,   //商业险保费
      showcicommission,    //交强险费率
      showbicommission,    //商业险费率
      carshiptax,      //车船税
      showcarshiptax,      //车船税费率
      ciCommission,        //交强佣金
      biCommission,        // 商业佣金
      carshipCommission,   // 车船佣金
      commission,   //总佣金
      totalpremium,  //总保费
      pureFee,      //净费
      comprehensivePoint,  //综合点位
      isHasBi,      // 是否有商业险
      isShowDetail,     // 是否显示商业险明细
      totalList,
      previewImage,
      previewVisible,
      fileList,
      isShowToast,
      recordId,
      commercialItems,    // 保险项list

    } = this.state;
    let {fromRecord, allInsuranceCp} = this.props
    const uploadButton = (
      <div>
        <Icon type="plus"/>
      </div>
    );
    return (
      <MpModal title='提交报价' cancel={this.cancel} isShowFooter={true} height='80%'>
        <div className='submit-price-wrapper'>
          <div className="submit-price-content">
            <div className='submit-head'>
              <span className='label'>是否价税分离</span>
              <Switch checked={isSeparate} onChange={this.onChangeSwitch} />
              <span className='label label-right' style={{marginLeft: '20px'}}>核保状态</span>
              <Switch checked={checkStatus} onChange={this.changeCheckStatus}/>
            </div>
            <div className='select-insurance'>
              <span className='title'>保险公司</span>
              {
                fromRecord
                ? <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="请选择投保的保险公司"
                  optionFilterProp="children"
                  value={recordId || defaultValue || '请选择投保的保险公司'}
                  onChange={this.dealChange}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                  className='select-container'
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
                    value={recordId || defaultValue || '请选择投保的保险公司'}
                    onChange={this.dealChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    className='select-container'
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
            <ul className='coverage-list-container'>
              {
                commercialItems && commercialItems.length && commercialItems.map((item, index) => {
                  return (
                    <li className='submit-item-container' key={index}>
                      <div className='item'>
                        <span className='fee'>{item.feeTitle}</span>
                        <input
                          onChange={(e) => this.calculateFee(e, 'fee', item.type)}
                          className='default'
                          type="text"
                          placeholder='0'
                          maxLength="12"
                          value={item.type === 1 && cipremium > 0 ? cipremium : (item.type === 2 && bipremium > 0) ?  bipremium : (item.type === 3 && carshiptax > 0) ? carshiptax : ''}
                        />
                      </div>
                      <div className='item'>
                        <span className='fee'>{item.rebateTitle}</span>
                        <input
                          onChange={(e) => this.calculateFee(e, 'rebate', item.type)}
                          className='default'
                          type="text"
                          placeholder='0'
                          maxLength="2"
                          value={item.type === 1 && showcicommission > 0 ? showcicommission : item.type === 2 && showbicommission > 0 ?  showbicommission : item.type === 3 && showcarshiptax > 0 ? showcarshiptax : ''}
                        /><span className='sign'>%</span>
                      </div>
                      <div className='item'>
                        <span className='fee'>{item.commissionTitle}</span>
                        <input
                          className='default'
                          type="text"
                          placeholder='0'
                          value={item.type === 1 ? ciCommission : item.type === 2 ? biCommission : item.type ===3 ? carshipCommission : ''}
                          readOnly="true"
                        />
                      </div>
                    </li>
                  )
                })
              }
            </ul>
            {
              isHasBi && totalList && totalList.length
              ? (
                  <div className='detail-wrapper'>
                    <span className='title' onClick={this.toggleDetailShow}>{isShowDetail ? '收起' : '展开'}明细</span>
                    {
                      isShowDetail
                      ? (
                          <div className='insurance-container'>
                            <ul>
                              {
                                totalList.map((item, index) => {
                                  return(
                                    <li className="insurance-item-container" key={index}>
                                      {
                                        Number(item.InsDetailId) > 30000
                                        ? <span className=''>{item.ins}-不计免赔</span>
                                        : <span className=''>{item.ins}{item.Amount ? '(' + Number(item.Amount).toFixed(2) + ')' : ''}</span>
                                      }
                                      <input
                                        onChange={(e) => this.changeFee(e, item)}
                                        className='item-fee'
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
              : null
            }
            <div className='upload-image-container'>
              <span className='upload-image-title' style={{marginBottom: '10px'}}>报价截图<span style={{fontSize: '12px'}}>（支持CTRL+V粘贴您QQ截取的报价图片）</span></span>
              <div>
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
          <div className='submit-footer-container'>
            <div className='total-price-container'>
              <div className='price-item'>
                <span className='price-title'>总保费: </span>
                <span className='sub-fee'>{totalpremium || 0}元</span>
              </div>
              <div className='price-item'>
                <span className='price-title'>总返佣: </span>
                <span className='sub-fee'>{commission || 0}元</span>
              </div>
              <div className='price-item'>
                <span className='price-title'>净费: </span>
                <span className='sub-fee'>{pureFee || 0}元</span>
              </div>
              <div className='price-item'>
                <span className='price-title'>综合点位: </span>
                <span className='sub-fee'>{comprehensivePoint || 0}元</span>
              </div>
            </div>
            <div className="operate-container">
              <Button type="primary" className='operate-btn' onClick={this.submit}>提交</Button>
              <Button className='operate-btn' onClick={this.cancel}>取消</Button>
            </div>
          </div>
          <Modal title="提示"
            visible={isShowToast}
            onOk={this.handleOk}
            onCancel={this.dealCancel}
            okText="确定"
            cancelText='取消'
          >
            <p>保费总金额和明细金额计算不一致, 是否继续提交？？</p>
          </Modal>
        </div>
      </MpModal>
    )
  }
}