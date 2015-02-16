var Item = require('./itemModel');
var Promise = require('bluebird');

var request = Promise.promisify(require('request'));

var itemController = {};
itemController.getAllItemIds = getAllItemIds;
itemController.addItem = addItem;

function addItem(item) {
  return Item.create(item)
    .then(null, function(err) {
      console.log('error creating item', err);
    });
}

function getAllItemIds() {
  var itemIds = [];
  return Comment.find()
    .exec()
    .then(function(foundItems) {

      for (var i = 0; i < foundItems.length; i++) {
        commentIds.push(foundItems[i].id);
      }
      return itemIds;
    })
    .then(null, function(err) {
      console.log('error getting all itemIds', err);
    });
}

function updateTitle(id) {

  function findTitle(id) {
    return Item.findById(id).exec()
      .then(function(foundItem) {

        // if title
        if (foundItem.title) {
          return foundItem.title;
        }

        return findTitle(foundItem.parent);
      })
      .then(null, function(err) {
        return request('https://hacker-news.firebaseio.com/v0/item/' +foundItem.parent +'.json')
        .spread(response, body) {




        }
      })
  }



}

module.exports = itemController;