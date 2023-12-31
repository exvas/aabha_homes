// Copyright (c) 2023, sammish and contributors
// For license information, please see license.txt

frappe.ui.form.on("Site Wages", {
	onload(frm) {
        frm.set_query('supervisor_name', function(frm){
            return{
                filters:{
                    custom_is_supervisor:1
                }
            }
        })
        frm.set_query('cost_center', function(frm){
            return{
                filters:{
                    is_group:0,
                    disabled:0
                }
            }
        })
        frm.fields_dict['site_wages_details'].grid.get_field('workers_name').get_query = function(frm, cdt, cdn){
            return {
                filters:{
                    custom_is_worker:1
                }
            }
        }
	},
    get_site_entry(frm){
        if(!frm.doc.cost_center){
            frappe.throw("Please select a cost center")
        }
        frappe.xcall("aabha_homes.aabha_homes.utils.get_total_emp_wages", {
            costCenter:frm.doc.cost_center
        }).then(msg=>{
            frm.set_value("site_wages_details", "")
            frm.set_value("site_wages_project_wise_total", "")
            msg.data.forEach(el=>{
                frm.add_child("site_wages_details", el)
            })
            frm.refresh_field("site_wages_details")
            msg.data_split.forEach(el=>{
                frm.add_child("site_wages_project_wise_total", el)
            })
            frm.refresh_field("site_wages_project_wise_total")
            frm.set_value("supervisor_name", msg.supervisor_name)
        })
    },
    create_je(frm){
        frappe.xcall("aabha_homes.aabha_homes.utils.create_sw_je", {
            costCenter:frm.doc.cost_center,
            docName: frm.doc.name
        })
    }
});

frappe.ui.form.on("Site Wages Details", {
    net_pay(frm, cdt, cdn){
        let row = locals[cdt][cdn]
        row.balance = row.original_net_pay - row.net_pay
        frm.refresh_field("site_wages_details")
    },
    before_site_wages_details_remove(frm, cdt, cdn){
        let row = locals[cdt][cdn]
        const splitup = frm.doc.site_wages_project_wise_total.slice()
        let newData = []
        for(let i=0; i<splitup.length; i++){
            if(splitup[i].workers_name != row.workers_name){
                newData.push(splitup[i])
            }
        }
        frm.doc.site_wages_project_wise_total = newData
        frm.refresh_field("site_wages_project_wise_total")
    }
})
