import React from 'react';
import { Icon } from 'antd';
import '../stylesheets/Loading.less'
export default class Loading extends React.Component{
  constructor (props) {
    super(props);
  }
  render () {
    let {loadingText } = this.props;
    return (
      <div className='loading-wrapper'>
        <div className='loading-container'>
          <Icon type="loading" className='loading-icon' />
          <span className='loading-text'>{loadingText || '加载中....'}</span>
        </div>
      </div>
    )
  }
}