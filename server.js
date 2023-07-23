/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Yakshit Aggarwal Student ID: 175307214 Date: July 23, 2023
*
*  Cyclic Web App URL: 
*
*  GitHub Repository URL: 
*
*******************************************************************************
*/ 

var path = require("path");
var express = require("express");
var app = express();
const fs = require('fs');
var blogData = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require ("express-handlebars");
const stripJs = require('strip-js');
const { errorMonitor } = require("events");
app.use(express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({extended: true}));


// Configuring Cloudinary
cloudinary.config({
  cloud_name: "ddtu4qtdp",
  api_key: "564532889745586",
  api_secret: "-Ie1oPaFU3fMVlh6OAqL_m4Pkuo",
  secure: true,
});

const upload = multer(); 
app.use(express.static('public'));
const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 
    navLink: function(url, options){
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  },
  safeHTML: function(context){
    return stripJs(context);
  },
  formatDate: function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
  }
}));

app.get("/", function(req,res){
    res.redirect('/about');
});


  app.get("/about", function(req, res) {
    fs.readFile(path.join(__dirname, "views/about.hbs"), 'utf8', function(err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading about.hbs file.');
        }
        res.render('layouts/main', {
            body: data,
            layout: false
        });
    });
});

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});


app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostsById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});


app.get("/categories", function(req,res){
  blogData.getCategories()
  .then((allCategories) => {
    if (allCategories.length > 0)
    res.render("categories", {categories: allCategories});
    else
    res.render("categories", {message: "No results"})
  })
  .catch((err) =>{
    res.render("categories", {message: err});
  })
});

app.get("/categories/add", function(req,res){
  fs.readFile(path.join(__dirname,"views/addCategory.hbs"), 'utf8', function(err, data){
    if(err) {
      console.error(err);
      return res.status(500).send('Error reading addPost.hbs file.');
    }

    res.render('layouts/main', {
      body: data,
      layout: false
    })
  });
});

app.post("/categories/add", upload.single("featureImage"), function(req, res, next){
    if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processPost(uploaded.url);
      });
  }else{
      processPost("");
  }
   
  function processPost(imageUrl){

      blogData.addCategory(req.body)
      .then(() => {res.redirect('/categories');})
      .catch(() => {res.send("Error creating category") })
      
  } 
})
  
app.get("/posts", function(req,res){
  const category = req.query.category;
  const minDate = req.query.minDate;
  
  if (category)
  {
    blogData.getPostsByCategory(category)
    .then((filteredCategories) => {
      if(filteredCategories.length > 0){
        res.render("posts", {posts: filteredCategories});
      }
      else
      res.render("posts", {message: "No results"});
    })
    .catch((err) => {
      res.render("posts", {message: err});
    })
  }
  else if(minDate)
  {
    blogData.getPostsByMinDate(minDate)
    .then((postsByDate) => {
      if(postsByDate.length > 0){
        res.render("posts", {posts: postsByDate});
      }
      else
      res.render("posts", {message: "No results"});
    })
    .catch((err) => {
      res.render("posts", {message: err});
    })
  }
  else{
    blogData.getAllPosts()
    .then((allPosts) => {
      if(allPosts.length > 0){
        res.render("posts", {posts: allPosts});
      }
      else
      res.render("posts", {message: "No results"});
    })
    .catch((err) =>{
      res.render("posts", {message: err});
    })
  }
});
  
app.get("/posts/add",  function(req, res){
  fs.readFile(path.join(__dirname,"views/addPost.hbs"), 'utf8', function(err, data){
    if(err) {
      console.error(err);
      return res.status(500).send('Error reading addPost.hbs file.');
    }

    blogData.getCategories().then((data) => {
      res.render("addPost", {categories: data});
    }).catch((err) => {
      res.render("addPost", {categories: []}); 
    })
  });
});
  
app.get("/post/:value", (req, res) => {
  const postID = req.params.value;

    blogData.getPostsById(postID)
      .then((postReturned) => {
        res.send(postReturned);
      })
      .catch((err) => {
        res.send(err);
      });
});

app.post("/posts/add", upload.single("featureImage"), function(req, res, next){
    if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processPost(uploaded.url);
      });
  }else{
      processPost("");
  }
   
  function processPost(imageUrl){
      req.body.featureImage = imageUrl;

      blogData.addPost(req.body)
      .then(() => {res.redirect('/posts');})
      .catch((err) => {res.send(err) })
  } 
})
 
app.get("/categories/delete/:id", (req, res) => {
const categoryId = req.params.id;

blogData.deleteCategoryById(categoryId)
  .then(() => {
    res.redirect("/categories");
  })
  .catch((err) => {
    res.sendStatus(500).send("Unable to Remove Category / Category not found")
  });
});
 
app.get("/posts/delete/:id", (req, res) => {
const postId = req.params.id;

blogData.deletePostById(postId)
  .then(() => {
    res.redirect("/posts");
  })
  .catch((err) => {
    res.sendStatus(500).send("Unable to Remove Post / Post not found")
  });
});
 
app.get ("/posts/delete/:id", (req, res) => {
  const postId = req.params.id;
  
  blogData.deletePostById(postId)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.sendStatus(500).send("Unable to Remove Post / Post not found")
    });
  });

app.use(function (req, res) {
  let myLink = "/404.jpg";
  res.render("404", { body: myLink });
});
    
blogData.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
  
})
.catch((err) => {
console.log(err)
});

