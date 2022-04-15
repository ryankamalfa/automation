(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{522:function(t,e,n){"use strict";n.r(e);n(67);var l=n(76),r=n.n(l),c={name:"automation",middleware:"auth",data:function(){return{config:{type:"automation",cron_time:null,notification_emails:null},last_run:{}}},fetch:function(){this.getConfig(),this.getLastRun()},mounted:function(){var t=this;setInterval((function(){"/automation"===location.pathname&&t.getLastRun()}),1e4)},methods:{getConfig:function(){var t=this;r.a.get("/api/config/get?type=automation").then((function(e){console.log(e.data.config),e.data.config&&(t.config=e.data.config)})).catch((function(t){console.log(t)}))},getLastRun:function(){var t=this;r.a.get("/api/config/get?type=last_run").then((function(e){console.log(e.data.config),e.data.config&&(t.last_run=e.data.config)})).catch((function(t){console.log(t)}))},updateAutomationConfig:function(){var t=this;console.log(this.config),r.a.post("/api/config/update",{config:this.config}).then((function(e){console.log(e.data),t.$toast.success("Saved")})).catch((function(e){console.log(e),t.$toast.error("Something went wrong")}))}}},o=n(75),d=n(93),m=n.n(d),_=n(433),f=n(190),v=n(420),x=n(419),h=n(464),C=n(443),y=n(444),w=n(445),k=n(446),j=n(188),S=n(414),Y=n(456),component=Object(o.a)(c,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("v-row",[n("v-col",{attrs:{cols:"6",offset:"3"}},[n("v-alert",{attrs:{dense:"",type:"error"}},[n("span",{staticClass:"text-uppercase"},[t._v("caution :")]),t._v("\n\t\t\t\t\t\tupdating automation data will force server to restart immediately and service may be unavailable for a few moments\n\t\t\t\t\t")]),t._v(" "),n("v-expansion-panels",[n("v-expansion-panel",[n("v-expansion-panel-header",{staticClass:"text-capitalize"},[t._v("\n\t\t\t        Auto run schedueling\n\t\t\t      ")]),t._v(" "),n("v-expansion-panel-content",[n("form",{on:{submit:function(e){return e.preventDefault(),t.updateAutomationConfig.apply(null,arguments)}}},[n("v-row",[n("v-col",{attrs:{cols:"12"}},[n("v-text-field",{attrs:{label:"Cron job time format",required:"",placeholder:"* * * * * *"},model:{value:t.config.cron_time,callback:function(e){t.$set(t.config,"cron_time",e)},expression:"config.cron_time"}}),t._v(" "),n("small",[t._v("\n\t\t\t\t                \tRead more about CRON jobs or see examples from "),n("a",{attrs:{href:"https://www.npmjs.com/package//node-cron",target:"_blank"}},[t._v("HERE")])])],1),t._v(" "),n("v-col",{attrs:{cols:"12"}},[n("v-btn",{staticStyle:{width:"100%"},attrs:{type:"submit",depressed:"",color:"primary"}},[t._v("\n\t\t\t\t\t\t\t\t      Update\n\t\t\t\t\t\t\t\t    ")])],1)],1)],1)])],1),t._v(" "),n("v-expansion-panel",[n("v-expansion-panel-header",{staticClass:"text-capitalize"},[t._v("\n\t\t\t        Email notification\n\t\t\t      ")]),t._v(" "),n("v-expansion-panel-content",[n("form",{on:{submit:function(e){return e.preventDefault(),t.updateAutomationConfig.apply(null,arguments)}}},[n("v-row",[n("v-col",{attrs:{cols:"12"}},[n("v-text-field",{attrs:{label:"Where to send script notifications in case of success or fail",required:""},model:{value:t.config.notification_emails,callback:function(e){t.$set(t.config,"notification_emails",e)},expression:"config.notification_emails"}}),t._v(" "),n("small",[t._v("\n\t\t\t\t                \tYou can enter multiple emails seperated by comma ( , ) \n\t\t\t\t                ")])],1),t._v(" "),n("v-col",{attrs:{cols:"12"}},[n("v-btn",{staticStyle:{width:"100%"},attrs:{type:"submit",depressed:"",color:"primary"}},[t._v("\n\t\t\t\t\t\t\t\t      Update\n\t\t\t\t\t\t\t\t    ")])],1)],1)],1)])],1)],1),t._v(" "),n("v-card",{staticClass:"mt-4 "},[n("v-card-title",[n("div",{staticClass:"d-flex flex-column justify-center align-center text-capitalize",staticStyle:{width:"100%"}},[n("v-icon",{staticClass:"mt-2 mb-2",attrs:{large:""}},[t._v("mdi-autorenew")]),t._v(" "),n("p",[t._v("\n\t\t\t  \t\t\t\t\tLast run activity\n\t\t\t  \t\t\t\t")])],1)]),t._v(" "),n("v-card-text",[n("div",{staticClass:"d-flex justify-space-between black--text  pl-2 pr-2",staticStyle:{width:"100%"}},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t  \t\t\t\t\tTime\n\t\t  \t\t\t\t")]),t._v(" "),n("p",{staticClass:"small ma-0"},[t._v("\n\t\t  \t\t\t\t\t"+t._s(t.last_run.time?t.$moment(t.last_run.time).format("YYYY-MM-DD hh:mm a"):"---")+"\n\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between black--text pl-2 pr-2",staticStyle:{width:"100%"}},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t  \t\t\t\t\tStatus\n\t\t  \t\t\t\t")]),t._v(" "),"success"===t.last_run.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 green lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tsuccess\n\t\t  \t\t\t\t")]):"failed"===t.last_run.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 red lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tfailed\n\t\t  \t\t\t\t")]):t.last_run.time&&!t.last_run.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 blue lighten-1 rounded dark text-uppercase white--text"},[t._v("\n\t\t  \t\t\t\t\tRunning\n\t\t  \t\t\t\t")]):t._e(),t._v(" "),t.last_run.time||t.last_run.status?t._e():n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 grey lighten-1 rounded dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tUnkown\n\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"mt-3 grey lighten-3 rounded pa-2 black--text elevation-1",staticStyle:{width:"100%"}},[n("p",{staticClass:"mb-2 pb-2 text-uppercase",staticStyle:{"border-bottom":"1px solid #fff"}},[n("b",[t._v("\n\t\t\t  \t\t\t\t\tAutotrader\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tTime\n\t\t\t  \t\t\t\t")]),t._v(" "),n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\t"+t._s(t.last_run.autotrader&&t.last_run.autotrader.time?t.$moment(t.last_run.autotrader.time).format("YYYY-MM-DD hh:mm a"):"---")+"\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tStatus\n\t\t\t  \t\t\t\t")]),t._v(" "),t.last_run.autotrader&&"success"===t.last_run.autotrader.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 green lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tsuccess\n\t\t\t  \t\t\t\t")]):t.last_run.autotrader&&"failed"===t.last_run.autotrader.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 red lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tfailed\n\t\t\t  \t\t\t\t")]):t.last_run.autotrader&&t.last_run.autotrader.time&&!t.last_run.autotrader.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 blue lighten-1 rounded dark text-uppercase white--text"},[t._v("\n\t\t  \t\t\t\t\tRunning\n\t\t  \t\t\t\t")]):t._e(),t._v(" "),!t.last_run.autotrader||t.last_run.autotrader.time||t.last_run.autotrader.status?t._e():n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 grey lighten-1 rounded dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tUnkown\n\t\t  \t\t\t\t")])])]),t._v(" "),n("div",{staticClass:"mt-3 grey lighten-3 rounded pa-2 black--text elevation-1",staticStyle:{width:"100%"}},[n("p",{staticClass:"mb-2 pb-2 text-uppercase",staticStyle:{"border-bottom":"1px solid #fff"}},[n("b",[t._v("\n\t\t\t  \t\t\t\t\tAdesa\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tTime\n\t\t\t  \t\t\t\t")]),t._v(" "),n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\t"+t._s(t.last_run.adesa&&t.last_run.adesa.time?t.$moment(t.last_run.adesa.time).format("YYYY-MM-DD hh:mm a"):"---")+"\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tStatus\n\t\t\t  \t\t\t\t")]),t._v(" "),t.last_run.adesa&&"success"===t.last_run.adesa.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 green lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tsuccess\n\t\t\t  \t\t\t\t")]):t.last_run.adesa&&"failed"===t.last_run.adesa.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 red lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tfailed\n\t\t\t  \t\t\t\t")]):t.last_run.adesa&&t.last_run.adesa.time&&!t.last_run.adesa.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 blue lighten-1 rounded dark text-uppercase white--text"},[t._v("\n\t\t  \t\t\t\t\tRunning\n\t\t  \t\t\t\t")]):t._e(),t._v(" "),!t.last_run.adesa||t.last_run.adesa.time||t.last_run.adesa.status?t._e():n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 grey lighten-1 rounded dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tUnkown\n\t\t  \t\t\t\t")])])]),t._v(" "),n("div",{staticClass:"mt-3 grey lighten-3 rounded pa-2 black--text elevation-1",staticStyle:{width:"100%"}},[n("p",{staticClass:"mb-2 pb-2 text-uppercase",staticStyle:{"border-bottom":"1px solid #fff"}},[n("b",[t._v("\n\t\t\t  \t\t\t\t\tAirtable\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tTime\n\t\t\t  \t\t\t\t")]),t._v(" "),n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\t"+t._s(t.last_run.airtable&&t.last_run.airtable.time?t.$moment(t.last_run.airtable.time).format("YYYY-MM-DD hh:mm a"):"---")+"\n\t\t\t  \t\t\t\t")])]),t._v(" "),n("div",{staticClass:"d-flex justify-space-between"},[n("p",{staticClass:"small ma-0"},[t._v("\n\t\t\t  \t\t\t\t\tStatus\n\t\t\t  \t\t\t\t")]),t._v(" "),t.last_run.airtable&&"success"===t.last_run.airtable.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 green lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tsuccess\n\t\t\t  \t\t\t\t")]):t.last_run.airtable&&"failed"===t.last_run.airtable.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 red lighten-1 rounded white--text dark text-uppercase"},[t._v("\n\t\t\t  \t\t\t\t\tfailed\n\t\t\t  \t\t\t\t")]):t.last_run.airtable&&t.last_run.airtable.time&&!t.last_run.airtable.status?n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 blue lighten-1 rounded dark text-uppercase white--text"},[t._v("\n\t\t  \t\t\t\t\tRunning\n\t\t  \t\t\t\t")]):t._e(),t._v(" "),!t.last_run.airtable||t.last_run.airtable.time||t.last_run.airtable.status?t._e():n("p",{staticClass:"d-flex align-center justify-center small ma-0 pl-2 pr-2 grey lighten-1 rounded dark text-uppercase"},[t._v("\n\t\t  \t\t\t\t\tUnkown\n\t\t  \t\t\t\t")])])]),t._v(" "),n("div",{staticClass:"mt-3 text-center"},[n("p",{staticClass:"ma-0"},[t._v("\n\t\t  \t\t\t\t\tThis report auto update itself every 10 seconds\n\t\t  \t\t\t\t")])])])],1)],1)],1)],1)}),[],!1,null,null,null);e.default=component.exports;m()(component,{VAlert:_.a,VBtn:f.a,VCard:v.a,VCardText:x.c,VCardTitle:x.d,VCol:h.a,VExpansionPanel:C.a,VExpansionPanelContent:y.a,VExpansionPanelHeader:w.a,VExpansionPanels:k.a,VIcon:j.a,VRow:S.a,VTextField:Y.a})}}]);