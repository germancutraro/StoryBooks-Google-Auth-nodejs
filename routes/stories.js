const express = require('express');
const router = express.Router();

const {ensureAuthenticated} = require('../libs/auth-helper');
const Story = require('../models/Story');
// Storie Index
router.get('/', (req, res) => {
  Story.find({status: 'public'}).populate('user').sort({date: 'desc'}).then(stories => {
    res.render('stories/index', {stories});
  }).catch(err => console.log(err));
});

// Add Story Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findById(req.params.id).populate('user').populate('comments.commentUser').then(story => {
    if (story.status == 'public') {
      res.render('stories/show', {story});
    } else {
      if (req.user) {
        if (req.user.id == story.user._id) {
          res.render('stories/show', {story});
        } else {
          res.redirect('/stories');
        }
      } else {
        res.redirect('/stories');
      }
    }
  });
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findById(req.params.id).then(story => {
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', {story});
    }
  }).catch(err => console.log(err));
});

// Process Add Story
router.post('/', (req, res) => {
  let allowComments = allowCommentsVerify(req, res);
  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments,
    user: req.user.id
  };
  Story.create(newStory).then(story => {
    res.redirect(`/stories/show/${story._id}`);
  }).catch(err => console.log(err));
});

// Edit form Process
router.put('/:id', (req, res) => {
  allowCommentsVerify(req, res);
  Story.findByIdAndUpdate(req.params.id, req.body).then(story => {
    console.log(`${story.title} Updated!`);
    res.redirect('/dashboard');
  }).catch(err => console.log(err));
});

// Delete process
router.delete('/:id', (req, res) => {
  Story.findByIdAndRemove(req.params.id).then(() => {
    res.redirect('/dashboard');
  }).catch(err => console.log());
});

// Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findById(req.params.id).then(story => {
    let newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    }
    story.comments.unshift(newComment);
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    }).catch(err => console.log(err));
  });
});

// get user posts
router.get('/user/:id', (req, res) => {
  Story.find({user: req.params.id, status: 'public'}).populate('user').then(stories => {
    res.render('stories/index', {stories});
  }).catch(err => console.log(err));
});

// Logged in users stories
router.get('/my', ensureAuthenticated, (req, res) => {
  Story.find({user: req.user.id}).populate('user').then(stories => {
    res.render('stories/index', {stories});
  }).catch(err => console.log(err));
});

// functionality
function allowCommentsVerify(req, res) {
  let allowComments;
  if (req.body.allowComments)
    allowComments = true;
  else
    allowComments = false;

  return allowComments;
}

module.exports = router;
