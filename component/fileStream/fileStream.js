window.$(function () {
    let $tree = {}, // 左侧 `行业 - 单位`树形结构对象
        $table = {}, // 右侧 `视频流` 表格对象
        page = {}, // 页面参数容器
        modal = {}, // 高级检索模态框容器
        currentOperationStream = null, // 当前编辑或查看详情的视频流对象信息
        _condition_industry = null,  // 页面的行业条件对象: 主要用于解决检索框中显示id的问题
        _condition_department = null, // 页面的机构条件对象: 主要用于解决检索框中显示id的问题
        _departmentByIndustry = {}, // 单位按照行业分类
        _res = null; // 行业 - 单位 响应

    let streamState = {0: '停用', 1: '在线', 2: '离线'}; // 视频流状态map列表

    let streamSwitch = {1: '录制', 2: '不录制'}; // 是否录制视频流map列表

    let streamArchive = {0: '不入蓝光',
        1: '一天后入蓝光', 2: '一周后入蓝光', 3: '一月后入蓝光',
        4: '三个月后入蓝光', 5: '半年后入蓝光'
    }; // 蓝光归档策略map列表

    // left-container页面selector
    let leftIndustrySearchIpt = window.$('#fileStream-container .left-container .organization-search input'),
        leftIndustryTreeContainer = window.$('#fileStream-container .left-container .organization-by-industry');

    // right-container页面selector
    let streamCommonSearchIpt = window.$('#stream-search-container input'),
        streamCommonSearchBtn = window.$('#stream-search-container button'),
        streamAdvancedSearchBtn = window.$('#stream-advanced-search-container button'),
        streamStopOperationBtn = window.$('#stream-operate-container button#stream-stop'),
        streamStartOperationBtn = window.$('#stream-operate-container button#stream-start'),
        streamAddBtn = window.$('#stream-add button'),
        streamRecordTable = window.$('#fileStream-container #stream-table');

    // 高级检索aside modal
    let advancedSearchModal = '#stream-manage-tool', // 高级检索modal aside
        advancedSearchLocation = '#stream-manage-tool form #location-name input', // 高级检索摄像头点位信息input
        advancedSearchIndustrySelect = '#stream-manage-tool form #industry select', // 高级检索行业下拉select
        advancedSearchDepartmentSelect = '#stream-manage-tool form #department select', // 高级检索单位下拉select
        advancedSearchStateSelect = '#stream-manage-tool form #stream-state select', // 高级检索状态下拉select
        advancedSearchConfirmBtn = '#stream-manage-tool .modal-footer button'; // 高级检索开始检索按钮

    // 视频流编辑/详情
    let streamEditModalSelector = '#stream-info', // 编辑/详情modal aside
        streamEditModalContentSelector = '#stream-info .modal-content', // 编辑/详情modal content
        streamEditModalLocationSelector = '#stream-info .modal-content #stream-location', // 视频流地址
        streamEditModalEquipmentSelector = '#stream-info .modal-content #stream-equipment', // 所属设备
        streamEditModalRecordSwitchSelector = '#stream-info .modal-content #stream-record-switch', // 是否录制视频流
        streamEditModalArchivePlanSelector = '#stream-info .modal-content #stream-archive-plan', // 归档计划
        streamEditModalVisualSelector = '#stream-info .modal-content #stream-visual', // 视频流可见
        streamEditModalCheckSelector = '#stream-info .modal-content #stream-check', // 视频流可查看
        streamEditModalEditSelector = '#stream-info .modal-content #stream-edit', // 视频流可编辑
        streamEditConfirmSelector = '#stream-info .modal-footer button.confirm', // 视频流编辑/详情 确定
        streamEditCancelSelector = '#stream-info .modal-footer button.cancel'; // 视频流编辑/详情 取消

    // 视频流添加aside modal
    let $streamAddModal = window.$('#stream-add-aside'), // 添加视频流aside
        $streamAddModalContent = window.$('#stream-add-aside .modal-content'), // 添加视频流aside content
        $streamAddTabsAnchor = window.$('#stream-add-aside .modal-body a.nav-link'), // 视频流anchor tab-link
        $streamAddSingleType = window.$('#stream-add-aside #single-stream-add-path select[name="type"]'), // 单个视频流地址类型: rtsp/国标流
        $streamAddSinglePath = window.$('#stream-add-aside #single-stream-add-path input#streamSingleAddPath'), // 单个视频流地址
        $streamAddSingleLocation = window.$('#stream-add-aside #single-stream-add-location select[name="singleStreamAddLocation"]'), // 单个视频流添加select
        $streamAddSingleLinkTestBtn = window.$('#stream-add-aside #single-stream-add-test button#singleStreamAddTest'), // 单个视频流添加测试按钮
        $streamAddSingleLinkValid = window.$('#stream-add-aside #single-stream-add-test div.valid'), // 单个视频流添加测试成功提示信息
        $streamAddSingleLinkInvalid = window.$('#stream-add-aside #single-stream-add-test div.invalid'), // 单个视频流添加测试失败提示信息
        $streamAddSingleConfirm = window.$('#stream-add-aside .modal-footer button.confirm'), // 单个视频流添加确认按钮
        $streamAddSingleCancel = window.$('#stream-add-aside .modal-footer button.cancel'); // 单个视频流添加取消按钮

    // 加载页面后渲染页面layui表单
    layui.use('form', function () {
        let form = layui.form;
        let tempDepartment = null;
        let endIndustryTrigger = false, endDepartmentTrigger = false;
        form.render();
        form.on('select(industry)', function (data) {
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
        return {};
    }

    // modal search industry input select: 模态框内选中某个行业的id
    function modalIndustrySelectById(industryId) {
        // window.$('#industry dl.layui-anim.layui-anim-upbit').find('dd[lay-value="' + industryId + '"]').trigger('click');
        window.$(advancedSearchIndustrySelect).val(industryId);
        layui.use('form', function () {let form = layui.form;form.render(); });
    }

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

    // modal search department input select: 模态框内选中某个单位的id
    function modalDepartmentSelectById(departmentId) {
        // window.$('#department dl.layui-anim.layui-anim-upbit').find('dd[lay-value="' + departmentId + '"]').trigger('click');
        window.$(advancedSearchDepartmentSelect).val(departmentId);
        layui.use('form', function () {let form = layui.form;form.render(); });
    }

    // modal search state input select: 模态框内选中某个状态
    function modalStateSelectByNum(stateNum) {
        window.$('#stream-state dl.layui-anim.layui-anim-upbit').find('dd[lay-value="' + stateNum + '"]').trigger('click');
    }

    // 视频流状态切换: str -> num, 如果没有该状态string, 则返回null
    function num(stateStr) {
        for (let key in streamState) {
            if (streamState.hasOwnProperty(key)) {
                if (streamState[key] === stateStr) {
                    return key;
                }
            }
        }
        return null;
    }

    // 视频流状态切换: num -> str, 如果没有该状态number, 则返回null
    function str(stateNum) {
        return streamState[stateNum] || null;
    }

    // 获取检索栏中的检索检索条件对象, 如果没有改条件, 则返回null
    function conditionObj() {
        let condition = {
            location: null,
            industry: null,
            department: null,
            state: null,
        }, conditionStr = streamCommonSearchIpt.val();
        conditionStr.trim().split(' ').forEach(function (currentValue) {
            if (currentValue !== '') {
                if (currentValue.startsWith('行业：')) {
                    condition.industry = _condition_industry;
                } else if (currentValue.startsWith('单位：')) {
                    condition.department = _condition_department;
                } else if (currentValue.startsWith('状态：')) {
                    let stateName = currentValue.substring(3);
                    condition.state = num(stateName);
                } else {
                    condition.location = currentValue;
                }
            }
        });
        return condition;
    }

    // 获取检索条件中某个字段的值, 如果没有该条件, 则返回null
    function get(type) {
        return conditionObj()[type] || null;
    }

    // 设置检索条件中某个字段的值, 设置失败时返回false
    function set(type, value) {
        let oldCondition = conditionObj(), conditionStr = '';
        if (!oldCondition.hasOwnProperty(type)) {
            return false;
        } // type不属于{location, industry, department, state}, 则不设置
        if (index.isValid(value)) {
            return false;
        } // value为null, undefined时不设置
        oldCondition[type] = value;
        for (let key in oldCondition) {
            if (oldCondition.hasOwnProperty(key) && !!oldCondition[key]) {
                if (key === 'location') {
                    conditionStr += oldCondition[key] + ' ';
                }
                if (key === 'industry' && oldCondition[key]['id'] && oldCondition[key]['name']) {
                    conditionStr += ('行业：' + oldCondition[key]['name'] + ' ');
                }
                if (key === 'department' && oldCondition[key]['id'] && oldCondition[key]['name']) {
                    conditionStr += ('单位：' + oldCondition[key]['name'] + ' ');
                }
                if (key === 'state') {
                    if (str(oldCondition[key])) {
                        conditionStr += ('状态：' + str(oldCondition[key]) + ' ');
                    }
                }
            }
        }
        streamCommonSearchIpt.val(conditionStr.trim());
    }

    // 选择表格某些项后改变`停用`按钮的状态, 使之变为可用
    function switchStreamState() {
        if ($table.getSelections().some(function (currentValue) { // 停用按钮
            return Number(currentValue['status']) === 1; // 如果选中的有在线的视频流, 则可以停用
        })) {
            streamStopOperationBtn.attr('disabled', false);
        } else {
            streamStopOperationBtn.attr('disabled', true);
        }
        if ($table.getSelections().some(function (currentValue) { // 开启按钮
            return Number(currentValue['status']) === 0; // 如果选中的有停用的视频流, 则可以开启
        })) {
            streamStartOperationBtn.attr('disabled', false);
        } else {
            streamStartOperationBtn.attr('disabled', true);
        }
    }

    // 单个视频流编辑/详情modal渲染
    function operateSingleStream(type, streamId) {
        // 编辑: 视频流地址编辑组件的构造方法
        function createStreamLocation(type, path) {
            let streamLocation = window.$('<div></div>').addClass('input-group').attr('id', 'stream-location'),
                streamLocationType = window.$('<div></div>').addClass('input-group-prepend'),
                streamLocationPath = window.$('<input type="text" class="form-control" autocomplete="off"/>').val(path);
            // let $linkageSelect = new LinkageSelect('path', false, 'path', undefined, undefined, {value: 'id', text: 'name'},
            //     [{id: '0', name: 'rtsp',}, {id: '1', name: '国标流'}], type, '', '', undefined);
            // $linkageSelect.init();
            // $linkageSelect.create(streamLocationType);
            streamLocationType.append(window.$('<span class="input-group-text">rtsp</span>'));
            streamLocation.append(streamLocationType).append(streamLocationPath);
            window.$(streamEditModalLocationSelector).replaceWith(streamLocation);
        }

        // 编辑: 是否录制视频流
        function createStreamRecordSwitch(initValue) {
            let streamSwitch = window.$('<span></span>').attr('id', 'stream-record-switch').attr('style', 'height:100%;display:flex'),
                switchOn = window.$('<span data-switch="0" data-value="1"><div style="margin-top: 8px;margin-left: 30px" class="radio"></div><label style="margin-left:8px;vertical-align:top;">录制</label></span>'),
                switchOff = window.$('<span data-switch="0" data-value="2"><div style="margin-top: 8px;margin-left: 30px" class="radio"></div><label style="margin-left:8px;vertical-align:top;">不录制</label></span>');
            if (Number(initValue) === 1) { // 录制: 选中`是`, 归档计划显示
                switchOn.attr('data-switch', '1');
                window.$(streamEditModalArchivePlanSelector).parent().parent().show();
            } else if (Number(initValue) === 2)  { // 不录制: 选中`否`, 归档计划不显示
                switchOff.attr('data-switch', '1');
                window.$(streamEditModalArchivePlanSelector).parent().parent().parent().hide();
            }
            switchOn.unbind('click').bind('click', function(event) {
                event.stopPropagation(); event.preventDefault();
                switchOn.attr('data-switch', 1);
                switchOff.attr('data-switch', 0);
                window.$(streamEditModalArchivePlanSelector).parent().parent().parent().animate({opacity:1,height:'38px'})
            });
            switchOff.unbind('click').bind('click', function(event) {
                event.stopPropagation(); event.preventDefault();
                switchOn.attr('data-switch', 0);
                switchOff.attr('data-switch', 1);
                window.$(streamEditModalArchivePlanSelector).parent().parent().parent().animate({opacity:0,height:0});
            });
            streamSwitch.append(switchOn).append(switchOff);
            window.$(streamEditModalRecordSwitchSelector).replaceWith(streamSwitch);
        }

        // 编辑: 归档计划
        function createStreamArchivePlan(initValue) {
            let $archivePlan = new LinkageSelect('archive', false, 'archive', undefined, undefined,
                {value: 'id', text: 'name'}, [
                    {id: '0', name: '不入蓝光'},
                    {id: '1', name: '一天后入蓝光'},
                    {id: '2', name: '一周后入蓝光'},
                    {id: '3', name: '一月后入蓝光'},
                    {id: '4', name: '三月后入蓝光'},
                    {id: '5', name: '半年后入蓝光'}
                ], initValue, 'stream-archive-plan', undefined, undefined);
            $archivePlan.init();
            $archivePlan.create();
            $archivePlan.replace(window.$(streamEditModalArchivePlanSelector));
        }

        if (type === 'edit') {
            window.$(streamEditModalContentSelector).removeClass('detail').addClass('edit');
        } else if (type === 'detail') {
            window.$(streamEditModalContentSelector).removeClass('edit').addClass('detail');
        }
        $http.handle('streamManage_streamInfo', {videoFlowId: streamId}, undefined, undefined, function(resp) {
            // 设置当前编辑/查看详情的视频流对象
            currentOperationStream = resp;

            // 视频流路径
            type === 'edit' ? createStreamLocation(resp['type'], resp['path']) : window.$(streamEditModalLocationSelector).replaceWith(
                window.$('<span class="layui-input-block" id="stream-location"></span>').append(window.$('<input type="text" autocomplete="off" readonly class="form-control"/>').val(resp['path']))
            );

            // 所属设备
            window.$(streamEditModalEquipmentSelector).text(resp['equipmentName']);

            // 录制配置
            if (type === 'edit') {
                createStreamRecordSwitch(resp['ifRecord']);
                createStreamArchivePlan(resp['originStoreStrategy'] || '0');
            } else if (type === 'detail') {
                window.$(streamEditModalRecordSwitchSelector).replaceWith(window.$('<span></span>').attr('id', 'stream-record-switch').text(streamSwitch[resp['ifRecord']]));
                if (Number(resp['ifRecord']) === 1) { // 如果录制的话则显示归档信息
                    window.$(streamEditModalArchivePlanSelector).replaceWith(window.$('<span></span>').attr('id', 'stream-archive-plan').text(streamArchive[resp['originStoreStrategy']]));
                }
            }

            // 视频流可见
            let streamVisualDepartment = [];
            if (resp['authorityInfo']['visible']) {
                resp['authorityInfo']['visible'].forEach(function(currentValue) {
                    streamVisualDepartment.push(currentValue['orgName']);
                });
            }
            window.$(streamEditModalVisualSelector).attr('title', streamVisualDepartment.join('; ')).text(streamVisualDepartment.join('; '));

            // 视频流可查看
            let streamCheckDepartment = [];
            if (resp['authorityInfo']['useable']) {
                resp['authorityInfo']['useable'].forEach(function(currentValue) {
                    streamCheckDepartment.push(currentValue['orgName']);
                });
            }
            window.$(streamEditModalCheckSelector).attr('title', streamCheckDepartment.join('; ')).text(streamCheckDepartment.join('; '));

            // 视频流可编辑
            let streamEditDepartment = [];
            if (resp['authorityInfo']['editable']) {
                resp['authorityInfo']['editable'].forEach(function(currentValue) {
                    streamEditDepartment.push(currentValue['orgName']);
                });
            }
            window.$(streamEditModalEditSelector).attr('title', streamEditDepartment.join('; ')).text(streamCheckDepartment.join('; '));

            // 处理履历
            window.$('#stream-dispose').remove();
            if (resp['record'] && resp['record'].length !== 0) {
                let streamDispose = window.$('<fieldset></fieldset>').attr('id', 'stream-dispose').addClass('col-12').append(window.$('<hr/>')),
                streamDisposeRow = window.$('<div></div>').addClass('row');
                streamDisposeRow.append(window.$('<legend></legend>').addClass('col-12').text('处理履历'));
                resp['record'].forEach(function(currentValue) {
                    let singleRecord = window.$('<dl class="col-12 layui-form-item"><div class="row"></div></dl>');
                    singleRecord.find('.row').append(window.$('<dt class="col-6"><label>' + currentValue['disposeName'] + '</label></dt>'))
                        .append(window.$('<dd class="col-6"><span>' + currentValue['disposeTime'] + '</span></dd>'));
                    streamDisposeRow.append(singleRecord);
                });
                streamDispose.append(streamDisposeRow).appendTo(window.$('#stream-info-form'));

            }
            window.$(streamEditModalSelector).modal('show');
        }, true);
    }

    Object.defineProperties(page, {
        location: {
            get: function () {
                return get('location');
            }, set: function (newValue) {
                if (newValue !== undefined) {
                    set('location', newValue);
                }
            }
        }, industry: {
            get: function () {
                return get('industry');
            }, set: function (newValue) {
                _condition_industry = newValue;
                set('industry', newValue);
            }
        }, department: {
            get: function () {
                return get('department');
            }, set: function (newValue) {
                let oldDepartment = page.department;
                if (oldDepartment) {
                    // 如果单位所在的行业产生了变化, 则切换行业
                    if (findIndustryByDepartmentId(oldDepartment.id) !== findIndustryByDepartmentId(newValue.id)) {
                        let industry = findIndustryByDepartmentId(newValue.id);
                        page.industry = {id: industry.id, name: industry.name};
                    }
                } else {
                    let industry = findIndustryByDepartmentId(newValue.id);
                    page.industry = {id: industry.id, name: industry.name};
                }
                _condition_department = newValue;
                set('department', newValue);

            }
        }, state: {
            get: function () {
                return get('state');
            }, set: function (newValue) {
                set('state', newValue);
            }
        }
    });

    Object.defineProperties(modal, {
        location: {
            get: function () {
                return window.$(advancedSearchLocation).val();
            }, set: function (locationName) {
                locationName === null ? window.$(advancedSearchLocation).val(locationName) : window.$(advancedSearchLocation).val('');
            }
        }, industry: {
            get: function () {
                let industryId = window.$(advancedSearchIndustrySelect).val(),
                    industryName = findIndustryNameById(industryId);
                return {id: industryId, name: industryName};
            }, set: function (industry) {
                if (!!industry) {
                    modalIndustrySelectById(industry['id']); // 选中industry
                    switchModalDepartmentsByIndustryId(industry['id']); // 根据不同的industry切换department下拉框中的内容
                } else {
                    modalIndustrySelectById('');
                    switchModalDepartmentsToAll(); // 如果打开时没有industryId信息, 单位下拉框中使用所有的departments
                }
            } // 仅用于每次打开modal时初始化industry的下拉框值
        }, department: {
            get: function () {
                let departmentId = window.$(advancedSearchDepartmentSelect).val();
                return {id: departmentId, name: findDepartmentNameById(departmentId)};
            }, set: function (department) {
                department ? modalDepartmentSelectById(department['id']) : modalDepartmentSelectById('');
            } // 仅用于每次打开modal前同步department信息
        }, state: {
            get: function () {
                return window.$(advancedSearchStateSelect).val();
            }, set: function (state) {
                state ? modalStateSelectByNum(Number(state)) : modalStateSelectByNum('');
            }
        }
    });

    // 左侧 `行业-单位` 树形结构渲染
    $http.handle('fileManage_departmentByIndustry', {}, undefined, undefined, function (res) {
        $tree = new Tree(leftIndustryTreeContainer, res);
        $tree.init();
        $tree.create({
            onNodeSelected: function (event, node) {
                page.department = {id: node.id, name: node.text,};
                $table.reload(); // table reload
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
            window.$(advancedSearchIndustrySelect).append(window.$('<option></option>').attr('value', currentValue['id']).text(currentValue['text'])); // 初始化modal层行业下拉框信息
            layui.use('form', function () {
                let form = layui.form;
                form.render();
            });
        });
    }, true);

    // 视频流添加`单个视频流添加`设备信息select填充
    $http.handle('streamManage_allEquipments', {}, undefined, undefined, function(res) {
        res.forEach(function(crtValue) {
            $streamAddSingleLocation.append(window.$('<option></option>').attr('value', crtValue['id']).text(crtValue['location']));
        });
        layui.use('form', function () { let form = layui.form; form.render(); });
    }, true);

    // 右侧 `视频文件` 表格数据检索
    $table = new Table(streamRecordTable, {
        classes: 'table table-hover table-striped table-responsive',
        theadClasses: 'dark',
        undefinedText: '',
        locale: 'zh-CN',
        url: 'dev/videoStream.json',
        method: 'post',
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        queryParams: function (params) {
            return {
                status: page.state,
                industryId: page.industry && page.industry.id,
                departmentId: page.department && page.department.id,
                location: page.location,
                offset: (params.pageNumber - 1) * params.pageSize,
                size: params.pageSize,
            }
        },
        queryParamsType: '', // queryParams中参数: pageSize, pageNumber, searchText, searchOrder
        responseHandler: function (res) {
            return res.data;
        },
        totalField: 'count',
        dataField: 'videoFlows',
        pagination: true,
        paginationLoop: false,
        sidePagination: 'server',
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50],
        showFooter: true,
        idField: 'id',
        clickToSelect: true,
        onCheck: function () {
            switchStreamState();
        },
        onUncheck: function () {
            switchStreamState();
        },
        onCheckAll: function () {
            switchStreamState();
        },
        onUnCheckAll: function () {
            switchStreamState();
        },
        columns: [{
            checkbox: true,
            clickToSelect: true,
            align: 'center',
            halign: 'center',
            valign: 'center',
        }, {
            title: '序号',
            formatter: function (value, row, index) {
                return index + 1;
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '设备点位信息',
            field: 'location',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '视频流地址',
            field: 'path',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '所属单位',
            field: 'departmentName',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '行业',
            field: 'industryName',
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '在线状态',
            field: 'status',
            formatter: function (value) {
                return str(value);
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }, {
            title: '操作',
            formatter: function (value, row) {
                let result = window.$('<div></div>').addClass('operation');
                result.append('<div class="live" title="直播"><i class="far fa-play-circle"></i></div>')
                    .append('<div class="play" title="回放"><i class="far fa-file-video"></i></div>');
                if (row.edit) {
                    result.append('<div class="edit" title="编辑"><i class="far fa-edit"></i></div>');
                } else {
                    result.append('<div class="detail" title="详情"><i class="far fa-sticky-note"></i></div>')
                }
                return result[0].outerHTML;
            },
            events: {
                'click .live': function (event, value, row, index) {
                    event.stopPropagation();
                    event.preventDefault();
                }, 'click .play': function (event, value, row, index) {
                    event.stopPropagation();
                    event.preventDefault();
                }, 'click .edit': function (event, value, row, index) {
                    event.stopPropagation();
                    event.preventDefault();
                    operateSingleStream('edit', row['videoFlowId']);
                }, 'click .detail': function(event, value, row, index) {
                    event.stopPropagation(); event.preventDefault();
                    operateSingleStream('detail', row['videoFlowId']);
                }
            },
            align: 'center',
            halign: 'center',
            valign: 'middle',
        }]
    });
    $table.init();
    $table.create();

    // 左侧 行业-单位 属性结构输入框节点检索事件
    leftIndustrySearchIpt.unbind('input propertychange').bind('input propertychange', function (event) {
        event.stopPropagation();
        event.preventDefault();
        $tree.search(leftIndustrySearchIpt.val());
    });

    // 右侧 便捷检索按钮 点击事件
    streamCommonSearchBtn.unbind('click').bind('click', function (event) {
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

    // 右侧 高级检索按钮 点击事件
    streamAdvancedSearchBtn.unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        modal.location = page.location;
        modal.industry = page.industry;
        modal.department = page.department;
        modal.state = page.state;
        window.$(advancedSearchModal).modal('show');
    });

    // 高级检索modal 开始检索按钮 点击事件
    window.$(advancedSearchConfirmBtn).unbind('click').bind('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        page.location = modal.location;
        page.industry = modal.industry;
        page.department = modal.department;
        page.state = modal.state;

        let selectedArray = $tree.getSelected();
        selectedArray.length !== 0 && $tree.toggleNodeSelected(selectedArray[0].id);
        let temp = page.department;
        if (temp && temp.id) {
            $tree.selectNode(temp.id);
            $tree.expandNode($tree.getParent(temp.id).id);
        } else {
            $table.reload();
        }

        window.$(advancedSearchModal).modal('hide');
    });

    // 视频流编辑/详情modal 确定
    window.$(streamEditConfirmSelector).unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        let /* type = window.$(streamEditModalLocationSelector).find('select').val(), */
            path = window.$(streamEditModalLocationSelector).find('input:eq(0)').val(),
            ifRecord = window.$(streamEditModalRecordSwitchSelector).find('span[data-switch="1"]').attr('data-value'),
            storeStrategy = window.$(streamEditModalArchivePlanSelector).find('select').val();

        if (path.length >= 70) {
            $alert.warning('<p>视频流地址最多为<b>70</b>个字符</p>');
            return;
        }
        if (path.length === 0) {
            $alert.warning('<p>视频流地址<b>不能为空</b>！</p>');
            return;
        }
        if (path === currentOperationStream['path']
            && Number(ifRecord) === Number(currentOperationStream['ifRecord'])
            && Number(storeStrategy) === Number(currentOperationStream['originStoreStrategy'])) {
            window.$(streamEditModalSelector).modal('hide');
            return;
        }
        $http.handle('streamManage_streamInfoEdit', {
            path: path,
            ifRecord: ifRecord,
            originStoreStrategy: storeStrategy
        }, undefined, undefined, function(resp) {
            $alert.success('<p>设置成功！</p>');
            window.$(streamEditModalSelector).modal('hide');
        }, true);

    });

    // 视频流编辑/详情modal 取消
    window.$(streamEditCancelSelector).unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        window.$(streamEditModalSelector).modal('hide');
    });

    // 视频流启用
    window.$(streamStartOperationBtn).unbind('click').bind('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        let selected = $table.getSelections(), reqData = {};
        reqData.operateType = 'useable';
        reqData.useable = '0';
        reqData.videoFlowIds = [];
        selected.forEach(function(currentValue) {reqData.videoFlowIds.push(currentValue['videoFlowId']);});
        $http.handle('streamManage_streamMultipleOnOrOff', reqData, undefined, undefined, function(resp) {
            $table.refresh();
            $alert.success('<p>启用成功！</p>');
        }, true);
    });

    // 视频流停用
    window.$(streamStopOperationBtn).unbind('click').bind('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        let selected = $table.getSelections(), reqData = {};
        reqData.operateType = 'useable';
        reqData.useable = '1';
        reqData.videoFlowIds = [];
        selected.forEach(function(currentValue) {reqData.videoFlowIds.push(currentValue['videoFlowId']);});
        $http.handle('streamManage_streamMultipleOnOrOff', reqData, undefined, undefined, function(resp) {
            $table.refresh();
            $alert.success('<p>停用成功！</p>');
        }, true);
    });

    // 视频流添加aside modal弹出
    streamAddBtn.unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        // $streamAddSingleType.val('0'); // 默认rtsp
        $streamAddSinglePath.val(''); // 默认为空
        $streamAddSingleLocation.val(''); // 默认为空
        layui.use('form', function () {let form = layui.form;form.render(); });
        $streamAddSingleLinkInvalid.hide();
        $streamAddSingleLinkValid.hide();
        $streamAddModal.modal('show');
    });

    // 视频流添加modal切换标签页tabs
    $streamAddTabsAnchor.unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        if (window.$(this).attr('href') === '#streamSingleAdd') {
            $streamAddModalContent.removeClass('multiple').addClass('single');
        } else if (window.$(this).attr('href') === '#streamMultipleAdd') {
            $streamAddModalContent.removeClass('single').addClass('multiple');
        } else {
            console.error('this', this);
            $streamAddModalContent.removeClass('multiple').addClass('single');
        }
        window.$(this).tab('show');
    });

    // 视频流点击测试button
    $streamAddSingleLinkTestBtn.unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        // if (Number($streamAddSingleType.val()) !== 0 && Number($streamAddSingleType.val) !== 0 ) {
        //     $alert.warning('<p>视频流<b>地址类型异常</b>！</p>'); return;
        // }

        if ($streamAddSinglePath.val().trim().length === 0) {
            $alert.warning('<p>视频流<b>地址不能为空</b>！</p>'); return;
        }

        if ($streamAddSingleLocation.val() === '' || (!$streamAddSingleLocation.val())) {
            $alert.warning('<p>视频流所属<b>设备地址无效</b>!</p>'); return;
        }
        $http.handle('streamManage_addTest', {
            rtspPath: $streamAddSinglePath.val(),
        }, undefined, undefined, function(resp) {
            if(Number(resp['ifConnected']) === 0) { // 0 - 可用
                $streamAddSingleLinkInvalid.hide();
                $streamAddSingleLinkValid.show();
            }
            else { // 1 - 不可用
                $streamAddSingleLinkValid.hide();
                $streamAddSingleLinkInvalid.show();
            }
        }, true);

    });

    // 视频流添加确定按钮
    $streamAddSingleConfirm.unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        // if (Number($streamAddSingleType.val()) !== 0 && Number($streamAddSingleType.val) !== 0 ) {
        //     $alert.warning('<p>视频流<b>地址类型异常</b>！</p>'); return;
        // }

        if ($streamAddSinglePath.val().trim().length === 0) {
            $alert.warning('<p>视频流<b>地址不能为空</b>！</p>'); return;
        }

        if ($streamAddSingleLocation.val() === '' || (!$streamAddSingleLocation.val())) {
            $alert.warning('<p>视频流所属<b>设备地址无效</b>!</p>'); return;
        }
        $http.handle('streamManage_singleStreamAdd', {
            path: $streamAddSinglePath.val(),
            equipmentId: $streamAddSingleLocation.val(),
            confirm: "0"
        }, undefined, undefined, function(res) {
            $alert.success('<p>添加视频流成功！</p>');
            $table.reload();
            $streamAddModal.modal('hide');
        }, true);
    });

    // 视频流添加取消按钮
    $streamAddSingleCancel.unbind('click').bind('click', function(event) {
        event.stopPropagation(); event.preventDefault();
        $streamAddModal.modal('hide');
    });
});