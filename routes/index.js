var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('roulette', { title: 'Expss' });
});

module.exports = router;


