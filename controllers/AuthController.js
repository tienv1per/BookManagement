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
        const { _id, ...userData}  = savedUser._doc; 

        return res.status(200).json({
            message: "User created successfully",
            user: {
                id: _id,
                ...userData,
            },
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
    const {email, password} = req.body;
    if(email === "" || password === ""){
        return res.status(201).json({
            message: "Please fill all required fields",
            success: false,
        });
    }

    try {
        const user = await UserModel.findOne({email});
        if(user){
            const isValid = await bcrypt.compare(password, user.password);
            if(isValid){
                const token = jwt.sign({
                    email: user.email,
                    id: user._id,
                    isAdmin: user.isAdmin
                }, JWT_TOKEN);

                const { _id, ...userData}  = user._doc; 

                return res
                        .cookie("authenToken", token, {
                            httpOnly: true,
                        })
                        .status(200)
                        .json({
                            message: "Login successfully",
                            user: {
                                id: user._id,
                                ...userData,
                            },
                            token: token,
                            success: true
                        });
            } else {
                return res.status(200).json({
                    message: "Wrong password",
                    success: false,
                });
            }
        } else {
            return res.status(200).json({
                message: "User not found",
                success: false,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}