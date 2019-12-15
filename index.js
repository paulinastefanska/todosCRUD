const mongo = require("mongodb");

const client = new mongo.MongoClient("mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function addNewTodo(todosCollection, title) {
  todosCollection.insertOne(
    {
      title,
      done: false
    },
    err => {
      if (err) {
        console.log("Error while adding!", err);
      } else {
        console.log("Task added.");
      }

      client.close();
    }
  );
}

function showAllTodos(todosCollection) {
  todosCollection.find({}).toArray((err, todos) => {
    if (err) {
      console.log("Error while downloading!", err);
    } else {
      const todosToDo = todos.filter(todo => !todo.done);
      const todosDone = todos.filter(todo => todo.done);

      console.log(`# To-do list (not completed): ${todosToDo.length}`);

      for (const todo of todosToDo) {
        console.log(`- [${todo._id}] ${todo.title}`);
      }

      console.log(`# List of tasks done (completed): ${todosDone.length}`);

      for (const todo of todosDone) {
        console.log(`- [${todo._id}] ${todo.title}`);
      }
    }

    client.close();
  });
}

function markTaskAsDone(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id)
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("Error while downloading!", err);
      } else if (todos.length !== 1) {
        console.log("There is no such task!");
        client.close();
      } else if (todos[0].done) {
        console.log("This task has already been completed!");
        client.close();
      } else {
        todosCollection.updateOne(
          {
            _id: mongo.ObjectID(id)
          },
          {
            $set: {
              done: true
            }
          },
          err => {
            if (err) {
              console.log("Error setting ending!", err);
            } else {
              console.log("Task marked as completed.");
            }

            client.close();
          }
        );
      }
    });
}

function deleteTask(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id)
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("Error while downloading!", err);
      } else if (todos.length !== 1) {
        console.log("There is no such task!");
        client.close();
      } else {
        todosCollection.deleteOne(
          {
            _id: mongo.ObjectID(id)
          },
          err => {
            if (err) {
              console.log("Error while deleting!", err);
            } else {
              console.log("Task deleted.");
            }

            client.close();
          }
        );
      }
    });
}

function deleteAllDoneTasks(todosCollection) {
  todosCollection.deleteMany(
    {
      done: true
    },
    err => {
      if (err) {
        console.log("Error while deleting!", err);
      } else {
        console.log("Finished all done tasks, if any.");
      }

      client.close();
    }
  );
}

function doTheToDo(todosCollection) {
  const [command, ...args] = process.argv.splice(2);

  switch (command) {
    case "add":
      addNewTodo(todosCollection, args[0]);
      break;
    case "list":
      showAllTodos(todosCollection);
      break;
    case "done":
      markTaskAsDone(todosCollection, args[0]);
      break;
    case "delete":
      deleteTask(todosCollection, args[0]);
      break;
    case "cleanup":
      deleteAllDoneTasks(todosCollection);
      break;
    default:
      console.log(`
Available commands:

add <task name> - add task
list - show tasks
done <id task> - set task as done
delete <id task> - delete task
cleanup - delete all done tasks, if any
`);
      client.close();
      break;
  }
}

client.connect(err => {
  if (err) {
    console.log("Connection error!", err);
  } else {
    console.log("Connection successful!");

    const db = client.db("test");

    const todosCollection = db.collection("todos");

    doTheToDo(todosCollection);
  }
});
