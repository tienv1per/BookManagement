const bcrypt = require('bcrypt');
const UserModel = require('../models/users');

module.exports.updateUser = async(req, res, next) => {
    const id = req.params.id;
    const updateData = req.body;
    try {
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(updateData.password, salt);
            updateData.password = hashed;
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            {$set: updateData},
            {new: true}
        );
        return res.status(200).json({
            user: updatedUser,
            message: "Update user successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};

module.exports.getUser = async(req, res, next) => {
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

module.exports.getAllUsers = async(req, res, next) => {
    try {
        const users = await UserModel.find();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json(error.message);
    }
};

module.exports.deleteUser = async(req, res, next) => {
    try {
        await UserModel.findByIdAndDelete(
            req.params.id, 
        );
        return res.status(200).json("DELETE SUCCESSFULLY");
    } catch (error) {
        return res.status(500).json(error.message);
    }
};
