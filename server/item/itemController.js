var Item = require('./itemModel');
var Promise = require('bluebird');

var request = Promise.promisify(require('request'));

var itemController = {};
itemController.getAllItemIds = getAllItemIds;
itemController.addItem = addItem;
itemController.deleteItems = deleteItems;
itemController.updateTitle = updateTitle;
itemController.getComments = getComments;

function deleteItems() {
  return Item.remove({})
    .exec();
}

function addItem(item, source) {

  return Item.create(createItemForDB(item, source))
    .then(null, function(err) {
      console.log('error creating item', err);
    });
}

function getAllItemIds() {
  var itemIds = [];
  return Item.find()
    .exec()
    .then(function(foundItems) {

      for (var i = 0; i < foundItems.length; i++) {
        itemIds.push(foundItems[i].id);
      }
      return itemIds;
    })
    .then(null, function(err) {
      console.log('error getting all itemIds', err);
    });
}

function updateTitle(commentId, source) {
  console.log('source', source);
  var itemsWithoutTitles = [];
  itemsWithoutTitles.push(commentId);

  function findTitle(id) {
    return Item.findOne({id: id}).exec()
      .then(function(foundItem) {

        if (foundItem) {

          if (foundItem && foundItem.title) {
            return updateTitles(itemsWithoutTitles, foundItem.title);
          }

          return findTitle(foundItem.parent);
        }
        return request('https://hacker-news.firebaseio.com/v0/item/' +id +'.json')
        .spread(function(response, body) {
          var item = createItemForDB(JSON.parse(body), source);

          return addItem(item, source)
                  .then(function(createdItem) {

                    if (createdItem && createdItem.title) {
                      return updateTitles(itemsWithoutTitles, createdItem.title);
                    }

                    itemsWithoutTitles.push(createdItem.id);
                    return findTitle(createdItem.parent)
                  });

      })
      //could not find comment in db
      .then(null, function(err) {
          console.log('error with finding title', err);
        })
      })
  }

  return findTitle(commentId);
}

function updateTitles(array, title) {
  console.log('updating');
  var updatingArray = [];
  for (var i = 0; i < array.length; i++) {
    updatingArray.push((function(id) {
      return Item.update({id: id}, {title: title}).exec()
        .then(function() {
          console.log('id', id);
          return Item.findOne({id: id}).exec();
        })
    })(array[i]));
  }

  return Promise.all(updatingArray);
}

function getComments() {
  return Item.find({type: 'comment'}).exec();
}


function createItemForDB(itemFromAPI, source) {
  var item = {};
  item.id = itemFromAPI.id;
  item.type = itemFromAPI.type;
  item.title = itemFromAPI.title || null;
  item.time = itemFromAPI.time;
  item.by = itemFromAPI.by;
  item.source = source;
  item.score = itemFromAPI.score;
  item.kids = itemFromAPI.kids || [];
  if (item.type !== 'story') {
    item.parent = itemFromAPI.parent;
  }
  if (item.type === 'comment') {
    item.text = itemFromAPI.text;
  }

  return item;
}

module.exports = itemController;