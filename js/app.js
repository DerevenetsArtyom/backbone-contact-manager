(function ($) {

    var contacts = [
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
    ];

    //define product model
    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png"
        }
    });

    var Directory = Backbone.Collection.extend({
        model: Contact
    });

    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: $("#contactTemplate").html(),

        render: function () {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this
        }
    });

    var DirectoryView = Backbone.View.extend({
        el: $("#contacts"),

        events: {
          "change #filter select": "setFilter"
        },

        initialize: function () {
            this.collection = new Directory(contacts);
            this.render();
            this.$el.find("#filter").append(this.createSelect());

            // filterByType() as the handler function for specific event
            this.on("change:filterType", this.filterByType, this);

            // re-render when collection changed

            // If we don't supply this as the 3-th argument,
            // there won't be able to access the collection inside the render()
            // method when it handles the reset event
            this.collection.on("reset", this.render, this);
        },

        render: function () {
            // remove previous content from section
            this.$el.find("article").remove();
            var self = this;
            _.each(this.collection.models, function (item) {
                self.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({ model: item });
            this.$el.append(contactView.render().el);
        },
        
        // construct 'select' element with types as options
        createSelect: function () {
            var self = this;
            var select = $("<select/>", {
                html: "<option value='all'>all</option>"
            });

            // return array of unique types
            getTypes = function () {
                return _.uniq(self.collection.pluck("type"), false, function (type) {
                    return type.toLowerCase()
                })
            };

            _.each(getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });
            return select;
        },

        // catching filter and trigger custom event
        setFilter: function (e) {
            this.filterType = e.currentTarget.value;
            this.trigger("change:filterType");
        },

        // actual filtering of collection on type
        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");

            } else {
                // won't be rerendered according to 'reset' event
                this.collection.reset(contacts, {silent: true});

                // save filterType to be able to use it inside the callback
                var filterType = this.filterType;
                var filtered = _.filter(this.collection.models, function(item){
                    return item.get("type").toLowerCase() === filterType
                });
                this.collection.reset(filtered);
                contactsRouter.navigate("filter/" + filterType);
            }
        }

    });

    //add routing
    var ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type": "urlFilter"
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("change:filterType");
        }
    });

    var directory = new DirectoryView();

    var contactsRouter = new ContactsRouter();

    //start history service
    Backbone.history.start();

} (jQuery));