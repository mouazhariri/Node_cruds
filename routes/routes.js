const express = require("express");
const router = express.Router();
const users = require("../models/users");
const multer = require("multer");
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("🚀 ~ file: upload.ts:11 ~ file", process.cwd());

        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
}).single("image");

router.post('/add', upload, async(req, res) => {
    const user = new users({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    try {
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added Successfully!'
        };
        res.redirect("/");
    } catch (err) {
        console.error('Save Error:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get('/', async(req, res) => {
    try {

        const allUser = await users.find().exec((err, users) => {
            if (err) {
                res.json({ message: err.message });
            } else {
                res.render("index", { title: "HOME PAGE", users: users }, );
            }

        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "error data was not created",
        });
    }

});


router.get('/add', (req, res) => {

    res.render('add_user', { title: "ADD USER" })
});
///* edit an user
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    users.findById(id, (err, user) => {
        if (err) {
            res.render('/');
        } else {
            if (users == null) {
                res.render('/');
            } else {
                res.render('edit_user', {
                    title: "Edit User",
                    users: user,
                })
            }
        }
    });
});
//update user route
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }
    users.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: "danger" });
        } else {
            req.session.message = {
                type: 'success',
                message: "User Updated successfully!",
            }
            res.redirect('/');
        }
    })

});

// delete an user 
router.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    users.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type: "info",
                message: "User deleted successfully!",
            };
            res.redirect("/");
        }

    });
});


module.exports = router;