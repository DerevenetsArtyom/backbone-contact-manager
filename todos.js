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

  // Create global collection of Todos
  const Todos = new TodoList;

  var TodoView = Backbone.View.extend({
      tagName:  "li",
      template: _.template($('#item-template').html()),

      events: {
          "click .toggle"   : "toggleDone",
          "dblclick .view"  : "edit",
          "click a.destroy" : "clear",
          "keypress .edit"  : "updateOnEnter",
          "blur .edit"      : "close"
      },

      // The TodoView listens for changes to its model, re-rendering.
      // Since there's a one-to-one correspondence between To-do and
      // TodoView in this app, we set a direct reference on the model for convenience.
      initialize: function() {
          // this.listenTo(this.model, 'change', this.render);
          // this.listenTo(this.model, 'destroy', this.remove);
          this.model.on('change', this.render, this);
          this.model.on('destroy', this.remomve, this);
      },

      // Re-render the titles of the to-do item.
      render: function() {
          this.$el.html(this.template(this.model.toJSON()));
          this.$el.toggleClass('done', this.model.get('done'));
          this.input = this.$('.edit');
          return this;
      },

      // Toggle the `"done"` state of the model.  --> "click .toggle" event
      toggleDone: function() {
          this.model.toggle();
      },

      // Switch view into `"editing"` mode, displaying the input field.
      // "dblclick .view" event
      edit: function() {
          this.$el.addClass("editing");
          this.input.focus();
      },












});
