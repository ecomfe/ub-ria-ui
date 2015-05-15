Ext.data.JsonP.MultiCalendar({"tagname":"class","name":"MultiCalendar","autodetected":{},"files":[{"filename":"MultiCalendar.js","href":"MultiCalendar.html#MultiCalendar"}],"members":[{"name":"autoHideLayer","tagname":"property","owner":"MultiCalendar","id":"property-autoHideLayer","meta":{}},{"name":"dateFormat","tagname":"property","owner":"MultiCalendar","id":"property-dateFormat","meta":{}},{"name":"paramFormat","tagname":"property","owner":"MultiCalendar","id":"property-paramFormat","meta":{}},{"name":"range","tagname":"property","owner":"MultiCalendar","id":"property-range","meta":{}},{"name":"rawValue","tagname":"property","owner":"MultiCalendar","id":"property-rawValue","meta":{}},{"name":"styleType","tagname":"property","owner":"MultiCalendar","id":"property-styleType","meta":{}},{"name":"type","tagname":"property","owner":"MultiCalendar","id":"property-type","meta":{"readonly":true}},{"name":"constructor","tagname":"method","owner":"MultiCalendar","id":"method-constructor","meta":{}},{"name":"convertToRaw","tagname":"method","owner":"MultiCalendar","id":"method-convertToRaw","meta":{}},{"name":"dispose","tagname":"method","owner":"MultiCalendar","id":"method-dispose","meta":{"protected":true}},{"name":"initEvents","tagname":"method","owner":"MultiCalendar","id":"method-initEvents","meta":{"protected":true}},{"name":"initOptions","tagname":"method","owner":"MultiCalendar","id":"method-initOptions","meta":{"protected":true}},{"name":"initStructure","tagname":"method","owner":"MultiCalendar","id":"method-initStructure","meta":{"protected":true}},{"name":"parseValue","tagname":"method","owner":"MultiCalendar","id":"method-parseValue","meta":{"protected":true}},{"name":"repaint","tagname":"method","owner":"MultiCalendar","id":"method-repaint","meta":{}},{"name":"stringifyValue","tagname":"method","owner":"MultiCalendar","id":"method-stringifyValue","meta":{"protected":true}},{"name":"change","tagname":"event","owner":"MultiCalendar","id":"event-change","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-MultiCalendar","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/MultiCalendar.html#MultiCalendar' target='_blank'>MultiCalendar.js</a></div></pre><div class='doc-contents'><p>控件类</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-autoHideLayer' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-autoHideLayer' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-autoHideLayer' class='name expandable'>autoHideLayer</a> : boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>是否点击自动关闭弹层 ...</div><div class='long'><p>是否点击自动关闭弹层</p>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='property-dateFormat' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-dateFormat' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-dateFormat' class='name expandable'>dateFormat</a> : string<span class=\"signature\"></span></div><div class='description'><div class='short'>输出的日期格式，用于getValue返回时格式化\n\n具体的日期格式参考\nmoment文档 ...</div><div class='long'><p>输出的日期格式，用于getValue返回时格式化</p>\n\n<p>具体的日期格式参考\n<a href=\"http://momentjs.com/docs/#/displaying/format/\">moment文档</a></p>\n<p>Defaults to: <code>&quot;YYYY-MM-DD&quot;</code></p></div></div></div><div id='property-paramFormat' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-paramFormat' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-paramFormat' class='name expandable'>paramFormat</a> : string<span class=\"signature\"></span></div><div class='description'><div class='short'>输入的日期格式，用于setValue时格式化\n\n具体的日期格式参考\nmoment文档 ...</div><div class='long'><p>输入的日期格式，用于setValue时格式化</p>\n\n<p>具体的日期格式参考\n<a href=\"http://momentjs.com/docs/#/displaying/format/\">moment文档</a></p>\n<p>Defaults to: <code>&quot;YYYY-MM-DD&quot;</code></p></div></div></div><div id='property-range' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-range' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-range' class='name expandable'>range</a> : meta.DateRange<span class=\"signature\"></span></div><div class='description'><div class='short'><p>指定控件可选的时间段</p>\n</div><div class='long'><p>指定控件可选的时间段</p>\n</div></div></div><div id='property-rawValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-rawValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-rawValue' class='name expandable'>rawValue</a> : Date<span class=\"signature\"></span></div><div class='description'><div class='short'><p>控件的原始值，为<code>Date</code>类型，默认为当天</p>\n</div><div class='long'><p>控件的原始值，为<code>Date</code>类型，默认为当天</p>\n</div></div></div><div id='property-styleType' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-styleType' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-styleType' class='name expandable'>styleType</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>'Calendar'</code></p></div></div></div><div id='property-type' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-property-type' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-property-type' class='name expandable'>type</a> : string<span class=\"signature\"><span class='readonly' >readonly</span></span></div><div class='description'><div class='short'>控件类型，始终为\"MultiCalendar\" ...</div><div class='long'><p>控件类型，始终为<code>\"MultiCalendar\"</code></p>\n<p>Defaults to: <code>'MultiCalendar'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/MultiCalendar-method-constructor' class='name expandable'>MultiCalendar</a>( <span class='pre'>options</span> ) : <a href=\"#!/api/MultiCalendar\" rel=\"MultiCalendar\" class=\"docClass\">MultiCalendar</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object<div class='sub-desc'><p>初始化参数</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/MultiCalendar\" rel=\"MultiCalendar\" class=\"docClass\">MultiCalendar</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-convertToRaw' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-convertToRaw' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-convertToRaw' class='name expandable'>convertToRaw</a>( <span class='pre'>value</span> ) : {begin:Date,end:Date}<span class=\"signature\"></span></div><div class='description'><div class='short'>将字符串转换成对象型rawValue\n可重写\n\n@inner ...</div><div class='long'><p>将字符串转换成对象型rawValue\n可重写</p>\n\n<p>@inner</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'><p>目标日期字符串 ‘YYYY-MM-DD,YYYY-MM-DD’</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>{begin:Date,end:Date}</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-dispose' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-dispose' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-dispose' class='name expandable'>dispose</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>卸载控件 ...</div><div class='long'><p>卸载控件</p>\n</div></div></div><div id='method-initEvents' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-initEvents' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-initEvents' class='name expandable'>initEvents</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>初始化事件交互 ...</div><div class='long'><p>初始化事件交互</p>\n</div></div></div><div id='method-initOptions' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-initOptions' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-initOptions' class='name expandable'>initOptions</a>( <span class='pre'>[options]</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>初始化参数 ...</div><div class='long'><p>初始化参数</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>构造函数传入的参数</p>\n</div></li></ul></div></div></div><div id='method-initStructure' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-initStructure' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-initStructure' class='name expandable'>initStructure</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>初始化DOM结构 ...</div><div class='long'><p>初始化DOM结构</p>\n</div></div></div><div id='method-parseValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-parseValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-parseValue' class='name expandable'>parseValue</a>( <span class='pre'>value</span> ) : Date<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>将字符串类型的值转换成原始格式，复杂类型的输入控件需要重写此接口 ...</div><div class='long'><p>将字符串类型的值转换成原始格式，复杂类型的输入控件需要重写此接口</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'><p>字符串值</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Date</span><div class='sub-desc'><p>日期原始格式</p>\n</div></li></ul></div></div></div><div id='method-repaint' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-repaint' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-repaint' class='name expandable'>repaint</a>( <span class='pre'>[]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>重新渲染视图\n仅当生命周期处于RENDER时，该方法才重新渲染 ...</div><div class='long'><p>重新渲染视图\n仅当生命周期处于RENDER时，该方法才重新渲染</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'></span> : Array (optional)<div class='sub-desc'><p>变更过的属性的集合</p>\n</div></li></ul></div></div></div><div id='method-stringifyValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-method-stringifyValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-method-stringifyValue' class='name expandable'>stringifyValue</a>( <span class='pre'>rawValue</span> ) : string<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>将值从原始格式转换成字符串，复杂类型的输入控件需要重写此接口 ...</div><div class='long'><p>将值从原始格式转换成字符串，复杂类型的输入控件需要重写此接口</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rawValue</span> : Date<div class='sub-desc'><p>原始值</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>string</span><div class='sub-desc'><p>日期字符串</p>\n</div></li></ul></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-event'>Events</h3><div class='subsection'><div id='event-change' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MultiCalendar'>MultiCalendar</span><br/><a href='source/MultiCalendar.html#MultiCalendar-event-change' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MultiCalendar-event-change' class='name expandable'>change</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>值发生变化时触发 ...</div><div class='long'><p>值发生变化时触发</p>\n</div></div></div></div></div></div></div>","meta":{}});