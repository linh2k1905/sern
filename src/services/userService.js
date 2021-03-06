
import db from '../models/index';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {

            let isExist = await checkEmailUser(email);

            let userData = {};
            if (isExist) {
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'password'],
                    where: {
                        email: email,
                    },

                });
                if (user) {
                    let rlt = await bcrypt.compareSync(password, user.password);
                    if (rlt) {
                        userData.errorCode = 0;
                        userData.messageCode = 'login success';
                        userData.user = user;

                    }
                    else {
                        userData.errorCode = 2;
                        userData.messageCode = 'wrong password';
                    }

                }

            }
            else {
                userData.errorCode = 1;
                userData.messageCode = 'wrong email';


            }

            resolve(userData);
        } catch (error) {
            reject(error);
        }
    })
}

let checkEmailUser = (mail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {
                    email: mail
                },
                raw: false,

            })

            if (user) {
                resolve(true);
            }
            else {

                resolve(false);
            }

        } catch (error) {
            reject(error);
        }
    })

}

let getAllUser = (id) => {

    return new Promise(async (resolve, reject) => {
        try {
            let users = ''
            if (id === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                });

            }
            if (id && id != "ALL") {
                users = await db.User.findOne({
                    where: { id: id },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)


        } catch (error) {
            reject(error)
        }
    }
    )
}
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkEmailUser(data.email)
            if (check) {
                resolve({
                    errorCode: 1,
                    messageCode: 'Email used. Please enter new email'
                })
            }
            else {
                let hashUserPasswordFromBcrypt = await hashUserPassword(data.password);

                await db.User.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    password: hashUserPasswordFromBcrypt,
                    email: data.email,
                    tel: data.tel,
                    address: data.address,
                    gender: data.gender === '1' ? true : false,
                    roleId: data.roleId,

                })
                resolve({
                    errorCode: 0,
                    messageCode: 'Create  New User'
                })

            }


        } catch (error) {
            reject(error);
        }
    })


}
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hash = await bcrypt.hashSync(password, salt);
            resolve(hash)

        } catch (error) {
            reject(error)

        }


    })
}
let deleteUser = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: id },

            })
            if (!user) {
                resolve({
                    errorCode: 2,
                    messageCode: 'User not found'
                })
            }

            await db.User.destroy({
                where: { id: id }
            });
            resolve({
                errorCode: 0,
                messageCode: 'The user is deleted'
            })
        }


        catch (error) {
            reject(error)

        }
    }
    )
}
let editUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errorCode: 2,
                    messageCode: "Missing input"
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false

            })
            if (user) {
                user.address = data.address;
                user.lastName = data.lastName;
                user.firstName = data.firstName;
                await user.save();
                resolve({
                    errorCode: 0,
                    messageCode: 'Update successfully'
                })


            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUser: getAllUser,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    editUser: editUser
}