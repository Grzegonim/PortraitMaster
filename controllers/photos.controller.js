const Photo = require('../models/photo.model');
const Voters = require('../models/Voters.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const fileExtension = '.' + file.name.split('.')[1];
    const imageExtansions = ['.gif','.jpg','.jpeg','.png'];

    const emailPattern = new RegExp (/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm);
    const contentPattern = new RegExp (/[A-Za-z0-9]/gm);

    const emailMatched = email.match(emailPattern).join('');
    const titleMatched = title.match(contentPattern).join('');
    const authorMatched = author.match(contentPattern).join('');

    console.log(authorMatched.length, author.length)

    if(title && title.length < 25 && titleMatched.length === title.length
      && author && author.length < 50 && authorMatched.length === author.length
      && email && emailMatched.length === email.length
      && file && imageExtansions.indexOf(fileExtension) !== -1) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const clientIp = requestIp.getClientIp(req);
    const isIpExisting = await Voters.findOne({ user: clientIp });

    const addVote = async () => {
      const photoToUpdate = await Photo.findOne({ _id: req.params.id });
      if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
      else {
        const newVote = await new Voters({ user: clientIp, votes: req.params.id });
        newVote.save();  
        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK' });
      }  
    }

    if(!isIpExisting) {
      addVote();
    } else {
      const isVoteExisting = await Voters.findOne({ votes: req.params.id });     
      if(!isVoteExisting) {
        addVote();
      } else {
        res.status(500).json({ message: 'Already voted for this picture'});
      }
    }
  } catch(err) {
    res.status(500).json(err);
  }
};
