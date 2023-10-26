const UserModel = require('../models/users');

module.exports.updateUser = async(req, res, next) => {
    const id = req.params.id;
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            {$set: req.body},
            {new: true}
        );
        return res.status(200).json({
            user: updatedUser,
            message: "Uupdate user successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}