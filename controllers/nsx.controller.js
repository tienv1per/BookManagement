const nsx = require('../models/nsx.model');


exports.getIDBySearchText = async (searchText) => {
    try {
        // console.log(searchText);
        const result = await nsx.find({name: new RegExp(searchText, "i")}, {name: 0});
        // console.log(result);
        return result.map(i => i.id);
    } catch (err) {
        // Nếu có lỗi, ném exception để xử lý ở nơi gọi hàm
        throw err;
    }
}