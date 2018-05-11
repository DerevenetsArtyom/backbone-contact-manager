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





});
