import React from 'react';
import '../stylesheets/BaseInfo.css';
import { Collapse } from 'antd';
const { filterInsurance } = require('../util/util.js');

const Panel = Collapse.Panel;

export default class BaseInfo extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            coverageList: [],
            baseData: [],
            supplierName: ''
        }
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.baseData && nextProps.baseData.coverageList || nextProps.allInsuranceCp !== this.props.allInsuranceCp) {
            // let tmp = JSON.parse(nextProps.baseData.coverageList);
            if (nextProps.baseData.coverageList && nextProps.baseData.coverageList.length > 0) {
                let tmpCoverageList = filterInsurance(JSON.parse(nextProps.baseData.coverageList))
                this.setState({
                    coverageList: tmpCoverageList,
                })
            }
            
            // if (nextProps.baseData.supplierId !== 0) {
            //     this.state.supplierName = this.props.changesupplierIdToName(nextProps.baseData.supplierId)
            // }
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
    showRobModal () {
        this.props.showRobModal()
    }
    render () {
        // const { baseData } = this.props;
        const { coverageList, baseData, supplierName } = this.state;
        return (
            <div className='base-info-container' id='base-info-detail' style={{height: 'initial', overflowY: 'auto'}}>
                <Collapse defaultActiveKey={['1','2', '3', '4', '5']} >
                    <Panel style={{display: baseData.customerId!=0 ? 'block' : 'none'}} className='panel-style' header="接单员信息" key="5">
                        <ul>
                            <li className='info-item'>
                                <span className='base-info-title'>接单员：</span>
                                <span className='info-content'>{ baseData.customerName } </span>
                            </li>
                            <li className='info-item'>
                                <span className='base-info-title'>接单时间：</span>
                                <span className='info-content'>{ baseData.orderReceivedTime }</span>
                            </li>
                        </ul>
                    </Panel>
                    <Panel className='panel-style' header="车辆信息" key="1">
                        <ul>
                            <li className='info-item'>
                                <span className='base-info-title'>车牌号：</span>
                                <span className='info-content'>{ baseData.licenseNo } </span>
                            </li>
                            <li className='info-item'>
                                <span className='base-info-title'>车架号：</span>
                                <span className='info-content'>{ baseData.frameNo }</span>
                            </li>
                            <li className='info-item'>
                                <span className='base-info-title'>发动机号：</span>
                                <span className='info-content'>{ baseData.engineno }</span>
                            </li>
                            <li className='insurance-info '>
                                <span className='base-info-title'>保险公司：</span>
                                    <ul>
                                        {
                                            baseData && baseData.supplierIdList && baseData.supplierIdList.length > 0
                                            ? baseData.supplierIdList.map((item, index) => {
                                                return(
                                                    <li key={index}>
                                                        <span className='info-content-li'>{this.changesupplierIdToName(item)}<span className='grey'> (已指定)</span></span>
                                                        <button className='get-price-btn' style={{ display:baseData.status === -9 ? 'none' : 'inline-block'}} onClick={() => {this.getPrice(item)}}>去报价</button>
                                                    </li>
                                                )
                                            })
                                            : <li>
                                                <span className='info-content-li'>未指定</span>
                                                <button className='get-price-btn' style={{ display:baseData.status === -9 ? 'none' : 'inline-block'}} onClick={() => {this.getPrice()}}>去报价</button>
                                            </li>
                                        }
                                    </ul>
                                {/* <span className='info-content'>{ baseData.supplierId ? supplierName : '未指定' }<span className='grey'>{ baseData.supplierId ? '（已指定）' : '' }</span></span> */}
                            </li>
                        </ul>
                    </Panel>
                    <Panel className='panel-style' header="保险信息" key="2">
                        <ul>
                            {
                                coverageList && coverageList.length > 0
                                ? (
                                    coverageList.map((item, index) => {
                                        return (
                                            <li className='info-item' key={ index }>
                                                <span className='base-info-title'>{ item.ins }：</span>
                                                <span className='info-content'>
                                                    {this.formateCoverageItem(item)}
                                                </span>
                                            </li>
                                        )
                                    })
                                )
                                : <li style={{textAlign: 'center'}}>暂未获取险种信息</li>
                            }
                            
                        </ul>
                    </Panel>
                    <Panel className='panel-style' header="身份信息" key="3">
                        <ul>
                            <li className='info-item'>
                                <span className='base-info-title'>姓名：</span>
                                <span className='info-content'>{ baseData.ownerName }</span>
                            </li>
                            <li className='info-item'>
                                <span className='base-info-title'>身份证号：</span>
                                <span className='info-content'>{ baseData.ownerID }</span>
                            </li>
                        </ul>
                    </Panel>
                    <Panel className='panel-style' header="收件方式" key="4">
                        {
                            baseData.deliverytype === 0
                            ? <div>
                                <ul>
                                    <li className='info-item'>
                                        <span className='base-info-title'>收件方式：</span>
                                        <span className='info-content'>自提</span>
                                    </li>
                                </ul>
                              </div>
                            : baseData.deliverytype === 1
                                ? <div>
                                    <ul>
                                        <li className='info-item'>
                                            <span className='base-info-title'>收件人：</span>
                                            <span className='info-content'>{ baseData.usersName }</span>
                                        </li>
                                        <li className='info-item'>
                                            <span className='base-info-title'>收件地址：</span>
                                            <span className='info-content'>{ baseData.userAddress }</span>
                                        </li>
                                        <li className='info-item'>
                                            <span className='base-info-title'>联系电话：</span>
                                            <span className='info-content'>{ baseData.userMobile }</span>
                                        </li>
                                    </ul>
                                </div>
                                : <div><ul>
                                <li className='info-item'>
                                    <span className='base-info-title'>收件方式：</span>
                                    <span className='info-content'>未设置</span>
                                </li>
                            </ul></div>
                        }
                    </Panel>
                </Collapse>
                    
                </div>
        )
    }
}
