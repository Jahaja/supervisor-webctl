$(function() {
    var Process = Backbone.Model.extend({

    });

    var ProcessList = Backbone.Collection.extend({
        url: '/process_list',
        model: Process,
        parse: function (resp) {
            return resp.data;
        }
    });

    var processList = new ProcessList;

    var ProcessView = Backbone.View.extend({
        tagName: "tr",
        template: $('#process-row-template').html(),
        events: {
          "click .btn.start" : "startProcess",
          "click .btn.stop" : "stopProcess",
          "click .btn.restart" : "restartProcess",
          "click .view-process" : "viewProcess"
        },

        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },
        startProcess: function(e) {
            var btn = $(e.target);
            btn.button('loading');
            var post_data = {
                "host_id": this.model.get("host_id"),
                "process_name": this.model.get("group") + ":" + this.model.get("name")
            };

            $.post('/start_process', post_data, function(resp) {
                processList.fetch();
            });
        },
        stopProcess: function(e) {
            var btn = $(e.target);
            btn.button('loading');
            var post_data = {
              "host_id": this.model.get("host_id"),
              "process_name": this.model.get("group") + ":" + this.model.get("name")
            };

            $.post('/stop_process', post_data, function(resp) {
                processList.fetch();
            });
        },
        restartProcess: function() {
            var btn = $(e.target);
            btn.button('loading');
            var post_data = {
                "host_id": this.model.get("host_id"),
                "process_name": this.model.get("group") + ":" + this.model.get("name")
            };

            $.post('/restart_process', post_data, function(resp) {
                processList.fetch();
            });
        },
        viewProcess: function() {
            var processInfoView = new ProcessInfoView({model: this.model});
            processInfoView.render();
        }
    });

    var ProcessListView = Backbone.View.extend({
        tagName: "div",
        className: "process-list",
        template: $('#process-list-template').html(),

        initialize: function() {
            this.collection = processList;
            this.collection.on("reset", this.render, this);
        },

        render: function () {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl());
            this.$el.find("tbody").html("");
            this.collection.each(function(process) {
                this.renderProcess(process);
            }, this);
            this.trigger("rendered", this);
            return this;
        },

        renderProcess: function(process) {
            var processView = new ProcessView({model: process});
            this.$el.find("tbody").append(processView.render().el);
        }
    });

    var ProcessInfoView = Backbone.View.extend({
        el: "#sidebar",
        template: $('#process-info-template').html(),
        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
        }
    });

    /*** Hosts ***/

    var Host = Backbone.Model.extend();

    var HostList = Backbone.Collection.extend({
        url: '/hosts',
        model: Host,
        parse: function (resp) {
            return resp.data;
        }
    });

    var hostList = new HostList();

    var HostView = Backbone.View.extend({
        tagName: "tr",
        template: $('#host-row-template').html(),
        events: {
            "click .view-info" : "viewHost"
        },
        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },
        viewHost: function() {

        }
    });

    var HostListView = Backbone.View.extend({
        tagName: "div",
        className: "host-list",
        template: $("#host-list-template").html(),
        initialize: function () {
            this.collection = hostList;
            this.collection.on("reset", this.render, this);
        },
        render: function() {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl());
            this.$el.find("tbody").html("");
            this.collection.each(function(host) {
                this.renderHost(host);
            }, this);
            this.trigger("rendered", this);
            return this;
        },
        renderHost: function(host) {
            var hostView = new HostView({model : host});
            this.$el.find("tbody").append(hostView.render().el);
        }
    });

    /*** App ***/
    var AppView = Backbone.View.extend({
        el: "#webctl-app",
        events: {
            "click a.host-list" : "viewHosts",
            "click a.process-list" : "viewProcessList"
        },
        initialize: function () {
            this.hostListView = new HostListView();
            this.processListView = new ProcessListView();
            this.viewProcessList();
        },
        viewHosts: function(e) {
            this.setActiveTab(".host-list");
            this.hostListView.collection.fetch();
            this.$el.find(".table-container").html(this.hostListView.el);
        },
        viewProcessList: function(e) {
            this.setActiveTab(".process-list");
            this.processListView.collection.fetch();
            this.$el.find(".table-container").html(this.processListView.el);
            this.processListView.on("rendered", function() {
                var model = processList.at(0);
                var processView = new ProcessView({model: model});
                processView.viewProcess();
            });
        },
        setActiveTab: function(className) {
            var tab = this.$el.find(className);
            tab.parent("li").siblings().removeClass("active");
            tab.parent("li").addClass("active");
        }
    });

    var app = new AppView();
});