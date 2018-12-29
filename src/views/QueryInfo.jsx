import React from 'react';
import { Collapse } from 'antd';

import '../stylesheets/QueryInfo.css';

const Panel = Collapse.Panel;
export default class QueryInfo extends React.Component{
    constructor(props){
        super(props);
    }
    componentDidMount () {
        console.log('this.props.baseData', this.props.baseData)
    };
    // componentWillReceiveProps (nextProps) {
    //     if (nextProps.baseData !== this.props.baseData) {
    //         console.log('componentWillReceiveProps: ', this.props.baseData)
    //     }
    // }
    render () {
        const {baseData} = this.props;
        return (
            <div className='query-info-container'>
                <Collapse defaultActiveKey={['1', '2']} >
                    <Panel className='panel-style' header="基本信息" key="1">
                        <ul>
                            <li className='info-item'>
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
                </Collapse>
            </div>
        )
    }
}