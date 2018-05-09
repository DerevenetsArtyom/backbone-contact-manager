(function ($) {

    const contacts = [
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
    const Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png",
            name: "Default name",
            address: "Default address",
            tel: "11111111",
            email: "Default email",
            type: "family"
        }
    });

    const Directory = Backbone.Collection.extend({
        model: Contact
    });

    const ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: _.template($("#contactTemplate").html()),
        editTemplate: _.template($("#contactEditTemplate").html()),

        events: {
            "click button.delete": "deleteContact",
            "click button.edit": "editContact",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit",
            "change select.type": "addType"
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        deleteContact: function (e) {
            e.preventDefault();

            const removedType = this.model.get("type").toLowerCase();

            //remove model
            this.model.destroy();

            //remove view from page
            this.remove();

            //re-render select if no more of deleted type
            if (_.indexOf(directory.getTypes(), removedType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
        },

        //switch contact to edit mode
        editContact: function () {
            // rendering view with template for that case
            this.$el.html(this.editTemplate(this.model.toJSON()));

            const newOpt = $("<option/>", {
                html: "<em>Add new ...</em>",
                value: "addType"
            });

             this.select = directory.createSelect().addClass("type")
                .val(this.$el.find("#type").val()).append(newOpt)
                .insertAfter(this.$el.find(".name"));

            this.$el.find("input[type='hidden']").remove();
        }


    });

    const DirectoryView = Backbone.View.extend({
        el: $("#contacts"),

        events: {
            "change #filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm": "showForm"
        },

        initialize: function () {
            this.collection = new Directory(contacts);
            this.render();
            this.$el.find("#filter").append(this.createSelect());

            // filterByType() as the handler function for specific event
            this.on("change:filterType", this.filterByType, this);

            // re-render when collection changed
            this.collection.on("reset", this.render, this);

            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
        },

        render: function () {
            // remove previous content from section
            this.$el.find("article").remove();

            const self = this;
            _.each(this.collection.models, function (item) {
                self.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            const contactView = new ContactView({ model: item });
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
            const select = $("<select/>", {
                html: "<option value='all'>all</option>"
            });

            _.each(this.getTypes(), function (item) {
                const option = $("<option/>", {
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
                const filterType = this.filterType;
                const filtered = _.filter(this.collection.models, function(item){
                    return item.get("type").toLowerCase() === filterType
                });
                this.collection.reset(filtered);
                contactsRouter.navigate("filter/" + filterType);
            }
        },

        // handling form input and creating new contact out of form data
        addContact: function (e) {
            // default behaviour of the <button>: submit form and reload page
            e.preventDefault();

            this.collection.reset(contacts, {silent: true});

            const newModel = {};
            $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                    newModel[el.id] = $(el).val();
                }
            });

            contacts.push(newModel);

            // handle the case when type is new and add it to the select
            if (_.indexOf(this.getTypes(), newModel.type) === -1) {
                this.collection.add(new Contact(newModel));
                this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
            } else {
                this.collection.add(new Contact(newModel));
            }
        },
        
        removeContact: function (removedModel) {
            const removed = removedModel.attributes;

            if (removed.photo === "img/placeholder.png") {
                delete removed.photo;
            }

            _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },
        
        showForm: function () {
            this.$el.find("#addContact").slideToggle();
        }
    });


    //add routing
    const ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type": "urlFilter"
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("change:filterType");
        }
    });

    const directory = new DirectoryView();

    const contactsRouter = new ContactsRouter();


    //start history service
    Backbone.history.start();

} (jQuery));