const dbService = require('../../services/db.service');
const externalService = require('../../services/externalService')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    add,
    getById,
    remove,
    update
}

const q = createQueue();
const queue = []

setTimeout(() => {
    _processQueue()
}, 1000);


function createQueue() {
    return {
        enqueue(x) {
            queue.unshift(x)
        },
        dequeue() {
            if (queue.length === 0) {
                return undefined
            }
            return queue.pop()
        },
        peek() {
            if (queue.length === 0) {
                return undefined
            }
            return queue[queue.length - 1]
        },
        get length() {
            console.log('Getting length');
            return queue.length
        },
        isEmpty() {
            return queue.length === 0
        }
    }
}

async function _processQueue() {
    if (q.isEmpty()) console.log('Task queue is empty');
    while (!q.isEmpty()) {
        var task = q.dequeue();
        console.log('Performing: ', task);
        try {
           _performTask(task)
        } catch (err) {
            console.log('Task Failed, putting it back at end of queue');
        }
    }
}

async function _performTask(task) {
    try {
        await externalService.execute()
        console.log(`Task completed`);
        task.doneAt = Date.now()
        update(task)
    } catch (err) {
        task.lastTried = Date.now()
        task.triesCount++
        const updatedTask = await update(task)
        q.enqueue(updatedTask)
    }
}

// function runTest() {
//     var q = createQueue();

//     for (var i = 0; i < 10; i++) {
//         q.enqueue({ title: `Task ${i + 1}` })
//     }
//     Array(1000)
//         .fill()
//         .map((_, i) => ({ title: `Task ${i + 1}` }))
//         .forEach(q.enqueue)

//     console.log('Queue', q.length);

//     processAllTasks(q)
//         // processAllTasksSplit(q)
//         .then(res => {
//             console.log('Results: ', res);

//         })

// }

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy);
    const collection = await dbService.getCollection('task')
    try {
        const tasks = await collection.find(criteria).toArray();
        return tasks
    } catch (err) {
        console.log('ERROR: cannot find tasks')
        throw err;
    }
}

async function getById(taskId) {
    const collection = await dbService.getCollection('task')
    try {
        const task = await collection.findOne({ "_id": ObjectId(taskId) })
        return task
    } catch (err) {
        console.log(`ERROR: cannot find task ${taskId}`)
        throw err;
    }
}

async function remove(taskId) {
    const collection = await dbService.getCollection('task')
    try {
        return await collection.deleteOne({ "_id": ObjectId(taskId) })
    } catch (err) {
        console.log(`ERROR: cannot remove task ${taskId}`)
        throw err;
    }
}

async function update(task) {
    const collection = await dbService.getCollection('task')
    try {
        let updatedTask = { ...task }
        delete updatedTask._id
        await collection.updateOne({ "_id": ObjectId(task._id) }, { $set: updatedTask })
        return task
    } catch (err) {
        console.log(`ERROR: cannot update task ${task._id}`)
        throw err;
    }
}

async function add(task) {
    const collection = await dbService.getCollection('task')
    try {
        await collection.insertOne(task);
        return task;
    } catch (err) {
        console.log(`ERROR: cannot insert task`)
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.txt) {
        criteria.name = filterBy.txt
    }
    if (filterBy.maxPrice) {
        criteria.price = { $lte: +filterBy.maxPrice }
    }
    return criteria;
}




