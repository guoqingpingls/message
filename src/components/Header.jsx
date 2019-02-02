import React from 'react';
import '../stylesheets/Header.less';
import choose from '../assets/images/choose.png';
import chooseActive from '../assets/images/choose-active.png';
export default class Header extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      checkList: [
        {
          val: '1',
          title: '行驶证正面已核对'
        },
        {
          val: '2',
          title: '行驶证反面已核对'
        },
        {
          val: '3',
          title: '身份证正面已核对'
        },
        {
          val: '4',
          title: '身份证反面已核对'
        }
      ]
    }
  }
  formStatus = (status) => {
    if (status === 301) {
        return '待接单';
    } else if (status === 1) {
        return '待报价';
    } else if (status === 2) {
        return '已报价';
    } else if (status === 23) {
        return '已确认报价'
    } else if (status === 37) {
        return '待缴费'
    } else if (status === 35) {
        return '已付款'
    } else if (status === 24) {
        return '已确认付款'
    } else if (status === 40) {
        return '已出保单'
    } else if (status === 99) {
        return '已完成'
    } else if (status === -9) {
        return '已关闭'
    };
  };
  render () {
    let { baseInfo } = this.props;
    let { checkList } = this.state;
    return(
      <div className='header-wrapper'>
        <div className='header-left'>
          <span className='title'>{baseInfo.licenseNo || ''}</span>
          {/* <div className='check-container'>
            {
              checkList.map((item, index) => {
                if (baseInfo.confirImage && baseInfo.confirImage.indexOf(item.val) > -1) {
                  return (
                    <div key={index} className='check-item active'>
                      <img className='check-image' src={chooseActive} alt="" />
                      <span>{ item.title }</span>
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className='check-item'>
                      <img className='check-image' src={choose} alt="" />
                      <span>{ item.title }</span>
                    </div>
                  )
                }
              })
            }
          </div> */}
        </div>
        <span>当前状态:{this.formStatus(baseInfo.status)}</span>
      </div>
    )
  }
}