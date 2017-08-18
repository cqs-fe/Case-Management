$(document).ready(function(){
	// var submenuHeight = document.querySelector('#submenu').offsetHeight;
	// document.querySelector('#submenu').children[0].style.height = submenuHeight / 2 + 'px';
	// document.querySelector('#submenu').children[1].style.height = submenuHeight / 2 + 'px';
	(function(){
        
        var tooltipwindow = new Vue({
          el: '#tooltipwindow',
          data: {
            flag: true
          },
          methods: {
            toggle: function(){
              this.flag = !this.flag;
            }
          }
        });
    })();
	(function(){
		var editDataVue = new Vue({
			el: '#editData',
			data: {
				dataType:4,
				isShow: false,
				insertTitle:null,
				insertType: null,
				isInsertDivShow:true, //
				selection: null,
				beforeOperationRows: [],//[{id:Symbol(), functions: [], operation: {element:'', ui: '',parameters:[]}}],
				afterOperationRows: [],
				parameterVue: null,
				// ztree的设置项
				zTreeSettings: {
					uiAndElement: {
						callback: {
						},
						data: {
							simpleData: {
								enable: true,
								idKey: 'id',
								pIdKey: 'parentid',
								rootPId: 0
							}
						}
					},
					functions: {
						callback: {
						},
						data: {
					        key:{
					            name:"mname",
					        },
					        simpleData: {
					            enable: true,
					            idKey: 'classid', 
					            pIdKey: 'parentid', 
					            rootPId: 0
					        }
					    }
					}
				},
				uiOrFunctions: {
					changed: false,  	// 模态框出现后是否点击过，如果点击过，在模态框点击保存时才会进行更改
					type: 'ui',			// 保存最后点击的是UI还是函数集，据此来确定不同的后续执行行为
					ui: '',				// 保存点击的ui
					element: '',		// 保存点击的元素
					function: '',		// 保存点击的函数集中的项
					target: null,		// 保存点击编辑的target，据此可以获得parent tr
					table: 1			// 保存当前操作的是前置操作还是后置操作
				}
			},
			created: function(){},
			ready: function() {
				var _this = this;
				this.zTreeSettings.uiAndElement.callback.onClick = this.zTreeOnClick;
				this.zTreeSettings.functions.callback.onClick = this.zTreeOnClick;
				// 设置table可以拖拽行
				$( function() {
                    $( "#sortable" ).sortable({
                        stop: (event, ui) => {
                        	if(+(ui.item[0].rowIndex - 1) === +ui.item[0].getAttribute('data-index')){
                        		return
                        	}
                        	// 拖拽停止后，改变绑定的数组中元素的顺序
                        	var target = ui.item[0].rowIndex - 1
                        	console.log(target)
                        	var start = ui.item[0].getAttribute('data-index');
                        	// console.log(`target: ${target} -- start: ${start}--end: ${end}`)
                        	if(target < 0) {
                        		_this.beforeOperationRows.unshift(_this.beforeOperationRows.splice(start, 1)[0])
                        	} else {
                        		_this.beforeOperationRows.splice(target, 0, _this.beforeOperationRows.splice(start, 1)[0])
                        	}
                        }
                    });
                    $( "#sortable" ).disableSelection();
                    $( "#sortable2" ).sortable({
                        stop: (event, ui) => {
                        	if(+(ui.item[0].rowIndex - 1) === +ui.item[0].getAttribute('data-index')){
                        		return
                        	}
                        	// 拖拽停止后，改变绑定的数组中元素的顺序
                        	var target = ui.item[0].rowIndex - 1
                        	var start = ui.item[0].getAttribute('data-index');
                        	// console.log(`target: ${target} -- start: ${start}--end: ${end}`)
                        	if(target < 0) {
                        		_this.afterOperationRows.unshift(_this.afterOperationRows.splice(start, 1)[0])
                        	} else {
                        		_this.afterOperationRows.splice(target, 0, _this.afterOperationRows.splice(start, 1)[0])
                        	}
                        }
                    });
                    $( "#sortable2" ).disableSelection();
                } );
			},
			methods: {
				hide: function(){this.isShow = false;insertDivVue.isShow = false;},
				show: function(selection){
					this.selection = selection;
					this.isShow = true;
				},
				insert: function(type, title){
					insertDivVue.show(type,title);
				},
				saveEditData: function(){
					var inputValue = document.getElementById("input"+this.dataType).value;
					console.log(inputValue);
					handsontable.setDataAtCell(this.selection.start.row,this.selection.start.col,inputValue);
					handsontable.render();
				},
				addRow: function(type){
					let s = {id: Symbol(), operation: {element:'', ui:''}, functions:[], parameters: []}
					type === 1 ? 
						(this.beforeOperationRows.push(s)) : 
						(this.afterOperationRows.push(s))
				},
				deleteRow: function(index, type) {
					type === 1 
						? (this.beforeOperationRows.splice(index,1))
						: (this.afterOperationRows.splice(index,1))
				},
				// 显示UI和元素 、函数集
				showUiAndElement: function(event, type) {
					var _this = this;
					this.uiOrFunctions.target = event.target;
					this.uiOrFunctions.changed = false;
					this.uiOrFunctions.table = type;
					// 请求Ui和Elment
					$.ajax({
						url: address + 'elementlibraryController/showUIandElement',
						data: 'transid=1',
						type: 'post',
						dataType: 'json',
						success: (data, statusText) => {
							if(data && data.success === true && (data.obj instanceof Array)) {
								$.fn.zTree.init($('#ui-element-ul'),_this.zTreeSettings.uiAndElement, data.obj);
							}
						}
					})
					// 请求函数集
					$.ajax({
						url: address + 'autController/selectFunctionSet',
						data: 'id=2',
						type: 'post',
						dataType: 'json',
						success: (data, statusText) => {
							if(data.ommethod) {
								$.fn.zTree.init($('#functions-ul'),_this.zTreeSettings.functions, data.ommethod);
							}	
						}
					})

					$('#ui-ele-modal').modal('show')
				},
				// 确定ztree的点击事件
				zTreeOnClick: function(event, treeId, treeNode) {
					if(treeNode.isParent){
						return					// 如果点击了父节点，则返回
					}
					// 判断树结构是ui还是函数集
					if(treeId === 'ui-element-ul') {
						var parent = treeNode.getParentNode()
						if (!parent) {
							return			// 没有父元素，则返回
						}
						this.uiOrFunctions.type = 'ui'
						this.uiOrFunctions.ui = treeNode.name
						this.uiOrFunctions.element = parent.name;
					} else {
						this.uiOrFunctions.type = 'function'
						// 获取节点的全部内容
						this.uiOrFunctions.function = treeNode;
						// console.log(treeNode)
					}
					this.uiOrFunctions.changed = true;			// 已经在模态框中点击了树节点
				},
				// 编辑参数方法，出现模态框，进行函数的编辑
				editParameter: function(event, type) {
					var _this = this
					// 保存当前点击行，行索引值以及当前需要操作的table所绑定的数组
					var parentRow = $(event.target).parents('tr')
					var index = parentRow.attr('data-index');
					var operationRows = type === 1 ? _this.beforeOperationRows : _this.afterOperationRows;

					_this.parameterVue = new Vue({
						el: '#edit-parameter-modal',
						data: {
							parameters: null
						},
						methods: {
							okParameter: function(event) {
								var inputs = $('#edit-parameter-modal input')
								console.log(inputs)
								for(var i=0;i<operationRows[index].parameters.length;i++) {
									operationRows[index].parameters[i].Value = inputs[i].value
								}
								modalVue.updateRow(operationRows, index)
								console.log(operationRows)
								$('#edit-parameter-modal').modal('hide')
							}
						}
					})
					_this.parameterVue.parameters = operationRows[index].parameters;
					$('#edit-parameter-modal').modal('show')
				},
				// remove the row who is checked when 
				removeRow: function(event, type) {
					var parent = $(event.target).closest('.operation-wrapper')
					var trs = parent.find("tbody input[type='checkbox']:checked").closest('tr')

					var operationRows = (type === 1 ? this.beforeOperationRows : this.afterOperationRows)
					for(var tr of trs) {
						operationRows.splice(tr.getAttribute('data-index'), 1)
					}
				},
				moveUp: function(event, type) {
					console.log('moveUp')
					var _this = this;
					var operationRows = (type === 1 ? this.beforeOperationRows : this.afterOperationRows )
					var trs = $(event.target).closest('.operation-wrapper').find(`input[type='checkbox']:checked`).closest('tr')
					$.each(trs, (index, row) => {
						var originIndex = row.getAttribute('data-index')
						originIndex >= 1 &&
						operationRows.splice(originIndex - 1, 0, operationRows.splice(originIndex,1)[0])
					})
				},
				moveDown: function(event, type) {
					console.log(JSON.parse(`[{"Name":"输入值1","Type":"","Desc":"","ParameterizeColumn":"{element}"},{"Name":"输入值2","Type":"","Desc":"","ParameterizeColumn":"{element}"}]`))
					var _this = this;
					var operationRows = (type === 1 ? this.beforeOperationRows : this.afterOperationRows )
					var trs = $(event.target).closest('.operation-wrapper').find(`input[type='checkbox']:checked`).closest('tr')
					for (var i = trs.length - 1; i >= 0; i--) {
						var originIndex = trs[i].getAttribute('data-index')
						operationRows.splice(+originIndex + 1, 0, operationRows.splice(+originIndex, 1)[0])
					}
				},
				saveOperation: function(event) {
					var a3 = this.beforeOperationRows.splice(3,1)
					console.log(a3)
					this.beforeOperationRows.splice(1, 0, a3[0])
				}
			},
		});
		var modalVue = new Vue({
			el: '#ui-ele-modal',
			data: {},
			methods: {
				// 在模态框中点击了保存按钮
				editRow: function () {
					var _this = this;
					if(!editDataVue.uiOrFunctions.changed) {
						return;		// 没有点击树结构，则返回
					}
					// 保存当前点击行，行索引值以及当前需要操作的table所绑定的数组
					var parentRow = $(editDataVue.uiOrFunctions.target).parents('tr')
					var index = parentRow.attr('data-index');
					var operationRows = editDataVue.uiOrFunctions.table === 1 ? editDataVue.beforeOperationRows : editDataVue.afterOperationRows;

					if (editDataVue.uiOrFunctions.type === 'ui') {
						// 点击了ui 与 元素后, 更新operation
						operationRows[index].operation = {
							ui: editDataVue.uiOrFunctions.ui,
							element: editDataVue.uiOrFunctions.element
						};

						// 使用splice方法，通过改变数组项的id更新绑定的数组，
						_this.updateRow(operationRows, index);

						// 发送ajax请求函数的数据
						var data = {
							id: 8,		// autid
							classname: editDataVue.uiOrFunctions.ui,		// classname
						}

						var getFunctions = new Promise((resolve, reject) => {
							$.ajax({
								url: address + 'autController/selectMethod',
								data: data,
								type: 'post',
								dataType: 'json',
								success: function(data, statusText) {
									var ommethod = data.ommethod;
									operationRows[index].functions = ommethod;
									_this.updateRow(operationRows, index)
									resolve();
								}
							})
						})
						getFunctions.then(() => {
							// 获取函数项的值
							// var mname = $('.functions-select', parentRow).val()
							var mname = operationRows[index].functions[0].mname
							var data = {
								autid: 8,	
								className: editDataVue.uiOrFunctions.ui,
								methodName: mname
							}
							return new Promise((resolve, reject) => {
								$.ajax({
									url: address + 'autController/selectParameterlist',
									data: data,
									type: 'post',
									dataType: 'json',
									success: function(data, statusText) {
										operationRows[index].parameters = JSON.parse(`${data}`)
										_this.updateRow(operationRows, index)
										resolve()
									}
								})
							})
						}).then(() => {
							console.log('success')
						})
					} else {
						// 清空functions数组并新添加选中的公共方法
						operationRows[index].functions = [];
						operationRows[index].functions.push(editDataVue.uiOrFunctions.function)
						// 清空操作项
						operationRows[index].operation = {
							ui: '',
							element: ''
						};
						// 更新参数
						operationRows[index].parameters = JSON.parse(operationRows[index].functions[0].arguments)
						_this.updateRow(operationRows, index)
					}
					$('#ui-ele-modal').modal('hide')
				},
				updateRow: function(rows, index) {
					// 使用splice方法，通过改变数组项的id更新绑定的数组，
					var cache = rows[index]
					cache.id = Symbol()
					rows.splice(index, 1, cache)
				}
			}
		})
		var insertDivVue = new Vue({
			el: '#insertDiv',
			data: {
				isShow: false,
				type: null,
				insertTitle:null,
				trData: ['参数1','参数2','参数3','参数4'],
				dataPoolType: null,
				dataWritable: "",
				functionName: ""
			},
			created: function(){

			},
			methods: {
				show: function(type,title){
					this.isShow = true;
					this.insertTitle = title;
					this.type = type;
				},
				hide: function(){
					this.isShow = false;
					// this.trData = [];
				},
				saveData: function(){
					var finalString = '';
					if(this.type === 1){
						var dataName = document.getElementById("dataName").value;
						switch(this.dataPoolType){
							case 1: finalString = "var(\"" + dataName + "\")";break;
							case 2: finalString = "Data.Flow(\"" + dataName + "\")";break;
							case 3: finalString = "Data.Com(\"" + dataName + "\")";break;
							case 4: finalString = this.dataWritable === "readable" ? "Data.Scene(\"" : "Data.SceneShare(\"" + dataName + "\")";break;
							case 5: finalString = this.dataWritable === "readable" ? "Data.Scene(\"" : "Data.SceneShare(\"" + dataName + "\")";break;
							case 6: finalString = "Data.Env(\"" + dataName + "\")";break;
						}
					}else {
						var paramValuesTd = document.getElementsByClassName("td-param-value");
						var paramValues = [];
						finalString = this.functionName+ "(";
						for(var td of paramValuesTd) {
							finalString += td.innerHTML.trim() + ",";
						}
						finalString = finalString.substring(0,finalString.length - 1) + ")";
					}
					var input = document.getElementById("input4");
					var pos = this.getCursortPosition(input);
					var s = input.value;
					input.value = s.substring(0, pos)+finalString+s.substring(pos);
				},
				getCursortPosition: function(ctrl){
					var CaretPos = 0;	// IE Support
					if (document.selection) {
						ctrl.focus();
						var Sel = document.selection.createRange();
						Sel.moveStart ('character', -ctrl.value.length);
						CaretPos = Sel.text.length;
					}
					// Firefox support
					else if (ctrl.selectionStart || ctrl.selectionStart == '0')
						CaretPos = ctrl.selectionStart;
					return (CaretPos);
				},
			}
		});
		var setting = {
			callback: {
				onDblClick: zTreeOnDblClick
			},
		};
		var zTreeObj;
		var data = {
			testpoint: 6,
			executor: 6,
			caseLib_id: 6
		};
		var sub = new Vue({
            el: '#submenu',
            data: {
                flag: true,
                selectItems: [],
                // checkedItems: [{value: 1,name: '登陆'},{value: 2,name: '注册'}],
                checkedItems: [],
                // 保存点击后的复选框
                checkedArray:[],
                systemInfo: {
                	executor: 63,
                	caseLib_id: 1,
                	testpoints: '',
                }
            },
            created: function(){

            },
            ready: function() {
            	var _this = this;
                var data = [
			        {
			            "name": "测试点",
			            "value": 1
			        },
			        {
			            "name": "执行状态",
			            "value": 2
			        }
			    ];
				_this.selectItems = data;
				_this.getInfo();
            },
            methods: {
            	getInfo: function() {
            		var userId = sessionStorage.getItem('userId')
            		var caseLib_id = sessionStorage.getItem('caselibid')
      //       		if(userId == null || userId == '') {
      //       			Vac.confirm('#vac-confirm', '.okConfirm', '.cancelConfirm', '您尚未登陆，请登陆！').then(function(){
						// 	window.location.href = 'Login.html'
						// }, function(){
						// 	return;
						// })
      //       		}
            		if(caseLib_id == null || caseLib_id == '') {
            			Vac.confirm('#vac-confirm', '.okConfirm', '.cancelConfirm', '请先选择测试项目！').then(function(){
							window.location.href = 'testProject.html'
						}, function(){
							return;
						})
            		}
            		this.systemInfo.executor = userId
            		this.systemInfo.caseLib_id = caseLib_id
            	},
                toggle: function(){
                    this.flag = !this.flag;
                    document.querySelector('.wtHolder') && (document.querySelector('.wtHolder').style.width = 'auto');
                },
                changeSelect: function(event){
                    var _this = this;
                    // console.log('hello');
                    if(event.target.value == 1){
                    	var data = {
                    		executor: _this.systemInfo.executor,
                    		caseLib_id: _this.systemInfo.caseLib_id
                    	}
                        $.ajax({
                            url: address + "TestcaseController/selectTestPointByCondition",
                            data: data,
                            type: 'post',
                            dataType: "json",
                            success: function(data,textStatus){
                            	 _this.checkedItems = []
                                data.o.forEach(function(value,index){
                                    var arrayItem = {};
                                    ({testpoint:arrayItem.value} = value);
                                    arrayItem.name = arrayItem.value;
                                    _this.checkedItems.push(arrayItem);
                                });
                            }
                        });
                    } else {
                    	_this.checkedItems = [];
                    	_this.checkedArray = []
                    }
                },
                changeChecked: function(event){
                    var _this = this;
                    console.log(JSON.stringify(_this.checkedArray))
                    console.log('[' + _this.checkedArray.toString() + ']')
                    _this.systemInfo.testpoints = JSON.stringify(_this.checkedArray)
                    // _this.systemInfo.testpoints = '[' + _this.checkedArray.toString() + ']';
                    $.ajax({
                        url: address + "autController/selectTestCaseByCondition",
                        type: "post",
                        dataType: "json",
                        data: _this.systemInfo,
                        success: function(data, textStatus){
                            var treeData = [];
                            data.o.forEach((value) => {
                                var item = {};  //解构第一层
                               item.open = true;
                               item.children = [];
                               value.children.forEach((value) => {
                                   var subData = {};  //解构第二层
                                   subData.children = [];
                                   subData.open = true;
                                   ({
                                       transactid: subData.id,
                                       name: subData.name,
                                   } = value);
                                   value.children.forEach((value => {
                                        var ssubData = {};
                                        ({
                                            scriptid: ssubData.id,
                                            name: ssubData.name
                                        } = value);
                                        subData.children.push(ssubData);
                                   }));
                                   item.children.push(subData);
                               });
                               ({
                                   autid: item.id,
                                   name: item.name,
                               } = value);
                               treeData.push(item);
                            });
                            zTreeObj = $.fn.zTree.init($("#tree-wrapper"), setting, treeData);
                        }
                    });
                }
            }
        });

		// handsontable init
		var tableContainer = document.getElementById("handsontable");
		var handsontable = null;
		var dataSource = null;
		var changedData = [];
		var selectAllFlag = false;
		var rowSelectFlags = [];
		var string = "";
		var editableColStartIndex = 3;
		var editableColEndIndex = 5;
		var clipBoard = [];
		var clipBoardSize = {
			cols: 0,
			rows: 0
		};
		var searchResults = null;
		var currentResult = 0;
		// var undoTimes = 0;
		var contextMenuObj = {
			callback: function (key, options) {},
      		items: {
      			"row_above":{
      				name: '复制',
      				callback: copyCallback,
    				disabled:function(){return false;},
    				hidden: function(){return false;}
      			},
		        "row_below": {
		        	name: '剪切',
      				callback: cutCallback,
    				disabled:function(){return false;},
    				hidden: function(){return false;}
		        },
		        "col_left": {
		          name: '粘贴',
      				callback: pasteCallback,
    				disabled:function(){
    					return clipBoard.length === 0 ? true : false;
    				},
    				hidden: function(){return false;}
		        },
		        "col_right": {
		        	name: '清除',
      				callback: clearCallback,
    				disabled:function(){return false;},
    				hidden: function(){return false;}
		        },
		        "remove_row":{
		        	name: '搜索',
		        	callback:searchCallback,
		        	disabled: function(){return false},
		        	hidden: function(){return false}
		        },
		        "remove_col":{
		        	name: '替换',
		        	callback: replaceCallback,
		        	disabled: function(){return false;},
		        	hidden: function(){return false;}
		        },
		        "make_read_only":{
		        	name: '编辑数据',
		        	callback: editCellData,
		        	disabled: function(){},
		        	hidden: function(){
		        		// [startRow, startCol, endRow, endCol]
		        		var selection = handsontable.getSelected();
		        		if(selection && selection[1] >= 8 && selection[0] == selection[2] && selection[1] == selection[3]){
		        			return false;
		        		}
		        		return true;
		        	}
		        }
      		}
		};
		const columnsHeaders = [
			"<input type='checkbox' class='header-checker' "+ (selectAllFlag?"checked='checked'":"")+">","行号",
			"案例编号","测试点","测试意图","测试步骤","预期结果","检查点"
		];
		const columnsOptions = [
			{	data:"",
				renderer: function(instance, td, row, col, prop, value, cellProperties){
				td.style.textAlign = 'center';
				td.innerHTML = "<input type='checkbox' data-index='"+row+"' class='checker' "+ (rowSelectFlags[row]?"checked='checked'":"") +">";
				return td;
				},
				readOnly: true
			},
			{	data:"",
				renderer: function(instance, td, row, col, prop, value, cellProperties){
					td.innerHTML = parseInt(row) + 1;
		 			return td;
				},
				readOnly: true
			},
			{	data: "casecode",readOnly: false},
			{	data: "testpoint",readOnly: false},
			{	data: "testdesign",readOnly: false},
			{	data: 'teststep',readOnly: false},
			{	data: 'expectresult',readOnly: false},
			{	data: 'checkpoint',readOnly: false}
		];
		var totalColumnsHeaders = [];
		var getColumnsOptions = function(tableHead){
			//tableHead = [ ["[待删除]","商品"], ["[待删除]","t1"] ]
			var totalColumnsOptions = [];
			var dataKey = getDataKey(tableHead);
			console.log("getColumnsOptions中dataKey:" + dataKey);
			// dataKey = ["商品","t1"]
			dataKey.forEach((key) => {
				if(key){
					var option = {
						data: key,
						readOnly: false
					};
					totalColumnsOptions.push(option);
				}
			});
			totalColumnsOptions = columnsOptions.concat(totalColumnsOptions);
			return totalColumnsOptions;
		};
		var getTotalColHeaders = function(data){
			// console.log("const"+columnsHeaders);
			totalColumnsHeaders  = [];
			// console.log("before"+totalColumnsHeaders);
			if(data && data.length){
				data.forEach((value) => {
					if(value.length > 0){
						var header = value.join('%');
						totalColumnsHeaders.push(header);
						// console.log("every"+ totalColumnsHeaders);
					}
				});
			}
			totalColumnsHeaders = columnsHeaders.concat(totalColumnsHeaders);
		};
		// 得到数据的表头
		var getDataKey = function(data){
			console.log("getDataKey中的head:"+data);
			//data = [ ["[待删除]","商品"], ["[待删除]","t1"] ]
			var dataKey = [];
			if(data){
				data.forEach((value) => {
					dataKey.push(value[1]);
				});
			}

			return dataKey;
		};
		function zTreeOnDblClick(event, treeId, treeNode){
			if(treeNode && !treeNode.isParent){
				var autId = treeNode.getParentNode().getParentNode().id;
				var transId = treeNode.getParentNode().id;
				var scriptId = treeNode.id;
				var data = {
					testpoint: sub.systemInfo.test,
					executor: sub.systemInfo.executor,
					caseLib_id: sub.systemInfo.caseLib_id,
					autId:autId,
					transId:transId,
					scriptId:scriptId
				};
				$.ajax({
					url: address + "scripttemplateController/searchScripttemplateInf",
					data: data,
					type:"post",
					dataType: "json",
					success: function(data){
						var dataKey = [];
						if(data.o.tableHead){
							// [ ["[待删除]","商品"], ["[待删除]","t1"] ]
							dataKey = getDataKey(data.o.tableHead);
							console.log("dataKey:"+dataKey);
						}
						var destrutData = [];
						if(data.o.tableDatas){
							data.o.tableDatas.forEach((value) => {
							var data = {};
							({
								id: data.testcaseId,
								expectresult:data.expectresult,
								testpoint: data.testpoint,
								teststep: data.teststep,
								checkpoint: data.checkpoint,
								testdesign: data.testdesign,
								casecode: data.casecode
							} = value);
							dataKey.forEach((key) => {
								data[key] = value[key];
							});
							console.log(data)
							destrutData.push(data);
						});
						}
						// console.log(destrutData);
						dataSource = destrutData;
						console.log(dataSource)
						rowSelectFlags.length = dataSource.length;
						getTotalColHeaders(data.o.tableHead);
						console.log(totalColumnsHeaders);
						var totalColumnsOptions = getColumnsOptions(data.o.tableHead);
						if(handsontable === null){
							handsontable = new Handsontable(tableContainer,{
								data: dataSource,
								hiddenColumns: {
							      columns: [2,3],
							      indicators: false
							    },
								columns: totalColumnsOptions,
							  	colHeaders: colHeadersRenderer,
							  	cells: function (row, col, prop) {
								    var cellProperties = {};
								    return cellProperties;
								},
								multiSelect: true,
								outsideClickDeselects: true,
								contextMenu: contextMenuObj,
								undo: true,
								copyPaste: true,
								allowInsertRow: false,
								allowInsertColumn: false,
								search: {
									searchResultClass: ''
								},
								afterRender: function(){
									if(searchResults && searchResults.length){
										var trs = document.querySelectorAll('#handsontable tbody tr');
										searchResults.forEach((value,index) => {
											var tds = trs[value.row].getElementsByTagName('td');
											if(index === currentResult){
												tds[value.col].style.backgroundColor="#f00";
											}else{
												tds[value.col].style.backgroundColor="#0f0";
											}

										})
									}
									document.querySelectorAll("table th")[0].style.display = "none";
								},
								afterChange: function(changes,source){
									if(changes){
										changes.forEach((value) => {
											var data = {};
											// data.testcaseId = handsontable.getDataAtRowProp(value[0], 'casecode');
											data.testcaseId = dataSource[value[0]].testcaseId;
											data.tbHead = value[1];
											data.value = value[3];
											var changedIndex;
											changedData.forEach((value,index) => {
												if(value.testcaseId == data.testcaseId && value.tbHead == data.tbHead){
													changedIndex = index;
												}
											});
											if(changedIndex !== undefined){
												changedData.splice(changedIndex,1,data);
											}else{
												changedData.push(data);
											}
										});
										console.log(changedData.toString());
									}
								}

							});
							// handsontable.updateSettings(contextMenuObj);
						}
						else{
							handsontable.updateSettings({
							   data: dataSource,
							   columns: totalColumnsOptions,
							   colHeaders: colHeadersRenderer
							});
							handsontable.render();
						}
					}
				}); //aj
			}
		}

		Handsontable.Dom.addEvent(tableContainer, 'mousedown', function (event) {
    		if (event.target.nodeName == 'INPUT' && event.target.className == 'header-checker') {
      			selectAllFlag = !event.target.checked;
      			for(var i = 0; i < rowSelectFlags.length; i++){
      				rowSelectFlags[i] = selectAllFlag;
      			}
      			var inputs = document.querySelectorAll('#handsontable tbody tr td:first-child input');
      			var trs = document.querySelectorAll('#handsontable tbody tr');
      			if(selectAllFlag){
      				for(var tr of trs){
      					tr.className = 'selected';
      				}
      				for(var input of inputs){
      					input.checked = true;
      				}
      			}else{
      				for(var tr of trs){
      					tr.className = '';
      				}
      				for(var input of inputs){
      					input.checked = false;
      				}
      			}
      			// handsontable.render();
      			event.stopPropagation();
    		}else if(event.target.nodeName == 'INPUT' && event.target.className == 'checker'){
				var row = event.target.getAttribute('data-index');
				rowSelectFlags[row] = !event.target.checked;
				var inputs = document.querySelectorAll('#handsontable tbody tr td:first-child input');
      			var trs = document.querySelectorAll('#handsontable tbody tr');
				if(rowSelectFlags[row]){
					trs[row].className = 'selected';
				}else{
					trs[row].className = '';
				}

    		}else{

    		}
		});
		var searchBoxVue = new Vue({
			el: '#searchBox',
			data: {
				isShow: false,
				searOrRep: false,
				keyword: "",
				newword: '',
				searchResults:null,
				currentReult:0,
			},
			methods: {
				show: function(searOrRep){
					this.isShow = true;
					this.searOrRep = searOrRep;
				},
				hide: function(){
					this.isShow = false;
					searchResults = null;
					currentResult = 0;
					this.keyword = "";
					handsontable.search.query(this.keyword);
					handsontable.render();
				},
				showSearch: function(){this.searOrRep = false;},
				showReplace: function(){this.searOrRep = true;},
				search: function(){
					searchResults = handsontable.search.query(this.keyword);
					currentResult = 0;
					// this.renderResults();
					handsontable.render();
				},
				findNext: function(){
					currentResult += 1;
					if(currentResult >= searchResults.length){
						currentResult = 0;
					}
					this.renderResults();
					this.scrollViewportTo(searchResults);
				},
				replace: function(){
					handsontable.setDataAtCell(searchResults[currentResult].row,searchResults[currentResult].col,this.newword);
					searchResults = handsontable.search.query(this.keyword);
					handsontable.render();
					if(currentResult >= searchResults.length){
						currentResult = 0;
					}
					this.renderResults();
				},
				replaceAll: function(){
					this.search();
					if(searchResults && searchResults.length){
						var newData = [];
						searchResults.forEach((value) => {
							var data = [value.row,value.col,this.newword];
							newData.push(data);
						});
						handsontable.setDataAtCell(newData);
						handsontable.render();
					}
				},
				scrollViewportTo: function(result){
					if(result && result.length){
						handsontable.scrollViewportTo(result[currentResult]['row'],result[currentResult]['col']);
					}
				},
				renderResults: function(){
					if(searchResults && searchResults.length){
						var trs = document.querySelectorAll('#handsontable tbody tr');
						searchResults.forEach((value,index) => {
							var tds = trs[value.row].getElementsByTagName('td');
							if(index === currentResult){
								tds[value.col].style.backgroundColor="#f00";
							}else{
								tds[value.col].style.backgroundColor="#0f0";
							}
						})
					}
				}
			},
			computed: {

			}
		});
		//window resize
		window.onresize = function(){
			if(handsontable !== null){
				handsontable.render();
			}
			try {
				var submenuHeight = document.querySelector('#submenu').offsetHeight;
				document.querySelector('#submenu').children[0].style.height = submenuHeight / 2 + 'px';
				document.querySelector('#submenu').children[1].style.height = submenuHeight / 2 + 'px';
			} catch(e) {}
			
		};
		//保存按钮
		document.getElementById('saveAll').onclick = function(){
			var data = { data: changedData };
			console.log(encodeURIComponent(JSON.stringify(data)));
			$.ajax({
				url: address + 'scripttemplateController/scripttemplateInf',
				data: "jsonStr="+encodeURIComponent(JSON.stringify(data),'utf-8'),
				dataType: 'json',
				type: 'post',
				success: function(data,textStatus){
					if(data.success === true){
						Vac.alert('保存成功')
					}
				}
			});
		};
		//双击单元格，跳出编辑数据框
		document.querySelectorAll('.dbclick').onDblClick = function(){
			console.log('niah');
		};
		//渲染第0列的内容
		function colHeadersRenderer(col){
			if(parseInt(col) === 0){
				return "<input type='checkbox' class='header-checker' "+ (selectAllFlag?"checked='checked'":"")+">";
			}else{
				return totalColumnsHeaders[col];
			}
		};
		//渲染第一列的内容 end
		//渲染平常列
		function renderNormalCol(instance, td, row, col, prop, value, cellProperties){
			if(row%2){
				td.style.backgroundColor = "#eeee11";
			}else{
				td.style.backgroundColor = "#ffff00";
			}
			if(rowSelectFlags[row] === true){
				td.style.backgroundColor = "#1ABDE6";
			}else{
				// td.style.backgroundColor = "#fff";
			}
			if(td.isSearchResult){
				// td.style.backgroundColor = "#fff";
				console.log("result");
			}
			td.innerHTML = value;
			return td;
		};
		//渲染平常列 end

		//复制功能函数
		function copyCallback(key,selection){
			var trueIndexArray = [];
			rowSelectFlags.forEach((flag, index) => {
				if(flag){
					trueIndexArray.push(index);
				}
			});
			// 先清空剪切板
			while(clipBoard.length > 0){
				clipBoard.pop();
			}
			//选择所有被选中的单元格
			var i = 0;
			for(i = selection.start.row;i <= selection.end.row;i++){
				let j = 0;
				for(j = selection.start.col; j <= selection.end.col;j++){
					let data = [i - selection.start.row, j - selection.start.col,handsontable.getDataAtCell(i,j)];
					clipBoard.push(data);
				}
			}
			clipBoardSize.cols = selection.end.col - selection.start.col + 1;
			clipBoardSize.rows = selection.end.row - selection.start.row + 1;
		}
		//复制功能函数 end
		//粘贴功能函数
		// the data of the clipboard : [[row,col,value],[row,col,value]]
		function pasteCallback(key, selection){
			if(clipBoard.length > 0){
				var cols = selection.end.col - selection.start.col + 1;
				var rows = selection.end.row - selection.start.row + 1;
				if(cols <= clipBoardSize.cols && rows <= clipBoardSize.rows){
					var clipBoardData = clipBoard.map((array) => {
						let arrayData = [];
						arrayData[0] = parseInt(array[0]) + parseInt(selection.start.row);
						arrayData[1] = parseInt(array[1]) + parseInt(selection.start.col);
						arrayData[2] = array[2];
						return arrayData;
					});
					setCellsData(clipBoardData);
				}else if(cols > clipBoardSize.cols && rows <= clipBoardSize.rows){
					var int = Math.floor(cols/clipBoardSize.cols);
					var i = 0;
					for(i = 0; i < int; i++){
						var clipBoardData = clipBoard.map((array) => {
							let arrayData = [];
							arrayData[0] = parseInt(array[0]) + parseInt(selection.start.row);
							arrayData[1] = parseInt(array[1]) + parseInt(selection.start.col) + i * clipBoardSize.cols;
							arrayData[2] = array[2];
							return arrayData;
						});
						setCellsData(clipBoardData);
					}
				}else if(cols <= clipBoardSize.cols && rows > clipBoardSize.rows){
					var int = Math.floor(rows/clipBoardSize.rows);
					var i = 0;
					for(i = 0; i < int; i++){
						var clipBoardData = clipBoard.map((array) => {
							let arrayData = [];
							arrayData[0] = parseInt(array[0]) + parseInt(selection.start.row) + i * clipBoardSize.rows;
							arrayData[1] = parseInt(array[1]) + parseInt(selection.start.col);
							arrayData[2] = array[2];
							return arrayData;
						});
						setCellsData(clipBoardData);
					}
				}else {
					var rowInt = Math.floor(rows / clipBoardSize.rows);
					var colInt = Math.floor(cols / clipBoardSize.cols);
					var i = 0, j = 0;
					for(i = 0; i < rowInt; i++){
						for(j = 0; j < colInt; j++){
							var clipBoardData = clipBoard.map((array) => {
								let arrayData = [];
								arrayData[0] = parseInt(array[0]) + parseInt(selection.start.row) + i * clipBoardSize.rows;
								arrayData[1] = parseInt(array[1]) + parseInt(selection.start.col) + j * clipBoardSize.cols;
								arrayData[2] = array[2];
								return arrayData;
							});
							setCellsData(clipBoardData);
						}
					}
				}
			}
		}
		//粘贴功能函数 end
		//剪切功能函数
		function cutCallback(key, selection){
			var trueIndexArray = [];
			rowSelectFlags.forEach((flag, index) => {
				if(flag){
					trueIndexArray.push(index);
				}
			});
			// 先清空剪切板
			while(clipBoard.length > 0){
				clipBoard.pop();
			}
			//选择所有被选中的单元格
			//将所有选中单元格复制到剪切板,同时清空选中单元格的内容
			var clipBoardData = [];
			var i = 0;
			for(i = selection.start.row;i <= selection.end.row;i++){
				let j = 0;
				for(j = selection.start.col; j <= selection.end.col;j++){
					let data = [i - selection.start.row, j - selection.start.col,handsontable.getDataAtCell(i,j)];
					let nullData = [i, j,""];
					clipBoard.push(data);
					clipBoardData.push(nullData)
				}
			}
			handsontable.setDataAtCell(clipBoardData);
		}
		//剪切功能函数 end
		// 清除功能函数
		function clearCallback(key,selection){
			var trueIndexArray = [];
			rowSelectFlags.forEach((flag, index) => {
				if(flag){
					trueIndexArray.push(index);
				}
			});
			//选择所有被选中的单元格
			//将所有选中单元格复制到剪切板,同时清空选中单元格的内容
			var clipBoardData = [];
			var i = 0;
			for(i = selection.start.row;i <= selection.end.row;i++){
				let j = 0;
				for(j = selection.start.col; j <= selection.end.col;j++){
					// let data = [i - selection.start.row, j - selection.start.col,handsontable.getDataAtCell(i,j)];
					let nullData = [i, j,""];
					// clipBoard.push(data);
					clipBoardData.push(nullData)
				}
			}
			handsontable.setDataAtCell(clipBoardData);
		}
		//清除功能函数 end
		// //搜索功能函数
		function searchCallback(key, selection){
			searchBoxVue.show(false);
		}
		// //搜索功能函数 end
		// //搜索功能函数
		function replaceCallback(key, selection){
			searchBoxVue.show(true);
		}
		// //搜索功能函数 end
		//编辑单元格数据
		function editCellData(key,selection){
			var header = handsontable.getColHeader(selection.start.col);
			var testcaseId = dataSource[selection.start.row].testcaseId;
			$.ajax({
				url: address + '',
				type: 'post',
				data: null,
				dataType: 'json',
				success: function(data,textStatus){
					
				}
			});
			editDataVue.show(selection);
		}
		// 编辑单元格数据
		// 设置单元格数据，保证设置的数据不超过最大行，最大列
		// parameter: [[row,col,value],[row,col,value]]
		function setCellsData(arrayData){
			var maxCol = handsontable.countCols() - 1;
			var maxRow = handsontable.countRows() - 1;
			arrayData = arrayData.filter((value) => {
				if(value[0] <= maxRow && value[1] <= maxCol){
					return true;
				}else{
					return false;
				}
			});
			handsontable.setDataAtCell(arrayData);
		}
	})();

	var editDiv = document.querySelector('#editData')
	var header = document.querySelector('#editData>header')
	Vac.startDrag(header, editDiv)
});
