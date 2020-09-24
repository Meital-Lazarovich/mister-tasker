const taskService = require('./task.service')
const externalService = require('../../services/externalService')

async function query(req, res) {
    try {
        const tasks = await taskService.query()
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ err })
    }
}

async function getById(req, res) {
    try {
        const task = await taskService.getById(req.params.id)
        res.json(task);
    } catch (err) {
        res.status(500).json({ err })
    }
}

async function remove(req, res) {
    try {
        await taskService.remove(req.params.id)
        res.json({});
    } catch (err) {
        res.status(500).json({ err })
    }
}

async function update(req, res) {
    try {
        const updatedTask = await taskService.update(req.body)
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ err })
    }
}

async function add(req, res) {
    const task = req.body;
    try {
        const newTask = await taskService.add(task)
        res.json(newTask);
    } catch (err) {
        res.status(500).json({ err })
    }
}

async function performTask(req, res) {
    var task;
    try {
        task = await taskService.getById(req.params.id)
        console.log(`performing task ${req.params.id}`)
        if (task) {
            externalService.execute()
            task.doneAt = Date.now();
        }
    } catch (error) {
        throw error;
    } finally {
        task.triesCount++;
        const updatedTask = await taskService.update(task)
        console.log('performTask -> updatedTask', updatedTask);
        res.json(updatedTask)
    }
}


module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    performTask
}