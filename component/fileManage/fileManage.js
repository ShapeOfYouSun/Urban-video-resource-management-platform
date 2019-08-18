window.$(function () {
    let $tree = {}, // 左侧`行业-单位`树形结构对象
        $table = {}, // 右侧`视频文件`表格对象
        page = {}, // 页面参数容器
        modal = {}, // 高级检索模态框容器
        infoModal = {}, // 视频文件信息modal 页面对象
        currentOperationVideo = null, // 当前编辑或查看详情的Video对象信息
        _condition_industry = null,
        _condition_department = null,
        _departmentByIndustry = {}, // 单位按照行业分类
        _res = null; // 行业 - 单位 响应

// left-container页面selector
    let industrySearchIpt = window.$('.left-container .organization-search input');

// right-container 页面selector
    let fileCommonSearchIpt = window.$('#file-search-container input'),
        fileCommonSearchBtn = window.$('#file-search-container button'),
        fileAdvancedSearchBtn = window.$('#file-advanced-search-container button'),
        fileSortDropDownItem = window.$('#file-sort-container .dropdown-item'),
        fileSortA = window.$('#file-sort-container > a > span'),
        fileSortSpan = window.$('#file-sort-container > div > span'),
        fileFetchOperateBtn = window.$('#file-operate-container #file-fetch'),
        fileDownloadOperateBtn = window.$('#file-operate-container #file-download'),
        fileDeleteOperateBtn = window.$('#file-operate-container #file-delete'),
        fileUploadOpeateBtn = window.$('#file-upload-btn > button');

// 高级检索modal selector
    let modalName = window.$('#file-name input'),
        modalLocation = window.$('#location-name input'),
        modalStartTime = window.$('#time-range #start-time'),
        modalEndTime = window.$('#time-range #end-time'),
        modalIndustry = window.$('#industry select'),
        modalDepartment = window.$('#department select'),
        modalHeaderClose = window.$('#file-manage-tool .modal-header button'),
        modalFooterSearch = window.$('#file-manage-tool .modal-footer button');

// 编辑/详情 modal selector
    let infoModalContent = '#file-info .modal-content',
        infoModalName = '#file-info-name',
        infoModalIndustry = '#file-info-industry',
        infoModalIndustrySelect = '#file-info-industry select',
        infoModalDepartment = '#file-info-department',
        infoModalDepartmentSelect = '#file-info-department select',
        infoModalLocation = '#file-info-location',
        infoModalLocationSelect = '#file-info-location select',
        infoModalTime = '#file-info-time',
        infoModalLength = '#file-info-length',
        infoModalSize = '#file-info-size',
        infoModalSuffix = '#file-info-suffix',
        infoModalOrigin = '#file-info-origin';

    // modal日期时间选择器
    layui.use('laydate', function () {
        let laydate = layui.laydate;

        laydate.render({
            elem: '#start-time',
            type: 'datetime'
        });
        laydate.render({
            elem: '#end-time',
            type: 'datetime'
        });
    });
    // modal 表单元素渲染
    layui.use('form', function () {
        let form = layui.form;
        let tempDepartment = null;
        let endIndustryTrigger = false, endDepartmentTrigger = false;
        form.render();
        form.on('select(industry)', function (data) {
            console.log('fileManage industry is triggered ~');
            if (!endIndustryTrigger) {
                if (data.value) {
                    switchModalDepartmentsByIndustryId(data.value);
                    if (!!tempDepartment) {
                        endDepartmentTrigger = true;
                        modalDepartmentSelectById(tempDepartment);
                    }
                } else {
                    switchModalDepartmentsToAll();
                }
            }
            endIndustryTrigger = false;
        });
        form.on('select(department)', function (data) {
            console.log('fileManage industry is triggered ~');
            if (!endDepartmentTrigger) {
                tempDepartment = data.value;
                if (tempDepartment) {
                    endIndustryTrigger = true;
                    modalIndustrySelectById(findIndustryByDepartmentId(data.value).id);
                }
            }
            endDepartmentTrigger = false;
        });
    });

    // commonSearchIpt中的条件String操作方法: tempObj, get, set
    function tempObj() {
        let temp = {name: null, location: null, start: null, end: null, industry: null, department: null,};
        console.log('fileCommonSearchIpt.value', fileCommonSearchIpt.val());
        let conditionArray = fileCommonSearchIpt.val().trim().split(' ');
        for (let i = 0, len = conditionArray.length; i < len; i ++) {
            let crtValue = conditionArray[i], nextValue = conditionArray[i+1]; // next可能为undefined
            if (crtValue.startsWith('摄像机点位：')) {
                temp.location = crtValue.substring(6);
            } else if (crtValue.startsWith('起始时间：')) {
                temp.start = crtValue.substring(5) + ' ' + nextValue; i ++;
            } else if (crtValue.startsWith('结束时间：')) {
                temp.end = crtValue.substring(5) + ' ' + nextValue; i ++;
            } else if (crtValue.startsWith('行业：')) {
                temp.industry = _condition_industry;
            } else if (crtValue.startsWith('单位：')) {
                temp.department = _condition_department;
            } else {
                temp.name = crtValue;
            }
        }
        return temp;
    }

    function get(key) { // 根据key, 获取value - name:string, location:string, start:string, end:string, industry: {id,name}, department: {id,name}
        return tempObj()[key];
    }

    function set(key, value) { // 设置新的key/value
        let temp = tempObj(), conditionStr = '';
        temp[key] = value;
        if (temp['name']) {
            conditionStr += temp['name'];
            conditionStr += ' ';
        }
        if (temp['location']) {
            conditionStr += '摄像机点位：';
            conditionStr += temp['location'];
            conditionStr += ' ';
        }
        if (temp['start']) {
            conditionStr += '起始时间：';
            conditionStr += temp['start'];
            conditionStr += ' ';
        }
        if (temp['end']) {
            conditionStr += '结束时间：';
            conditionStr += temp['end'];
            conditionStr += ' ';
        }
        if (temp['industry'] && temp['industry'].id && temp['industry'].name) {
            conditionStr += '行业：';
            conditionStr += (temp['industry']['name']);
            conditionStr += ' ';
        }
        if (temp['department'] && temp['department'].id && temp['department'].name) {
            conditionStr += '单位：';
            conditionStr += (temp['department']['name']);
            conditionStr += ' ';

        }
        if (conditionStr !== '') {
            conditionStr = conditionStr.substring(0, conditionStr.length - 1);
        }
        fileCommonSearchIpt.val(conditionStr);
    }

    // 禁用对视频文件的取回、下载、删除操作
    function fileOperationDisable() {
        fileFetchOperateBtn.attr('disabled', true);
        fileDownloadOperateBtn.attr('disabled', true);
        fileDeleteOperateBtn.attr('disabled', true);
    }

    // 启用对视频文件的取回、下载、删除操作
    function fileOperationEnable() {
        fileFetchOperateBtn.attr('disabled', false);
        fileDownloadOperateBtn.attr('disabled', false);
        fileDeleteOperateBtn.attr('disabled', false);
    }

    // fileSortContainer 点击选中某个选项
    function selectSort($elt) {
        fileSortSpan.removeClass('checked'); // 移除所有checked
        $elt.addClass('checked'); // 为新选择的item添加class: checked
        fileSortA.text($elt.text());
    }

    // 根据industryId检索到industryName
    function findIndustryNameById(industryId) {
        let result = null;
        _res.forEach(function (currentValue) {
            if (currentValue.id === industryId) {
                result = currentValue.text;
            }
        });
        return result;
    }

    // 根据单位Id找到其所属的行业对象
    function findIndustryByDepartmentId(departmentId) {
        for (let key in _departmentByIndustry) {
            if (_departmentByIndustry.hasOwnProperty(key)) {
                let temp = _departmentByIndustry[key].findIndex(function (element) {
                    return element.id === departmentId;
                });
                if (temp !== -1) {
                    return {
                        id: key,
                        name: findIndustryNameById(key),
                    }
                }
            }
        }
        console.warn('Can not find the industry with departmentId: ' + departmentId);
        return {};
    }

    // 根据departmentId检索到departmentId
    function findDepartmentNameById(departmentId) {
        let resultName = undefined;
        for (let key in _departmentByIndustry) {
            if (_departmentByIndustry.hasOwnProperty(key)) {
                _departmentByIndustry[key].forEach(function (currentValue) {
                    if (currentValue.id === departmentId) {
                        resultName = currentValue.name;
                    }
                });
            }
        }
        return resultName;
    }

    // modal search industry input select: 模态框内选中某个行业的id
    function modalIndustrySelectById(industryId) {
        window.$('#industry dl.layui-anim.layui-anim-upbit').find('dd[lay-value="' + industryId + '"]').trigger('click');
    }

    // modal search department input select: 模态框内选中某个单位的id
    function modalDepartmentSelectById(departmentId) {
        window.$('#department dl.layui-anim.layui-anim-upbit').find('dd[lay-value="' + departmentId + '"]').trigger('click');
    }

    // 根据行业Id切换Department下拉框内容
    function switchModalDepartmentsByIndustryId(industryId) {
        window.$('#department select').html('<option value="">直接选择或搜索选择</option>');
        _departmentByIndustry[industryId].forEach(function (currentValue) {
            window.$('#department select').append(window.$('<option></option>').attr('value', currentValue.id).text(currentValue.name));
        });
        layui.use('form', function () {
            let form = layui.form;
            form.render();
        });
        return true;
    }

    // 没有行业id时, departments下内容为所有单位
    function switchModalDepartmentsToAll() {
        window.$('#department select').html('<option value="">直接选择或搜索选择</option>');
        for (let key in _departmentByIndustry) {
            if (_departmentByIndustry.hasOwnProperty(key)) {
                _departmentByIndustry[key].forEach(function (currentValue) {
                    window.$('#department select').append(window.$('<option></option>').attr('value', currentValue.id).text(currentValue.name));
                });
            }
        }
        layui.use('form', function () {
            let form = layui.form;
            form.render();
        });
        return true;
    }

    // 编辑单个文件的信息/查看单个文件的详情
    function operateSingleFile(type, videoId) {
        let locationReq = false, fileRecordReq = false;

        let $industryLs, $departmentLs, $locationLs;

        // 行业下拉框构造方法
        function industrySelectCreate(initId) {
            $industryLs = new LinkageSelect('industry', true, 'industry', undefined, function () {
                let result = [];
                _res.forEach(function (currentValue) {
                    result.push({id: currentValue['id'], name: currentValue['text']});
                });
                return result;
            }, {value: 'id', text: 'name'}, [], initId, 'file-info-industry', undefined, function (data) {
                console.log('😈 industry select `onSelect` is triggered: ' + data.value);
                departmentSelectUpdate(data.value, infoModal.department);
            });
            $industryLs.init();
            $industryLs.create();
            $industryLs.replace(window.$(infoModalIndustry));
        }

        // 单位下拉框构造方法
        function departmentSelectCreate(industryId, initId) {
            $departmentLs = new LinkageSelect('department', true, 'department', undefined, function () {
                return _departmentByIndustry[industryId];
            }, {value: 'id', text: 'name'}, [], initId, 'file-info-department', undefined, function (data) {
                console.log('😈 department select `onSelect` is triggered: ' + data.value);
                locationSelectUpdate(industryId, data.value, infoModal.location);
            });
            $departmentLs.init();
            $departmentLs.create();
            $departmentLs.replace(window.$(infoModalDepartment));
        }

        // 单位下拉框更新方法, 行业更新时调用
        function departmentSelectUpdate(industryId, initId) {
            $departmentLs.options(_departmentByIndustry[industryId] || []);
            $departmentLs.val(initId);
            locationSelectUpdate(industryId, infoModal.department, infoModal.location);
        }

        // 设备下拉框构造方法
        function locationSelectCreate(industryId, departmentId, initId, callback) {
            $http.handle('fileManage_equipments', {
                industryId: industryId,
                departmentId: departmentId
            }, undefined, undefined, function (locationResp) {
                $locationLs = new LinkageSelect('equipment', true, 'equipment', undefined, undefined,
                    {
                        value: 'equipmentId',
                        text: 'equipmentName'
                    }, locationResp, initId, 'file-info-location', undefined, function (data) {
                        console.log('😈 location select `onSelect` is triggered: ' + data.value);
                    });
                $locationLs.init();
                $locationLs.create();
                $locationLs.replace(window.$(infoModalLocation));
                if (callback) {
                    callback.call(null);
                }
            }, true);
        }

        // 设备下拉框更新方法
        function locationSelectUpdate(industryId, departmentId, initId, callback) {
            if (industryId === '' || departmentId === '' || industryId === null || departmentId === null) {
                $locationLs.options([]);
                if (callback) {
                    callback.call(null);
                }
                return;
            }
            $http.handle('fileManage_equipments', {
                industryId: industryId,
                departmentId: departmentId
            }, undefined, undefined, function (locationResp) {
                $locationLs.options(locationResp || []);
                $locationLs.val(initId);
                if (callback) {
                    callback.call(null);
                }
            }, false);
        }

        function allAjaxFinished() {
            if (locationReq && fileRecordReq) {
                window.$('aside#file-info').modal('show');
            }
        } // 视频文件信息编辑/详情的5个请求完成之后执行这个函数

        $http.handle('fileManage_fileInfo', {videoId: videoId}, undefined, undefined, function (resp) {

            currentOperationVideo = resp; // 每次点开`编辑/详情`后会改变当前操作的视频文件对象

            if (type === 'edit') {
                window.$(infoModalContent).removeClass('detail').addClass('edit');
            }
            else if (type === 'detail') {
                window.$(infoModalContent).removeClass('edit').addClass('detail');
            }

            // 文件履历信息
            $http.handle('fileManage_fileRecord', {dataId: videoId}, undefined, undefined, function (recordResp) {
                window.$('#info-form #record').remove();
                if (!!recordResp && recordResp.length !== 0) {
                    let recordContainer = window.$('<fieldset></fieldset>').attr('id', 'record').addClass('col-12');
                    let recordRow = window.$('<div></div>').addClass('row');
                    recordRow.append(window.$('<legend></legend>').addClass('col-12').text('文件履历'));
                    recordResp.forEach(function (currentValue) {
                        let tempSr = window.$('<dl></dl>').addClass('col-12');
                        let tempSrRow = window.$('<div></div>').addClass('row');
                        tempSrRow.append(window.$('<dt class="col-6"><label>' + currentValue['disposeName'] + '</label></dt>'))
                            .append(window.$('<dd class="col-6"><span>' + currentValue['disposeTime'] + '</span></dd>'));
                        tempSr.append(tempSrRow);
                        recordRow.append(tempSr);
                    });
                    recordContainer.append(window.$('<hr/>')).append(recordRow);
                    window.$('#info-form').append(recordContainer);
                }
                fileRecordReq = true;
                allAjaxFinished();
            }, true);

            // 文件名称
            window.$(infoModalName).replaceWith(window.$('<span></span>').attr('id', 'file-info-name').text(resp['videoName'] || ''));

            // 行业
            (type === 'edit') ? industrySelectCreate(resp['industryId']) : window.$(infoModalIndustry).replaceWith(window.$('<span></span>').attr('id', 'file-info-industry').text(resp['industryName'] || ''));

            // 单位
            (type === 'edit') ? departmentSelectCreate(resp['industryId'], resp['departmentId']) : window.$(infoModalDepartment).replaceWith(window.$('<span></span>').attr('id', 'file-info-department').text(resp['departmentName'] || ''));

            // 设备
            (type === 'edit') ? locationSelectCreate(resp['industryId'], resp['departmentId'], resp['equipmentId'], function () {
                locationReq = true;
                allAjaxFinished();
            }) : window.$(infoModalLocation).replaceWith(window.$('<span></span>').attr('id', 'file-info-location').text(resp['location']));

            // 文件录制时时间
            window.$(infoModalTime).replaceWith(window.$('<span></span>').attr('id', 'file-info-time').text(resp['recordTime']));

            // 视频文件时长
            let $time = new Time(resp['videoLength'] * 1000), timeText = '';
            $time.init();
            if ($time.year()) {
                timeText += ($time.year() + '年');
            }
            if ($time.month()) {
                timeText += ($time.month() + '月');
            }
            if ($time.day()) {
                timeText += ($time.day() + '日');
            }
            if ($time.hour()) {
                timeText += ($time.hour() + '小时');
            }
            if ($time.minute()) {
                timeText += ($time.minute() + '分钟');
            }
            if ($time.second()) {
                timeText += ($time.second() + '秒');
            }
            window.$(infoModalLength).replaceWith(window.$('<span></span>').attr('id', 'file-info-length').text(timeText));

            // 视频文件大小
            window.$(infoModalSize).replaceWith(window.$('<span></span>').attr('id', 'file-info-size').text(resp['size'] + " MB"));

            // 视频文件后缀
            window.$(infoModalSuffix).replaceWith(window.$('<span></span>').attr('id', 'file-info-suffix').text(resp['format']));

            // 视频文件来源
            let origin = {1: '上传', 2: '录制'};
            window.$(infoModalOrigin).replaceWith(window.$('<span></span>').attr('id', 'file-info-origin').text(origin[resp['resource']]));

            if (type === 'detail') {
                window.$('aside#file-info').modal('show');
            }

        }, true);
    }

    Object.defineProperties(page, {
        name: {
            get: function () {
                return get('name');
            },
            set: function (newName) {
                if (newName !== null && newName !== undefined) {
                    set('name', newName); // page 输入框name 修改
                    modalName.val(newName); // modal输入框name修改
                }
            }
        }, // search condition: 视频文件的名称检索条件
        location: {
            get: function () {
                return get('location');
            },
            set: function (newLocation) {
                if (location !== null && location !== undefined) {
                    set('location', newLocation); // page输入框location
                    modalLocation.val(newLocation); // modal输入框location
                }
            }
        }, // search location: 视频文件的摄像头点位检索条件
        start: {
            get: function () {
                return get('start');
            },
            set: function (newStart) {
                if (newStart !== null && newStart !== undefined) {
                    set('start', newStart); // page输入框location
                    modalStartTime.val(newStart); // modal输入框start
                }
            }
        }, // search start: 视频文件的起始时间检索条件
        end: {
            get: function () {
                return get('end');
            },
            set: function (newEnd) {
                if (newEnd !== null && newEnd !== undefined) {
                    set('end', newEnd); // page输入框location
                    modalEndTime.val(newEnd); // modal输入框end
                }
            }
        }, // search end: 视频文件的起始时间检索条件
        industry: {
            get: function () {
                return get('industry');
            },
            set: function (newIndustry) {
                if (!!newIndustry) {
                    // let oldIndustry = page.industry;
                    _condition_industry = newIndustry;
                    set('industry', newIndustry); // page输入框industry
                    // $tree.toggleNodeSelected($tree.getSelected()[0].id); // 如果选择了某个行业的话, 取消单位选择, page树形结构industry
                    // modalIndustrySelectById(newIndustry.id)// modal下拉框industry, 下拉框中以行业Id作为value
                    // // 切换行业后, 需要切换单位下拉框的选项
                    // oldIndustry ?
                    //     (oldIndustry.id !== newIndustry.id) && switchModalDepartmentsByIndustryId(newIndustry.id) && page.department && modalDepartmentSelectById(page.department.id) :
                    //     (switchModalDepartmentsByIndustryId(newIndustry.id) && page.department && modalDepartmentSelectById(page.department.id));
                }
            }
        }, // search industry: 视频文件行业检索条件
        department: {
            get: function () {
                return get('department');
            },
            set: function (newDepartment) {
                if (!!newDepartment) {
                    let oldDepartment = page.department;
                    _condition_department = newDepartment;
                    set('department', newDepartment); // page输入框department
                    // // page树形结构department, 1. 获得已经选择的oldNodeId = node.id; 2.oldNodeId === node.id ? 3 : 4; 3. 什么都不做; 4. 取消先前的选中node, 选择新的node
                    // if ($tree.getSelected()[0]) { // 如果之前选中了其它节点
                    //     let oldNodeId = $tree.getSelected()[0].id;
                    //     if (oldNodeId !== newDepartment.id) {
                    //         $tree.toggleNodeSelected(oldNodeId); // 取消之前选中的node节点
                    //         $tree.selectNode(newDepartment.id); // 选中新的node节点
                    //     }
                    // } else {
                    //     $tree.selectNode(newDepartment.id);
                    // }
                    // modal下拉框department, 下拉框中以单位Id作为value
                    // modalDepartmentSelectById(newDepartment.id);  // 选中新的node节点
                    // // 单位改变时也会自动改变行业
                    //
                    if (oldDepartment) {
                        // 如果单位所在的行业产生了变化, 则切换行业
                        if (findIndustryByDepartmentId(oldDepartment.id) !== findIndustryByDepartmentId(newDepartment.id)) {
                            let industry = findIndustryByDepartmentId(newDepartment.id);
                            page.industry = {id: industry.id, name: industry.name,};
                        }
                    } else {
                        let industry = findIndustryByDepartmentId(newDepartment.id);
                        page.industry = {id: industry.id, name: industry.name,};
                    }
                }
            }
        }, // search department: 视频文件单位检索条件
        sort: {
            get: function () {
                return window.$('#file-sort-container .dropdown-menu span[class="checked"]').find('a').attr('data-val');
            },
            set: function (newValue) {
                let selectElt = window.$('#file-sort-container .dropdown-menu a[data-val="' + newValue + '"]');
                if (selectElt.length !== 0) {
                    selectSort(selectElt[0])
                }
            }
        } // file sort: 排序检索条件
    });

    Object.defineProperties(modal, {
        name: {
            get: function () {
                return modalName.val();
            },
            set: function (newValue) {
                modalName.val(newValue);
            }
        }, // modal Name, 随时从page.name同步, 开始高级检索后同步到page.name
        location: {
            get: function () {
                return modalLocation.val();
            },
            set: function (newValue) {
                modalLocation.val(newValue);
            }
        }, // modal location, 随时从page.location同步, 开始高级检索后同步到page.location
        start: {
            get: function () {
                return modalStartTime.val();
            },
            set: function (newValue) {
                modalStartTime.val(newValue);
            }
        },
        end: {
            get: function () {
                return modalEndTime.val();
            },
            set: function (newValue) {
                modalEndTime.val(newValue);
            }
        },
        industry: {
            get: function () {
                let industryId = modalIndustry.val();
                return {
                    id: industryId,
                    name: findIndustryNameById(industryId)
                }
            },
            // 仅用于每次打开modal前同步page信息
            set: function (newIndustry) {
                if (!!newIndustry) {
                    modalIndustrySelectById(newIndustry.id); // 选中industry
                    switchModalDepartmentsByIndustryId(newIndustry.id); // 根据industry切换departments
                } else {
                    modalIndustrySelectById(''); // 重置行业下拉框中的值为""
                    switchModalDepartmentsToAll(); // 如果打开时没有industryId信息, 单位下拉框中使用所有的departments
                }
            }
        },
        department: {
            get: function () {
                let departmentId = modalDepartment.val();
                return {
                    id: departmentId,
                    name: findDepartmentNameById(departmentId)
                }
            },
            // 仅用于每次打开modal前同步page信息
            set: function (newDepartment) {
                if (!!newDepartment) {
                    modalDepartmentSelectById(newDepartment.id); // 选中department
                }
            }
        }
    });

    Object.defineProperties(infoModal, {
        name: {
            get: function () {
                return window.$(infoModalName).text();
            }, set: function (newValue) {
                window.$(infoModalName).text(newValue);
            }
        }, industry: {
            get: function () {
                if (window.$(infoModalContent).hasClass('detail')) {
                    return window.$(infoModalIndustry).text();
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    return window.$(infoModalIndustrySelect).val();
                }
            }, set: function (newValue) {
                if (window.$(infoModalContent).hasClass('detail')) {
                    window.$(infoModalIndustry).text(newValue);
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    window.$(infoModalIndustrySelect).val(newValue);
                    layui.use('form', function () {
                        let form = layui.form;
                        form.render();
                    });
                }
            }
        }, department: {
            get: function () {
                if (window.$(infoModalContent).hasClass('detail')) {
                    return window.$(infoModalDepartment).text();
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    return window.$(infoModalDepartmentSelect).val();
                }
            }, set: function (newValue) {
                if (window.$(infoModalContent).hasClass('detail')) {
                    window.$(infoModalDepartment).text(newValue);
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    window.$(infoModalDepartmentSelect).val(newValue);
                    layui.use('form', function () {
                        let form = layui.form;
                        form.render();
                    });
                }
            }
        }, location: {
            get: function () {
                if (window.$(infoModalContent).hasClass('location')) {
                    return window.$(infoModalLocation).text();
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    return window.$(infoModalLocationSelect).val();
                }
            }, set: function (newValue) {
                if (window.$(infoModalContent).hasClass('location')) {
                    window.$(infoModalLocation).text(newValue);
                } else if (window.$(infoModalContent).hasClass('edit')) {
                    window.$(infoModalLocationSelect).val(newValue);
                    layui.use('form', function () {
                        let form = layui.form;
                        form.render();
                    });
                }
            }
        }, time: {
            get: function () {
                return window.$(infoModalTime).text();
            }, set: function (newValue) {
                window.$(infoModalTime).text(newValue);
            }
        }, length: {
            get: function () {
                return window.$(infoModalLength).text();
            }, set: function (newValue) {
                let $time = new Time(Number(newValue) * 1000), timeStr = '';
                $time.init();
                ($time.year() !== 0) && (timeStr += ($time.year() + '年'));
                ($time.month() !== 0) && (timeStr += ($time.month() + '月'));
                ($time.day() !== 0) && (timeStr += ($time.day() + '日'));
                ($time.hour() !== 0) && (timeStr += ($time.hour() + '时'));
                ($time.minute() !== 0) && (timeStr += ($time.minute() + '分'));
                ($time.second() !== 0) && (timeStr += ($time.second() + '秒'));
                window.$(infoModalLength).text(timeStr);
            }
        }, size: {
            get: function () {
                return window.$(infoModalSize).text();
            }, set: function (newValue) {
                let $size = new StorageSize(Number(newValue) * 1024 * 1024), sizeStr = '';
                $size.init();
                ($size.t() !== 0) && (sizeStr += ($size.t() + 'T'));
                ($size.g() !== 0) && (sizeStr += ($size.g() + 'G'));
                ($size.m() !== 0) && (sizeStr += ($size.m() + 'M'));
                window.$(infoModalSize).text(sizeStr);
            }
        }, suffix: {
            get: function () {
                return window.$(infoModalSuffix).text();
            }, set: function (newValue) {
                window.$( ).text(newValue);
            }
        }, origin: {
            get: function () {
                return window.$(infoModalOrigin).text();
            }, set: function (newValue) {
                window.$(infoModalOrigin).text(newValue);
            }
        }
    });

    // 左侧 行业-单位 检索框事件
    industrySearchIpt.unbind('input propertychange').bind('input propertychange', function () {
        $tree.search(industrySearchIpt.val());
    });

    // 左侧`行业 - 单位`树形结构渲染
    $http.handle('fileManage_departmentByIndustry', {}, undefined, undefined, function (res) {
        $tree = new Tree(window.$('#fileManage-container .left-container .organization-by-industry'), res);
        $tree.init();
        $tree.create({
            onNodeSelected: function (event, node) { // 选中节点触发函数: 改变行业条件, 改变单位条件, 重新请求表格数据
                page.department = {id: node.id, name: node.text,};
                $table.reload(); // table Refresh
            }, onNodeUnselected: function (event, node) {
            } // 修改bootstrap tree view使得无法通过再次click取消node选中状态
        });

        // 初始 行业-单位 response
        _res = res;

        // 获取单个node下的所有child
        function getNodeAllChildren(node) {
            let result = [];
            if (node['nodes']) {
                node['nodes'].forEach(function (crtValue) {
                    result.push({
                        id: crtValue.id,
                        name: crtValue.text,
                    });
                    getNodeAllChildren(crtValue).forEach(function (elt) {
                        result.push({
                            id: elt.id,
                            name: elt.name,
                        })
                    });
                });
            }
            return result;
        }

        // _departmentByIndustry 用于存储 行业-单位 信息: 1. 根据单位检索单位所属的行业
        res.forEach(function (currentValue) {
            _departmentByIndustry[currentValue['id']] = getNodeAllChildren(currentValue); // 初始化industry - department信息
            modalIndustry.append(window.$('<option></option>').attr('value', currentValue['id']).text(currentValue['text'])); // 初始化modal层行业下拉框信息
            layui.use('form', function () {
                let form = layui.form;
                form.render();
            });
        });
    }, true);

    // 右侧`视频文件`表格数据检索
    $table = new Table(window.$('#file-table'), {
        classes: 'table table-hover table-striped table-responsive',
        theadClasses: 'dark',
        undefinedText: '',
        locale: 'zh-CN',
        url: 'dev/videoFile.json',
        method: 'post',
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        queryParams: function (params) {
            return {
                pageSize: params.pageSize,
                pageNum: params.pageNumber,
                videoName: page.name,
                location: page.location,
                startRecordTime: page.start,
                endRecordTime: page.end,
                departmentId: page.department && page.department.id,
                industryId: page.industry && page.industry.id,
                sort: page.sort
            }
        },
        queryParamsType: '', // queryParams中参数: pageSize, pageNumber, searchText, sortOrder
        responseHandler: function (res) {
            /** 这里会预处理response */
            return res.data;
        },
        totalField: 'count',
        dataField: 'files',
        pagination: true,
        paginationLoop: false,
        sidePagination: 'server',
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50],
        showFooter: true,
        idField: 'id',
        clickToSelect: true,
        onCheck: function (row, $elt) {
            fileOperationEnable();
        },
        onUncheck: function (row, $elt) {
            if ($table.getSelections().length === 0) {
                fileOperationDisable();
            }
        },
        onCheckAll: function (rowsAfter, rowsBefore) {
            fileOperationEnable();
        },
        onUncheckAll: function (rowsAfter, rowsBefore) {
            if (rowsAfter.length === 0) {
                fileOperationDisable();
            }
        },
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
            title: '文件名称',
            field: 'name',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '录制时间',
            field: 'time',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '摄像头点位信息',
            field: 'camera',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '行业',
            field: 'industry',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '单位',
            field: 'department',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '操作',
            formatter: function (value, row, index, field) {
                let result = window.$('<div></div>').addClass('operation');
                result.append('<div class="play" title="回放"><i class="far fa-file-video"></i></div>');
                (Number(row.edit) === 1 || Number(row.edit) === 2) ? result.append(window.$('<div class="edit" title="编辑"><i class="far fa-edit"></i></div>')) : result.append(window.$('<div class="detail" title="详情"><i class="far fa-sticky-note"></i></div>'));
                return result[0].outerHTML;
            },
            events: {
                'click .play': function (event, value, row, index) { // 播放
                    event.stopPropagation();
                    event.preventDefault();
                }, 'click .edit': function (event, value, row, index) { // 编辑
                    event.stopPropagation();
                    event.preventDefault();
                    operateSingleFile('edit', row['id']);
                }, 'click .detail': function (event, value, row, index) { // 详情
                    event.stopPropagation();
                    event.preventDefault();
                    operateSingleFile('detail', row['id']);
                }

            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }]
    });
    $table.init();
    $table.create();

    // 排序下拉菜单Click阻止hash change事件, 排序下拉菜单变化事件
    fileSortDropDownItem.unbind('click').bind('click', function (event) {
        let target = window.$(event.target);
        while (target[0].nodeName !== 'SPAN') {
            target = target.parent();
        }
        selectSort(target);
        $table.refresh(); // tableRefresh
    });

    // common search input, 检索输入框值变化事件: BUG, 这个事件注册似乎不需要!!!
    // fileCommonSearchIpt.unbind('input propertychange').bind('input propertychange', function(event) {
    //     event.stopPropagation();
    //     event.preventDefault();
    //     page.name = get('name');
    //     page.location = get('location');
    //     page.start = get('start');
    //     page.end = get('end');
    //     page.industry = get('industry');
    //     page.department = get('department');
    // });

    // common search button, 检索按钮点击事件
    fileCommonSearchBtn.unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        let selectedArray = $tree.getSelected();
        selectedArray.length !== 0 && $tree.toggleNodeSelected(selectedArray[0].id);
        let temp = page.department;
        if (temp && temp.id) {
            $tree.selectNode(temp.id);
            $tree.expandNode($tree.getParent(temp.id).id);
        } else {
            $table.reload();
        }

    });

    // 高级检索按钮点击事件
    fileAdvancedSearchBtn.unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        modal.name = page.name;
        modal.location = page.location;
        modal.start = page.start;
        modal.end = page.end;
        modal.industry = page.industry;
        modal.department = page.department;
        window.$('#file-manage-tool').modal('show');
    });

    // modal框关闭按钮事件
    modalHeaderClose.unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        window.$('#file-manage-tool').modal('hide');
    });

    // modal开始检索按钮点击事件
    modalFooterSearch.unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        page.name = modal.name;
        page.location = modal.location;
        page.start = modal.start;
        page.end = modal.end;
        page.department = modal.department;
        page.industry = modal.industry;

        let selectedArray = $tree.getSelected();
        selectedArray.length !== 0 && $tree.toggleNodeSelected(selectedArray[0].id);
        let temp = page.department;
        if (temp && temp.id) {
            $tree.selectNode(temp.id);
            $tree.expandNode($tree.getParent(temp.id).id);
        } else {
            $table.reload();
        }

        // table refresh
        window.$('#file-manage-tool').modal('hide');
    });

    // 修改layui使用数字键输入中文时不触发keyup事件
    window.$('#industry,#department').undelegate('input', 'input propertychange').delegate('input', 'input propertychange', function () {
        window.$(this).trigger('keyup');
    });
    window.$('#file-info-industry,#file-info-department,#file-info-location').undelegate('input', 'input propertychange').delegate('input', 'input propertychange', function () {
        window.$(this).trigger('keyup');
    });

    // 视频文件编辑 - 确定按钮
    window.$('#file-info .modal-footer button.confirm').unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        let industryId = infoModal.industry, departmentId = infoModal.department, locationId = infoModal.location;
        if (industryId === '' || industryId === null || industryId === undefined) {
            $alert.warning('<p>请选择<b>行业</b>信息后提交!</p>');
            return;
        }
        if (departmentId === '' || departmentId === null || departmentId === undefined) {
            $alert.warning('<p>请选择<b>单位</b>信息后提交!</p>');
            return;
        }
        if (locationId === '' || locationId === null || locationId === undefined) {
            $alert.warning('<p>请选择<b>设备</b>信息后提交!</p>');
            return;
        }
        if (locationId !== currentOperationVideo['equipmentId']) {
            $http.handle('fileManage_fileInfoEdit', {
                videoId: currentOperationVideo['videoId'],
                locationId: locationId
            }, undefined, undefined, function (resp) {
                window.$('#file-info').modal('hide');
                $alert.success('编辑成功!');
            }, true);
        }
    });

    // 视频文件编辑 - 取消按钮
    window.$('#file-info .modal-footer button.cancel').unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        window.$('#file-info').modal('hide');
    });

    // 视频文件取回/批量取回
    window.$('#file-fetch').unbind('click').bind('click', function (event) {

    });

    // 视频文件下载/批量下载
    window.$('#file-download').unbind('click').bind('click', function (event) {

    });

    // 视频文件下载/批量下载确认
    window.$('#file-manage-download-confirm').unbind('click').bind('click', function (event) {

    });

    // 视频文件下载/批量下载取消
    window.$('#file-manage-download-cancel').unbind('click').bind('click', function (event) {

    });

    // 视频文件删除提示信息
    window.$('#file-delete').unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        let selected = $table.getSelections(), reqData = [];
        selected.forEach(function (currentValue) {
            reqData.push(currentValue['id']);
        });
        $http.handle('fileManage_fileDeleteInfo', {videoId: reqData}, undefined, undefined, function (resp) {
            let fileManageDeleteModal = window.$('#file-manage-delete-modal');
            fileManageDeleteModal.find('#file-handled').text(resp['dealed']);
            fileManageDeleteModal.find('#file-handling').text(resp['dealing']);
            fileManageDeleteModal.find('#file-for-handle').text(resp['deal']);
            fileManageDeleteModal.modal('show');
        }, true);
    });

    // 视频文件删除/批量删除确认
    window.$('#file-manage-delete-confirm').unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        let selected = $table.getSelections(), reqData = [];
        selected.forEach(function (currentValue) {
            reqData.push(currentValue['id']);
        });
        $http.handle('fileManage_fileDelete', {videoId: reqData}, undefined, undefined, function (resp) {
            $table.refresh(); // 删除完了之后需要刷新表格数据
            $alert.success('<p>成功删除文件<b>' + reqData.length + '</b>个</p>');
            window.$('#file-manage-delete-modal').modal('hide');
        }, true);
    });

    // 视频文件删除/批量删除取消
    window.$('#file-manage-delete-cancel').unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        window.$('#file-manage-delete-modal').modal('hide');
    });
});