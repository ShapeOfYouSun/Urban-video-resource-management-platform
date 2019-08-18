window.$(function() {
    // 页面变量对象
    let page = {}, // 页面检索条件对象
        $table = {}; // 页面table对象: 任务管理

    // 页面检索条件task manage search condition对象
    let $taskSearchIpt = window.$('#taskManage-container #task-search-container input:first-child'), // 快捷检索input
        $taskSearchBtn = window.$('#taskManage-container #task-search-container button'), // 快捷检索button
        $taskAdvancedSearchBtn = window.$('#taskManage-container #task-advanced-search-container button'), // 高级检索button
        $taskStartBtn = window.$('#taskManage-container #task-operation-container button#task-start'), // 任务开始按钮
        $taskStopBtn = window.$('#taskManage-container #task-operation-container button#task-stop'), // 任务停止按钮
        $taskDeleteBtn = window.$('#taskManage-container #task-operation-container button#task-delete'), // 任务删除按钮
        $taskAddBtn = window.$('#taskManage-container #task-add button'); // 任务新增按钮

    // 页面table:
    let $tableContainer = window.$('#taskManage-container #task-table'); // 任务管理table container

    // 任务状态map
    let taskStatusMapping = { 0: '异常', 1: '未开启', 2: '正在开启', 3: '正在排队', 4: '暂停', 5: '正在处理', 6: '处理完成' };

    // 根据状态string获取状态num
    function numStatus(statusStr) {
        for (let key in taskStatusMapping) {
            if (taskStatusMapping.hasOwnProperty(key) && taskStatusMapping[key] === statusStr) {
                return key;
            }
        }
    }

    // 根据状态num获取状态str
    function strStatus(statusNum) {
        return taskStatusMapping[statusNum];
    }

    // 当前页面快捷检索条件对象, 如果么有当前条件, 则为空对象
    function tempObj() {
        let condition = { name: undefined, startTime: undefined, endTime: undefined, state: undefined },
            conditionStr = $taskSearchIpt.val().trim(),
            conditionArray = conditionStr.split('');
        for (let i = 0, len = conditionArray.length; i < len; i ++) {
            let current = conditionArray[i], next = conditionArray[i + 1]; // next可能是undefined
            if (current.startsWith('开始时间：')) { // start
                condition.startTime = current.substring(5) + next; i ++;
            } else if (current.startsWith('结束时间：')) { // end
                condition.endTime = current.substring(5) + next; i ++;
            } else if (current.startsWith('任务状态：')) { // status
                condition.state = numStatus(current);
            } else { // name
                condition.name = current;
            }
        }
        return condition;
    }

    // 获取当前页面的某个条件, 如果不存在该条件, 则为undefined
    function get(type) {
        return tempObj()[type];
    }

    // 设置当前页面的某个条件
    function set(type, value) {
        let temp = tempObj(), conditionStr = '';
        temp[type] = value;
        for (let key in temp) {
            if (temp.hasOwnProperty(key) && temp[key] !== undefined && temp[key] !== null && temp[key] !== '') {
                if (key === 'name') {
                    conditionStr += (temp[key] + ' ');
                } else if (key === 'startTime') {
                    conditionStr += ('开始时间：' + temp[key] + ' ');
                } else if (key === 'endTime') {
                    conditionStr += ('结束时间：' + temp[key] + ' ');
                } else if (key === 'state') {
                    conditionStr += ('状态：' + strStatus(temp[key]) + ' ');
                }
            }
        }
        $taskSearchIpt.val(conditionStr);
    }

    // 页面检索条件: name/startTime/endTime/state
    Object.defineProperties(page, {
        name: {
            get: function() {
                get('name');
            },
            set: function(newValue) {
                set('name', newValue);
            }
        },
        state: {
            get: function() {
                get('state');
            },
            set: function(newValue) {
                set('state', newValue);
            }
        },
        startTime: {
            get: function() {
                get('startTime');
            },
            set: function(newValue) {
                set('startTime', newTime);
            }
        },
        endTime: {
            get: function() {
                get('endTime');
            },
            set: function(newValue) {
                set('endTime', newValue);
            }
        }
    });

    // task table 初始化
    $table = new Table($tableContainer, {
        classes: 'table table-hover table-striped table-responsive',
        theadClasses: 'dark',
        undefinedText: '',
        locale: 'zh-CN',
        url: 'dev/taskInfo.json',
        method: 'post',
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        queryParams: function(params) {
            let result = {};
            page.state && (result.status = page.state);
            page.name && (result.taskName = page.name);
            if (page.startTime || page.endTime) {
                result.createTime = {};
                page.startTime && (result.createTime.startTime = page.startTime);
                page.endTime && (result.createTime.endTime = page.endTime);
            }
            result.offset = (params.pageNumber - 1) * params.pageSize;
            result.size = params.pageSize;
            return result;
        },
        queryParamsType: '', // queryParams中参数: pageSize, pageNumber, searchText, sortOrder
        responseHandler: function(res) {
            return res.data;
        },
        totalField: 'count',
        dataField: 'tasks',
        pagination: true,
        paginationLoop: false,
        sidePagination: 'server',
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50],
        showFooter: true,
        idField: 'taskId',
        clickToSelect: true,
        onCheck: function(row, $elt) {},
        onUncheck: function(row, $elt) {},
        onCheckAll: function(rowsAfter, rowsBefore) {},
        onUncheckAll: function(rowsAfter, rowsBefore) {},
        columns: [{
            checkbox: true,
            clickToSelect: true,
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '序号',
            formatter: function (value, row, index, field) {
                return index + 1;
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '任务名称',
            field: 'taskName',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '输入数据类型',
            formatter: function(value, row, index, field) {
                let result = window.$('<span></span>');
                if (Number(row.dataType) === 0) {
                    result.text('视频文件');
                } else if (Number(row.dataType) === 1) {
                    result.text('视频流');
                }
                return result[0].outerHTML;
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '输入数据量',
            field: 'inputDataNum',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '创建时间',
            field: 'createTime',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '处理状态',
            formatter: function(value, row, index, field) {
                let result = window.$('<span></span>');
                switch(Number(row.status)) {
                    case 0:
                        result.text('异常'); break;
                    case 1:
                        result.text('未开启'); break;
                    case 2:
                        result.text('正在开启...'); break;
                    case 3:
                        result.text('正在排队...'); break;
                    case 4:
                        result.text('暂停中...'); break;
                    case 5:
                        result.text('正在处理...'); break;
                    case 6:
                        result.text('处理完成'); break;
                    default:
                        result.text('系统异常'); break;
                }
                return result[0].outerHTML;
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '操作',
            formatter: function(value, row, index, field) {
                return '';
            },
            events: {},
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }]
    });
    $table.init();
    $table.create();
});