import React from 'react';
import MpModal from '../components/MpModal';
import {Upload, Modal, message, Icon } from 'antd';
import {reply_remark_api} from '../services/index';
import '../stylesheets/SendImageModal.less';
import {sendIM} from '../util/util.js'
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
      return defaultImageUri + item.response.resultMap.uri
    })
    let params = {
      priceid: priceId,
      carinfoid: baseInfo.carinfoid,
      info: '',
      usertype: 2,
      imageuris: tmpList,
      cid: cid
    };
    this.props.showReqLoading('图片发送中.....')
    reply_remark_api(params).then((res) => {
      sendIM(baseInfo.userid, '')
      this.props.hideReqLoading()
      self.props.hideSendImage(1);
    }).catch((err) => {
      this.props.hideReqLoading()
      console.log('err: ', err);
    })
  }
  cancel = () => {
    this.props.hideSendImage()
  }
  handlePaste = (e) => {
    const _this = this;
    const clipboardData = e.clipboardData;
    if (!(clipboardData && clipboardData.items)) {//是否有粘贴内容
      return;
    }
    for (let i = 0, len = clipboardData.items.length; i < len; i++) {
      const item = clipboardData.items[i];
      if (item.kind === "string" && item.type == "text/plain") {
        item.getAsString(function (str) {
          // console.log(str);
        })
      } else if (item.kind === "file") {
        const blob = item.getAsFile();
        const url = 'https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/';
        const extension = blob.type.match(/\/([a-z0-9]+)/i)[1].toLowerCase();
        const fileName = 'paste_' + Date.now();
        const formData = new FormData();
        // formData.append("partnerId", baseInfo.partnerId);
        formData.append("file", blob, fileName + '.' + extension);
        formData.append("extension", extension);
        formData.append("mimetype", blob.type);
        formData.append("submission-type", 'paste');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.onload = function () {
          if (xhr.status == 200) {
            console.log(xhr.responseText);
            const response = JSON.parse(xhr.responseText);
            _this.state.fileList.push({
              uid: fileName,
              name: fileName + '.' + extension,
              status: 'done',
              url: 'https://openapi.youbaolian.cn/' + response.resultMap.uri,
              response: response
            });
            _this.handleChange({fileList: _this.state.fileList});
            _this.setState({fileList: _this.state.fileList});
          }
        }
        xhr.onerror = function (ev) {
          console.log(ev);
        };
        xhr.send(formData);
      }
    }
  };
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
      <div onPaste={this.handlePaste}>
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
      </div>
      
    )
  }
}