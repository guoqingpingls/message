require("babel-polyfill");

require('babel-register')({
    presets: ['es2015', 'stage-0']
});

const {
    get_preprice_ins_inspreprices_priceDetails,
    get_preprice_ins_message,
    post_preprice_ins_message
} = require('../services/index');


get_preprice_ins_inspreprices_priceDetails('5036')
    .then(data=>{
        console.log(data);
    });

// get_preprice_ins_message('1720')
//     .then(data=>{
//         console.log(data);
//     });
