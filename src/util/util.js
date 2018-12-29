
import dataSource from './dataSource';
// 险种显示
function insuranceInString (code) {
    switch(code) {
        case '10001':
            return '机动车损失险';
            break;
        case '10002':
        case '30002':
            return '三责险';
            break;
        case '10003':
        case '30003':
            return '盗抢险';
            break;
        case '10004':
        case '30004':
            return '司机险';
            break;
        case '10005':
        case '30005':
            return '乘客险';
            break;
        case '10501':
        case '11':
            return '交强险';
            break;
        case '20201':
            return '玻璃险';
            break;
        case '20202':
        case '30202':
            return '车身划痕险';
            break;
        case '20203':
        case '30203':
            return '自燃损失险';
            break;
        case '20204':
        case '30204':
            return '涉水险';
            break;
        case '20205':
            return '指定修理厂险';
            break;
        case '20206':
        case '30206':
            return '新增设备损失险';
            break;
        case '20207':
        case '30207':
            return '车上货物责任险';
            break;
        case '20208':
        case '30208':
            return '精神损害抚慰金责任险';
            break;
        case '20209':
            return '修理期间费用补偿险';
            break;
        case '20210':
            return '机动车损失保险无法找到第三方特约险';
            break;
        case '20251':
            return '特种车损失保险无法找到第三方特约险';
            break;
        case '20252': 
            return '起重_装载_挖掘车辆损失扩展条款';
            break;
        case '20253':
            return '特种车辆固定设备_仪器损坏扩展条款';
            break;
        case '30100': 
            return '基本险';
            break;
        case '30001':
            return '车损险';
            break;
        default:
            return '';
            break;
    }
};
function changesupplierIdToName (id) {
    let name = ''
    dataSource.insuranceCpList.map((item, index) => {
        if(item.id === id) {
            name = item.name
        }
    })
    return name;
}
function getInsDetailId (coverageList) {
    let InsDetailIdList = coverageList.map((item, index) => {
        return Number(item.InsDetailId)
    })
    return InsDetailIdList;
}
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
// 对象是否为空
function isEmptyObject(obj) {   
　　for (var key in obj){
　　　　return true;
　　}　　
　　return false;
}
module.exports = {
    insuranceInString,
    changesupplierIdToName,
    getInsDetailId,
    filterInsurance,
    hasCommercialInsurance,
    isEmptyObject
}