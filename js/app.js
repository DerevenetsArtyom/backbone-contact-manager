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

        initialize: function () {
            this.collection = new Directory(contacts);
            this.render();
            this.$el.find("#filter").append(this.createSelect());
        },

        render: function () {
            var self = this;
            _.each(this.collection.models, function (item) {
                self.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({
                model: item
            });
            this.$el.append(contactView.render().el);
        },
        
        // return array of unique types
        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase()
            })
        },
        
        // construct 'select' element with types as options
        createSelect: function () {
            var select = $("<select/>", {
                html: "<option>All</option>"
            });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });
            return select;
        },

        events: {
          "change #filter select": "setFilter"
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
            } else {
                this.collection.reset(contacts, {silent: true});

                // save to be able to use it inside callback
                var filterType = this.filterType;
                var filtered = _.filter(this.collection.models, function(item){
                    return item.get("type").toLowerCase() === filterType
                });

                this.collection.reset(filtered)
            }
        }

    });

    new DirectoryView();

} (jQuery));