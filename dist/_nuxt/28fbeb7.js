(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{433:function(t,e,n){var content=n(454);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(23).default)("50788f08",content,!0,{sourceMap:!1})},454:function(t,e,n){var l=n(22)(!1);l.push([t.i,".v-autocomplete.v-input>.v-input__control>.v-input__slot{cursor:text}.v-autocomplete input{align-self:center}.v-autocomplete.v-select.v-input--is-focused input{min-width:64px}.v-autocomplete:not(.v-input--is-focused).v-select--chips input{max-height:0;padding:0}.v-autocomplete--is-selecting-index input{opacity:0}.v-autocomplete.v-text-field--enclosed:not(.v-text-field--solo):not(.v-text-field--single-line):not(.v-text-field--outlined) .v-select__slot>input{margin-top:24px}.v-autocomplete.v-text-field--enclosed:not(.v-text-field--solo):not(.v-text-field--single-line):not(.v-text-field--outlined).v-input--dense .v-select__slot>input{margin-top:20px}.v-autocomplete:not(.v-input--is-disabled).v-select.v-text-field input{pointer-events:inherit}.v-autocomplete__content.v-menu__content,.v-autocomplete__content.v-menu__content .v-card{border-radius:0}",""]),t.exports=l},513:function(t,e,n){"use strict";n.r(e);var l=n(35),o=(n(87),n(121),n(6),n(105),n(159)),r=n.n(o),c=(n(190),{name:"Listings",middleware:"auth",data:function(){return{makes:[],models:[],modelYearsList:[],modelTrimList:[],headers:[{text:"Make",value:"make"},{text:"Model",value:"model"},{text:"Year",value:"year"},{text:"Trim",value:"trim"},{text:"Created at",value:"createdAt"},{text:"Created by",value:"createdBy"},{text:"Actions"}],listings:[],new_listing:{make:null,model:null,year:null,trim:null}}},fetch:function(){var t=this;return Object(l.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t.getMakesList(),t.getActiveListings();case 2:case"end":return e.stop()}}),e)})))()},methods:{resetDatasetForm:function(t){t&&(this.new_listing.make=null),this.new_listing.model=null,this.new_listing.year=null,this.new_listing.trim=null},getMakeCount:function(t){return this.makes.find((function(e){return e.make===t})).count},getMakeModels:function(){var t=this;this.resetDatasetForm(!1),r.a.post("/api/listings/models/get",{make:this.new_listing.make}).then((function(e){t.models=e.data.models,console.log("models",t.models)})).catch((function(t){console.log(t)}))},getmodelYearsList:function(){var t=this;r.a.post("/api/listings/modelYearslist/get",this.new_listing).then((function(e){t.modelYearsList=e.data.modelYearsList,console.log("models",t.modelYearsList)})).catch((function(t){console.log(t)}))},getmodelTrimList:function(){var t=this;r.a.post("/api/listings/modelTrimList/get",this.new_listing).then((function(e){t.modelTrimList=e.data.modelTrimList,console.log("models",t.modelTrimList)})).catch((function(t){console.log(t)}))},addNewListing:function(){var t=this;this.new_listing.userId=this.$store.state.user.id,r.a.post("/api/listings/active/add",this.new_listing).then((function(e){t.getActiveListings(),t.resetDatasetForm(!0)})).catch((function(t){console.log(t)}))},deleteListing:function(t){var e=this;r.a.post("/api/listings/active/delete",{listingId:t}).then((function(t){e.getActiveListings()})).catch((function(t){console.log(t)}))},getActiveListings:function(){var t=this;return Object(l.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r.a.get("/api/listings/active/get").then((function(e){t.listings=e.data.listings,console.log(t.listings)})).catch((function(t){console.log(t)}));case 1:case"end":return e.stop()}}),e)})))()},getMakesList:function(){var t=this;return Object(l.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r.a.get("/api/listings/makes/get").then((function(e){t.makes=e.data.makes,console.log(t.makes)})).catch((function(t){console.log(t)}));case 1:case"end":return e.stop()}}),e)})))()}}}),h=n(75),d=n(92),m=n.n(d),f=n(191),v=n(432),x=n(419),I=n(508),S=(n(11),n(12),n(14),n(18),n(10),n(19),n(25)),y=n(2),_=(n(91),n(202),n(47),n(33),n(56),n(74),n(196),n(197),n(433),n(423)),w=(n(65),n(443)),C=n(69),D=n(1);function k(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(object);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,n)}return e}function O(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?k(Object(source),!0).forEach((function(e){Object(y.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):k(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var j=O(O({},_.b),{},{offsetY:!0,offsetOverflow:!0,transition:!1}),L=_.a.extend({name:"v-autocomplete",props:{allowOverflow:{type:Boolean,default:!0},autoSelectFirst:{type:Boolean,default:!1},filter:{type:Function,default:function(t,e,n){return n.toLocaleLowerCase().indexOf(e.toLocaleLowerCase())>-1}},hideNoData:Boolean,menuProps:{type:_.a.options.props.menuProps.type,default:function(){return j}},noFilter:Boolean,searchInput:{type:String}},data:function(){return{lazySearch:this.searchInput}},computed:{classes:function(){return O(O({},_.a.options.computed.classes.call(this)),{},{"v-autocomplete":!0,"v-autocomplete--is-selecting-index":this.selectedIndex>-1})},computedItems:function(){return this.filteredItems},selectedValues:function(){var t=this;return this.selectedItems.map((function(e){return t.getValue(e)}))},hasDisplayedItems:function(){var t=this;return this.hideSelected?this.filteredItems.some((function(e){return!t.hasItem(e)})):this.filteredItems.length>0},currentRange:function(){return null==this.selectedItem?0:String(this.getText(this.selectedItem)).length},filteredItems:function(){var t=this;return!this.isSearching||this.noFilter||null==this.internalSearch?this.allItems:this.allItems.filter((function(e){var n=Object(D.r)(e,t.itemText),text=null!=n?String(n):"";return t.filter(e,String(t.internalSearch),text)}))},internalSearch:{get:function(){return this.lazySearch},set:function(t){this.lazySearch!==t&&(this.lazySearch=t,this.$emit("update:search-input",t))}},isAnyValueAllowed:function(){return!1},isDirty:function(){return this.searchIsDirty||this.selectedItems.length>0},isSearching:function(){return this.multiple&&this.searchIsDirty||this.searchIsDirty&&this.internalSearch!==this.getText(this.selectedItem)},menuCanShow:function(){return!!this.isFocused&&(this.hasDisplayedItems||!this.hideNoData)},$_menuProps:function(){var t=_.a.options.computed.$_menuProps.call(this);return t.contentClass="v-autocomplete__content ".concat(t.contentClass||"").trim(),O(O({},j),t)},searchIsDirty:function(){return null!=this.internalSearch&&""!==this.internalSearch},selectedItem:function(){var t=this;return this.multiple?null:this.selectedItems.find((function(i){return t.valueComparator(t.getValue(i),t.getValue(t.internalValue))}))},listData:function(){var data=_.a.options.computed.listData.call(this);return data.props=O(O({},data.props),{},{items:this.virtualizedItems,noFilter:this.noFilter||!this.isSearching||!this.filteredItems.length,searchInput:this.internalSearch}),data}},watch:{filteredItems:"onFilteredItemsChanged",internalValue:"setSearch",isFocused:function(t){t?(document.addEventListener("copy",this.onCopy),this.$refs.input&&this.$refs.input.select()):(document.removeEventListener("copy",this.onCopy),this.blur(),this.updateSelf())},isMenuActive:function(t){!t&&this.hasSlot&&(this.lazySearch=null)},items:function(t,e){e&&e.length||!this.hideNoData||!this.isFocused||this.isMenuActive||!t.length||this.activateMenu()},searchInput:function(t){this.lazySearch=t},internalSearch:"onInternalSearchChanged",itemText:"updateSelf"},created:function(){this.setSearch()},destroyed:function(){document.removeEventListener("copy",this.onCopy)},methods:{onFilteredItemsChanged:function(t,e){var n=this;if(t!==e){if(!this.autoSelectFirst){var l=e[this.$refs.menu.listIndex];l?this.setMenuIndex(t.findIndex((function(i){return i===l}))):this.setMenuIndex(-1),this.$emit("update:list-index",this.$refs.menu.listIndex)}this.$nextTick((function(){n.internalSearch&&(1===t.length||n.autoSelectFirst)&&(n.$refs.menu.getTiles(),n.autoSelectFirst&&t.length&&(n.setMenuIndex(0),n.$emit("update:list-index",n.$refs.menu.listIndex)))}))}},onInternalSearchChanged:function(){this.updateMenuDimensions()},updateMenuDimensions:function(){this.isMenuActive&&this.$refs.menu&&this.$refs.menu.updateDimensions()},changeSelectedIndex:function(t){this.searchIsDirty||(this.multiple&&t===D.x.left?-1===this.selectedIndex?this.selectedIndex=this.selectedItems.length-1:this.selectedIndex--:this.multiple&&t===D.x.right?this.selectedIndex>=this.selectedItems.length-1?this.selectedIndex=-1:this.selectedIndex++:t!==D.x.backspace&&t!==D.x.delete||this.deleteCurrentItem())},deleteCurrentItem:function(){var t=this.selectedIndex,e=this.selectedItems[t];if(this.isInteractive&&!this.getDisabled(e)){var n=this.selectedItems.length-1;if(-1!==this.selectedIndex||0===n){var l=t!==this.selectedItems.length-1?t:t-1;this.selectedItems[l]?this.selectItem(e):this.setValue(this.multiple?[]:null),this.selectedIndex=l}else this.selectedIndex=n}},clearableCallback:function(){this.internalSearch=null,_.a.options.methods.clearableCallback.call(this)},genInput:function(){var input=w.a.options.methods.genInput.call(this);return input.data=Object(C.a)(input.data,{attrs:{"aria-activedescendant":Object(D.p)(this.$refs.menu,"activeTile.id"),autocomplete:Object(D.p)(input.data,"attrs.autocomplete","off")},domProps:{value:this.internalSearch}}),input},genInputSlot:function(){var slot=_.a.options.methods.genInputSlot.call(this);return slot.data.attrs.role="combobox",slot},genSelections:function(){return this.hasSlot||this.multiple?_.a.options.methods.genSelections.call(this):[]},onClick:function(t){this.isInteractive&&(this.selectedIndex>-1?this.selectedIndex=-1:this.onFocus(),this.isAppendInner(t.target)||this.activateMenu())},onInput:function(t){if(!(this.selectedIndex>-1)&&t.target){var e=t.target,n=e.value;e.value&&this.activateMenu(),this.multiple||""!==n||this.deleteCurrentItem(),this.internalSearch=n,this.badInput=e.validity&&e.validity.badInput}},onKeyDown:function(t){var e=t.keyCode;!t.ctrlKey&&[D.x.home,D.x.end].includes(e)||_.a.options.methods.onKeyDown.call(this,t),this.changeSelectedIndex(e)},onSpaceDown:function(t){},onTabDown:function(t){_.a.options.methods.onTabDown.call(this,t),this.updateSelf()},onUpDown:function(t){t.preventDefault(),this.activateMenu()},selectItem:function(t){_.a.options.methods.selectItem.call(this,t),this.setSearch()},setSelectedItems:function(){_.a.options.methods.setSelectedItems.call(this),this.isFocused||this.setSearch()},setSearch:function(){var t=this;this.$nextTick((function(){t.multiple&&t.internalSearch&&t.isMenuActive||(t.internalSearch=!t.selectedItems.length||t.multiple||t.hasSlot?null:t.getText(t.selectedItem))}))},updateSelf:function(){(this.searchIsDirty||this.internalValue)&&(this.multiple||this.valueComparator(this.internalSearch,this.getValue(this.internalValue))||this.setSearch())},hasItem:function(t){return this.selectedValues.indexOf(this.getValue(t))>-1},onCopy:function(t){var e,n;if(-1!==this.selectedIndex){var l=this.selectedItems[this.selectedIndex],o=this.getText(l);null==(e=t.clipboardData)||e.setData("text/plain",o),null==(n=t.clipboardData)||n.setData("text/vnd.vuetify.autocomplete.item+plain",o),t.preventDefault()}}}});function T(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(object);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,n)}return e}function V(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?T(Object(source),!0).forEach((function(e){Object(y.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):T(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var M=L.extend({name:"v-combobox",props:{delimiters:{type:Array,default:function(){return[]}},returnObject:{type:Boolean,default:!0}},data:function(){return{editingIndex:-1}},computed:{computedCounterValue:function(){return this.multiple?this.selectedItems.length:(this.internalSearch||"").toString().length},hasSlot:function(){return _.a.options.computed.hasSlot.call(this)||this.multiple},isAnyValueAllowed:function(){return!0},menuCanShow:function(){return!!this.isFocused&&(this.hasDisplayedItems||!!this.$slots["no-data"]&&!this.hideNoData)},searchIsDirty:function(){return null!=this.internalSearch}},methods:{onInternalSearchChanged:function(t){if(t&&this.multiple&&this.delimiters.length){var e=this.delimiters.find((function(e){return t.endsWith(e)}));null!=e&&(this.internalSearch=t.slice(0,t.length-e.length),this.updateTags())}this.updateMenuDimensions()},genInput:function(){var input=L.options.methods.genInput.call(this);return delete input.data.attrs.name,input.data.on.paste=this.onPaste,input},genChipSelection:function(t,e){var n=this,l=_.a.options.methods.genChipSelection.call(this,t,e);return this.multiple&&(l.componentOptions.listeners=V(V({},l.componentOptions.listeners),{},{dblclick:function(){n.editingIndex=e,n.internalSearch=n.getText(t),n.selectedIndex=-1}})),l},onChipInput:function(t){_.a.options.methods.onChipInput.call(this,t),this.editingIndex=-1},onEnterDown:function(t){t.preventDefault(),this.getMenuIndex()>-1||this.$nextTick(this.updateSelf)},onKeyDown:function(t){var e=t.keyCode;!t.ctrlKey&&[D.x.home,D.x.end].includes(e)||_.a.options.methods.onKeyDown.call(this,t),this.multiple&&e===D.x.left&&0===this.$refs.input.selectionStart?this.updateSelf():e===D.x.enter&&this.onEnterDown(t),this.changeSelectedIndex(e)},onTabDown:function(t){if(this.multiple&&this.internalSearch&&-1===this.getMenuIndex())return t.preventDefault(),t.stopPropagation(),this.updateTags();L.options.methods.onTabDown.call(this,t)},selectItem:function(t){this.editingIndex>-1?this.updateEditing():(L.options.methods.selectItem.call(this,t),this.internalSearch&&this.multiple&&this.getText(t).toLocaleLowerCase().includes(this.internalSearch.toLocaleLowerCase())&&(this.internalSearch=null))},setSelectedItems:function(){null==this.internalValue||""===this.internalValue?this.selectedItems=[]:this.selectedItems=this.multiple?this.internalValue:[this.internalValue]},setValue:function(t){_.a.options.methods.setValue.call(this,void 0===t?this.internalSearch:t)},updateEditing:function(){var t=this,e=this.internalValue.slice(),n=this.selectedItems.findIndex((function(e){return t.getText(e)===t.internalSearch}));if(n>-1){var l="object"===Object(S.a)(e[n])?Object.assign({},e[n]):e[n];e.splice(n,1),e.push(l)}else e[this.editingIndex]=this.internalSearch;this.setValue(e),this.editingIndex=-1,this.internalSearch=null},updateCombobox:function(){this.searchIsDirty&&(this.internalSearch!==this.getText(this.internalValue)&&this.setValue(),(Boolean(this.$scopedSlots.selection)||this.hasChips)&&(this.internalSearch=null))},updateSelf:function(){this.multiple?this.updateTags():this.updateCombobox()},updateTags:function(){var t=this,e=this.getMenuIndex();if(!(e<0&&!this.searchIsDirty||!this.internalSearch)){if(this.editingIndex>-1)return this.updateEditing();var n=this.selectedItems.findIndex((function(e){return t.internalSearch===t.getText(e)})),l=n>-1&&"object"===Object(S.a)(this.selectedItems[n])?Object.assign({},this.selectedItems[n]):this.internalSearch;if(n>-1){var o=this.internalValue.slice();o.splice(n,1),this.setValue(o)}if(e>-1)return this.internalSearch=null;this.selectItem(l),this.internalSearch=null}},onPaste:function(t){var e;if(this.multiple&&!this.searchIsDirty){var n=null==(e=t.clipboardData)?void 0:e.getData("text/vnd.vuetify.autocomplete.item+plain");n&&-1===this.findExistingIndex(n)&&(t.preventDefault(),_.a.options.methods.selectItem.call(this,n))}},clearableCallback:function(){this.editingIndex=-1,L.options.methods.clearableCallback.call(this)}}}),$=n(512),P=n(189),A=n(414),component=Object(h.a)(c,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("v-row",[n("v-col",{staticClass:"col-12"},[n("v-card",{attrs:{elevation:"1"}},[n("v-card-title",[t._v("\n                Add new record\n              ")]),t._v(" "),n("v-card-subtitle",[t._v("\n                Search for new records in your dataset and add to active listing with ease\n              ")]),t._v(" "),n("v-card-text",[n("v-row",[n("v-col",[n("label",{staticClass:"text-subtitle-1 mb-2"},[t._v("\n              \t\t\tMake\n              \t\t")]),t._v(" "),n("v-combobox",{attrs:{name:"category",items:t.makes.map((function(t){return t.make})),clearable:"",outlined:""},on:{change:t.getMakeModels},scopedSlots:t._u([{key:"item",fn:function(e){var l=e.item;return[n("div",{staticClass:"d-flex justify-space-between",staticStyle:{width:"100%"}},[n("p",{staticClass:"ma-0"},[t._v("\n\t\t\t"+t._s(l)+" \n\t\t")]),t._v(" "),n("b",[t._v("\n\t\t\t"+t._s(t.getMakeCount(l))+"\n\t\t")])])]}}]),model:{value:t.new_listing.make,callback:function(e){t.$set(t.new_listing,"make",e)},expression:"new_listing.make"}})],1),t._v(" "),n("v-col",[n("label",{staticClass:"text-subtitle-1"},[t._v("\n              \t\t\tModel\n              \t\t")]),t._v(" "),n("v-combobox",{attrs:{items:t.models.map((function(t){return t.model})),clearable:"",outlined:""},on:{change:t.getmodelYearsList},scopedSlots:t._u([{key:"item",fn:function(e){var l=e.item;return[n("div",{staticClass:"d-flex justify-space-between",staticStyle:{width:"100%"}},[n("p",{staticClass:"ma-0"},[t._v("\n\t\t\t"+t._s(l)+" \n\t\t")])])]}}]),model:{value:t.new_listing.model,callback:function(e){t.$set(t.new_listing,"model",e)},expression:"new_listing.model"}})],1),t._v(" "),n("v-col",[n("label",{staticClass:"text-subtitle-1"},[t._v("\n              \t\t\tYear\n              \t\t")]),t._v(" "),n("v-combobox",{attrs:{items:t.modelYearsList.map((function(t){return t.year})),clearable:"",outlined:""},on:{change:t.getmodelTrimList},scopedSlots:t._u([{key:"item",fn:function(e){var l=e.item;return[n("div",{staticClass:"d-flex justify-space-between",staticStyle:{width:"100%"}},[n("p",{staticClass:"ma-0"},[t._v("\n\t\t\t"+t._s(l)+" \n\t\t")])])]}}]),model:{value:t.new_listing.year,callback:function(e){t.$set(t.new_listing,"year",e)},expression:"new_listing.year"}})],1),t._v(" "),n("v-col",[n("label",{staticClass:"text-subtitle-1"},[t._v("\n              \t\t\tTrim\n              \t\t")]),t._v(" "),n("v-combobox",{attrs:{items:t.modelTrimList.map((function(t){return t.trim})),clearable:"",outlined:""},scopedSlots:t._u([{key:"item",fn:function(e){var l=e.item;return[n("div",{staticClass:"d-flex justify-space-between",staticStyle:{width:"100%"}},[n("p",{staticClass:"ma-0"},[t._v("\n\t\t\t"+t._s(l)+" \n\t\t")])])]}}]),model:{value:t.new_listing.trim,callback:function(e){t.$set(t.new_listing,"trim",e)},expression:"new_listing.trim"}})],1),t._v(" "),n("v-col",[n("label",{staticClass:"text-subtitle-1"},[t._v("\n              \t\t\t \n              \t\t")]),t._v(" "),n("v-btn",{staticStyle:{height:"55px",width:"100%"},attrs:{depressed:"",color:"primary"},on:{click:t.addNewListing}},[t._v("\n\t\t\t\t      Add\n\t\t\t\t    ")])],1)],1)],1)],1)],1),t._v(" "),n("v-col",{staticClass:"mb-3 col-12"},[n("v-card",{attrs:{elevation:"1"}},[n("v-card-title",[t._v("\n                Active listings \n              ")]),t._v(" "),n("v-card-subtitle",[t._v("\n                Records in this table will be used by automation scripts as a feed source\n              ")]),t._v(" "),n("v-data-table",{staticClass:"elevation-1",attrs:{headers:t.headers,items:t.listings,"items-per-page":10},scopedSlots:t._u([{key:"item",fn:function(e){return[n("tr",[n("td",[t._v(t._s(e.item.make||"---"))]),t._v(" "),n("td",[t._v(t._s(e.item.model||"---"))]),t._v(" "),n("td",[t._v(t._s(e.item.year||"---"))]),t._v(" "),n("td",[t._v(t._s(e.item.trim||"---"))]),t._v(" "),n("td",[t._v(t._s(t.$moment(e.item.createdAt).format("YYYY-MM-DD hh:mm A")))]),t._v(" "),n("td",[t._v(t._s(e.item.createdBy))]),t._v(" "),n("td",[n("v-btn",{staticStyle:{width:"35px"},attrs:{text:"",small:"",color:"red"},on:{click:function(n){return t.deleteListing(e.item._key)}}},[n("v-icon",[t._v("mdi-delete")])],1)],1)])]}}])})],1)],1)],1)],1)}),[],!1,null,null,null);e.default=component.exports;m()(component,{VBtn:f.a,VCard:v.a,VCardSubtitle:x.b,VCardText:x.c,VCardTitle:x.d,VCol:I.a,VCombobox:M,VDataTable:$.a,VIcon:P.a,VRow:A.a})}}]);