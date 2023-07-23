const Sequelize = require('sequelize');
const env = require("dotenv");
env.config();

var sequelize = new Sequelize(
    process.env.PG_USERDB, 
    process.env.PG_USERDB, 
    process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject("Unable to sync the database");
        })
    });
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() =>{
            Post.findAll({}).then((data) => {
                if(data.length > 0){
                    resolve(data);
                }
                else{
                    reject('Post is empty');
                }
            }).catch((err) => {
                reject('unable to sync the database');
            })
        })
    })
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(posts => {
            if(posts.length > 0){
                resolve(posts);
            } else {
                reject("No results returned!");
            }
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(categories => {
            if(categories.length > 0){
                resolve(categories);
            } else {
                reject("No results returned!")
            }
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports.addPost = function(postData) {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for(let i in postData){
            if(postData[i] === ""){
                postData[i] = null;
            }
        }
        postData.postDate = new Date().toLocaleDateString('fr-CA');

        Post.create(postData)
        .then(() => {
            resolve();
        }).catch(err => {
            reject("Unable to create post");
        });
    });
}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {

            Post.findAll()
            .then(posts => {
                const filteredPosts = posts.filter(post => post.category == category);
                if(filteredPosts.length > 0){
                    resolve(filteredPosts);
                } else{
                    reject("No result returned!");
                }
            }).catch(err => {
                reject(err);
            });        
        });
    });
};

module.exports.getPostsByMinDate = function(minDatestr) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {

            const Op = Sequelize.Op;

            Post.findAll({ 
                where:{
                    postDate:{
                        [Op.gte]: new Date(minDatestr)
                    }
                }
            }).then(posts => {
                if (posts.length > 0){
                    resolve(posts);
                } else{
                    reject("No results returned!")
                }
            }).catch(err => {
                reject(err);
            });        
        });
    });
};

module.exports.getPostsById = function(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(posts => {
            if(posts.length > 0){
                resolve(posts[0]);
            } else {
                reject("No results returned!");
            }
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports.getPublishedPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(posts => {
            if(posts.length > 0) {
                resolve(posts);
            } else {
                reject("No results returned!")
            }
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject) => {
            for(let i = 0; i < categoryData.length; i++) {
            console.log(categoryData[i])
            if(categoryData[i] == ""){
                categoryData[i] = null;
            }
        }
        
        Category.create(categoryData)
        .then(() => {
            resolve();
        }).catch(err => {
            reject(err + " Unable to create category.")
        });
    });
}

module.exports.deleteCategoryById = function(id){
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id }})
        .then(rows => {
            if(rows > 0){
                resolve();
            } else {
                reject("The catogory not found.")
            }
        }).catch(err => {
            reject(err);
        });
    });
}

module.exports.deletePostById = function(id){
    return new Promise((resolve, reject) => {
        Post.destroy({ where: { id: id } })
        .then(rows => {
            if(rows > 0){
                resolve();
            } else {
                reject("The post not found.")
            }
        }).catch(err => {
            reject(err);
        });
    });
}
