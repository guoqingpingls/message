import React from 'react';
import {Button} from 'antd';
import '../stylesheets/EnquireRecord.less';
export default class EnquireRecord extends React.Component {
  constructor (props) {
    super(props);
    this.state = {

    }
  }
  usePrice = (item) => {
    this.props.usePrice(item)
  }
  render () {
    let {recordList} = this.props;
    return (
      <div className='enquire-record-wrapper'>
        {
          recordList.length === 0
          ? <div className='no-record'>暂无报价记录</div>
          : <div className='record-wrapper'>
              <span className='record-tip'>仅显示3天内的报价记录</span>
              <span className='record-tip-fixed'>仅显示3天内的报价记录</span>
              <div className='record-container'>
                {
                  recordList.map((item, index) => {
                    return(
                      <div className='record-item' key={index}>
                        <div className='record-head'>
                          <div className='head-left'>
                            {/* <img src={u4} alt="" className='left-icon'/> */}
                            <div className='right'>
                              <span className='right-top'>{item.SupplierName}</span>
                              <span className='right-bottom'>{item.UpdateTime}</span>
                            </div>
                          </div>
                          <span className='head-right'>{item.TotalPrice ? `￥${item.TotalPrice}` : ''}</span>
                        </div>
                        {
                          item.CIPremium || item.CarshipTax
                          ? <div className='jq-total'>
                              <span>{item.CIPremium ? `交强险(${item.CIPremium})` : ''}{item.CIPremium && item.CarshipTax ? '+' : ''}{item.CarshipTax ? `{车船税(${item.CarshipTax})` : ''}</span>
                              <span>￥{item.CICarTotal}</span>
                            </div>
                          : null
                        }
                        {
                          item.BIPremium
                          ? <div className='ci-container'>
                              <div className='ci-total'>
                                <span>商业险<span className='discount'>折扣:<span className='discount-num'>{item.BIDiscount}</span></span></span>
                                <span>{item.BIPremium ? `￥${item.BIPremium}` : ''}</span>
                              </div>
                              {
                                item.coverageList.map((item, index) => {
                                  return (
                                    <div key={index}>
                                    {
                                      item.DetailId === 10501
                                      ? null
                                      : <div className='coverage-list'>
                                          <span>{item.name}</span>
                                          {
                                            item.DetailId > 30000
                                            ? <span className='deductible'>不计免赔</span>
                                            : null
                                          }
                                          <span>{item.InsuredPremium}</span>
                                        </div>
                                    }
                                    </div>
                                  )
                                })
                              }
                            </div>
                          : null
                        }
                        <div className='foot-container'>
                          <Button type='primary' onClick={() => this.usePrice(item)}>发送给询价人</Button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
        }

      </div>
    )
  }
}