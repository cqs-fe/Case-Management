var app = new Vue({
    el: '#elementLibrary',
    data: {
        autId: '',
        transactId: '',
        UIName: 'UI',
        eleName: '元素',
        propTr: '<tr><td><input type="checkbox" name="chk_list"/></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>',
        UILinked: '',
        eleParent: '',
        eleLinked: '',
        linkedTr: '<tr><td><input type="checkbox" name="chk_list"/></td><td contenteditable="true"></td></tr>',
        linkedPropTr: '<tr><td><input type="checkbox" name="chk_list"/></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>',
    },
    ready: function() {
        this.autSelect();
        this.setval();
        $('#autSelect').change(function() {
            app.transactSelect();
        });
        this.classtypeSelect();
        getElementTree();
        getUILinkedObjectTree();
        getEleParentObjectTree();
        getEleLinkedObjectTree();
    },
    methods: {
        //获取测试系统
        autSelect: function() {
            $.ajax({
                async: false,
                url: "http://10.108.226.152:8080/ATFCloud/autController/selectAll",
                type: "POST",
                success: function(data) {
                    var autList = data.obj;
                    var str = "";
                    for (var i = 0; i < autList.length; i++) {

                        str += " <option value='" + autList[i].id + "' >" + autList[i].autName + "</option> ";
                    }

                    $('#autSelect').html(str);

                }
            });
        },
        //功能点
        transactSelect: function() {
            var val = $('#autSelect').val();
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/transactController/showalltransact',
                data: { 'autlistselect': val },
                type: "POST",
                success: function(data) {
                    var transactList = data.o;
                    var str = "";
                    for (var i = 0; i < transactList.length; i++) {

                        str += " <option value='" + transactList[i].id + "'>" + transactList[i].transname + "</option> ";
                    }
                    $('#transactSelect').html(str);

                }

            });
        },
        //获取classtype
        classtypeSelect: function() {
            var val = $('#autSelect').val();
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/autController/selectClass',
                data: { 'id': val },
                type: "POST",
                success: function(data) {
                    var classtypeList = data;
                    var str = "";
                    for (var i = 0; i < classtypeList.length; i++) {
                        str += " <option>" + classtypeList[i].className + "</option> ";
                    }
                    $('#classtypeSelect').html(str);

                }

            });
        },
        //设置所属测试系统和所属功能点为上级页面选中的值
        setval: function() {
            var thisURL = document.URL,
                getval = thisURL.split('?')[1],
                keyval = getval.split('&');
            this.autId = keyval[0].split('=')[1],
                this.transactId = keyval[1].split('=')[1];
            $("#autSelect").val(this.autId);
            $("#transactSelect").val(this.transactId);
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/transactController/transactqueryByPage',
                type: 'GET',
                async: false,
                data: {
                    'page': 1,
                    'rows': 10,
                    'order': 'id',
                    'sort': 'asc',
                    'id': this.transactId,
                    'transcode': '',
                    'transname': '',
                    'autctgId': '',
                    'descript': '',
                    'maintainer': '',
                    'autId': '',
                    'useStatus': ''
                },
                success: function(data) {
                    var transactList = data.o.rows;
                    // console.log(transactList)
                    var str = "";
                    for (var i = 0; i < transactList.length; i++) {

                        str += " <option value='" + transactList[i].id + "'>" + transactList[i].transname + "</option> ";
                    }
                    $('#transactSelect').html(str);

                }
            });
        },
        addUI: function() {
            var UIName = $("#addUIName").val(),
                relateIdentifyObjectId = $("#addRelateIdentifyObjectId").val(),
                relateParentIdentifyObjectId = $("#addRelateParentIdentifyObjectId").val();
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/insertUI',
                type: 'post',
                data: {
                    "UIName": UIName,
                    "transid": this.transactId,
                    "relateIdentifyObjectId": relateIdentifyObjectId,
                    "relateParentIdentifyObjectId": relateParentIdentifyObjectId
                },
                success: function(data) {
                    console.info(data);
                    if (data.success) {
                        window.location.reload();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        delUI: function() {
            var treeObj = $.fn.zTree.getZTreeObj("elementtree");
            var nodes = treeObj.getCheckedNodes(true);
            var delUIName = nodes[0].name;
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/deleteUI',
                type: 'post',
                data: {
                    "deleteUI": delUIName,
                    "transid": this.transactId,
                },
                success: function(data) {
                    console.info(data);
                    if (data.success) {
                        window.location.reload();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        updateUI: function() {
            var treeObj = $.fn.zTree.getZTreeObj("elementtree"),
                nodes = treeObj.getCheckedNodes(true),
                UIName = nodes[0].name,
                RUIName = $('#RUIName').val(),
                LtreeObj = $.fn.zTree.getZTreeObj("UILinkedTree"),
                Lnodes = LtreeObj.getCheckedNodes(true),
                relateIdentifyObjectId = Lnodes[0].id,
                relateParentIdentifyObjectId = Lnodes[0].parentid;
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/updateUI',
                type: 'post',
                data: {
                    "UIName": UIName,
                    "transid": this.transactId,
                    "RUIName": RUIName,
                    "relateIdentifyObjectId": relateIdentifyObjectId,
                    "relateParentIdentifyObjectId": relateParentIdentifyObjectId
                },
                success: function(data) {
                    console.info(data);
                    if (data.success) {
                        $('#successModal').modal();
                        // window.location.reload();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        addElement: function() {
            var ElementName = $("#addElementName").val(),
                ClassType = $("#addEleClassType").val(),
                relateIdentifyObjectId = $("#addEleRelateIdentifyObjectId").val(),
                relateParentIdentifyObjectId = $("#addEleRelateParentIdentifyObjectId").val(),
                treeObj = $.fn.zTree.getZTreeObj("elementtree"),
                nodes = treeObj.getCheckedNodes(true),
                selectedUIName = nodes[0].name;
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/insertElement',
                type: 'post',
                data: {
                    "transid": this.transactId,
                    "UIName": selectedUIName,
                    "ElementName": ElementName,
                    "ClassType": ClassType,
                    "relateIdentifyObjectId": relateIdentifyObjectId,
                    "relateParentIdentifyObjectId": relateParentIdentifyObjectId
                },
                success: function(data) {
                    console.info(data);
                    if (data.success) {
                        window.location.reload();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        delElement: function() {
            var treeObj = $.fn.zTree.getZTreeObj("elementtree");
            var nodes = treeObj.getCheckedNodes(true);
            var delElementName;
            for (var i = 1; i < nodes.length; i++) {
                delElementName = nodes[i].name;
            }
            var delUIName = nodes[0].name;
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/deleteElement',
                type: 'post',
                data: {
                    "deleteElements": delElementName,
                    "UIName": delUIName,
                    "transid": this.transactId,
                },
                success: function(data) {
                    console.info(data);
                    if (data.success) {
                        window.location.reload();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        updateElement: function() {
            var treeObj = $.fn.zTree.getZTreeObj("elementtree"),
                nodes = treeObj.getCheckedNodes(true),
                UIName = nodes[0].name,
                eleName = nodes[1].name,
                rEleName = $('#rEleName').val(),
                LtreeObj = $.fn.zTree.getZTreeObj("eleLinkedTree"),
                Lnodes = LtreeObj.getCheckedNodes(true),
                relateIdentifyObjectId = Lnodes[0].id,
                PtreeObj = $.fn.zTree.getZTreeObj("eleParentTree"),
                Pnodes = PtreeObj.getCheckedNodes(true),
                relateParentIdentifyObjectId = Pnodes[0].id;
            //主属性
            var mainTd,
                mainName = '',
                mainVal = '';
            $('#mainTbody').find('tr').each(function() {
                mainTd = $(this).children();
                mainName = mainTd.eq(1).html(); //主属性名称
                mainVal = mainTd.eq(2).html(); //主属性值
            });
            //附加属性
            var addiTd,
                addiName = '',
                addiVal = '';
            $('#addiTbody').find('tr').each(function() {
                addiTd = $(this).children();
                addiName = addiTd.eq(1).html(); //附加属性名称
                addiVal = addiTd.eq(2).html(); //附加属性值
            });
            //辅助属性
            var assisTd,
                assisName = '',
                assisVal = '';
            $('#assiTbody').find('tr').each(function() {
                assisTd = $(this).children();
                assisName = assisTd.eq(1).html(); //辅助属性名称
                assisVal = assisTd.eq(2).html(); //辅助属性值
            });
            //关联元素
            var relateNameTd,
                relateName = '';
            $('relateNameTbody').find('tr').each(function() {
                relateNameTd = $(this).children();
                relateName = relateNameTd.eq(1).html();
            });
            //关联元素属性
            var relatePropNameTd,
                relatePropName = '',
                relatePropVal = '';
            $('relatePropTbody').find('tr').each(function() {
                relatePropNameTd = $(this).children();
                relatePropName = relatePropNameTd.eq(1).html();
                relatePropVal = relatePropNameTd.eq(2).html();
            });
            $.ajax({
                url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/updateElement',
                type: 'post',
                data: {
                    "UIName": UIName,
                    "transid": this.transactId,
                    "ElementNmae": eleName,
                    "RElementName": rEleName,
                    "relateIdentifyObjectId": relateIdentifyObjectId,
                    "relateParentIdentifyObjectId": relateParentIdentifyObjectId,
                    //主属性
                    "mainpropertiesname": mainName,
                    "mainpropertiesvalue": mainVal,
                    "mainpropertiesmatchMethod": '',
                    "mainpropertiesisRelative": '',
                    "mainpropertiestoolName": '',
                    //附加属性
                    "addtionalpropertiesname": addiName,
                    "addtionalpropertiesvalue": addiVal,
                    "addtionalpropertiesmatchMethod": '',
                    "addtionalpropertiesisRelative": '',
                    "addtionalpropertiestoolName": '',
                    //辅助属性
                    "assistantpropertiesname": assisName,
                    "assistantpropertiesvalue": assisVal,
                    "assistantpropertiesmatchMethod": '',
                    "assistantpropertiesisRelative": '',
                    "assistantpropertiestoolName": '',
                    //关联元素
                    "relateElementname": relateName,
                    //关联元素属性
                    "relemainpropertiesname": relatePropName,
                    "relemainpropertiesvalue": relatePropVal,
                },
                success: function(data) {
                    console.log(data);
                    if (data.success) {
                        $('#successModal').modal();
                    } else {
                        $('#failModal').modal();
                    }
                },
                error: function() {
                    $('#failModal').modal();
                }
            });
        },
        addProp: function(e) {
            var curTbody = $(e.target).parent().next().find('tbody');
            curTbody.append(this.propTr);
        },
        delProp: function(e) {
            var selectedTr = $(e.target).parent().next().find('input[name="chk_list"]:checked').parent().parent();
            selectedTr.remove();
        },
        addLinked: function(e) {
            var curTbody = $(e.target).parent().next().find('tbody');
            curTbody.append(this.linkedTr);
        },
        delLinked: function(e) {
            var selectedTr = $(e.target).parent().next().find('input[name="chk_list"]:checked').parent().parent();
            selectedTr.remove();
        },
        //获取关联元素属性
        showProp: function(e) {
            var selectedName = $(e.target).parent().next().text();
            console.log(selectedName)
        }

    },
});

/*elementtree start*/
var setting1 = {
    view: {
        addHoverDom: false,
        removeHoverDom: false,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkStyle: "checkbox",
        chkboxType: { "Y": "ps", "N": "ps" }
    },
    data: {
        simpleData: {
            enable: true,
            idKey: 'id', //id编号命名
            pIdKey: 'parentid', //父id编号命名
            rootPId: 0
        }
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    // 获取json数据
    // async: {
    //     enable: true,
    //     url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/showUIandElement',
    //     autoParam: ['id',"name"], // 异步加载时自动提交的父节点属性的参数
    //     otherParam: { "transid": "1" }, //ajax请求时提交的参数
    //     dataFilter: filter,
    //     type: 'post'
    // },
    //回调函数
    callback: {
        // 禁止拖拽
        beforeDrag: zTreeBeforeDrag,
        //选中时的回调函数
        // onCheck: function(event, treeId, treeNode) {
        //     if (treeNode.parentid == '0') { //选择的是UI
        //         $(':input', '#UIForm').val('');
        //         app.UIName = treeNode.name;
        //         $('#UIForm input[name="UIName"]').val(treeNode.name);
        //         $('#UI').css('display', 'block');
        //         $('#ele').css('display', 'none');
        //         $.ajax({
        //             url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/queryUI',
        //             type: 'post',
        //             data: {
        //                 "transid": app.transactId,
        //                 "UIName": app.UIName
        //             },
        //             success: function(data) {
        //                 var relateObjectId = data.obj.relateIdentifyObjectId;
        //                 var treeObj = $.fn.zTree.getZTreeObj("UILinkedTree");
        //                 treeObj.checkNode(treeObj.getNodeByParam("id", relateObjectId, null));
        //                 var nodes = treeObj.getCheckedNodes(true),
        //                     obj = nodes[0].name;
        //                 $('#UILinkedInput').val(obj);
        //             }
        //         });
        //     } else { //选择的是元素
        //         $('#classtypeSelect').val('');
        //         $('#eleParentInput').val('');
        //         $('#eleLinkedInput').val('');
        //         $('#mainTbody').children().remove();
        //         $('#addiTbody').children().remove();
        //         $('#assiTbody').children().remove();
        //         $('#relateNameTbody').children().remove();
        //         $('#relatePropTbody').children().remove();
        //         var treeObj = $.fn.zTree.getZTreeObj("elementtree");
        //         var nodes = treeObj.getCheckedNodes(true);
        //         app.UIName = nodes[0].name;
        //         app.eleName = treeNode.name;
        //         $('#UI').css('display', 'none');
        //         $('#ele').css('display', 'block');
        //         $.ajax({
        //             url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/queryElement',
        //             type: 'post',
        //             data: {
        //                 "transid": app.transactId,
        //                 "UIName": app.UIName,
        //                 "ElementName": app.eleName
        //             },
        //             success: function(data) {
        //                 var classtype = data.obj.classtype;
        //                 $('#classtypeSelect').val(classtype);
        //                 var relateParentObjectId = data.obj.relateParentIdentifyObjectId;
        //                 var relateObjectId = data.obj.relateIdentifyObjectId;
        //                 //父对象
        //                 var elePtree = $.fn.zTree.getZTreeObj("eleParentTree");
        //                 elePtree.checkNode(elePtree.getNodeByParam("id", relateParentObjectId, null));
        //                 var pNodes = elePtree.getCheckedNodes(true),
        //                     pObj = pNodes[0].name;
        //                 $('#eleParentInput').val(pObj);
        //                 //关联对象
        //                 var eleLtree = $.fn.zTree.getZTreeObj("eleLinkedTree");
        //                 eleLtree.checkNode(eleLtree.getNodeByParam("id", relateObjectId, null));
        //                 var lNodes = eleLtree.getCheckedNodes(true),
        //                     lObj = lNodes[0].name;
        //                 $('#eleLinkedInput').val(lObj);
        //                 //主属性
        //                 var mainList = data.obj.identifyElement.locatePropertyCollection.main_properties;
        //                 for (var i = 0; i < mainList.length; i++) {
        //                     var mainTr = $('<tr></tr>'),
        //                         mainCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
        //                         mainNameTd = $('<td contenteditable="true"></td>'),
        //                         mainValTd = $('<td contenteditable="true"></td>');
        //                     mainNameTd.html(mainList[i].name);
        //                     mainValTd.html(mainList[i].value);
        //                     mainTr.append(mainCheckTd, mainNameTd, mainValTd);
        //                     $('#mainTbody').append(mainTr);
        //                 }
        //                 //附加属性
        //                 var addiList = data.obj.identifyElement.locatePropertyCollection.addtional_properties;
        //                 for (var j = 0; j < addiList.length; j++) {
        //                     var addiTr = $('<tr></tr>'),
        //                         addiCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
        //                         addiNameTd = $('<td contenteditable="true"></td>'),
        //                         addiValTd = $('<td contenteditable="true"></td>');
        //                     addiNameTd.html(addiList[j].name);
        //                     addiValTd.html(addiList[j].value);
        //                     addiTr.append(addiCheckTd, addiNameTd, addiValTd);
        //                     $('#addiTbody').append(addiTr);
        //                 }
        //                 //辅助属性
        //                 var assiList = data.obj.identifyElement.locatePropertyCollection.assistant_properties;
        //                 for (var k = 0; k < assiList.length; k++) {
        //                     var assiTr = $('<tr></tr>'),
        //                         assiCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
        //                         assiNameTd = $('<td contenteditable="true"></td>'),
        //                         assiValTd = $('<td contenteditable="true"></td>');
        //                     assiNameTd.html(assiList[k].name);
        //                     assiValTd.html(assiList[k].value);
        //                     assiTr.append(assiCheckTd, assiNameTd, assiValTd);
        //                     $('#assiTbody').append(assiTr);
        //                 }
        //                 //关联元素
        //                 var relateNameList = data.obj.logicalElementNameList;
        //                 for (var l = 0; l < relateNameList.length; l++) {
        //                     var relateNameTr = $('<tr></tr>'),
        //                         relateNameCheckTd = $("<td><input type='checkbox' name='chk_list' @click='showProp($event)'/></td>"),
        //                         relateNameTd = $('<td contenteditable="true"></td>');
        //                     relateNameTd.html(relateNameList[l]);
        //                     relateNameTr.append(relateNameCheckTd, relateNameTd);
        //                     $('#relateNameTbody').append(relateNameTr);
        //                 }
        //             }
        //         });
        //     }
        // },
        onClick: function(event, treeId, treeNode, clickFlag) {
            if (treeNode.parentid == '0') { //选择的是UI
                $(':input', '#UIForm').val('');
                app.UIName = treeNode.name;
                $('#UIForm input[name="UIName"]').val(treeNode.name);
                $('#UI').css('display', 'block');
                $('#ele').css('display', 'none');
                $.ajax({
                    url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/queryUI',
                    type: 'post',
                    data: {
                        "transid": app.transactId,
                        "UIName": app.UIName
                    },
                    success: function(data) {
                        var relateObjectId = data.obj.relateIdentifyObjectId;
                        var treeObj = $.fn.zTree.getZTreeObj("UILinkedTree");
                        treeObj.checkNode(treeObj.getNodeByParam("id", relateObjectId, null));
                        var nodes = treeObj.getCheckedNodes(true),
                            obj = nodes[0].name;
                        $('#UILinkedInput').val(obj);
                    }
                });
            } else { //选择的是元素
                $('#classtypeSelect').val('');
                $('#eleParentInput').val('');
                $('#eleLinkedInput').val('');
                var treeObj = $.fn.zTree.getZTreeObj("elementtree");
                var nodes = treeObj.getCheckedNodes(true);
                app.eleName = treeNode.name;
                $('#UI').css('display', 'none');
                $('#ele').css('display', 'block');
                $.ajax({
                    url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/queryElement',
                    type: 'post',
                    data: {
                        "transid": app.transactId,
                        "UIName": app.UIName,
                        "ElementName": app.eleName
                    },
                    success: function(data) {
                        var classtype = data.obj.classtype;
                        $('#classtypeSelect').val(classtype);
                        var relateParentObjectId = data.obj.relateParentIdentifyObjectId;
                        var relateObjectId = data.obj.relateIdentifyObjectId;
                        //父对象
                        var elePtree = $.fn.zTree.getZTreeObj("eleParentTree");
                        elePtree.checkNode(elePtree.getNodeByParam("id", relateParentObjectId, null));
                        var pNodes = elePtree.getCheckedNodes(true),
                            pObj = pNodes[0].name;
                        $('#eleParentInput').val(pObj);
                        //关联对象
                        var eleLtree = $.fn.zTree.getZTreeObj("eleLinkedTree");
                        eleLtree.checkNode(eleLtree.getNodeByParam("id", relateObjectId, null));
                        var lNodes = eleLtree.getCheckedNodes(true),
                            lObj = lNodes[0].name;
                        $('#eleLinkedInput').val(lObj);
                        //主属性
                        var mainList = data.obj.identifyElement.locatePropertyCollection.main_properties;
                        if (mainList.length !== 0) {
                            $('#mainTbody').children().remove();
                            for (var i = 0; i < mainList.length; i++) {
                                var mainTr = $('<tr></tr>'),
                                    mainCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
                                    mainNameTd = $('<td contenteditable="true"></td>'),
                                    mainValTd = $('<td contenteditable="true"></td>');
                                mainNameTd.html(mainList[i].name);
                                mainValTd.html(mainList[i].value);
                                mainTr.append(mainCheckTd, mainNameTd, mainValTd);
                                $('#mainTbody').append(mainTr);
                            }
                        } else {
                            $('#mainTbody').children().remove();
                            $('#mainTbody').append(app.propTr);
                        }

                        //附加属性
                        var addiList = data.obj.identifyElement.locatePropertyCollection.addtional_properties;
                        if (addiList.length !== 0) {
                            $('#addiTbody').children().remove();
                            for (var j = 0; j < addiList.length; j++) {
                                var addiTr = $('<tr></tr>'),
                                    addiCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
                                    addiNameTd = $('<td contenteditable="true"></td>'),
                                    addiValTd = $('<td contenteditable="true"></td>');
                                addiNameTd.html(addiList[j].name);
                                addiValTd.html(addiList[j].value);
                                addiTr.append(addiCheckTd, addiNameTd, addiValTd);
                                $('#addiTbody').append(addiTr);
                            }
                        } else {
                            $('#addiTbody').children().remove();
                            $('#addiTbody').append(app.propTr);
                        }

                        //辅助属性
                        var assiList = data.obj.identifyElement.locatePropertyCollection.assistant_properties;
                        if (assiList.length !== 0) {
                            $('#assiTbody').children().remove();
                            for (var k = 0; k < assiList.length; k++) {
                                var assiTr = $('<tr></tr>'),
                                    assiCheckTd = $("<td><input type='checkbox' name='chk_list'/></td>"),
                                    assiNameTd = $('<td contenteditable="true"></td>'),
                                    assiValTd = $('<td contenteditable="true"></td>');
                                assiNameTd.html(assiList[k].name);
                                assiValTd.html(assiList[k].value);
                                assiTr.append(assiCheckTd, assiNameTd, assiValTd);
                                $('#assiTbody').append(assiTr);
                            }
                        } else {
                            $('#assiTbody').children().remove();
                            $('#assiTbody').append(app.propTr);
                        }
                        //关联元素
                        var relateElementList = data.obj.relateElementList;
                        if (relateElementList.length !== 0) {
                            $('#relateNameTbody').children().remove();
                            for (var l = 0; l < relateElementList.length; l++) {
                                var relateNameTr = $('<tr></tr>'),
                                    relateNameCheckTd = $("<td><input type='checkbox' name='chk_list' onclick='relateNameClick(event)'/></td>"),
                                    relateNameTd = $('<td contenteditable="true"></td>');
                                relateNameTd.html(relateNameList[l].name);
                                relateNameTr.append(relateNameCheckTd, relateNameTd);
                                $('#relateNameTbody').append(relateNameTr);
                            }
                        }else{
                            $('#relateNameTbody').children().remove();
                            $('#relateNameTbody').append(linkedTr);
                        }
                        //关联元素属性

                    }
                });
            }
        },

    }
};
// 页面初始化获取元素库
function getElementTree() {
    var transid = $("#transactSelect").val();
    $.ajax({
        url: 'http://10.108.226.152:8080/ATFCloud/elementlibraryController/showUIandElement',
        type: 'post',
        data: { "transid": transid },
        success: function(data) {
            if (data !== null) {
                $.fn.zTree.init($("#elementtree"), setting1, data.obj);
            }
        }
    });
}

//禁止拖动
function zTreeBeforeDrag(treeId, treeNodes) {
    return false;
}

/*elementtree end*/

/*UILinked objecttree start*/
var setting2 = {
    view: {
        addHoverDom: false,
        removeHoverDom: false,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkStyle: "checkbox",
        chkboxType: { "Y": "s", "N": "ps" }
    },
    data: {
        simpleData: {
            enable: true,
            idKey: 'id', //id编号命名
            pIdKey: 'parentid', //父id编号命名
            rootPId: 0
        }
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },

    //回调函数
    callback: {
        // 禁止拖拽
        beforeDrag: zTreeBeforeDrag,
        onClick: function(event, treeId, treeNode, clickFlag) {
            app.UILinked = treeNode.name;
        },

    }
};
// 页面初始化获取对象库
function getUILinkedObjectTree() {
    var transid = $("#transactSelect").val();
    $.ajax({
        url: 'http://10.108.226.152:8080/ATFCloud/object_repoController/queryObject_repoAll',
        type: 'post',
        data: { "transid": transid },
        success: function(data) {
            if (data !== null) {
                $.fn.zTree.init($("#UILinkedTree"), setting2, data.obj);
            }
        }
    });
}
//禁止拖动
function zTreeBeforeDrag(treeId, treeNodes) {
    return false;
}
//UI关联对象库中对象
function setUILinked() {
    var treeObj = $.fn.zTree.getZTreeObj("UILinkedTree"),
        nodes = treeObj.getCheckedNodes(true),
        obj = nodes[0].name;
    $('#UILinkedInput').val(obj);

}
//解除关联
function removeUILinked() {
    $('#UILinkedInput').val('');
}
/*UILinked objecttree end*/

/*eleParent objecttree start*/
var setting3 = {
    view: {
        addHoverDom: false,
        removeHoverDom: false,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkStyle: "checkbox",
        chkboxType: { "Y": "s", "N": "ps" }
    },
    data: {
        simpleData: {
            enable: true,
            idKey: 'id', //id编号命名
            pIdKey: 'parentid', //父id编号命名
            rootPId: 0
        }
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    //回调函数
    callback: {
        // 禁止拖拽
        beforeDrag: zTreeBeforeDrag,
        onClick: function(event, treeId, treeNode, clickFlag) {
            app.eleParent = treeNode.name;
        },
    }
};
// 页面初始化获取对象库
function getEleParentObjectTree() {
    var transid = $("#transactSelect").val();
    $.ajax({
        url: 'http://10.108.226.152:8080/ATFCloud/object_repoController/queryObject_repoAll',
        type: 'post',
        data: { "transid": transid },
        success: function(data) {
            if (data !== null) {
                $.fn.zTree.init($("#eleParentTree"), setting2, data.obj);
            }
        }
    });
}
//禁止拖动
function zTreeBeforeDrag(treeId, treeNodes) {
    return false;
}
//设置对象库中父对象
function setEleParent() {
    var treeObj = $.fn.zTree.getZTreeObj("eleParentTree"),
        nodes = treeObj.getCheckedNodes(true),
        obj = nodes[0].name;
    $('#eleParentInput').val(obj);

}
/*eleParent objecttree end*/

/*eleLinked objecttree start*/
var setting4 = {
    view: {
        addHoverDom: false,
        removeHoverDom: false,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkStyle: "checkbox",
        chkboxType: { "Y": "s", "N": "ps" }
    },
    data: {
        simpleData: {
            enable: true,
            idKey: 'id', //id编号命名
            pIdKey: 'parentid', //父id编号命名
            rootPId: 0
        }
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    //回调函数
    callback: {
        // 禁止拖拽
        beforeDrag: zTreeBeforeDrag,
        onClick: function(event, treeId, treeNode, clickFlag) {
            app.eleLinked = treeNode.name;
        },

    }
};
// 页面初始化获取对象库
function getEleLinkedObjectTree() {
    var transid = $("#transactSelect").val();
    $.ajax({
        url: 'http://10.108.226.152:8080/ATFCloud/object_repoController/queryObject_repoAll',
        type: 'post',
        data: { "transid": transid },
        success: function(data) {
            if (data !== null) {
                $.fn.zTree.init($("#eleLinkedTree"), setting2, data.obj);
            }
        }
    });
}
//禁止拖动
function zTreeBeforeDrag(treeId, treeNodes) {
    return false;
}
//设置对象库中关联对象
function setEleLinked() {
    var treeObj = $.fn.zTree.getZTreeObj("eleLinkedTree"),
        nodes = treeObj.getCheckedNodes(true),
        obj = nodes[0].name;
    $('#eleLinkedInput').val(obj);

}
/*eleLinked objecttree end*/

//勾选关联元素名称
function relateNameClick(event){
    if($(event.target).attr('checked')){

    }
}