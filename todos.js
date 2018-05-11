// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
  const Todo = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });

  // Collection of todos is backed by *localStorage* instead of a remote server.
  const TodoList = Backbone.Collection.extend({
      model: Todo,
      localStorage: new Backbone.LocalStorage("todos-backbone"),

       // Filter down the list of all finished to-do items
      done: function() {
        return this.where({done: true});
      },

      // Filter down the list to only not finished to-do items
      remaining: function() {
        return this.where({done: false});
      },

      // Keep the Todos in sequential order,
      // despite being saved by unordered ID in the database.
      // This generates the next order number for new items.
      nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
      },

      // Todos are sorted by their original insertion order.
      comparator: 'order'
  });






});
