const express = require('express');
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const db= require('./config/mongoose-connection');
const parentModel= require("./models/parent-model");
const postModel= require('./models/post-model');
const createOrFindCircle  = require('./utils/circle-utils');
const { generateToken } = require('./utils/generate-token');
const isLoggedIn = require('./middlewares/isLoggedIn');
const isPartOfCircle = require('./middlewares/isPartOfCircle');
const circleModel= require('./models/circle-model');
const replyModel= require('./models/reply-model');
require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req,res){
    res.send("working");
})
app.get("/register",function(req,res){
    res.render('parent-register.ejs');
})
app.post('/create-parents', async (req, res) => {
    const { name, email, password, child_school_name, child_class, child_section, society } = req.body;

    try {
        let existingParent = await parentModel.findOne({ email });
        if (existingParent) {
            return res.status(400).json({ message: 'Parent already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const parent = await parentModel.create({
            name,
            email,
            password: hashedPassword,
            child_school_name,
            child_class,
            child_section,
            society
        });
        const token = generateToken(name, email);
        res.cookie('authToken', token, {
            httpOnly: true,  
            maxAge: 3600000 
        });
        const circlesToCreate = [
            `${child_school_name}-${child_class}`, 
            child_class,                          
            `${child_school_name}-${child_section}`, 
            society ? `${child_school_name}-${society}` : null, 
            child_school_name    
        ].filter(Boolean); 

        for (const circleName of circlesToCreate) {
            await createOrFindCircle(circleName, parent._id);
            
        }
        res.redirect('/circlesOfOneParent');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});
app.get("/circlesOfOneParent",isLoggedIn,async function(req,res){
    let{name,email}=req.user; 
    try {
        const parent = await parentModel.findOne({ email }).populate('circles');

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.render('view-circles.ejs', { circles: parent.circles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }

})
app.get("/login",function(req,res){
    res.render("parent-login.ejs");
})
app.post('/parent-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const parent = await parentModel.findOne({ email });
        if (!parent) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, parent.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(parent.name, parent.email);

        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 3600000 
        });
        res.redirect("/circlesOfOneParent");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

app.get('/viewCircle/:circleName', isLoggedIn, async (req, res) => {
    try {
        const circleName = decodeURIComponent(req.params.circleName);
        
        const circle = await circleModel.findOne({ name: circleName });
        
        if (!circle) {
            console.log('Circle not found');
            return res.status(404).send('Circle not found');
        }

        await circle.populate([
            { path: 'parents', select: 'name' },
            {
                path: 'posts',
                populate: [
                    { path: 'parent_id', select: 'name' }, 
                    { path: 'replies', populate: { path: 'parent_id_replying', select: 'name' } } 
                ]
            } 
        ]);

        res.render('single-circle-page', { circle });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/create-post/:circleId',isLoggedIn, async (req, res) => {

    const content = req.body.content;
    const parentName= req.user.name;
    try {
        const circle = await circleModel.findById(req.params.circleId);
        const parent = await parentModel.findOne({name:parentName});

        if (!circle) {
            return res.status(404).json({ message: 'Circle not found' });
        }
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const newPost = await postModel.create({
            circle_id: circle._id,
            parent_id: parent._id,
            content,
            likes: [],
            dislikes: [],
            replies: []
        });

        circle.posts.push(newPost._id);
        await circle.save();
        res.status(201).json({
            message: 'Post created successfully',
            post: newPost
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/create-reply',isLoggedIn, async function(req,res){
    
    const { circleId, postId, replyContent } = req.body;
    const parent = await parentModel.findOne({email: req.user.email}); 

    try {
        const circle = await circleModel.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: 'Circle not found' });
        }

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const parentId= parent._id;
        let reply= await replyModel.create({
            parent_id_replying: parentId,
            post_id: postId,
            content: replyContent
        })
        post.replies.push(reply);
        await post.save();

        res.redirect(`/viewCircle/${circle.name}`);
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
 
})
app.listen(3000);