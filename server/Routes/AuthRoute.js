const { fetchRepoDetails } = require('../api/githubApi')
const {  signup, verifyUser, login } = require('../Controllers/AuthController')
const { userVerification } = require('../Middlewares/AuthMiddleware')
const router = require('express').Router()


router.post('/signup', signup)
router.post('/login', login)
router.post('/',verifyUser)
module.exports = router