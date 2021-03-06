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

    const TodoView = Backbone.View.extend({
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

        // "click .toggle" event
        // Toggle the `"done"` state of the model.
        toggleDone: function() {
            this.model.toggle();
        },

        // "dblclick .view" event
        // Switch view into `"editing"` mode, displaying the input field.
        edit: function() {
            this.$el.addClass("editing");
            this.input.focus();
        },

        // "blur .edit" event
        // Close the `"editing"` mode, saving changes to the to-do.
        close: function() {
            const value = this.input.val();
            if (!value) {
                this.clear();
            } else {
                this.model.save({title: value});
                this.$el.removeClass("editing");
            }
        },

        // "keypress .edit" event
        // If you hit `enter`, we're through editing the item.
        updateOnEnter: function(e) {
            if (e.keyCode === 13) this.close();
        },

        // "click a.destroy" event
        // Remove the item, destroy the model.
        clear: function() {
            this.model.destroy();
        }
    });

    // Overall **AppView** is the top-level piece of UI.
    const AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#todoapp"),

        // Template for the line of statistics at the bottom of the app.
        statsTemplate: _.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
          "keypress #new-todo":  "createOnEnter",
          "click #clear-completed": "clearCompleted",
          "click #toggle-all": "toggleAllComplete"
        },

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {
            this.input = this.$("#new-todo");
            this.allCheckbox = this.$("#toggle-all")[0];

            this.listenTo(Todos, 'add', this.addOne);
            this.listenTo(Todos, 'reset', this.addAll);
            this.listenTo(Todos, 'all', this.render);

            this.footer = this.$('footer');
            this.main = $('#main');

            Todos.fetch();
        },

        // Re-rendering the App just means refreshing the statistics --
        // the rest of the app doesn't change.
        render: function() {
            const done = Todos.done().length;
            const remaining = Todos.remaining().length;

            if (Todos.length) {
                this.main.show();
                this.footer.show();
                this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
            } else {
                this.main.hide();
                this.footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },

        // Add a single to-do item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(todo) {
            const view = new TodoView({model: todo});
            this.$("#todo-list").append(view.render().el);
        },

        // Add all items in the **Todos** collection at once.
        addAll: function() {
            Todos.each(this.addOne, this);
        },

        // If you hit return in the main input field,
        // create new To-do model, persisting it to *localStorage*.
        createOnEnter: function(e) {
            if (e.keyCode !== 13) return;
            if (!this.input.val()) return;

            Todos.create({title: this.input.val()});
            this.input.val('');
        },

        // Clear all done to-do items, destroying their models.
        clearCompleted: function() {
            _.invoke(Todos.done(), 'destroy');
            return false;
        },

        toggleAllComplete: function () {
        const done = this.allCheckbox.checked;
        Todos.each(function (todo) { todo.save({'done': done}); });
    }
  });

    // Finally, we kick things off by creating the **App**.
    const App = new AppView;
});
