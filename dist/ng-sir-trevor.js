(function() {
    'use strict';
    angular
    .module('SirTrevor', [])
        .provider('SirTrevor', function() {
            this.$get = function() {
                return window.SirTrevor;
            };
            this.Blocks = window.SirTrevor.Blocks;
            this.Block = window.SirTrevor.Block;
            this.Formatters = window.SirTrevor.Formatters;
            this.Formatter = window.SirTrevor.Formatter;
        })
        .provider('SirTrevorOptions', function() {
            var options = {
                    blockTypes: ['Text'],
                    transform: {
                        get: function(block) {
                            return {
                                type: block.blockStorage.type,
                                data: block.blockStorage.data
                            };
                        },
                        set: function(block) {
                            return {
                                type: block.type,
                                data: block.data
                            };
                        }
                    }
                };
            this.$get = function() {
                return options;
            };
            this.$extend = function(opts) {
                _.extend(options, opts);
            };
            this.$set = function(opts) {
                options = opts;
            };
        })
        .directive('ngSirTrevor', ['SirTrevor', 'SirTrevorOptions', '$parse', function(SirTrevor, options, $parse) {
            var directive = {
                    template: function(element, attr) {
                        var str = '<textarea class="sir-trevor" name="content"></textarea>';
                        // sir trevor needs a parent `form` tag.
                        if (!element.parent('form').length) {
                            str = '<form>' + str + '</form>';
                        }
                        return str;
                    },
                    link: function (scope, element, attrs) {
                        var opts = _.clone(options);
                        // get and eval all the directive paramters starting by 'st-'
                        _.each(attrs, function(value, key) {
                            if (key.indexOf('st') === 0) {
                                opts[key[2].toLowerCase() + key.slice(3)] = scope.$eval(value);
                            }
                        });
                        opts.el = element.find('textarea');
                        scope.editor = new SirTrevor.Editor(opts);
                        scope.editor.get = function() {
                            var list = [];
                            _.each(scope.editor.blocks, function(block) {
                                scope.editor.saveBlockStateToStore(block);
                                list.push(opts.transform.get(block));
                            });
                            return list;
                        };
                        scope.editor.set = function(list) {
                            var item;
                            _.each(list, function(block) {
                                item = opts.transform.set(block);
                                scope.editor.createBlock(item.type, item.data);
                            });
                        };

                        scope.editor.clear = function() {
                            scope.editor.dataStore.data = [];
                        };
                        // @TODO: investigate how to better `digest` out of $scope  variables.
                        // scope.$watchCollection('editor.blocks', function(blocks) {
                        //     var list = [];
                        //     _.each(blocks, function(block) {
                        //         list.push(scope.editor.get(block));
                        //     });
                        //     scope.model = list;
                        // });
                    }
                };
            return directive;
        }]);
})();
