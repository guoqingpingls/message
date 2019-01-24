import React from 'react';
import '../stylesheets/PayType.less'
import MpModal from '../components/MpModal';
import {Radio, Icon, Upload, Modal, message} from 'antd';
const RadioGroup = Radio.Group;
import {
  parse_image,            // 识别图片
  confirm_pay_type,       // 发送支付方式
} from '../services/index';
const pageName = '发送图片'
export default class PayType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payType: 1,
      previewImageuri: '',
      imageurls: '',
      fileList: [],
      ispreviewImage: false,
      payLink: '',
    }
  }
  // 选择支付方式
  changePaytype = (e) => {
    this.setState({
      payType: e.target.value,
    });
  }
  // 上传图片
  handleChange = ({fileList}) => {
    this.setState({fileList});
    let tmpFile = fileList.map((item, index) => {
      if (item.status === 'done') {
        let tmp = 'https://openapi.youbaolian.cn/' + item.response.resultMap.uri;
        this.analysisImageCode(tmp)
        return tmp
      }
    });
    if (tmpFile[tmpFile.length - 1] != null) {
      this.state.imageurls = tmpFile;
    }
  }
  // 识别图片
  analysisImageCode (uri) {
    let self = this
    parse_image(uri).then((res) => {
      console.log(res)
      if (res.CODE === 200) {
        self.setState({
          payLink: res.SUCCESS || ''
        })
      } else {
        res.error && message.info(res.error);
      }
    })
  }
  // 预览取消
  dealCancel = (file) => {
    this.setState({
      previewImageuri: '',
      ispreviewImage: false
    })
  }
  // 获取支付链接
  getPaylink = (e) => {
    let target = e.target.value;
    this.state.payLink = target
  }
  // 图片预览
  handleImagePreview = (file) => {
    this.setState({
      previewImageuri: file.url || file.thumbUrl,
      ispreviewImage: true
    })
  };
  // 发送支付方式
  sendPayType = () => {
    let {payType, fileList, payLink} = this.state;
    let {priceId, defaultImageUri, cid, baseInfo} = this.props;
    let params = {
      paymentMethod: payType,
      priceid: priceId,
      priceitemid: baseInfo.priceitemid,
      cid: cid
    }
    if (payType === 1 && fileList.length === 0 && payLink.length === 0) {
      if (fileList.length === 0 && payLink.length === 0) {
        message.info('请上传二维码或者填写支付链接');
        return;
      }
      return;
    }
    if (payType === 1 && fileList.length > 0) {
      params.payCode = defaultImageUri + fileList[0].response.resultMap.uri
    }
    if (payType === 1 && payLink.length > 0) {
      params.payLink = payLink
    }
    confirm_pay_type(params).then((res) => {
      if (res.returnCode === 200) {
        let msgContent = {};
        msgContent.type = "IM";
        msgContent.target = 'C_' + baseInfo.userid;
        msgContent.msg = '';
        msgContent.time = Date.now();
        localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
        self.props.closePayType(1)
      } else {
        message.info(res.message);
      }
    })
  }
  // 取消
  cancel = () => {
    this.props.closePayType()
  }
  render () {
    let {payType, previewImageuri, ispreviewImage, fileList, payLink} = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus"/>
      </div>
    );
    return (
      <MpModal title='支付方式' sure={this.sendPayType} cancel={this.cancel}>
        <div className='pay-type-wrapper'>
          <RadioGroup className='radio-container' onChange={this.changePaytype} value={payType}>
            <Radio className='pay-radio' value={1}>支付给保险公司</Radio>
            <Radio className='pay-radio' value={2}>支付给代理（取您配置的支付方式）</Radio>
            <Radio className='pay-radio' value={3}>代理垫付</Radio>
          </RadioGroup>
          {
            payType === 1
            ? <div className='pay-info'>
                <div className='upload-container'>
                  <span className='sub-image-title' style={{marginBottom: '10px'}}>保险公司支付二维码<span style={{color: "#f00"}}>(推荐上传微信支付码)</span></span>
                  <div className="clearfix">
                    <Upload
                      action="https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/"
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={this.handleImagePreview}
                      onChange={this.handleChange}
                    >
                      {fileList.length === 1 ? null : uploadButton}
                    </Upload>
                    <Modal visible={ispreviewImage} footer={null} onCancel={this.dealCancel}>
                      <img alt="example" style={{width: '100%'}} src={previewImageuri}/>
                    </Modal>
                  </div>
                  <span className='pay-link-title'>保险公司支付链接</span>
                  <input type="text" className='pay-link' onChange={this.getPaylink} value={payLink}/>
                </div>
              </div>
            : null
          }
        </div>
      </MpModal>
    )
  }
}