import React from 'react';
import {Avatar } from 'antd';
import customer from '../assets/images/customer.png';
import {
    download_images //批量下载图片
} from '../services/index';
import '../stylesheets/ChatImageList.css';

export default class ChatImageList extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            allImageList: [],
            positiveSort: true,
            baseUrl: 'https://openapi.youbaolian.cn/api/preprice-ins/files/upload/download?priceId='
        }
    }
    componentWillReceiveProps (nextProps) {
        if (this.props.allImageList !== nextProps.allImageList) {
            this.setState({
                allImageList: nextProps.allImageList
            })
        }
    }
    componentDidMount () {
        if (this.props.allImageList && this.props.allImageList.length > 0 ) {
            this.setState({
                allImageList: this.props.allImageList
            })
        }
    }
    upDownSort = () => {
        const { positiveSort, allImageList } = this.state;
            this.setState({
                allImageList: allImageList.reverse(),
                positiveSort: !positiveSort
            })
        
        }
    upSort = () => {
        const { positiveSort, allImageList } = this.state;
        if (!positiveSort) {
            this.setState({
                allImageList: allImageList.reverse(),
                positiveSort: !positiveSort
            })
        }
    }
    downSort = () => {
        const { positiveSort, allImageList } = this.state;
        if (positiveSort) {
            this.setState({
                allImageList: allImageList.reverse(),
                positiveSort: !positiveSort
            })
        }
    }
    checkImage = (ite, item) => {
        this.props.handlePreview(item.imageuris, ite)

    }
    render () {
        const {baseUrl, positiveSort, allImageList} = this.state;
        const {priceId} = this.props;
        return (
            <div className='image-wrapper'>
                {
                    allImageList && allImageList.length
                    ? <div className='image-head-container'>
                        <a href={baseUrl + priceId} >
                            <button className='download-btn'>批量下载</button>
                        </a>
                        <div className='sort-operate' onClick={this.upDownSort}>
                            <span className='sort-title'>时间排序</span>
                            <div className='sort-container'>
                                <i className={positiveSort ? 'iconfont icon-iconfontordinaryshangjiantou sort-icon sort-active' : 'iconfont icon-iconfontordinaryshangjiantou sort-icon'}/>
                                <i className={positiveSort ? 'iconfont icon-sj-down-copy sort-icon' : 'iconfont icon-sj-down-copy sort-icon sort-active'}/>
                            </div>
                        </div>
                    </div>
                    : null
                }
                <div>
                    {
                        allImageList && allImageList.length
                        ?  allImageList.map((item, index) => {
                            return(
                                <div className='image-item-container' key={index}>
                                    <div className='image-item-title'>
                                        <div className='item-head'>
                                            {
                                                item.usertype === 1
                                                ?  <Avatar size="small" icon="user" style={{backgroundColor: '#108ee9', verticalAlign: 'super', marginRight: '5px'}} />
                                                :   <div className='item-head-avatar'>
                                                        <img src={customer} alt="" className='item-head-image'/>
                                                    </div>
                                            }
                                            <span className='item-name'>{item.name}</span>
                                            <span className='item-time'>{item.senddate}</span>
                                        </div>
                                        {
                                            item.imageuris && item.imageuris.length > 0 && item.imageuris.map((ite, idx) => {
                                                return (
                                                    <img onClick={() => {this.checkImage(ite, item)}} className='image-item' key={idx} src={ite}/>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        })
                        : <div style={{width: '60px', margin: '40px auto', color: '#999'}}> 暂无图片</div>
                    }
                </div>
            </div>
        )
    }
}