var Item = require('./itemModel');
var Promise = require('bluebird');
var _ = require('lodash');

var request = Promise.promisify(require('request'));

var itemController = {};
itemController.getAllHNItemIds = getAllHNItemIds;
itemController.getAllLinkIds = getAllLinkIds;
itemController.addItem = addItem;
itemController.addRedditItem = addRedditItem;
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

function addRedditItem(item) {
  return Item.findOne({id: item.id}).exec()
    .then(function(foundItem) {
      console.log('foundItem', foundItem);
      if (foundItem) {
        return foundItem;
      } else {
        return Item.create(item)
          .then(null, function(err) {
            console.log('error creating item', err);
          });
      }
    })
}

function getAllHNItemIds() {
  var itemIds = [];
  return Item.find({source: "Hacker News"})
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

//takes in source as parameter and only checks for that source
function getAllLinkIds(source) {
  var itemIds = [];
  return Item.find({source: source, type: 'link'})
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

        return (function(itemId) {
            return request('https://hacker-news.firebaseio.com/v0/item/' +itemId +'.json')
            .spread(function(response, body) {
              var item = createItemForDB(JSON.parse(body), source);

              return (function(input) {
                return addItem(input, source)
                        .then(function(createdItem) {

                          // uses input instead of createdItem because dup key would
                          // leaves createdItem as null
                          if (input.title) {
                            return updateTitles(itemsWithoutTitles, input.title);
                          }
                          itemsWithoutTitles.push(input.id);
                          return findTitle(input.parent);
                        });
              })(item);

          })
          //could not find comment in db
          .then(null, function(err) {
              console.log('error with finding title', err);
            })
        })(id);


        });
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
          return Item.findOne({id: id}).exec();
        })
        .then(null, function(err) {
          console.log('error updating', err);
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
  item.parent = itemFromAPI.parent;
  item.text = itemFromAPI.text;

  if (source === 'Hacker News') {
    item.replies = item.kids.length;
  }

  return item;
}

module.exports = itemController;