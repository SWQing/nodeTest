const express = require('express');
const router = express.Router();
let home = require('./routes/home.js');
let auth = require('./util/auth');

router.get('/', home.index);
router.get('/login', auth.userNotRequired, home.loginPage)
router.post('/login', home.login)
router.get('/reg', auth.userNotRequired, home.regPage)
router.post('/reg', home.reg)
router.get('/logout', home.logout)

module.exports = router;