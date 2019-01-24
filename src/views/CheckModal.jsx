import React from 'react';
import {Icon, notification, message } from 'antd';
import '../stylesheets/CheckModal.less';
import choosedImage from '../assets/images/checked-icon.png';
import { get_enquiry_image, image_recognition, update_car_info, search_car_info} from '../services/index';
import Loading from './Loading';
const { isEmptyObject } = require('../util/util.js');
import closeIcon from '../assets/images/close.png';
const btnObj = [
  {
    title: '行驶证正面',
    key: 0
  },
  {
    title: '行驶证副面',
    key: 1
  },
  {
    title: '身份证正面',
    key: 2
  },
  {
    title: '身份证反面',
    key: 3
  }
]
let paramsInfo = []
const name = '图片识别'
export default class CheckModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowRight: false,     // 是否显示右边的识别部分
      baseInfo: '',
      priceId: null,
      choosedIndex: null,
      showSuccesstip: false,
      isShowLoading: false,
      imageInfo: {},
      DLFront: {
        LicenseNo: '',   //号牌号码
        OwnerName: '',   //车主姓名
        VehicleType: '',    //车辆类型
        CarModel: '',       //品牌型号
        FrameNo: '',    //车辆识别代码
        EngineNo: '',   // 发动机号
        UseCharacter: '',   //使用性质
        RegisterDate: '',   //注册日期
        IssueDate: '',  //发证日期
        Address: '',    //地址
      },
      DLBack: {
        LicenseNo: '',   //车牌号
        FileNo: '',     //档案编号
        Passenger: '',      //核定载人数
        ExhaustCapability: '',  //总质量
        WholeWeight: '',       //整备质量
        OverallDimension: '',       //外扩尺寸
        TractionMass: '',       //准牵引总质量
        InspectionRecord: '',   //检验记录
      },
      IDBack: {
        DepInfo: '',    // 签发机关
        EffBeginDate: '',   // 签发时间
        EffEndDate: '',     // 截止时间
      },
      IDFront: {
        Birthday: '',       //出生日期
        Nationality: '',    //民族
        Sex: '',        //性别
        Name: '',       // 姓名
        Address: '',    //地址
        IdNo: '',       //身份证号
      },
      defaultWidth: 412,
      defaultHeight: 316,
      rotateDeg: 0,
      path: '',
      images: []
    }
  }
  choosedItem = (index) => {
    this.setState({
      choosedIndex: index
    })
    this.searchByItem(this.props.priceId);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.imageSrc !== nextProps.imageSrc) {
      let {defaultWidth, defaultHeight} = this.state
      let image = new Image();
      image.src = nextProps.imageSrc;
      this.state.imageInfo = {
        path: nextProps.imageSrc,
        width: defaultWidth,
        height: defaultHeight,
      }
      this.setState({
        path: nextProps.imageSrc,
        images: nextProps.imagesInArr,
        rotateDeg: 0
      })
    }
    if (this.props.baseInfo !== nextProps.baseInfo) {
      this.setState({
        baseInfo: nextProps.baseInfo
      })
    }
  }
  closeModal = () => {
    this.setState({
      isShowRight: false
    })
    this.props.hideCheckModal();
  }
    // 根据证件类型赋值
  getDataInType = (newData) => {
    let self = this;
    let tmpInfo = {};
    if (self.state.choosedIndex === 0 ) {
      tmpInfo = Object.assign({}, self.state.DLFront, newData);
      self.setState({
        DLFront: tmpInfo
      });
    };
    if (self.state.choosedIndex === 1 ) {
      tmpInfo = Object.assign({}, self.state.DLBack, newData);
      self.setState({
        DLBack: tmpInfo
      });
    };
    if (self.state.choosedIndex === 2 ) {
      tmpInfo = Object.assign({}, self.state.IDFront, newData);
      self.setState({
        IDFront: tmpInfo
      })
    };
    if (self.state.choosedIndex === 3 ) {
      tmpInfo = Object.assign({}, self.state.IDBack, newData);
      self.setState({
        IDBack: tmpInfo
      });
    };
  }
  // 查询
  searchByItem = (priceId) => {
    search_car_info(priceId).then((res) => {
      if (res.returnCode === 2 ) {
        this.setState({
          DLFront: res.dtoList[0].Dlfront,
          DLBack: res.dtoList[0].Dlback,
          IDFront: res.dtoList[0].Idfront,
          IDBack: res.dtoList[0].Idback
        })
      }
    })
  }
  // 重新识别
  recogniteImage = () => {
    let { baseInfo } = this.state;
    if ([0, 1, 2, 3].indexOf(this.state.choosedIndex) === -1 ) {
      message.info('请选择图片类型！！');
      message.config({
        duration: 2
      })
      return;
    }
    let self = this;
    let tmoImageType = Number(this.state.choosedIndex) + 1;
    let params = '?imageUrl=' + this.state.path + '&imageType=' + tmoImageType + '&userId=' + baseInfo.userid + '&partnerId=' + baseInfo.partnerId
    this.setState({
      isShowLoading: true
    })
    image_recognition(params).then((res) => {
      if (res.returnCode === 2) {
        this.setState({
          showSuccesstip: true
        })
        if (res.dtoList.length) {
          self.getDataInType(res.dtoList[0]);
          this.setState({
            isShowLoading: false
          })
        }
      } else {
        this.setState({
          isShowLoading: false
        })
        notification.open({
          message: res.message,
          duration: 3
        });
      }
    })
  }
  updateCarInfo = () => {
    let self = this;
    if ([0, 1, 2, 3].indexOf(this.state.choosedIndex) === -1 ) {
      message.info('请选择图片类型！！');
      message.config({
        duration: 2
      })
      return;
    }
    let { DLFront, DLBack, IDFront, IDBack } = this.state;
    let tmpObj = {};
    let tmpParams = paramsInfo[this.state.choosedIndex];
    if (this.state.choosedIndex === 0) {
      tmpObj = Object.assign({}, DLFront, tmpParams)
    }
    if (this.state.choosedIndex === 1) {
      tmpObj = Object.assign({}, DLBack, tmpParams)
    }
    if (this.state.choosedIndex === 2) {
      tmpObj = Object.assign({}, IDFront, tmpParams)
    }
    if (this.state.choosedIndex === 3) {
      tmpObj = Object.assign({}, IDBack, tmpParams)
    }
    // 过滤掉tmpObj的空字符串
    let tpObj = {};
    for (var i in tmpObj) {
      if (tmpObj.hasOwnProperty(i)) {
        if (tmpObj[i] && tmpObj[i].trim().length > 0) {
          tpObj[i] = tmpObj[i]
        }
      }
    }
    let resultObj = {};
    if (this.state.choosedIndex === 0) {
      let dataReg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      if (dataReg.test(tpObj.RegisterDate)) {
        if (tpObj.LicenseNo && tpObj.LicenseNo.trim().length
          && tpObj.OwnerName && tpObj.OwnerName.trim().length
          && tpObj.CarModel && tpObj.CarModel.trim().length
          && tpObj.FrameNo && tpObj.FrameNo.trim().length
          && tpObj.RegisterDate && tpObj.RegisterDate.trim().length
          && tpObj.EngineNo && tpObj.EngineNo.trim().length
        ) {
          resultObj = tpObj
        } else {
          message.info('缺少必填字段！！！');
          message.config({
            duration: 2
          })
          return;
        }
      } else {
        message.info('日期填写有误，请核对后再提交');
        return;
      }
    }
    if (this.state.choosedIndex === 1) {
      if (tpObj.LicenseNo && tpObj.LicenseNo.trim().length) {
        resultObj = tpObj
      } else {
        message.info('缺少必填字段！！！');
        message.config({
          duration: 2
        })
        return;
      }
    }
    if (this.state.choosedIndex === 2) {
      if (tpObj.Birthday && tpObj.Birthday.trim().length
        && tpObj.Nationality && tpObj.Nationality.trim().length
        && tpObj.Sex && tpObj.Sex.trim().length
        && tpObj.Name && tpObj.Name.trim().length
        && tpObj.Address && tpObj.Address.trim().length
        && tpObj.IdNo && tpObj.IdNo.trim().length
      ) {
        resultObj = tpObj
      } else {
        message.info('缺少必填字段！！！');
        message.config({
          duration: 2
        })
        return;
      }
    }
    if (this.state.choosedIndex === 3) {
      if (tpObj.DepInfo && tpObj.DepInfo.trim().length
        && tpObj.EffBeginDate && tpObj.EffBeginDate.trim().length
        && tpObj.EffEndDate && tpObj.EffEndDate.trim().length
      ) {
        resultObj = tpObj
      } else {
        message.info('缺少必填字段！！！');
        return;
      }
    }
    resultObj.Type = Number(this.state.choosedIndex) + 1;
    let tmp = {
      priceId: this.props.priceId,
      dto: resultObj
    }
    let params = JSON.stringify(tmp);
    this.setState({
      isShowLoading: true
    })
    if (tmp.priceId && isEmptyObject(tmp.dto)) {
      update_car_info(tmp).then((res) => {
        self.setState({
          isShowLoading: false
        })
        if (res.returnCode === 2) {
          notification.open({
            message: res.message,
            duration: 3
          });
          self.props.getEnquireDetail();
        } else {
          notification.open({
            message: res.message,
            duration: 3
          });
        }
        self.props.hideCheckModal(1);
      });
    }
    self.setState({
      isShowLoading: false
    });
  }
  changeValue = (e) => {
    const {DLFront, DLBack, IDFront, IDBack} = this.state;
    let target = e.target;
    let name = target.name;
    let value = target.value;
    let index = this.state.choosedIndex;
    let tmpObj = {};
    if (index === 0) {
      tmpObj = Object.assign({}, DLFront, {[name]: value});
      this.setState({
        DLFront: tmpObj
      })
    }
    if (index === 1) {
      tmpObj = Object.assign({}, DLBack, {[name]: value});
      this.setState({
        DLBack: tmpObj
      })
    }
    if (index === 2) {
      tmpObj = Object.assign({}, IDFront, {[name]: value});
      this.setState({
        IDFront: tmpObj
      })
    }
    if (index === 3) {
      tmpObj = Object.assign({}, IDBack, {[name]: value});
      this.setState({
        IDBack: tmpObj
      })
    }
  }
  enlarge = () => {
    const {defaultHeight, defaultWidth, imageInfo} = this.state;
    let showImage = this.refs.showImage;
    if (imageInfo.height > 824 && imageInfo.width > 632) {
      return;
    }
    let tmpInfo = imageInfo
    tmpInfo.width = imageInfo.width * 2 
    tmpInfo.height = imageInfo.height * 2 
    this.setState({
      imageInfo: tmpInfo
    })
  }
  narrow = () => {
    const {defaultHeight, defaultWidth, imageInfo} = this.state;
    let showImage = this.refs.showImage;
    if (imageInfo.height === 316 && imageInfo.width === 412) {
      return;
    }
    let tmpInfo = imageInfo
    tmpInfo.width = imageInfo.width / 2
    tmpInfo.height = imageInfo.height / 2
    this.setState({
      imageInfo: tmpInfo
    })
  }
  toLast = () => {
    const {path, images, defaultHeight, defaultWidth} = this.state;
    if (images.indexOf(path) > 0) {
      let pathPosition = images.indexOf(path) - 1;
      let image = new Image();
      image.src = images[pathPosition]
      this.state.imageInfo = {
        path: images[pathPosition],
        width: defaultWidth,
        height: defaultHeight,
      }
      this.setState({
        path: images[pathPosition],
        rotateDeg: 0,
        choosedIndex: null,
      })
    }
  }
  toNext = () => {
    const {path, images, defaultHeight, defaultWidth} = this.state;
    if (images.indexOf(path) < images.length -1) {
      let pathPosition = images.indexOf(path) + 1;
      let image = new Image();
      image.src = images[pathPosition]
      this.state.imageInfo = {
        path: images[pathPosition],
        width: defaultWidth,
        height: defaultHeight,
      }
      this.setState({
        path: images[pathPosition],
        rotateDeg: 0,
        choosedIndex: null,
      })
    }
  }
  leftRotate = () => {
    let {rotateDeg, imageInfo, defaultHeight, defaultWidth} = this.state;
    let tmpRotate = Number(rotateDeg) - 90;
    let tmpInfo = imageInfo
    tmpInfo.width = defaultWidth
    tmpInfo.height = defaultHeight
    this.setState({
      rotateDeg: tmpRotate,
      imageInfo: tmpInfo
    })
  }
  rightRotate = () => {
    let {rotateDeg, imageInfo, defaultWidth, defaultHeight} = this.state;
    let tmpRotate = Number(rotateDeg) + 90;
    let tmpInfo = imageInfo
    tmpInfo.width = defaultWidth 
    tmpInfo.height = defaultHeight 
    this.setState({
      rotateDeg: tmpRotate,
      imageInfo: tmpInfo
    })
  }
  resetImage = () => {
    let { imageInfo, defaultHeight, defaultWidth } = this.state;
    let tmpInfo = imageInfo
    tmpInfo.width = defaultWidth
    tmpInfo.height = defaultHeight
    this.setState({
      imageInfo: tmpInfo
    })
  }
  showRight = () => {
    this.setState({
      isShowRight: true
    })
  }
  render () {
    const {
      choosedIndex,
      DLFront,
      DLBack,
      IDFront,
      IDBack,
      isShowLoading,
      imageInfo,
      defaultHeight,
      defaultWidth,
      path,
      images,
      rotateDeg,
      isShowRight
    } = this.state;
    const hasRight = {
      width: '80%',
      minWidth: '1180px'
    }
    const noRight = {
      width: '618px'
    }
      return (
          <div className='check-modal-container' style={isShowRight ? hasRight : noRight} onClick = {(e) => { e.stopPropagation()}}>
            <img src={closeIcon} alt="" className='close-icon' onClick={this.closeModal}/>
            <div className='check-modal-left'>
              <div className='check-modal-left-title'>
                <span></span>
                {
                  isShowRight
                  ? <div></div>
                  : <div className='left-tip-container'>
                      <div className='left-tip'>
                        <span>证件照或者行驶证可以点击识别哦</span>
                        <span className='left-trangle'></span>
                      </div>
                      <button className='art-btn' onClick={this.showRight}>智能识别</button>
                    </div>
                }
              </div>
              <div className='modal-image-container'>
                <img className='show-image' style={{width: imageInfo.width+'px', height: imageInfo.height+'px', transform: 'rotate('+ rotateDeg + 'deg)'}} ref='showImage' src={path} alt=""/>
              </div>
              <div className='operate-wrapper'>
                <img className='operate-item' onClick={this.enlarge} src={require("../assets/images/check-icon/enlarge.gif")} alt=""/>
                <img className='operate-item' onClick={this.narrow} src={require("../assets/images/check-icon/narrow.gif")} alt=""/>
                <img className='operate-item' onClick={this.resetImage} src={require("../assets/images/check-icon/oneToOne.gif")} alt=""/>
                <span className='horizon-span'></span>
                {
                  images.length && images.indexOf(path) > 0 
                  ? <img className='operate-item' onClick={this.toLast} src={require("../assets/images/check-icon/last.gif")} alt=""/>
                  : <img className='operate-item' src={require("../assets/images/check-icon/noLast.gif")} alt=""/>
                }
                {
                  images.length && images.indexOf(path) < images.length -1
                  ? <img className='operate-item' onClick={this.toNext} src={require("../assets/images/check-icon/next.gif")} alt=""/>
                  : <img className='operate-item' src={require("../assets/images/check-icon/noRight.gif")} alt=""/>
                }
                <span className='horizon-span'></span>
                <img className='operate-item' onClick={this.rightRotate} src={require("../assets/images/check-icon/rightRotate.gif")} alt=""/>
                <img className='operate-item' onClick={this.leftRotate} src={require("../assets/images/check-icon/leftRotation.gif")} alt=""/>
                <span className='horizon-span'></span>
                <a href={path} download={path}>
                  <img ref='downLoad' className='operate-item' src={require("../assets/images/check-icon/down.gif")} alt=""/>
                </a>
              </div>
            </div>
            {
              isShowRight
              ? <div className='check-modal-right'>
                  <span className='check-right-title'>该图片为</span>
                  <div className='btn-container'>
                    {
                      btnObj.map((item, index) => {
                        return (
                          <button onClick={() => {this.choosedItem(index)}} className='default-btn' style={{borderColor: choosedIndex === index ? '#15CE36' : '#ccc'}} key={index}>
                            {item.title}
                            <img  style={{display: choosedIndex === index ? 'block' : 'none'}} src={choosedImage} className='choosed-icon'/>
                          </button>
                        )
                      })
                    }
                  </div>
                  <div className='input-container'>
                    {
                      choosedIndex === 0
                      ? <div>
                          <div>注：* 号为必填字段; 日期格式例如： 2008-08-08</div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>* 号牌号码</span>
                              <input className='input-defult' type="text" name='LicenseNo' onChange={this.changeValue} value={DLFront.LicenseNo || ''} placeholder="请填写号牌号码" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title'>&nbsp;&nbsp;&nbsp;车辆类型</span>
                              <input className='input-defult' type="text" name='VehicleType' onChange={this.changeValue} value={DLFront.VehicleType || ''} placeholder="请填写车辆类型" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>* 车主姓名</span>
                              <input className='input-defult' type="text" name='OwnerName' onChange={this.changeValue} value={DLFront.OwnerName || ''} placeholder="请填写车主姓名" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title' >&nbsp;&nbsp;&nbsp;住<span style={{display: 'inline-block', width: '26px'}}></span>址</span>
                              <input className='input-defult' type="text" name='Address' onChange={this.changeValue} value={DLFront.Address || ''} placeholder="请填写住址" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'><span style={{display: 'inline-block', width: '66px', textAlign: 'right'}}>使用性质</span></span>
                              <input className='input-defult' type="text" name='UseCharacter' onChange={this.changeValue} value={DLFront.UseCharacter || ''} placeholder="请填写使用性质" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title'>* 品牌型号</span>
                              <input className='input-defult' type="text" name='CarModel' onChange={this.changeValue} value={DLFront.CarModel || ''} placeholder="请填写品牌型号" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>* 车架号码</span>
                              <input className='input-defult' type="text" name='FrameNo' onChange={this.changeValue} value={DLFront.FrameNo || ''} placeholder="请填写车架号码" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>* 发动机号</span>
                              <input className='input-defult' type="text" name='EngineNo' onChange={this.changeValue} value={DLFront.EngineNo || ''} placeholder="请填写发动机号" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>* 注册日期</span>
                              <input className='input-defult' type="text" name='RegisterDate' onChange={this.changeValue} value={DLFront.RegisterDate || ''} placeholder="请填写注册日期" />
                            </div>
                            <div className='item-container'>
                            </div>
                          </div>
                        </div>
                      : null
                    }
                    {/* 行驶证反面 */}
                    {
                      choosedIndex === 1
                      ? <div>
                          <div>注：* 号为必填字段</div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title title-content'>号牌号码*</span>
                              <input className='input-defult' type="text" name='LicenseNo' onChange={this.changeValue} value={DLBack.LicenseNo || ''} placeholder="请填写号牌号码" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title title-content'>档案编号</span>
                              <input className='input-defult' type="text" name='FileNo' onChange={this.changeValue} value={DLBack.FileNo || ''} placeholder="请填写档案编号" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title title-content'>核定载人数</span>
                              <input className='input-defult' type="text" name='Passenger' onChange={this.changeValue} value={DLBack.Passenger || ''} placeholder="请填写核定载人数" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title title-content'>总质量</span>
                              <input className='input-defult' type="text" name='ExhaustCapability' onChange={this.changeValue} value={DLBack.ExhaustCapability || ''} placeholder="请填写总质量" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title title-content'>整备质量</span>
                              <input className='input-defult' type="text" name='WholeWeight' onChange={this.changeValue} value={DLBack.WholeWeight || ''} placeholder="请填写整备质量" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title title-content'>外扩尺寸</span>
                              <input className='input-defult' type="text" name='OverallDimension' onChange={this.changeValue} value={DLBack.OverallDimension || ''} placeholder="请填写外扩尺寸" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title title-content'>准牵引总质量</span>
                              <input className='input-defult' type="text" name='TractionMass' onChange={this.changeValue} value={DLBack.TractionMass || ''} placeholder="请填写准牵引总质量" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title title-content'>检验记录</span>
                              <input className='input-defult' type="text" name='InspectionRecord' onChange={this.changeValue} value={DLBack.InspectionRecord || ''} placeholder="请填写检验记录" />
                            </div>
                          </div>
                        </div>
                      : null
                    }
                    {/* 身份证正面 */}
                    {
                      choosedIndex === 2
                      ? <div>
                          <div>注：* 号为必填字段</div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>姓名*</span>
                              <input className='input-defult' type="text" name='OwnerName' onChange={this.changeValue} value={IDFront.Name || ''} placeholder="请填写姓名" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>性别*</span>
                              <input className='input-defult' type="text" name='Sex' onChange={this.changeValue} value={IDFront.Sex || ''} placeholder="请填写性别" />
                            </div>
                            <div className='item-container'>
                              <span className='item-title'>民族*</span>
                              <input className='input-defult' type="text" name='Nationality' onChange={this.changeValue} value={IDFront.Nationality || ''} placeholder="请填写民族" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>出生*</span>
                              <input className='input-defult' type="text" name='Birthday' onChange={this.changeValue} value={IDFront.Birthday || ''} placeholder="请填写出生日期" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>住址*</span>
                              <input className='input-defult' type="text" name='Address' onChange={this.changeValue} value={IDFront.Address || ''} placeholder="请填写住址" />
                            </div>
                          </div>
                          <div className='vertical-container'>
                            <div className='item-container'>
                              <span className='item-title'>公民身份证号码*</span>
                              <input className='input-defult' type="text" name='IdNo' onChange={this.changeValue} value={IDFront.IdNo || ''} placeholder="请填写公民身份证号码" />
                            </div>
                          </div>
                        </div>
                      : null
                    }
                    {/* 身份证反面 */}
                    {
                      choosedIndex === 3
                      ? <div>
                        <div>注：* 号为必填字段</div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>签发机关*</span>
                            <input className='input-defult' type="text" name='DepInfo' onChange={this.changeValue} value={IDBack.DepInfo || ''} placeholder="请填写签发机关" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>签发时间*</span>
                            <input className='input-defult' type="text" name='EffBeginDate' onChange={this.changeValue} value={IDBack.EffBeginDate || ''} placeholder="请填写签发时间" />
                          </div>
                          <div className='item-container'>
                            <span className='item-title'>截止时间*</span>
                            <input className='input-defult' type="text" name='EffEndDate' onChange={this.changeValue} value={IDBack.EffEndDate || ''} placeholder="请填写截止时间" />
                          </div>
                        </div>
                      </div>
                      : null
                    }
                  </div>
                  <div className='footer'>
                    <button className='footer-btn' onClick={this.recogniteImage}>重新识别</button>
                    <button className='footer-btn' onClick={this.updateCarInfo}>提交</button>
                  </div>
                </div>
              : <div></div>
            }
            <Loading isShowLoading={isShowLoading}/>
          </div>
      )
  }
}