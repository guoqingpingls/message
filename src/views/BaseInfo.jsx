import React from 'react';
import '../stylesheets/BaseInfo.less';
import { Collapse,message } from 'antd';
const { filterInsurance } = require('../util/util.js');
const Panel = Collapse.Panel;
const name = '基本信息'
export default class BaseInfo extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      coverageList: [],
      baseData: [],
      supplierName: ''
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.baseData && nextProps.baseData.coverageList || nextProps.allInsuranceCp !== this.props.allInsuranceCp) {
      if (nextProps.baseData.coverageList && nextProps.baseData.coverageList.length > 0) {
        // 返回参数为json or array
        let tmpCoverageList
        if (typeof nextProps.baseData.coverageList === 'string') {
          tmpCoverageList = filterInsurance(JSON.parse(nextProps.baseData.coverageList))
        } else {
          tmpCoverageList = filterInsurance(nextProps.baseData.coverageList)
        }
        this.setState({
          coverageList: tmpCoverageList,
        })
      }
      this.setState({
        baseData: nextProps.baseData
      })
    }
  };
  getPrice = (supplierId) => {
    this.props.btnClick(supplierId);
  }
  changesupplierIdToName = (id) => {
    let allInsuranceCp = this.props.allInsuranceCp;
    let supplierName = '';
    if (allInsuranceCp && allInsuranceCp.length) {
      allInsuranceCp.map((item, index) => {
        if (item.id === Number(id)) {
          supplierName = item.name;
          return supplierName;
        }
      })
    }
    return supplierName;
  }
  formateCoverageItem (item) {
    let str = '投保';
    if (item.Amount) {
      str += '-' + item.Amount;
    }
    if (Number(item.InsDetailId) > 30000) {
      str += '-不计免赔'
    }
    if (item.flag === 1) {
      str += '-国产玻璃'
    }
    if (item.flag === 2) {
      str += '-进口玻璃'
    }
    return str
  }
  showRobModal = () => {
    this.props.showRobModal()
  }
  CopyValue = (e) => {
    let ele = e.target
    if (ele.className === 'info-content') {
      let val = ele.innerText
      let hiddenEle = document.getElementById('input-hidden')
      hiddenEle.value=val
      hiddenEle.select()
      document.execCommand('copy')
      message.success('复制成功');
    }
  }
  render () {
    const { coverageList, baseData, supplierName } = this.state;
    return (
      <div className='base-info-container' id='base-info-detail' style={{height: 'initial', overflowY: 'auto'}}>
        <Collapse defaultActiveKey={['1','2', '3', '4', '5']} >
            <Panel className='panel-style' header="车辆信息" key="1">
              {
                !baseData.carbaseinfoDto
                ? <div className='no-info'>暂无车辆信息</div>
                : <ul onClick={this.CopyValue}>
                    <li className='info-item-container'>
                      <span className='base-info-title'>车牌号：</span>
                      <span className='info-content'>{ baseData.carbaseinfoDto.licenseno || '-' } </span>
                      <input type="text" id="input-hidden" style={{width:"30px",opacity:0}} />
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>车辆类型：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.vehicleType || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>所有人：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.ownername || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>住址：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.owneraddress || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>使用性质：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.useCharacter || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>品牌型号：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.automodelname || baseData.carbaseinfoDto.automodelcode || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>车架号：</span>
                      <span className='info-content'>{ baseData.carbaseinfoDto.frameno || '-' }</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>发动机号：</span>
                      <span className='info-content'>{ baseData.carbaseinfoDto.engineno || '-' }</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>注册日期：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.firstregisterdate && baseData.carbaseinfoDto.firstregisterdate.substring(0, 10) || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>发证日期：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.issueDate || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>整备质量：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.wholeweight || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>核载质量：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.vehicletonnages || '-'}</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>座位数：</span>
                      <span className='info-content'>{baseData.carbaseinfoDto.seats || '-'}</span>
                    </li>
                    </ul>
              }
            </Panel>
            <Panel className='panel-style' header="身份信息" key="3">
              {
                !baseData.carbaseinfoDto
                ? <div className='no-info'>暂无车辆信息</div>
                : <ul onClick={this.CopyValue}>
                    <li className='info-item-container'>
                      <span className='base-info-title'>姓名：</span>
                      <span className='info-content'>{ baseData.carbaseinfoDto.ownername || baseData.ownerName || '' }</span>
                    </li>
                    <li className='info-item-container'>
                      <span className='base-info-title'>身份证号：</span>
                      <span className='info-content'>{  baseData.carbaseinfoDto.certificateno || baseData.ownerID || '' }</span>
                    </li>
                  </ul>
              }
            </Panel>
            <Panel className='panel-style' header="保险信息" key="2">
              <ul>
                {
                  coverageList && coverageList.length > 0
                  ? (
                      coverageList.map((item, index) => {
                        return (
                          <li className='info-item-container' key={ index }>
                            <span className='base-info-title'>{ item.ins }：</span>
                            <span className='info-content' style={{cursor: 'default'}}>
                              {this.formateCoverageItem(item)}
                            </span>
                          </li>
                        )
                      })
                    )
                  : <li className='no-info'>暂未获取险种信息</li>
                }
              </ul>
            </Panel>
        </Collapse>
      </div>
    )
  }
}