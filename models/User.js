const { DataTypes } = require("sequelize");
require('dotenv').config(); 
const dbConfig = require("../config/dbConfig")
const initializeSequelize = require("../config/sequelizeConfig");
const databaseName = process.env.DATABASE;

const sequelize = initializeSequelize(databaseName);

const User = sequelize.define('User',{
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
        first_name:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name'
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name' 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'username'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: "account_created",
        updatedAt: "account_updated"
    });
    const syncModels = async()=>{
        try{
            await sequelize.sync({ force: false })
       
    
        } catch(err){
            console.log("Error while syncing")
            
        }

    }
    syncModels();
    

module.exports = User;

