const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/users');

dotenv.config();

const JWT_TOKEN = process.env.JWT_TOKEN;

module.exports.registerUser = async(req, res, next) => {
    const {email, password, name} = req.body;
    if(email === "" || password === "" || name === ""){
        return res.status(201).json({
            message: "Please fill all required fields",
            success: false
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = await UserModel({email, password: hashed, name});

    try {
        const oldUser = await UserModel.findOne({email: email});
        if(oldUser){
            return res.status(200).json({
                message: "User already exists",
                success: false,
            });
        }
        const savedUser = await newUser.save();

        return res.status(200).json({
            message: "User created successfully",
            user: savedUser,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}

module.exports.loginUser = async(req, res, next) => {

}