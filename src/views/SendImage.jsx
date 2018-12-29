import React from 'react';
import '../stylesheets/SendImage.css';
import closeIcon from '../assets/images/close.png';
import {Upload, Icon, message, Modal } from 'antd';
export default class SendImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            previewVisible: false,
            previewImage: '',
            isSendImage: false,
        }
    }
    componentWillReceiveProps (nextProps) {
        if (this.props.isSendImage !== nextProps.isSendImage) {
            this.setState({
                isSendImage: nextProps.isSendImage
            })
        }
    }
    cancel () {
        console.log('close')
    };
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
            // this.setState({
            //     imageurls: tmpFile
            // });
            this.state.imageurls = tmpFile;
        }
    };
    sendImage = () => {
        let fileList = this.state.fileList;
        if (fileList.length === 0) {
            message.info('至少要选择一张图片');
            return;
        }
        if (fileList.length > 10) {
            message.info('最多只能发送十张图片');
            return;
        }
        this.props.sendImage(fileList);
        this.state.fileList = []
    }
    cancel = () => {
        this.props.hideSendImage()
    }
    // 粘贴
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
        const uploadButton = (
            <div>
                <Icon type="plus"/>
            </div>
        );
        const {fileList, previewVisible, previewImage, isSendImage} = this.state;
        const props = {
            action: "https://openapi.youbaolian.cn/api/preprice-ins/files/upload/wx/",
            listType: "picture-card",
            multiple: true
        }
        return (
            <div className="send-image-wrapper" onPaste={this.handlePaste} style={{display: isSendImage ? 'block' : 'none'}}>
                <div className='send-image-container'>
                    <div className='send-title-container'>
                        <span className='send-title'>发送图片<span style={{fontSize: '12px', color: '#aaa'}}>（支持CTRL+V粘贴您截取到剪切板的图片）</span></span>
                        {/* <span className='submit-title-close' onClick={this.cancel}>×</span> */}
                        <img src={closeIcon} alt="" className='send-title-close' onClick={this.cancel}/>
                    </div>
                    <div className='send-content'>
                        <Upload
                            {...props}
                            fileList={fileList}
                            onPreview={this.handlePreview}
                            onChange={this.handleChange }
                        >
                            {/* {fileList.length >= 10 ? null : uploadButton} */}
                            {uploadButton}
                        </Upload>
                        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                            <img alt="example" style={{width: '100%'}} src={previewImage}/>
                        </Modal>
                    </div>
                    <div className="send-foot">
                        <button className='default' onClick={this.cancel}>取消</button>
                        <button className='default send' onClick={this.sendImage}>发送</button>
                    </div>
                </div>
            </div>
        )
    }
}