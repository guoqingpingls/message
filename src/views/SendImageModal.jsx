import React from 'react';
import MpModal from '../components/MpModal';
import {Upload, Modal, message, Icon } from 'antd';
import {reply_remark_api} from '../services/index';
import '../stylesheets/SendImageModal.less';
const pageName = '发送图片'
export default class SendImageModal extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      previewVisible: false,
      fileList: [],
      previewImage: ''
    }
  }
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    })
  };
  handleCancel = () => {
    this.setState({
      previewVisible: false
    })
  };
  handleChange = ({fileList}) => {
    this.setState({fileList});
    let tmpFile = fileList.map((item, index) => {
      if (item.status === 'done') {
        let tmp = 'https://openapi.youbaolian.cn/' + item.response.resultMap.uri;
        return tmp
      }
    });
    if (tmpFile[tmpFile.length - 1] != null) {
      this.state.imageurls = tmpFile;
    }
  };
  sendImage = () => {
    let {fileList} = this.state;
    let {defaultImageUri, priceId, baseInfo, cid} = this.props;
    let self = this;
    if (fileList.length === 0) {
      message.info('至少要选择一张图片');
      return;
    }
    if (fileList.length > 10) {
      message.info('最多只能发送十张图片');
      return;
    }
    let tmpList = fileList.map((item) => {
      // if (item.status === 'done' && item.response && item.response.resultMap && item.response.resultMap.uri) {
        return defaultImageUri + item.response.resultMap.uri
        // tmpList.push(tmpUri)
      // }
    })
    let params = {
      priceid: priceId,
      carinfoid: baseInfo.carinfoid,
      info: '',
      usertype: 2,
      imageuris: tmpList,
      cid: cid
    };
    reply_remark_api(params).then((res) => {
      let msgContent = {};
      msgContent.type = "IM";
      msgContent.target = 'C_' + baseInfo.userid;
      msgContent.msg = '';
      msgContent.time = Date.now();
      localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent));
      self.props.hideSendImage(1);
    }).catch((err) => {
      console.log('err: ', err);
    })
  }
  cancel = () => {
    this.props.hideSendImage()
  }
  render () {
    const defaultProps = {
      action: "https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/",
      listType: "picture-card",
      multiple: true
    }
    const uploadButton = (
      <div>
        <Icon type="plus"/>
      </div>
    );
    let {fileList, previewVisible, previewImage} = this.state;
    return (
      <MpModal title='发送图片' sure={this.sendImage} cancel={this.cancel}>
        <div className='send-image-wrapper'>
          <Upload
            {...defaultProps}
            fileList={fileList}
            onPreview={this.handlePreview}
            onChange={this.handleChange }
          >
            {uploadButton}
          </Upload>
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{width: '100%'}} src={previewImage}/>
          </Modal>
        </div>
      </MpModal>
    )
  }
}