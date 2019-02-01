import React from 'react';
import {Icon, notification, message } from 'antd';
import MpModal from '../components/MpModal';
import ImageModal from 'cxj-react-image';
import '../stylesheets/CheckModal.less';
import choosedImage from '../assets/images/checked-icon.png';
import { get_enquiry_image, image_recognition, update_car_info, search_car_info} from '../services/index';
// import Loading from './Loading';
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
      choosedIndex: null,
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
      path: '',
      images: [],
      // new
      modalWidth: '50%',
      isShowReModal: false,
      currentImageIndex: null
    }
  }
  componentWillMount = () => {
    // 默认图片大小
    // let {imageSrc, imagesInArr} = this.props;
    // let image = new Image();
    // image.src = imageSrc;
    // this.state.imageInfo = {
    //   path: imageSrc,
    //   width: image.width,
    //   height: image.height,
    //   rotateDeg: 0
    // }
    // this.setState({
    //   path: imageSrc,
    //   images: imagesInArr,
    //   defaultHeight: image.height,
    //   defaultWidth: image.width
    // })


    let {imageSrc, imagesInArr} = this.props;
    this.setState({
      currentImageIndex: imagesInArr.indexOf(imageSrc)
    })
  }
  componentDidMount = () => {
    // 图片显示垂直居中
    let imageContainer = this.refs.imageContainer
    imageContainer.style.lineHeight = `${imageContainer.clientHeight}px`;

  }
  choosedItem = (index) => {
    this.setState({
      choosedIndex: index
    })
  }
  resetChooseIndex = () => {
    this.setState({
      choosedIndex: null,
      isShowRight: false,
    })
  }
  closeModal = () => {
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
  // 重新识别
  recogniteImage = () => {
    let { baseInfo, imagesInArr } = this.props;
    let {currentImageIndex} = this.state;
    if ([0, 1, 2, 3].indexOf(this.state.choosedIndex) === -1 ) {
      message.info('请选择图片类型！！');
      message.config({
        duration: 2
      })
      return;
    }
    let self = this;
    let tmoImageType = Number(this.state.choosedIndex) + 1;
    let params = '?imageUrl=' + imagesInArr[currentImageIndex] + '&imageType=' + tmoImageType + '&userId=' + baseInfo.userid + '&partnerId=' + baseInfo.partnerId
    this.setState({
      isShowLoading: true
    })
    image_recognition(params).then((res) => {
      if (res.returnCode === 2) {
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
    let { choosedIndex, DLFront, DLBack, IDFront, IDBack } = this.state;
    let self = this;
    if ([0, 1, 2, 3].indexOf(choosedIndex) === -1 ) {
      message.info('请选择图片类型！！');
      message.config({
        duration: 2
      })
      return;
    }
    let tmpObj = {};
    let tmpParams = paramsInfo[choosedIndex];
    if (choosedIndex === 0) {
      tmpObj = Object.assign({}, DLFront)
    }
    if (choosedIndex === 1) {
      tmpObj = Object.assign({}, DLBack)
    }
    if (choosedIndex === 2) {
      tmpObj = Object.assign({}, IDFront)
    }
    if (choosedIndex === 3) {
      tmpObj = Object.assign({}, IDBack)
    }
    // 过滤掉tmpObj的空字符串
    let tpObj = {};
    for (var i in tmpObj) {
      if (tmpObj.hasOwnProperty(i)) {
        if (tmpObj[i] && tmpObj[i].toString().trim().length > 0) {
          tpObj[i] = tmpObj[i]
        }
      }
    }
    let resultObj = {};
    if (choosedIndex === 0) {
      // 校验注册日期
      let dataReg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      if (tpObj.RegisterDate && tpObj.RegisterDate.length) {
        if (dataReg.test(tpObj.RegisterDate)) {
          resultObj = tpObj
        } else {
          message.info('注册日期填写有误，请核对后再提交');
          return;
        }
      }
      if (tpObj.IssueDate && tpObj.IssueDate.length) {
        if (dataReg.test(tpObj.IssueDate)) {
          resultObj = tpObj
        } else {
          message.info('发证日期填写有误，请核对后再提交');
          return;
        }
      }
      // if ((tpObj.RegisterDate && dataReg.test(tpObj.RegisterDate)) || (tpObj.IssueDate && dataReg.test(tpObj.IssueDate))) {
      //     resultObj = tpObj
      // } else {
      //     message.info('日期填写有误，请核对后再提交');
      //     return;
      // }
    }
    if (choosedIndex === 1) {
      if (tpObj.Passenger && isNaN(Number(tpObj.Passenger))) {
        message.info('核定载人数必须是数字');
        return;
      }
      // if (tpObj.WholeWeight && isNaN(Number(tpObj.WholeWeight))) {
      //     message.info('整备质量必须是数字');
      //     return;
      // }
      resultObj = tpObj
    }
    if (choosedIndex === 2) {
      resultObj = tpObj
    }
    if (choosedIndex === 3) {
      resultObj = tpObj
    }
    resultObj.Type = Number(choosedIndex) + 1;
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
        } else {
          notification.open({
            message: res.message,
            duration: 3
          });
        }
          // self.setState({
          //     choosedIndex: null
          // })
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
    let {path, imageInfo} = this.state;
    let image = new Image();
    image.src = path;
    if (imageInfo.height > 824 && imageInfo.width > 632) {
      return;
    }
    this.setState({
      imageInfo: Object.assign({}, imageInfo, {
        width: imageInfo.width * 1.5,
        height: imageInfo.height * 1.5
      })
    })
  }
  narrow = () => {
    let {path, imageInfo} = this.state
    let image = new Image();
    image.src = path;
    if (imageInfo.height < 50 && imageInfo.width < 50) {
      return;
    }
    this.setState({
      imageInfo: Object.assign({}, imageInfo, {
        width: imageInfo.width * 0.5,
        height: imageInfo.height * 0.5
      })
    })
  }
  toLast = () => {
    let {currentImageIndex} = this.state;
    this.setState({
      currentImageIndex: currentImageIndex-1
    })
    // const {path, imageInfo, images, defaultHeight, defaultWidth} = this.state;
    // if (images.indexOf(path) > 0) {
    //   let pathPosition = images.indexOf(path) - 1;
    //   let image = new Image();
    //   image.src = images[pathPosition]
    //   this.setState({
    //     path: images[pathPosition],
    //     choosedIndex: null,
    //     defaultHeight: image.height,
    //     defaultWidth: image.width,
    //     imageInfo: Object.assign({}, imageInfo, {
    //       src: images[pathPosition],
    //       width: image.width,
    //       height: image.height,
    //       rotateDeg: 0
    //     })
    //   })
    // }
  }
  toNext = () => {
    let {currentImageIndex} = this.state;
    this.setState({
      currentImageIndex: currentImageIndex+1
    })
    // const {path, imageInfo, images, defaultHeight, defaultWidth} = this.state;
    // if (images.indexOf(path) < images.length -1) {
    //   let pathPosition = images.indexOf(path) + 1;
    //   let image = new Image();
    //   image.src = images[pathPosition]
    //   this.setState({
    //     path: images[pathPosition],
    //     choosedIndex: null,
    //     defaultHeight: image.height,
    //     defaultWidth: image.width,
    //     imageInfo: Object.assign({}, imageInfo, {
    //       src: images[pathPosition],
    //       width: image.width,
    //       height: image.height,
    //       rotateDeg: 0
    //     })
    //   })
    // }
  }
  leftRotate = () => {
    let imageModal = this.refs.imageModal
    imageModal.handleRotateLeft()
    // let {imageInfo, defaultHeight, defaultWidth} = this.state;
    // let tmpRotate = Number(imageInfo.rotateDeg) - 90;
    // if (tmpRotate%180 === 0) {
    //   this.setState({
    //     imageInfo:  Object.assign({}, imageInfo, {
    //       rotateDeg: tmpRotate,
    //       width: defaultWidth,
    //       height: defaultHeight
    //     })
    //   })
    // } else {
    //   this.setState({
    //     imageInfo:  Object.assign({}, imageInfo, {
    //       rotateDeg: tmpRotate,
    //       width: defaultHeight,
    //       height: defaultWidth
    //     })
    //   })
    // }
  }
  rightRotate = () => {
    let imageModal = this.refs.imageModal
    imageModal.handleRotateRight()
    // let {imageInfo, defaultWidth, defaultHeight} = this.state;
    // let tmpRotate = Number(imageInfo.rotateDeg) + 90;
    // if (tmpRotate%180 === 0) {
    //   this.setState({
    //     imageInfo: Object.assign({}, imageInfo, {
    //       rotateDeg: tmpRotate,
    //       width: defaultWidth,
    //       height: defaultHeight
    //     })
    //   })
    // } else {
    //   this.setState({
    //     imageInfo: Object.assign({}, imageInfo, {
    //       rotateDeg: tmpRotate,
    //       width: defaultHeight,
    //       height: defaultWidth
    //     })
    //   })
    // }
  }
  dealRotate (deg) {
    let {imageInfo, defaultWidth, defaultHeight} = this.state;
    if (deg%180 === 0) {
      this.setState({
        imageInfo: Object.assign({}, imageInfo, {
          rotateDeg: deg,
          width: defaultWidth,
          height: defaultHeight
        })
      })
    } else {
      this.setState({
        imageInfo: Object.assign({}, imageInfo, {
          rotateDeg: deg,
          width: defaultHeight,
          height: defaultWidth
        })
      })
    }
  }
  resetImage = () => {
    let { path, imageInfo, defaultHeight, defaultWidth } = this.state;
    if ((imageInfo.rotateDeg)%180 === 0) {
      this.setState({
        imageInfo: Object.assign({}, imageInfo, {
          height: defaultHeight,
          width: defaultWidth,
          rotateDeg: 0
        })
      })
    } else {
      this.setState({
        imageInfo: Object.assign({}, imageInfo, {
          height: defaultWidth,
          width: defaultHeight,
          rotateDeg: 0
        })
      })
    }
  }
  showRight = () => {
    this.setState({
      isShowRight: true,
      modalWidth: '80%'
    })
  }
  next = () => {
    const { currentImageIndex } = this.state;
    let {imagesInArr} = this.props;
    if (currentImageIndex < imagesInArr.length - 1) {
      this.setState({ currentImageIndex: currentImageIndex + 1 });
    }
  }
  prev() {
    const { currentImageIndex } = this.state;
    if (currentImageIndex > 0) {
      this.setState({ currentImageIndex: currentImageIndex - 1 });
    }
  }
  closeImg () {
    console.log('closeImge')
  }
  render () {
    let {
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
      // rotateDeg,
      isShowRight,
      modalWidth,
      isShowReModal,
      currentImageIndex
    } = this.state;
    let {imagesInArr} = this.props;
    return (
      <MpModal title='智能识别' cancel={this.closeModal} isShowFooter={true} height="80%" width={modalWidth}>
        <div className='check-modal-wrapper' onClick = {(e) => { e.stopPropagation()}}>
          <div className='check-modal-left'>
            <div className='modal-image-container' ref='imageContainer'>
              {/* <img className='show-image' style={{width: imageInfo.width+'px', height: imageInfo.height+'px', transform: 'rotate('+ imageInfo.rotateDeg + 'deg)'}} ref='showImage' src={imageInfo.path} alt=""/> */}
              <ImageModal 
                  ref='imageModal'
                  src={imagesInArr[currentImageIndex]}  /* 当前图片路径 */
                  // next={() => this.next()}            /* 控制下一张 */
                  // prev={() => this.prev()}            /* 控制上一张 */
                  closeModal={() => this.closeImg()}  /* 控制modal打开关闭 */
                  option={{
                    move: true,                        /* 控制拖动 */
                    // waterMarkText: '多功能图片组件',    /* 设置水印文字 */
                    rotate: true,                      /* 控制旋转 */
                    zoom: true                         /* 控制放大缩小 */
                  }}
                />
            </div>
            {
              isShowRight
              ? <div className='operate-wrapper'>
                  {/* <img className='operate-item' onClick={this.enlarge} src={require("../assets/images/check-icon/enlarge.gif")} alt=""/>
                  <img className='operate-item' onClick={this.narrow} src={require("../assets/images/check-icon/narrow.gif")} alt=""/>
                  <img className='operate-item' onClick={this.resetImage} src={require("../assets/images/check-icon/oneToOne.gif")} alt=""/>
                  <span className='horizon-span'></span> */}
                  {
                    imagesInArr.length &&  currentImageIndex > 0
                    ? <img className='operate-item' onClick={this.toLast} src={require("../assets/images/check-icon/last.gif")} alt=""/>
                    : <img className='operate-item' src={require("../assets/images/check-icon/noLast.gif")} alt=""/>
                  }
                  {
                    imagesInArr.length && currentImageIndex < imagesInArr.length-1
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
              : <div className='re-button' onClick={this.showRight}>
                  智能识别
                  <span className='tip'>(证件照或者行驶证可以点击识别哦)</span>
                </div>
            }
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
                        {/* <div>注：* 号为必填字段; 日期格式例如： 2008-08-08</div> */}
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>号牌号码</span>
                            <input className='input-defult' type="text" name='LicenseNo' onChange={this.changeValue} value={DLFront.LicenseNo || ''} placeholder="请填写号牌号码" />
                          </div>
                          <div className='item-container'>
                            <span className='item-title'>&nbsp;&nbsp;&nbsp;车辆类型</span>
                            <input className='input-defult' type="text" name='VehicleType' onChange={this.changeValue} value={DLFront.VehicleType || ''} placeholder="请填写车辆类型" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>车主姓名</span>
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
                            <span className='item-title'>品牌型号</span>
                            <input className='input-defult' type="text" name='CarModel' onChange={this.changeValue} value={DLFront.CarModel || ''} placeholder="请填写品牌型号" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>车架号码</span>
                            <input className='input-defult' type="text" name='FrameNo' onChange={this.changeValue} value={DLFront.FrameNo || ''} placeholder="请填写车架号码" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>发动机号</span>
                            <input className='input-defult' type="text" name='EngineNo' onChange={this.changeValue} value={DLFront.EngineNo || ''} placeholder="请填写发动机号" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>注册日期</span>
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
                        {/* <div>注：* 号为必填字段</div> */}
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title title-content'>号牌号码</span>
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
                        {/* <div>注：* 号为必填字段</div> */}
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>姓名</span>
                            <input className='input-defult' type="text" name='OwnerName' onChange={this.changeValue} value={IDFront.Name || ''} placeholder="请填写姓名" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>性别</span>
                            <input className='input-defult' type="text" name='Sex' onChange={this.changeValue} value={IDFront.Sex || ''} placeholder="请填写性别" />
                          </div>
                          <div className='item-container'>
                            <span className='item-title'>民族</span>
                            <input className='input-defult' type="text" name='Nationality' onChange={this.changeValue} value={IDFront.Nationality || ''} placeholder="请填写民族" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>出生</span>
                            <input className='input-defult' type="text" name='Birthday' onChange={this.changeValue} value={IDFront.Birthday || ''} placeholder="请填写出生日期" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>住址</span>
                            <input className='input-defult' type="text" name='Address' onChange={this.changeValue} value={IDFront.Address || ''} placeholder="请填写住址" />
                          </div>
                        </div>
                        <div className='vertical-container'>
                          <div className='item-container'>
                            <span className='item-title'>公民身份证号码</span>
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
                      {/* <div>注：* 号为必填字段</div> */}
                      <div className='vertical-container'>
                        <div className='item-container'>
                          <span className='item-title'>签发机关</span>
                          <input className='input-defult' type="text" name='DepInfo' onChange={this.changeValue} value={IDBack.DepInfo || ''} placeholder="请填写签发机关" />
                        </div>
                      </div>
                      <div className='vertical-container'>
                        <div className='item-container'>
                          <span className='item-title'>签发时间</span>
                          <input className='input-defult' type="text" name='EffBeginDate' onChange={this.changeValue} value={IDBack.EffBeginDate || ''} placeholder="请填写签发时间" />
                        </div>
                        <div className='item-container'>
                          <span className='item-title'>截止时间</span>
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
          {/* <Loading isShowLoading={isShowLoading}/> */}
        </div>
      </MpModal>
     
    )
  }
}