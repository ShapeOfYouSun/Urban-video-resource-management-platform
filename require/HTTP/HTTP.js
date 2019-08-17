function HTTP() {}

HTTP.prototype = {};

HTTP.prototype.init = function() {
    this._ajaxDefault = function(type, url, data, beforeSendFunc, completeFunc, successFunc, load) {
        let header = {
            Accept: 'application/json;charset-utf-8',
            token: identifyWatcher.get('token'),
        };
        window.$.ajax({
            async: true,
            type: type,
            url: url,
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            headers: header,
            beforeSend: function() {
                if (load) { $load.show(); }
                if (beforeSendFunc) { beforeSendFunc.call(undefined); }
            },
            complete: function() {
                if (load) { $load.hide(); }
                if (completeFunc) { completeFunc.call(undefined); }
            },
            // error: function(XMLHttpRequest) {
            //     switch(XMLHttpRequest.status) {
            //         case '400':
            //             window.location.href = 'component/error/HTTP400.html'; break;
            //         case '401':
            //             window.location.href = 'component/error/HTTP401.html'; break;
            //         case '403':
            //             window.location.href = 'component/error/HTTP403.html'; break;
            //         case '404':
            //             window.location.href = 'component/error/HTTP404.html'; break;
            //         case '500':
            //             window.location.href = 'component/error/HTTP500.html'; break;
            //         case '501':
            //             window.location.href = 'component/error/HTTP501.html'; break;
            //         case '502':
            //             window.location.href = 'component/error/HTTP502.html'; break;
            //         case '503':
            //             window.location.href = 'component/error/HTTP503.html'; break;
            //         case '520':
            //             window.location.href = 'component/error/HTTP520.html'; break;
            //         case '521':
            //             window.location.href = 'component/error/HTTP521.html'; break;
            //         case '533':
            //             window.location.href = 'component/error/HTTP533.html'; break;
            //         default:
            //             window.location.href = 'component/error/HTTP500.html'; break;
            //     }
            // },
            success: function(res) {
                if (res.status === 0) { successFunc.call(undefined, res); }
                else {
                    if (res.errorCode !== undefined && res.errorCode.substr(0, 1) === '2') {
                        $alert.error(res.error);
                    } else if (res.errorCode === '10019') { // token无法识别, 需要重新登录
                        $alert.error(res.error);
                        identifyWatcher.set('role', 'tourist');
                        identifyWatcher.set('token', null);
                        window.location.hash = 'login';
                    } else { // 数据异常
                        $alert.error('数据异常');
                    }
                }
            }
        });
    };
    this._sourceMap = {
        login_in: function(requestData, before, complete, success, load) {
            let passport = requestData.passport;
            let password = requestData.password;
            this._ajaxDefault('POST', 'dev/' + passport + '.json', {
                passport: passport,
                password: password,
            }, before, complete, function(res) {
                /**
                 * {
                 *  token: '',
                 *  role: '', // user|organizer|operator|admin
                 * }
                 * 需要保证登录成功, 此处需要预处理与拦截
                 */
                success.call(undefined, res);
            }, load);
        }, // 登录_devTest
        login_out: function(requestData, before, complete, success, load) {
            success.call(undefined);
        }, // 退出登录_devTest
        fileManage_departmentByIndustry: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/organizationByIndustry.json' , requestData, before, complete, function(res) {
                function parseSingleNode(node) {
                    let newNode = {};
                    newNode['text'] = node['name'];
                    newNode['id'] = node['id'];
                    if (node.hasOwnProperty('children')) {
                        newNode['nodes'] = [];
                        node['children'].forEach(function(crtValue) {
                            newNode['nodes'].push(parseSingleNode(crtValue));
                        });
                    }
                    return newNode;
                }
                let data = res.data.organizationByIndustry;
                let dataNew = [];
                data.forEach(function(elt) {
                    dataNew.push(parseSingleNode(elt));
                });
                dataNew.forEach(function(elt) {
                    elt.selectable = false;
                });
                success.call(undefined, dataNew);
            }, load);
        }, // 行业-单位_devTest
        fileManage_fileInfo: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/fileInfo.json', {
                videoId: requestData['videoId']
            }, before, complete, function(resp) {
                success.call(undefined, resp['data']['videoFileInfo']);
            }, load);
        }, // 根据视频文件id获取文件详情_devTest
        userManage_userInfo: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/userInfo.json', {
                accountId: requestData['accountId']
            }, before, complete, function(resp) {
                success.call(undefined, resp['data']['userInfo']);
            }, load);
        }, // 根据账户ID获取文件详情_devTest
        fileManage_industries: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/industries.json', {}, before, complete, function(resp) {
                success.call(undefined, resp['industries']);
            }, load);
        }, // 所有行业信息_devTest
        fileManage_departments: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/departments.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['departments']);
            }, load);
        }, // 根据行业Id查询单位信息_devTest
        fileManage_equipments: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/equipments.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']['equipments']);
            }, load);
        }, // 根据单位Id查询设备信息_devTest
        fileManage_fileRecord: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/fileRecord.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']['record']);
            }, load);
        }, // 根据文件Id查询文件履历_devTest
        fileManage_fileInfoEdit: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/fileInfoEdit.json', requestData, before, complete, function(resp){
                success.call(undefined);
            }, load);
        }, // 文件信息编辑
        fileManage_fileDeleteInfo: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/fileDeleteInfo.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']);
            }, load);
        }, // 文件删除提示信息
        fileManage_fileDelete: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/fileDelete.json', requestData, before, complete, function(resp) {
                success.call(undefined);
            }, load);
        }, // 文件删除
        streamManage_streamInfo: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/streamInfo.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']);
            }, load);
        }, // 视频流文件信息
        streamManage_streamInfoEdit: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/streamInfoEdit.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp);
            }, load);
        }, // 视频流信息编辑
        streamManage_streamMultipleOnOrOff: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/StreamMultipleOnAndOff.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp);
            }, load);
        }, // 视频流批量停用/启用
        streamManage_allEquipments: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/allEquipments.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']['equipments']);
            }, load);
        }, // 请求所有设备id以及名称
        streamManage_addTest: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/streamAddPathTest.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']);
            }, load);
        }, // 测试视频流地址是否能够连接
        streamManage_singleStreamAdd: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/streamAdd.json', requestData, before, complete, function(resp) {
                success.call(undefined);
            }, load);
        }, // 单个视频流添加接口
        userManage_userLogoutInfo: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/userLogoutInfo.json', requestData, before, complete, function(resp) {
                success.call(undefined, resp['data']);
            }, load);
        }, // 用户注销提示信息
        userManage_userLogout: function(requestData, before, complete, success, load) {
            this._ajaxDefault('POST', 'dev/userLogout.json', requestData, before, complete, function(resp) {
                success.call(undefined);
            }, load);
        }, // 用户注销
    };
};

HTTP.prototype.handle = function(source, requestData, before, complete, success, loading) {
    if (!this._sourceMap.hasOwnProperty(source)) {
        console.error('💀 ~ can not find the source: ' + source); return;
    }
    this._sourceMap[source] && this._sourceMap[source].call(this, requestData, before, complete, success, loading);
};