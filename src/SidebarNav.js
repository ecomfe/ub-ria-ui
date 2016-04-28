/**
 * @class SideBarNav
 * @extends esui.Control
 * @file 侧边导航栏
 * @author lisijin
 *         yankun01
 */

define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var esui = require('esui');
        var Control = require('esui/Control');
        var etpl = require('etpl');
        var $ = require('jquery');
        var eoo = require('eoo');
        // var tplHtml = require('html!./tpl/sidebarNav.tpl.html');
        var painters = require('esui/painters');

        var SidebarNav = eoo.create(
            Control,
            {
                type: 'SidebarNav',

                initOptions: function (options) {
                    var properties = {
                        datasource: [],
                        activeItems: [],
                        expandItem: '',
                        contents: []
                    };
                    u.extend(properties, options);
                    this.setProperties(properties);
                    this.complier = etpl.compile(listTemplate);
                },

                initEvents: function () {
                    var me = this;
                    var itemClass = me.helper.getPartClassName('item');
                    var leafClass = me.helper.getPartClassName('item-leaf');
                    var expander = me.helper.getPartClassName('item-expander');
                    var activeClass = me.helper.getPartClassName('item-active');

                    me.$super(arguments);
                    me.helper.addDOMEvent(
                        me.main,
                        'click',
                        '.' + itemClass,
                        function dropClick(e) {
                            var jqItem = $(e.currentTarget);
                            var expandedClass = me.helper.getPartClassName('item-expanded');

                            if (!jqItem.hasClass(leafClass)) {
                                e.preventDefault();
                                jqItem.find('>ul').slideToggle('fast', function () {
                                    jqItem.toggleClass(expandedClass);
                                    $(this).css('display', '');
                                });
                            }
                            else {
                                e.stopPropagation();
                                if (!jqItem.hasClass(activeClass)) {
                                    me.fire('itemclick', e);
                                    if (e.isDefaultPrevented()) {
                                        return;
                                    }
                                    $(me.main).find('.' + activeClass).removeClass(activeClass);
                                    jqItem.addClass(activeClass).parents('.' + itemClass).addClass(activeClass);
                                }
                            }
                        }
                    );
                },

                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: 'datasource',
                        paint: function (me, datasource) {
                            var data = prepareData.call(me, datasource);
                            me.main.innerHTML = me.complier(
                                {
                                    datasource: data,
                                    typeCls: me.helper.getPrimaryClassName(),
                                    iconCls: me.helper.getIconClass()
                                }
                            );
                        }
                    },
                    {
                        name: 'collapsed',
                        paint: function (me, isCollapsed) {
                            if (isCollapsed) {
                                me.addState('collapsed');
                            }
                            else {
                                me.removeState('collapsed');
                            }

                            me.fire('collapsed', isCollapsed);
                        }
                    }
                )
            }
        );

        function prepareData(datasource) {
            var items = [];
            u.each(
                datasource,
                function (data) {
                    var item = {
                        domID: this.helper.getId('item-' + data.id),
                        text: data.text,
                        url: data.url ? data.url : 'javascript:;',
                        target: data.target ? data.target : '_self',
                        items: data.items || [],
                        hide: data.hide,
                        header: data.header,
                        icon: data.icon,
                        expanded: data.expanded,
                        active: data.active
                    };

                    addItemClass(item, this.helper);
                    items.push(item);
                    u.each(
                        item.items,
                        function (subItem) {
                            subItem.domID = this.helper.getId('item-' + subItem.id);
                            addItemClass(subItem, this.helper);
                        },
                        this
                    );
                },
                this
            );

            return items;
        }

        function addItemClass(item, helper) {
            var itemCls = [];
            if (item.items && item.items.length > 0) {
                itemCls.push(
                    helper.getPartClassName('item-has-menu')
                );
            }
            if (item.expanded > 0) {
                itemCls.push(
                    helper.getPartClassName('item-expanded')
                );
            }
            if (item.active > 0) {
                itemCls.push(
                    helper.getPartClassName('item-active')
                );
            }
            item.itemClass = itemCls.join(' ');
        }

        esui.register(SidebarNav);
        return SidebarNav;
    }
);
