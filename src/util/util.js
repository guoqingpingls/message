
import dataSource from './dataSource';
import dayjs from 'dayjs';
// 过滤选择不计免赔的险种的一万或者两万项
function filterInsurance (list) {
    let InsDetailIdList = list.map((item, index) => {
        return Number(item.InsDetailId)
    });
    let resultList = [];
    list.map((item, index) => {
        if (Number(item.InsDetailId) > 30000) {
            resultList.push(item);
        } else {
            let tmp = Number(item.InsDetailId) + 20000;
            let tmp1 = Number(item.InsDetailId) + 10000;
            if (Number(item.InsDetailId) < 20000 && InsDetailIdList.indexOf(tmp) < 0 || Number(item.InsDetailId) > 20000 && InsDetailIdList.indexOf(tmp1) < 0) {
                resultList.push(item);
            }
        }
        return resultList;
    })
    return resultList;
}
// 是否有商业险
function hasCommercialInsurance (coverageList) {
    // let tmpCoverageList = JSON.parse(coverageList);
    let tmpInsDetailId = coverageList.length && coverageList.map((item, index) => {
        return Number(item.InsDetailId);
    })
    if (tmpInsDetailId.indexOf(10001) > -1 || tmpInsDetailId.indexOf(30001) > -1 || tmpInsDetailId.indexOf(10002) > -1 || tmpInsDetailId.indexOf(30002) > -1 || tmpInsDetailId.indexOf(10004) > -1 || tmpInsDetailId.indexOf(30004) > -1 || tmpInsDetailId.indexOf(10005) > -1 || tmpInsDetailId.indexOf(30005) > -1 || tmpInsDetailId.indexOf(10003) > -1 || tmpInsDetailId.indexOf(30003) > -1) {
        return true
    } else {
        return false
    }
}
// 是否含有商业险：仅判断主险
function isHasCommercial (idList) {
  // 判断理由: 主险存在
  let mainList =  [10001, 10002, 10003, 10004, 10005]
  if (mainList.indexOf(idList[1]) > -1) {
    return true
  } else {
    return false
  }
}
// 对象是否为空 非空 返回true
function isEmptyObject(obj) {   
　　for (var key in obj){
　　　　return true;
　　}　　
　　return false;
}
// 打开地址
function openNavUrl(_url, title) {
    var url = _url;
    if (_url && _url.substr(0, 1) == '/') {
        url = "http://" + window.location.host + _url;
    }
    var _req = {
        customerId: 0,
        type: 0,
        id: parseInt(Math.random() * 10000).toString(),
        url: url,
        title: title,
        jsCode: ""
    };
    try {
        window.IAgencyWebCall("OpenUrl", JSON.stringify(_req), "");
    } catch (e) {
        window.open(url);
    }
};
/**
 * 日期转换（当value为空时返回的是当天的日期）
 * @param {日期值} value
 */
function date(value) {
    value = value === '0001-01-01T00:00:00' ? '' : value
    return (value && dayjs(value)) || dayjs()
}
// formate date
function dateF (value, format = 'YYYY-MM-DD') {
  return date(value).format(format)
}
function factory (value, source) {
  return (value !== undefined && source.find(c => +c.value === +value) && source.find(c => +c.value === +value).label) || value
}
// 保险项id -> 保险项 name
function translateIdToName (value) {
  return factory(value, dataSource.coverageList)
}
// 保司id -> 保司name
function insuranceIdToName (value) {
    return factory(value, dataSource.insuranceCpList)
}
// send IM message
function sendIM (userid, text) {
    let msgContent = {};
    msgContent.type = "IM";
    msgContent.target = 'C_' + userid;
    msgContent.msg = text;
    msgContent.time = Date.now();
    localStorage.setItem('_receiveMsgKey', JSON.stringify(msgContent)); 
}
export {
    filterInsurance,
    hasCommercialInsurance,
    isEmptyObject,
    openNavUrl,
    date,
    dateF,
    translateIdToName,
    isHasCommercial,
    insuranceIdToName,
    sendIM
}