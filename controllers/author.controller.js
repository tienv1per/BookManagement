const author = require('../models/author.model');


exports.getIDBySearchText = async (searchText) => {
    try {
        // console.log(searchText);
        const result = await author.find({name: new RegExp(searchText, "i")}, {name: 0});
        // console.log(result);
        return result.map(i => i.id);
    } catch (err) {
        // Nếu có lỗi, ném exception để xử lý ở nơi gọi hàm
        throw err;
    }
}



exports.getNameByID = async(req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let result
    try {
        result = await author.findById(req.params.id);
    }
    catch(err) {
        console.log(err)
        res.status(500).json({msg: err})
        return;
    }
    if(result === null){
        res.status(404).json({msg: "not found"})
        return;
    }
    res.status(200).json({name: result.name})
}
exports.getAuthor = async (req, res) => {
    try {
        const docs = await author.find({});
        res.status(200).json({ data: docs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
    }
}
