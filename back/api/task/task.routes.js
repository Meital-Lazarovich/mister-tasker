const express = require('express')
// const requireAuth = require('../../middlewares/requireAuth.middleware')
const { query, getById, remove, update, add, performTask } = require('./task.controller')
const router = express.Router()

router.get('/', query)
router.get('/:id', getById)
router.delete('/:id', remove)
router.put('/:id', update)
router.post('/', add)
router.put('/:id/start', performTask)

module.exports = router;
