import React from 'react';
import { Collapse } from 'antd';
import '../stylesheets/QueryInfo.less';
const Panel = Collapse.Panel;
const pageName = '询价人资料'
export default class QueryInfo extends React.Component{
  constructor(props){
    super(props);
  }
  render () {
    const {baseData} = this.props;
    return (
      <div className='query-info-container'>
        <Collapse defaultActiveKey={['1', '2', '3', '4']} >
          <Panel className='panel-style' header="基本信息" key="1">
            <ul>
              <li className='info-item' style={{height:'auto'}}>
                <span className='base-info-title'>微信：</span>
                <span className='info-content'>{baseData.usersDetail.nickName || ''} </span>
              </li>
              <li className='info-item'>
                <span className='base-info-title'>类型：</span>
                <span className='info-content'>{baseData.usersDetail.isreLate === 21 ? '业务员' : '普通客户'}</span>
              </li>
              <li className='info-item'>
                <span className='base-info-title'>姓名：</span>
                <span className='info-content'>{baseData.usersDetail.name}</span>
              </li>
              <li className='info-item'>
                <span className='base-info-title'>手机：</span>
                <span className='info-content'>{baseData.usersDetail.phoneNum}</span>
              </li>
            </ul>
          </Panel>
          <Panel className='panel-style' header="询价统计" key="2">
            <ul>
              <li className='info-item'>
                <span className='base-info-title'>总询价数：</span>
                <span className='info-content'>{baseData.usersDetail.countPreprice} </span>
              </li>
              <li className='info-item'>
                <span className='base-info-title'>总成交数：</span>
                <span className='info-content'>{baseData.usersDetail.finishPreprice}</span>
              </li>
            </ul>
          </Panel>
          <Panel style={{display: baseData.customerId!=0 ? 'block' : 'none'}} className='panel-style' header="接单员信息" key="3">
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
                : <div>
                    <ul>
                      <li className='info-item'>
                        <span className='base-info-title'>收件方式：</span>
                        <span className='info-content'>未设置</span>
                      </li>
                    </ul>
                  </div>
            }
          </Panel>
        </Collapse>
      </div>
    )
  }
}