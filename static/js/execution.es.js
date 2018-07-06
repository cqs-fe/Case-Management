// var address = 'http://10.108.223.23:8080/atfcloud1.0a/'; 
// var address = 'http://10.205.25.141:8080/atfcloud/'
function generateConst(from, to, ...values) {
    let o = {}, index = 0;
    for (let i = +from; i <= +to; i++) {
        o[i] = values[index++];
    }
    return o;
}

var app = new Vue({
    el: '#scene',
    data: {
        sceneList: [],
        recordList: [],
        tt: 0, //总条数
        pageSize: 10, //页面大小
        currentPage: 1, //当前页
        totalPage: 1, //总页数
        listnum: 10, //页面大小
        order: 'id',
        sort: 'asc',
        isPageNumberError: false,
        checkboxModel: [],
        checked: "",
        querySceneId: '',
        //当前选中行
        selectedId: '',
        selectedSceneCode: '',
        selectedSceneName: '',
        selectedAbstractarchitecture_name: '',
        selectedScene_desc: '',
        addshow: false, //添加场景
        isShow: false, //筛选
        iconflag: true,
        customFilterList: [
            { title: '选择1' },
            { title: '选择2' }
        ],
        caseNodeNum: 0,
        caseNode: '</h3><div class="form-group"><label class="col-lg-2 control-label hidden">案例组成类型</label><div class="col-lg-4 hidden"><input type="text" class="form-control" name="caseCompositeType" value="3"></div><label class="col-lg-2 control-label">流程节点编号</label><div class="col-lg-4"><input type="text" class="form-control" name="subcasecode"></div><label class="col-lg-2 control-label">动作标识</label><div class="col-lg-4"><input type="text" class="form-control" name="actioncode"></div></div><div class="form-group"><label class="col-lg-2 control-label">被测系统</label><div class="col-lg-4"><select class="form-control" size="1" name="subautid" id=""></select></div><label class="col-lg-2 control-label">被测系统版本号</label><div class="col-lg-4"><input class="form-control" name="subversioncode"></div></div><div class="form-group"><label class="col-lg-2 control-label">功能码</label><div class="col-lg-4"><select class="form-control" size="1" name="subtransid"><option></option></select></div><label class="col-lg-2 control-label">所属模板</label><div class="col-lg-4"><select class="form-control" size="1" name="subscriptmodeflag"></select></div></div><div class="form-group"><label class="col-lg-2 control-label">执行方式</label><div class="col-lg-4"><select class="form-control" size="1" name="executemethod"><option>手工</option><option>自动化</option><option>配合</option></select></div><label class="col-lg-2 control-label">脚本管理方式</label><div class="col-lg-4"><select class="form-control" size="1" name="scriptmode"><option>模板</option></select></div></div><div class="form-group"><label class="col-lg-2 control-label">执行者</label><div class="col-lg-4"><select class="form-control" size="1" name="executor"><option v-for="user in users" value="{{user.id}}">{{user.reallyname}}</option></select></div><label class="col-lg-2 control-label">测试顺序</label><div class="col-lg-4"><input class="form-control" name="steporder"></div></div><div class="form-group"><label class="col-lg-2 control-label">案例使用状态</label><div class="col-lg-4"><select class="form-control" size="1" name="subusestatus"><option value="1">新增</option><option value="2">评审通过</option></select></div></div><div class="form-group"><label class="col-lg-2 control-label">备注</label><div class="col-lg-10"><textarea class="form-control" rows="3" name="note"></textarea></div></div>',
        caseList: [], //案例
        ids: '', //当前选中的场景id，
        executeProduct: generateConst(1, 4, '批量执行', '批量调试', '单个执行', '单个调试'),
        caseSourceChannel: generateConst(1, 4, '测试计划', '场景', '数据编写', '模版调试'),
        runScopeFlag: generateConst(1, 2, '所有用例', '选择执行的用例'),
        recordSaveType: generateConst(1, 2, '仅保存一份', '保存多份'),
        recordSaveHouse: generateConst(1, 2, '正式库', '调试库'),
        recordVerboseType: generateConst(1, 2, '不保存', '标准', '简约'),
        runStatus: generateConst(0, 4, '未执行', '执行中', '执行完成-正常完成', '执行完成-错误终止', '执行完成-人工终止'),
        runResult: generateConst(1, 3, '全部成功', '部分成功', '全部失败')
    },
    ready: function() {
        getScene(this.currentPage, this.pageSize, this.order, this.sort);
        changeListNum();
        console.log('ss');
        $('.3').addClass('open')
        $('.3 .arrow').addClass('open')
        $('.3-ul').css({display: 'block'})
        $('.3-8').css({color: '#ff6c60'})
    },
    methods: {
        //获取选中的id
        getIds: function() {
            var id_array = new Array();
            $('input[name="chk_list"]:checked').each(function() {
                id_array.push($(this).attr('id'));
            });
            app.ids = id_array.join(',');
            // $('input[name="id"]').val(id_array.join(','));
        },
        checkedAll: function() {
            var _this = this;
            console.log(_this.checkboxModel);
            if (this.checked) { //反选
                _this.checkboxModel = [];
            } else { //全选
                _this.checkboxModel = [];
                _this.sceneList.forEach(function(item) {
                    _this.checkboxModel.push(item.id);
                });
            }
        },
        //turnToPage为跳转到某页
        //传入参数pageNum为要跳转的页数
        turnToPage(pageNum) {
            var ts = this;
            pageNum = parseInt(pageNum);

            //页数不合法则退出
            if (!pageNum || pageNum > ts.totalPage || pageNum < 1) {
                console.log('页码输入有误！');
                ts.isPageNumberError = true;
                return false;
            } else {
                ts.isPageNumberError = false;
            }

            //更新当前页
            ts.currentPage = pageNum;

            //页数变化时的回调
            getScene(ts.currentPage, ts.pageSize, 'id', 'asc');
        },


        //添加场景
        insert: function() {
            var self=this;
            var scenename = $('#insertForm input[name="scenename"]').val();
            var description = $('#insertForm textarea[name="description"]').val();
            var caselibid=sessionStorage.getItem('caselibid');
            if(scenename==""){
                alert("场景名称不能为空");
            }else if(description==""){
                alert("场景描述不能为空");
            }else{
                $.ajax({
                    url: address + 'sceneController/insertSelective',
                    type: 'post',
                    data: {
                        'scenename': scenename,
                        'description': description,
                        'caselibid': caselibid,
                        'exeStrategyTestcase': '',
                        'exeStrategyTestcaseaction': '',
                        'errStrategy': ''
                    },
                    success: function(data) {
                        console.log(data);
                        if (data.success) {
                            $('#successModal').modal();
                            getScene(self.currentPage, self.pageSize, self.order, self.sort);
                        } else {
                            $('#failModal').modal();
                        }
                    },
                    error: function() {
                        $('#failModal').modal();
                    }
                });
            }
            
        },
        getRecord: function (id) {
           window.open('testRecord-of-runid.html?runId=' + id);
        },
        //传递当前页选中的场景id到场景管理页面
        toSceneManagement: function(e) {
            var sceneid = $(e.target).parent().prev().prev().prev().children().attr('id'),
                scenename = $(e.target).parent().prev().prev().html();
            location.href = "scene-setting.html?sceneid=" + sceneid + "&" + "scenename=" + scenename;
        }

    },

});

//获取场景
function getScene(page, listnum, order, sort) {
    //获取list通用方法，只需要传入多个所需参数
    $.ajax({
        url: address2 + '/batchRunCtrlController/selectAllBatchRunCtrlByPage',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            'currentpage': page,
            'pagesize': listnum
        }),
        success: function(data) {
            if (data.respCode === '0000') {
                app.sceneList = data.batchRunCtrlEntities;
                app.tt = data.batchRunCtrlEntities[0] ?  data.batchRunCtrlEntities[0].page.totalCount : 0;
                app.totalPage = data.batchRunCtrlEntities[0] ?  data.batchRunCtrlEntities[0].page.totalPage : 0;
                app.pageSize = data.batchRunCtrlEntities[0] ?  data.batchRunCtrlEntities[0].page.pageSize : 0;
            } else {
                app.sceneList = [];
                app.tt = 0;
                app.totalPage = 0;
                app.pageSize = 5;
            }
        }
    });

}

//获取案例
function getCase(currentPage, listnum, order, sort) {
    $.ajax({
        url: address + 'TestcaseController/selectAllByPage',
        type: 'GET',
        data: {
            'page': currentPage,
            'rows': listnum,
            'order': order,
            'sort': sort
        },
        success: function(data) {
            // console.info(data);
            // console.info(data.o.rows);
            app.caseList = data.o.rows;
            app.tt = data.o.total;
            app.totalPage = Math.ceil(app.tt / listnum);
            app.pageSize = listnum;
        }
    });
}

//改变页面大小
function changeListNum() {
    $('#mySelect').change(function() {
        listnum = $(this).children('option:selected').val();
        $("#mySelect").find("option[text='" + listnum + "']").attr("selected", true);
        app.currentPage=1;
        getScene(1, listnum, 'id', 'asc');
    });
}

//全选反选
$("#chk_all").click(function() {　　
    $("input[name='chk_list']").prop("checked", $(this).prop("checked"));　
});

//重新排序
function resort(target) {
    var spans = target.parentNode.getElementsByTagName("span");
    for (var span in spans) {
        if (spans[span].nodeName === "SPAN") {
            spans[span].setAttribute("class", "");
        }
    }
    if (target.getAttribute("data-sort") === "desc") {
        app.sort = "asc";
        target.getElementsByTagName("span")[0].setAttribute("class", "icon-sort-up")
        target.setAttribute("data-sort", "asc");
    } else {
        app.sort = "desc";
        target.getElementsByTagName("span")[0].setAttribute("class", "icon-sort-down")
        target.setAttribute("data-sort", "desc");
    }
    app.order = target.getAttribute("data-order");
    getScene(1, 10, app.order, app.sort);
}
//重新排序 结束

//搜索场景
function queryScene() {
    $.ajax({
        url: address + 'sceneController/selectByPrimaryKey',
        type: 'POST',
        data: {
            'page': app.currentPage,
            'rows': app.listnum,
            'order': app.order,
            'sort': app.sort,
            'id': app.querySceneId
        },
        success: function(data) {
            app.sceneList = data.rows;
            console.log(app.sceneList);
            app.tt = data.total;
            app.totalPage = Math.ceil(app.tt / app.listnum);
            app.pageSize = app.listnum;
        }
    });
}
