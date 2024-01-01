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

exports.getNsx = async (req, res) => {
    try {
        const docs = await nsx.find({});

        if (docs.length === 0) {
            res.status(404).json({ data: [] });
        } else {
            res.status(200).json({ data: docs });
        }
    } catch (err) {
        console.error('Error in find:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAll = async (req, res) => {
    nsx.find({})
    .exec((err, docs) => {
        if(err){
            console.log(err);
            res.status(500).json({msg: err});
            return;
        }
        res.status(200).json({data: docs});
    })
}

exports.getNameByID = async(req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({msg: 'Invalid data'})
        return;
    }
    let result
    try {
        result = await nsx.findById(req.params.id)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: 'not found'})
        return;
    }
    if(result === null){
        res.status(404).json({msg: 'not found'});
        return;
    }
    res.status(200).json({name: result.name});
}






