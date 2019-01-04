'use strict'

const model = {
    days: 10,
    students: [ '', '', '', ''],

    get_data: function get_data() {
        return JSON.parse(localStorage.student_atend);
    },

    set_data: function set_data(new_data) {
        localStorage.student_atend = JSON.stringify(new_data);
    },

    check_data: function chcek_data() {
        return (localStorage.student_atend);
    },

    delete_data: function delete_data() {
        localStorage.removeItem('student_atend');
    }
};

class CreateContent
{
    constructor(data, template, entry, where = 'beforeend') {
        this.data           = data;
        this.template_class = template;
        this.entry_node     = document.querySelector(entry);
        this.where          = where;
    }

    _getTemplate() {
        // incerment by 1 helper - used for table header row
        Handlebars.registerHelper("inc", function(value, options) {
                return parseInt(value) + 1;
        });

        const html = document.querySelector(this.template_class).innerHTML;
        const compiled_html = Handlebars.compile(html);
        return compiled_html;
    }

    _insertHTML(html) {
        this.entry_node.insertAdjacentHTML(this.where, html);
    }

    create_HTML() {
        let compiled_html       = '';
        const compiled_template = this._getTemplate();

        if (this._isIterable(this.data)) {
            for (let content of this.data) {
                compiled_html = compiled_html + compiled_template(content);
            }
        } else {
            compiled_html = compiled_template(this.data);
        }
        this._insertHTML(compiled_html);
    }

    _isIterable(obj) {
        // checks for null and undefined
        if (obj == null) {
          return false;
        }
        //check if is iterable
        return typeof obj[Symbol.iterator] === 'function';
    }
};

const main = {
    init: function init() {
        if (model.check_data()) {
            main.init_view_table();

            //show reinit button
            view_admin.reinit_toggle();
        } else {
            view_admin.init();
        }
    },

    // view table

    init_view_table: function init_table() {
        this._init_localstorage();

        view_table.init();
    },

    reinit_view_table: function reinit_view_table() {
        view_admin.reinit_toggle();
        view_table.clear();

        this._delete_data();
        this.init();
    },

    // manipulate model

    _init_localstorage: function init_localstorage() {
        if (!model.check_data()) {
            console.log('Creating attendance records...');
            function getRandom() {
                return (Math.random() >= 0.5);
            }

            let attendance = [];
            for (let name of model.students) {
                let array = [];
                let sumarry = 0;

                for (var i = 0; i <= (model.days - 1); i++) {
                    let a = getRandom();
                    (a === false) ? sumarry = sumarry + 1 : '';
                    array.push(a);
                }

                let object = {
                    name: name,
                    attend: array,
                    missed: sumarry
                };
                attendance.push(object);
            }
            model.set_data(attendance);
        }
    },

    get_data: function() {
        return model.get_data();
    },

    set_data: function(data) {
        model.set_data(data);
    },

    _delete_data: function() {
        model.delete_data();
    },

    update_data: function(student, array, sum) {
        let data = this.get_data();
        let data_object = {
            name: student,
            attend: array,
            missed: sum
        }

        //replace current student data in data array
        for (var i = 0; i <= (data.length - 1); i++) {
            if (data[i].name === student) {
                data[i] = data_object;
            }
        }
        model.set_data(data);
    },

    // data manipulation for view_admin functionality

    get_init_data: function get_init() {
        const data = {
            days: model.days,
            students: model.students
        }
        return data;
    },

    set_init_data: function(days, students) {
        model.days = days;
        model.students = students;

        main.init_view_table();
    },

};

const view_table = {
    init: function() {
        this.attend    = main.get_data();
        this.node_days = document.querySelector('.days');
        this.node_data = document.querySelector('.data');

        //remove old data
        this.clear();

        this._init_render();
        this._set_listener();
    },

    _init_render: function() {
        //table header row
        const days = new CreateContent(this.attend[0], '.days_template', '.days');
        days.create_HTML();

        //table data rows
        const content = new CreateContent(this.attend, '.atend_template', '.data');
        content.create_HTML();
    },

    _set_listener: function set_listener() {
        // When a checkbox is clicked, update localStorage
        window.addEventListener('change', function(e) {
            (e.target.type === 'checkbox') ? view_table._set_missing(e.target) : '';
        })
    },

    clear: function() {
        while (this.node_days.firstChild) {
            this.node_days.removeChild(this.node_days.firstChild);
        }
        while (this.node_data.firstChild) {
            this.node_data.removeChild(this.node_data.firstChild);
        }
    },

    // set value of missing column
    _set_missing: function(target) {
        let missed_col = target.parentNode.parentNode.parentNode.querySelector('.missed-col');
        let data_key   = target.parentNode.parentNode.parentNode.dataset.key;

        if (target.checked) {
            missed_col.textContent =  parseInt(missed_col.textContent) - 1;
        } else {
            missed_col.textContent =  parseInt(missed_col.textContent) + 1;
        }

        this._row_data(data_key);
    },

    // get nodes for calculating new object of complete row data.
    _row_data: function(student) {
        const row_node        = document.querySelector(`[data-key='${student}']`);
        const row_input_nodes = row_node.querySelectorAll('input');
        const sum             = row_node.querySelector('.missed-col').innerHTML;
        let   array           = [];

        for (let chbox of row_input_nodes) {
            array.push(chbox.checked);
        }

        main.update_data(student, array, sum);
    },
};

const view_admin = {
    init: function() {
        this.visible = true;
        this._init_render();

        this.node_days   = document.querySelector('input[name="days"]');
        this.node_submit = document.querySelector('input[name="submit"]');
        this.node_add    = document.querySelector('input[name="add"]');

        this._set_listeners();
    },

    _init_render: function _init_render() {
        this.template  = '.admin_template';
        this.init_data = main.get_init_data();

        //table header row
        const days = new CreateContent(this.init_data, this.template, '.days');
        days.create_HTML();
    },

    _set_listeners: function _set_listeners() {
        // listen to the events on the form elements
        this.node_add.addEventListener('click', function() {
            view_admin.add_row();
        });

        this.node_submit.addEventListener('click', function() {
            view_admin._submit();
        });

        // window.addEventListener('change', function(e) {
        //     console.log(e.target);
        //     // (e.target.type === 'checkbox') ? view_table._set_missing(e.target) : '';
        // })
    },

    add_row: function add_row() {
        this.row_template  = '.row_template';
        this.where         = 'beforebegin';
        const n = document.querySelectorAll('input[name="name"]').length + 1;

        //table header row
        const new_row = new CreateContent([n], this.row_template, '.add_stud', this.where);
        new_row.create_HTML();
    },

    _submit: function _submit() {
        const node_names  = document.querySelectorAll('input[name="name"]');
        let names = [];
        for (let name of node_names) {

            if (name.value != '') {
                names.push(name.value);
            }
        }
        if (names === []) {
            names = ['student1'];
        }
        main.set_init_data(this.node_days.value, names);
        this.reinit_toggle();
    },

    reinit_toggle: function reinit_toggle() {
        const node_btn = document.querySelector('.reinit');
        node_btn.classList.toggle('hidden');
    }

    // cancel: function() {
    //     this.btn_admin.classList.toggle('hidden');
    //     const node = this.admin_form;
    //     node.parentNode.removeChild(node);
    //     this.visible = false;
    // }


}

main.init();


