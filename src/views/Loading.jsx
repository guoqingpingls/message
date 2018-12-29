import React from 'react';
import {Icon} from 'antd';

export default class Loading extends React.Component{
    constructor (props) {
        super(props);
    }
    render () {
        const { isShowLoading } = this.props;
        return (
            <div style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '0', bottom: '0', left: '0', right: '0',backgroundColor: 'rgba(7, 17, 27, 0.2)', display: isShowLoading ? 'flex' : 'none' }}>
                <Icon style={{fontSize: '90px'}} type="loading" />
            </div>
        )
        
    }
}