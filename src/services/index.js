import {apiHttpRequest} from '../utils/httpRequest';

export const get_message_list = (priceId) => {
    return apiHttpRequest(`/preprice-ins/messages/${priceId}`)
};

export const post_preprice_ins_message = (data) => {
    const body = {
        "priceid": 1720,
        "carinfoid": 1146,
        "info": "留言添加的文字信息",
        "usertype": 1,
        "imageuris": [
            "图片1的url",
            "图片2的url"
        ]
    };
    return apiHttpRequest('/preprice-ins/messages', 'POST', body);
};

export const get_price_detail = (priceId) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/priceDetails?priceId=${priceId}`)
};

// 提交保单
/**
 * 
 * @param {*} param 
 * params: {
 *  biPolicyNo: string,
 *  ciPolicyNo: string,
 *  jobNoId: string,
 *  expressNo: string,
 *  priceId: string
 * }
 */
export const submit_policy = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/submitPolicy?' + params, 'PUT')
}

// 确认缴费
export const confirm_pay = (priceId, priceitemid, cid) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/confirmPay?priceId=${priceId}&priceItemId=${priceitemid}&cid=${cid}`, 'POST')
}
// 完成保单 http://192.168.1.27:8866/api/preprice-ins/inspreprices/finish?priceId=5065
export const finish_policy = (priceId, cid) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/finish?priceId=${priceId}&cid=${cid}`, 'POST')
}

// 提交报价
/**
 * 
 * @param {*} params 
 * {
 *  "supplierid":9801,
 *  "totalpremium":5000.78,
 *  "uploadimages":"yinjun.com",
 *  "cipremium":5000,
 *  "bipremium":0.78,
 *  "showcicommission":20,
 *  "showbicommission":30,
 *  "commission":500,
 *  "carshiptax":700,
 *  "showcarshiptax":10,
 *  "priceid":1720
}
 */
export const submit_to_get_price = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/submitQuote', 'POST', params);
}
// 添加留言
// params = {
//     priceid: self.data.priceid,
//     carinfoid: self.data.carinfoid,
//     info: self.data.remark,
//     usertype: 1
// };
export const reply_remark_api = (params) => {
    return apiHttpRequest('/preprice-ins/messages', 'POST', params);
}
// 获取历史报价
// params: {licenseNo: '京N4Y158'}
export const get_historical_price = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/historicalPrice?' + params, 'GET');
}
// 获取出单员列表
export const get_member_list = (params) => {
    return apiHttpRequest('/preprice-car/partnerconfigs/getPartnerJobNo', 'POST', params)
}

// 获取询价图片
export const get_enquiry_image = (priceId) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/getCarInfoImages/${priceId}`, 'GET')
}

// 图片识别
/**
 * params
 * {
 * imageUrl: ''
 * imageType:   // 1 行驶证正面  2 行驶证副本  3 身份证正面  4  身份证背面
 * }
 */
export const image_recognition = (params) => {
    return apiHttpRequest(`/preprice-ins/files/upload/getImageInfo${params}`, 'POST');
}

// 根据图片查询相关信息
export const search_car_info = (priceId) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/getCarInfo/${priceId}`, 'GET');
}

// 修改信息
/**
 * 
 * @param {*} params 
 * {
 *  priceId: number,
 *  dto: {
 *     ......
 *  }
 * }
 */
export const update_car_info = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/updateCarInfo', 'POST', params);
}
// 获取保险公司列表
export const get_insurance_cp_list = (partnerId) => {
    return apiHttpRequest('/preprice-car/partners/getJobNoPartnerNew?partnerId=' + partnerId, 'GET');
}
// 批量下载图片
export const download_images= (params) => {
    return apiHttpRequest('/preprice-ins/files/upload/download', 'POST', params)
}
// 获取报价信息
export const get_price_info = (params) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/getPriceRelation?${params}`, 'GET')
}
// 转接查询
export const transfer_search = (partnerid) => {
    return apiHttpRequest(`/preprice-car/customers?pageNum=1&pageSize=999&status=1&partnerid=${partnerid}`, 'GET')
}
// 转接
export const transfer_to_others = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/Transfer', 'POST', params)
}
// 确认此报价
export const confirm_price = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/confirm', 'PUT', params)
}
// 获取自取地址
export const get_address = (partnerId) => {
    return apiHttpRequest(`/preprice-car/partnerconfigs/${partnerId}`, 'GET')
}
// 付款
export const payoff = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/payoff', 'POST', params)
}
// 拒绝
export const close_order = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/closeOrder', 'POST', params)
}
// 抢单
export const confirm_orders = (params) => {
    return apiHttpRequest(`/preprice-ins/inspreprices/confirmOrders${params}`, 'PUT')
}
// 发送支付方式
export const confirm_pay_type = (params) => {
    return apiHttpRequest('/preprice-ins/inspreprices/confirmPayType', 'POST', params)
}
// 识别图片
export const parse_image = (params) => {
    return apiHttpRequest(`/preprice-ins/erwei/parse?path=${params}`, 'GET')
}