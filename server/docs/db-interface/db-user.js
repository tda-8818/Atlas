// This file interfaces with the database to request/create user data from mongodb

import User from "../models/user.model.js";


export const getUser = async(userID) => {
    try {
        const user = await User.findOne({userID})

        if (!user)
        {
            return await User.create({userID})
        }
        return user;


    }catch (error)
    {
        throw error;
    }

}