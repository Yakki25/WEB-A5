const Sequelize = require('sequelize');

var sequelize = new Sequelize('qbyugsmt', 'qbyugsmt', 'w45yVx1q7TvXcnKVPaEL6ll8zEcDJCoL', {
    host: 'stampy.db.elephantsql.com',
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
    published: Sequelize.BOOLEAN,
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
        console.log("Connection Success")
        resolve()
        })
        .catch((err) => {
            reject("Database Connection Error " + err)
        })
});
};

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("Cannot 'get all posts'. ")
        })
    });   
}

module.exports.getPostsByCategory = (myCategory) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where : {
                category: myCategory
            }
        })
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("No posts on this category")
        })
    });
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("No posts within given date.")
        })
    });
}

module.exports.getPostsById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where : {
                postID: id
            }
        })
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject ("No post with id: " + id)
            })
    });
}

module.exports.getPublishedPosts = () => { 
    return new Promise((resolve, reject) => {
        Post.findAll({
            where : {
                published: true
            }
        })
        .then((data) => 
            resolve (data)
        )
        .catch(() => {
            reject("No published posts at this moment.")
        })
    });
}

module.exports.getPublishedPostsByCategory = (myCategory) => {
    return new Promise((resolve, reject) => {
        Post.findAll(() => {
            where : {
                published: true
                category: myCategory;
            }
        })
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("No published posts on this category")
        })
    });
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("No categories to be displayed.")
        })
    });
}

module.exports.addCategory = (categoryData) => {
    for (attribute in categoryData) {
        if(attribute =="")
            attribute = null;
    }

    return new Promise((resolve, reject) => {
        Category.create(({
            category: categoryData.category
        })) 
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
            reject("Failed to create category.")
        })
    })
}

module.exports.addPost = (postData) => {
    postData.published = (postData.published) ? true : false;

    for (attribute in postData) {
        if(attribute == "")
            attribute = null;
    }

        var today = new Date();
        var year = today.toLocaleString("default", { year: "numeric" });
        var month = today.toLocaleString("default", { month: "2-digit" });
        var day = today.toLocaleString("default", { day: "2-digit" });
        var formattedDate = [year, month, day].join("-");
        
        postData.postDate = formattedDate;

    return new Promise((resolve, reject) => {
        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: formattedDate,
            featureImage: postData.featureImage,
            published: postData.published,
            category: postData.category
        })
        .then((data) => {
            resolve(data)
        })
        .catch(() => {
        reject("Cannot create this post")
    })
    });
}

module.exports.deleteCategoryById = (myId) => {

    return new Promise((resolve, reject) => {
        Category.destroy({
            where : { id: myId}
        })
        .then(() => {resolve("Deletion Success")})
        .catch(() => {reject("Failed to delete category")})
    })
} 
 
module.exports.deletePostById = (myId) => {

    return new Promise((resolve, reject) => {
        Post.destroy({
            where : { id: myId}
        })
        .then(() => {resolve("Deletion Success")})
        .catch(() => {reject("Failed to delete post")})
    })
} 
 
module.exports.deletePostById = (myId) => {

    return new Promise((resolve, reject) => {
        Post.destroy({
            where : { id: myId}
        })
        .then(() => {resolve("Deletion Success")})
        .catch(() => {reject("Failed to delete category")})
    })
}

