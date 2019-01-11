import React from 'react';
import MpModal from '../components/MpModal.jsx';
import {Switch, Select, Icon, Upload, Modal, Button } from 'antd';
import '../stylesheets/SubmitPrice.less';
const { hasCommercialInsurance, isEmptyObject, filterInsurance } = require('../util/util.js');
const Option = Select.Option;
import {
  get_price_info,
  submit_to_get_price
} from '../services/index';
export default class SubmitPrice extends React.Component{
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
    }
  }
  componentDidMount () {
    this.getCoverageList();
    this.formateCoverageList()
    this.getPriceInfo();
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
    // this.props.getPrice(params);
    this.submitPrice(params);
    
  };
  submitPrice = (params) => {
    let self = this;
    let {baseInfo} = this.props;
    submit_to_get_price(params).then((res) => {
      self.props.closeSumitPriceModal(1) // 关闭弹窗
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
    this.props.closeSumitPriceModal()
  }
  // 保险公司改变
  dealChange = (value) => {
    this.setState({defaultValue:value})
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
      if (res.returnCode === 2) {
        if (res.dto) {
          let info = res.dto;
          self.state.cipremium = info.ciPremium;
          self.state.showcicommission = info.showcicommission;
          self.state.ciCommission = info.ciCommission;
          self.state.ciBeginDate = info.ciBeginDate;
          self.state.bipremium = info.biPremium;
          self.state.showbicommission = info.showbicommission;
          self.state.biCommission = info.biCommission;
          self.state.biBeginDate = info.biBeginDate;
          self.state.carshiptax = info.carshiptax;
          self.state.showcarshiptax = info.showcarshiptax;
          self.state.carshipCommission = info.carshipCommission;
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
          let tmp = JSON.parse(baseInfo.coverageList)
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
  getCoverageList = (list) => {
    let tmpCoverageList
    let tmpCoverage = []
    let {baseInfo} = this.props;
    // 传入list || baseInfo里面的list
    if (list && list.length > 0) {
      tmpCoverageList = JSON.parse(list);
    } else {
      if (!baseInfo.coverageList || baseInfo.coverageList.length === 0) {
        return;
      }
      tmpCoverageList = JSON.parse(baseInfo.coverageList);
    }
    let tmpInsDetailId = tmpCoverageList.length && tmpCoverageList.map((item, index) => {
      return Number(item.InsDetailId);
    })
    if (tmpInsDetailId.indexOf(10501) > -1) {
      tmpCoverage.push({
        type: 1,
        feeTitle: '交强保费',
        rebateTitle: '交强返佣点位',
        commissionTitle: '交强佣金',
        // beginDateTitle: '起保日期'
      })
      tmpCoverage.push({
        type: 3,
        feeTitle: '车船税保费',
        rebateTitle: '车船税返佣点位',
        commissionTitle: '车船税佣金'
      })
    }
    if (hasCommercialInsurance(tmpCoverageList)) {
      this.setState({
        isHasBi: true
      })
      tmpCoverage.push({
        type: 2,
        feeTitle: '商业保费',
        rebateTitle: '商业保费返佣点位',
        commissionTitle: '商业佣金',
        // beginDateTitle: '起保日期'
      })
    }
    console.log(tmpCoverage)
    this.setState({
      coverageList: tmpCoverage
    })
  }
  // 是否显示商业险明细
  toggleDetailShow = () => {
    let { isShowDetail } = this.state;
    this.setState({
        isShowDetail: !isShowDetail
    })
  }
  // 获取商业险明细
  formateCoverageList (list) {
    let tmpList = []
    // if (list && list.length === 0) {
    //   return;
    // }
    let {baseInfo} = this.state;
    if (list && list.length !== 0) {
      tmpList = list
    } else if (baseInfo && baseInfo.coverageList) {
      tmpList = baseInfo.coverageList;
    } else {
      return;
    }
    let tmp = JSON.parse(tmpList)
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
    let result = formateTmp.filter((item) => {
      return Number(item.InsDetailId) !== 10501
    })
    this.setState({
      totalList: result,
      additionList: addtionTmp,
      mainList: mainTmp 
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
      isShowToast
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
                  value={defaultValue || '请选择投保的保险公司'}
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
                    value={defaultValue || '请选择投保的保险公司'}
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
                coverageList && coverageList.length && coverageList.map((item, index) => {
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
                                        ? <span className=''>{item.ins}不计免赔</span>
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