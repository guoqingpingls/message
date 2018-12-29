import React from 'react';
const { hasCommercialInsurance, changesupplierIdToName } = require('../util/util.js');
import '../stylesheets/FormModal.css';
import { get_member_list } from '../services/index';
import { Select,message } from 'antd';

const Option = Select.Option;
const formList = ['交强保单号', '商业保单号', '工号', '快递单号']
export default class FormModal extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            baseInfo: {},
            InsDetailIdList: [],
            memberList: [],
            // jobNoId: null,
            InsBackOfficePartnerId: null,
            memberList: []
        }
    };
    componentWillMount () {
        const params = {
            Status:2
        }
        // this.getInsBackOfficePartnerId('InsBackOfficePartner');
        // this.getSingleMemberList();

        // get_member_list(params).then(res => {
        //     console.log('get_member_list: ', res)
        //     this.state.memberList = res.Datas
        // }).catch((err) => {
        //     console.log('get_member_list: err: ', err)
        // })
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.baseData && nextProps.baseData !== this.props.baseData) {
            this.state.baseInfo = nextProps.baseData;
            this.getInsDetailIdList()
            // this.setState({
            //     baseInfo: nextProps.baseData
            // }, this.getInsDetailIdList())
        }
    };
    getInsBackOfficePartnerId (name) {
        this.state.InsBackOfficePartnerId = 10000;
    //     var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)"); 
    // 　　let tmp = (arr=document.cookie.match(reg))?unescape(arr[2]):null;
    //     this.state.InsBackOfficePartnerId = tmp;
    };
    getInsDetailIdList = () => {
        let tmpCoverageList = this.state.baseInfo.coverageList;
        let tmpList = [];
        if (tmpCoverageList) {
            tmpList = JSON.parse(tmpCoverageList).map((item, index) => {
                return item.InsDetailId;
            });
            this.setState({
                InsDetailIdList: tmpList
            });
        }
    };
    submitForm = () => {
        var queryParam = function(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var search = window.location.href.split('?');
            if(search.length<2) return null;
            var r = search[1].match(reg);
            if (r != null) return unescape(r[2]); return null;
        };
        let cid = queryParam('cid');
        let params = {
            // biPolicyNo: this.refs.biPolicyNo.value,
            // ciPolicyNo: this.refs.ciPolicyNo.value,
            // jobNoId: this.state.jobNoId,
            jobNoId: 0,
            // expressNo: this.refs.expressNo.value,
            // priceId: this.props.priceId
            priceId: this.props.priceId
        };
        if(cid){
            params.cid=cid;
        }
        let { baseInfo } = this.state;

                // 是否有商业险
                if (baseInfo.coverageList && hasCommercialInsurance(JSON.parse(baseInfo.coverageList))) {
                    if(!this.refs.biPolicyNo.value){
                        message.info('请输入商业险保单号',2);
                        this.refs.biPolicyNo.focus();
                        return;
                    }
                    params.biPolicyNo = this.refs.biPolicyNo.value
                }
        // 有交强险
        if (this.state.InsDetailIdList.indexOf('10501') > -1) {
            if(!this.refs.ciPolicyNo.value){
                message.info('请输入交强险保单号',2);
                this.refs.ciPolicyNo.focus();
                return;
            }
            params.ciPolicyNo = this.refs.ciPolicyNo.value
        }
        // 是否邮寄
        //邮寄方式:  0 自取 1 邮寄 -1 未选择
        if (baseInfo.deliverytype === 1) {
            params.expressNo = this.refs.expressNo.value
        }
        this.props.submitForm(params);
        params = {}
    };
    cancel = () => {
        this.props.onCancel();
    };
    // getSelectedValue = () => {
    //     let obj = document.getElementById('choosedMember'); //定位id
    //     let index = obj.selectedIndex; // 选中索引
    //     let text = obj.options[index].text; // 选中文本
    //     let jobNoId = obj.options[index].value; // 选中值
    //     this.state.jobNoId = Number(jobNoId);
    // };
    // 获取出单员列表
    getSingleMemberList = (value) => {
        let params = {
            pageNum: 1,
            pageSize: 10000,
            dto: {
                PartnerId: this.state.InsBackOfficePartnerId
            }
        };
        if (value.trim().length > 0) {
            params.dto.Remark = value;
        }
        get_member_list(params).then((res) => {
            // this.state.memberList = res.pageInfo.list
            this.setState({
                memberList: res.pageInfo.list
            })
        }).catch((err) => {
            console.log('err: ', err)
        })
    }
    // 搜索出单员
    handleChange = (value) => {
        // this.getSingleMemberList(value)
    }
      
    handleBlur = () => {
        console.log('blur');
    }
      
    handleFocus = () => {
        console.log('focus');
    }
    render () {
        const { isShowModal } = this.props;
        const { baseInfo, InsDetailIdList, memberList } = this.state;
        return (
            <div className='form-modal-container' style={{display: isShowModal ? 'block' : 'none'}} >
                    <div className='form-modal-content'>
                        <div className='form-modal-title-container'>
                            <span className='form-modal-title'>保单已生成</span>
                            <span className='form-modal-cancel' onClick={this.cancel}>×</span>
                        </div>
                        <ul>
                            {/* {
                                formList.map((item, index) => {
                                    return(
                                        <li className='modal-item-container' key={index}>
                                            <span className='modal-item-title'>{ item }</span>
                                            <input ref={} type="text" className='modal-item-input'/>
                                        </li>
                                    )
                                })
                            } */}
                             {
                                baseInfo.coverageList && hasCommercialInsurance(JSON.parse(baseInfo.coverageList))
                                ?   <li className='form-modal-item-container'>
                                        <span className='form-modal-item-title'>商业保单号</span>
                                        <input ref='biPolicyNo' type="text" placeholder='请输入商业单号' className='form-modal-item-input'/>
                                    </li>
                                :   null
                            }
                            {
                                InsDetailIdList.indexOf('10501') > -1
                                ?   <li className='form-modal-item-container'>
                                        <span className='form-modal-item-title'>交强保单号</span>
                                        <input ref='ciPolicyNo' type="text" placeholder='请输入交强单号' className='form-modal-item-input'/>
                                    </li>
                                :   null
                            }
                            {
                                baseInfo.deliverytype === 1
                                ?   <li className='form-modal-item-container'>
                                        <span className='form-modal-item-title'>快递单号</span>
                                        <input ref='expressNo' type="text"  placeholder='请输入快递单号' className='form-modal-item-input'/>
                                    </li>
                                :   <div style={{marginTop: '20px'}} className='form-modal-item-container'>收件方式： 自提</div>
                            }
                            
                        </ul>
                        {/* <div className='form-modal-operate-container'>注：在提交前请确认您已经针对以上保单做了录单结算操作</div> */}
                        <div className='form-modal-operate-container'>
                            <button className='form-modal-btn-default form-modal-submit' onClick={this.submitForm}>提交</button>
                            <button className='form-modal-btn-default form-modal-default' onClick={this.cancel}>取消</button>
                        </div>
                    </div>
                </div>
        )
    }
}