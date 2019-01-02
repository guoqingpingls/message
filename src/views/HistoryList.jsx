// 历史报价模块 已删除
import React from 'react';
import dataSource from '../util/dataSource';
import '../stylesheets/HistoryList.css';
import { getInsDetailId } from '../util/util';
import {message} from 'antd';
export default class HistoryList extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            historicalPriceList: [],
            supplierIdList: [],
            status: null,
            taxArray: [{
                id: 16,
                name: '不代交'
            }, {
                id: 1,
                name: '代交'
            }]
        }
    }
    componentWillMount () {
        this.state.status = this.props.status
    }
    componentWillReceiveProps (nextProps) {
        console.log('this.props.historicalPriceList: ', nextProps.historicalPriceList);
        if (nextProps.historicalPriceList && nextProps.historicalPriceList !== this.props.historicalPriceList) {
            this.setState({
                historicalPriceList: nextProps.historicalPriceList
            })
        }
        if (nextProps.baseData !== this.props.baseData) {
            this.setState({
                status: nextProps.baseData.status,
                supplierIdList: nextProps.baseData.supplierIdList
            })
        }
    };
    // 选择不计免赔的险种，筛选出只有不计免赔的哪一项
    dealCoverageList = (list) => {
        let InsDetailIdList = getInsDetailId(list);
        let resultList = [];
        list.map((item, index) => {
            if (Number(item.InsDetailId) > 30000) {
                resultList.push(item);
            } else {
                let tmp = Number(item.InsDetailId) + 20000;
                let tmp1 = Number(item.InsDetailId) + 10000;
                if (Number(item.InsDetailId) < 20000 && InsDetailIdList.indexOf(tmp) < 0 || Number(item.InsDetailId) > 20000 && InsDetailIdList.indexOf(tmp1) < 0) {
                    resultList.push(item);
                }
            }
            return resultList;
        })
        return resultList;
    };
    formateCoverage = (item) => {
        let tmpCoverageList = JSON.parse(item.coveragelist);
        let str = '';
        if (item.vvtaxstate !== 16) {
            this.state.taxArray.map((itm, idx) => {
                if (itm.id === item.vvtaxstate) {
                    str = '车船税' + itm.name + '/';
                }
            })
        }
        let resultList = this.dealCoverageList(tmpCoverageList);
        let listLength = resultList.length;
        resultList.map((item, index) => {
            str += item.ins;
            if (item.Amount) {
                str = str + '-' + item.Amount;
            }
            if (index !== listLength-1) {
                str += '/';
            }
        });
        return str;
    };
    matchInsuranceCp = (id) => {
        let insuranceName = '';
        dataSource.insuranceCpList.map((item, index) => {
            if (item.id === id) {
                insuranceName =  item.name;
            }
        })
        return insuranceName;
    }
    usePrice = (info) => {
        console.log('info: ', info);
        if (this.state.supplierIdList.indexOf(info.supplierId) > -1 || this.state.supplierIdList.length === 0) {
            this.props.usePrice(info);
        } else {
            message.config({
                top: 130
            });
            message.warning('此历史报价的保险公司不在询价指定的保险公司内，请选择其他报价');
        }
        
    }
    render () {
        const { historicalPriceList } = this.props;
        const { status } = this.state;
        let hasHistory = historicalPriceList.map((item, index) => {
            return (
                <div className='history-item-container' key={index}>
                    <div className='history-item-title'>保险信息</div>
                    <div className='history-item-content'>{this.formateCoverage(item)}</div>
                    <div className='history-item-title'>报价信息</div>
                    <div>保险公司   {this.matchInsuranceCp(item.supplierId)}</div>
                    <div className='history-item-content' style={{display: item.cipremium > 0 ? 'block' : 'none'}}>交强保费：{item.cipremium} / 返佣点： {item.showcicommission}%</div>
                    <div className='history-item-content' style={{display: item.bipremium > 0 ? 'block' : 'none'}}>商业保费：{item.bipremium} / 返佣点： {item.showbicommission}%</div>
                    <div className='history-item-content' style={{display: item.carshiptax > 0 ? 'block' : 'none'}}>车船税保费：{item.carshiptax} / 返佣点： {item.showcarshiptax}%</div>
                    <div className='history-item-title'>询价时间</div>
                    <div className='history-item-content'>{ item.addTime }</div>
                    {/* <button className='use-btn'>{status}</button> */}
                    <button className='use-btn' style={{display: status === 1 || status === 2 ? 'block' : 'none'}} onClick={() => {this.usePrice(item)}}>使用此报价</button>
                </div>
            )
        })
        return (
            <div className='history-container'>
                {
                    historicalPriceList.length === 0
                    ? <div style={{width: '100px', margin: '40px auto', color: '#999'}}>暂无历史询价</div>
                    : hasHistory
                }
            </div>
        )
    }
}