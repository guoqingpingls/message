import React from 'react';
import MpModal from '../components/MpModal';
import {Form, Input, message } from 'antd';
const { hasCommercialInsurance, sendIM } = require('../util/util.js');
import {submit_policy} from '../services/index';
import qs from 'query-string';
import '../stylesheets/GeneratePolicy.less';
const name = '生成保单'
export default class GeneratePolicy extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      // InsDetailIdList: [],
      hasCi: false,
      hasBi: false,
      ciPolicyNo: '',
      biPolicyNo: '',
      expressNo: ''
    }
  }
  componentDidMount () {
    this.dealData()
  }
  queryParam = () => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let search = window.location.href.split('?');
    if(search.length<2) return null;
    let r = search[1].match(reg);
    if (r != null) return unescape(r[2]); return null;
  }
  submitForm = () => {
    let {hasCi, hasBi, biPolicyNo, ciPolicyNo} = this.state;
    let {baseInfo, priceId} = this.props;
    let self = this
    let cid = this.queryParam('cid');
    let params = {
      // jobNoId: this.state.jobNoId,
      jobNoId: 0,
      priceId: priceId
    };
    if (cid) {
      params.cid = cid
    }
    if (hasBi) {
      if(!biPolicyNo){
        message.info('请输入商业险保单号',2);
        // this.refs.biPolicyNo.focus();
        return;
      }
      params.biPolicyNo = biPolicyNo
    }
    if (hasBi) {
      if(!ciPolicyNo){
        message.info('请输入交强险保单号',2);
        // this.refs.ciPolicyNo.focus();
        return;
      }
      params.ciPolicyNo = ciPolicyNo
    }
    //邮寄方式:  0 自取 1 邮寄 -1 未选择
    if (baseInfo.deliverytype === 1) {
      if(!expressNo){
        message.info('请输入快递单号',2);
        // this.refs.expressNo.focus();
        return;
      }
      params.expressNo = expressNo
    }
    let tmpParams = qs.stringify(params);
    submit_policy(tmpParams).then((res) => {
      sendIM(baseInfo.userid, 'replyContent')
      self.props.close(1)
    }).catch((err) => {
      console.log(err)
      message.error(err)
    })
  }
  dealData = () => {
    let {baseInfo} = this.props;
    let tmpList = []
    tmpList = baseInfo && baseInfo.coverageList && JSON.parse(baseInfo.coverageList).map((item, index) => {
      return item.InsDetailId;
    });
    this.setState({
      hasCi: tmpList && tmpList.indexOf('10501') > -1,
      hasBi: baseInfo && baseInfo.coverageList && hasCommercialInsurance(JSON.parse(baseInfo.coverageList))
    });
  };
  cancel = () => {
    this.props.close()
  };
  changeNum = (name, e) => {
    console.log(name, e.target)
    this.setState({
      [name]: e.target.value
    })
  }
  render () {
    let {hasCi, hasBi, biPolicyNo, ciPolicyNo, expressNo} = this.state;
    let {baseInfo} = this.props;
    return (
      <MpModal title='保单已生成' sure={this.submitForm} cancel={this.cancel}>
        <Form layout="vertical" className='generate-policy-wrapper'>
          {
            hasBi
            ? <Form.Item label="商业保单号">
                <Input maxLength={20} value={biPolicyNo} onChange={(val) => {this.changeNum('biPolicyNo', val)}} placeholder='请输入商业单号' />
              </Form.Item>
            : null
          }
          {
            hasCi
            ? <Form.Item label="交强保单号">
                <Input maxLength={20} value={ciPolicyNo} onChange={(val) => {this.changeNum('ciPolicyNo', val)}} placeholder='请输入交强单号' />
              </Form.Item>
            : null
          }
          
          <Form.Item label="收件方式">
            {
              baseInfo.deliverytype === 1
              ? <div className='express-container'>
                  <span className='express-label'>快递: </span>
                  <Input maxLength={20} ref='expressNo' type="text" value={expressNo} onChange={(val) => {this.changeNum('expressNo', val)}}  placeholder='请输入快递单号' />
                </div>
              : <span>自提</span>
            }
          </Form.Item>
        </Form>
      </MpModal>
    )
  }
}