import React from 'react';
import MpModal from '../components/MpModal';
import { Scrollbars } from 'react-custom-scrollbars';
import '../stylesheets/ChooseJobNo.less';
export default class ChooseJobNo extends React.Component {
  constructor (props) {
    super(props)
  }
  toAiQuote = (item) => {
    this.props.toAiQuote(item)
    this.props.cancelChoose()
  }
  cancel = () => {
    this.props.cancelChoose()
  }
  render () {
    let {chooseList, chooseTitle} = this.props;
    return (
      <MpModal title={chooseTitle || '选择工号'} cancel={this.cancel} isShowFooter={true}>
        <div className='choose-jobno-wrapper'>
          {
            chooseList && chooseList.length
            ? <Scrollbars>
                <ul>
                  {
                    chooseList.length && chooseList.map((item, index) => {
                      return (
                        <li className='item' key={index}>
                          <span>{item.name || ''}</span>
                          <button className='choose-btn' onClick={() => this.toAiQuote(item)}>去报价</button>
                        </li>
                      )
                    })
                  }
                </ul>
              </Scrollbars>
            : <div className='no-data'>暂无工号</div>
          }
        </div>
      </MpModal>
    )
  }
}