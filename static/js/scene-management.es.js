var vBody = new Vue({
	el: '#v-body',
	data: {
		isSelect: false,
		tooltipFlag: true,
		tooltipType: 4,
		triggerShow: false,
		saveTriggerType: 1,

		alertShow: false,
		tooltipMessage: '',

		sceneInfo: null,
		triggers: null,
		triggerInfo: {
			selectedTrigger: [],
			editTriggerType: '编辑'
		},
		// 保存触发器编辑的字段数据
		editTriggerData:{
			triggerId: null,
			name: "",
			desc:'',
			occasions: [],
			Conditionrelate: null,
			conditions: [],
			actions: [],
			modifyType: null
		},
		// 保存执行策略的数据
		exe_strategy: {
			// sceneId: '3',
			exe_strategy1_status: '',
			exe_strategy2_start: '',
			exe_strategy2_order: '',
			exe_strategy2_status: '',
			exe_strategy3_start: '',
			exe_strategy3_order: '',
			exe_strategy3_status: '',
			exe_strategy_err: ''
		},

		// save the selected cases
		selectedCases: [],
		// 执行时间设置的相关参数
		executeTime: null,
		executeDateFlag: null,

		// 数据池数据
		dataPoolTitle: '',
		editPoolType: 1,
		selectedPool:[],
		selectedPoolId: null,
		poolData: {
			poolname: null,
			datadesc: null,
			poolobjid: null,
			dataname: null,
			datavalue: null
		},
		poolDatas: null,

		//场景id和名称
		url: '',
		sceneid: '',
		scenename: '场景名称'
	},
	ready:function(){
		this.setVal();
		var _this = this;
		// 用于初始化 滑动鼠标选取元素
		this.setSelectListener();
		// 用于页面加载时获取所有的用例
		this.getCases();
		// 数据池模态框消失
		$('#editDataPool').on('hidden.bs.modal', function(e){
			_this.poolData.poolname = '';
			_this.poolData.poolobjid = '';
			_this.poolData.dataname = '';
			_this.poolData.datavalue = '';
			_this.poolData.datadesc = '';
			// _this.selectedPool = [];
		});
		console.log('ready')
	},
	created: function(){
		
	},
	methods: {
		//获取上级页面选中的场景id和名称
		setVal:function(){
			var thisURL = document.URL;
            var getval = thisURL.split('?')[1];
            if (!getval) {
            	var promise = Vac.confirm('#vac-confirm', '.okConfirm', '.cancelConfirm', "请从场景管理页面进入！");
            	promise.then(() => {
            		location.href = "scene.html"
            	}, () => {
            		location.href = "scene.html"
            	})
            	
            }
            var keyval = getval.split('&');
            this.url = document.URL;
            
            this.sceneid = keyval[0].split('=')[1],
            this.scenename = decodeURI(keyval[1].split('=')[1]);
		},
		toInsertSceneCase: function(){
			location.href = "insertSceneCase.html?sceneid=" + this.sceneid + "&" + "scenename=" + this.scenename;
		},
		getCases: function(){
			var _this = this;
			$.ajax({
				url: address + 'sceneController/selectByPrimaryKey',
				data: 'id='+_this.sceneid,
				type: 'post',
				dataType: 'json',
				success: function(data, statusText){
					if(data.success == true){
						_this.sceneInfo = data.obj;
						({
							exeStrategy1Status: _this.exe_strategy.exe_strategy1_status,
							exeStrategy2Start:_this.exe_strategy.exe_strategy2_start,
							exeStrategy2Order: _this.exe_strategy.exe_strategy2_order,
							exeStrategy2Status: _this.exe_strategy.exe_strategy2_status,
							exeStrategy3Start: _this.exe_strategy.exe_strategy3_start,
							exeStrategy3Order: _this.exe_strategy.exe_strategy3_order,
							exeStrategy3Status: _this.exe_strategy.exe_strategy3_status,
							exeStrategyErr: _this.exe_strategy.exe_strategy_err
						} = data.obj)
					}
				}
			});
		},
		getTriggers: function(){
			var _this = this;
			$.ajax({
				url: address + 'trigerController/trigerqueryinScene',
				data: 'sceneId='+_this.sceneid,
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data.success == true){
						_this.triggers = data.obj;
					}
				}
			});
		},
		setSelect: function(event){
			var target  = event.target;
			if(!target.classList.contains('main-content')) {
				return
			}
			var fileNodes = document.querySelectorAll(".case input[type='checkbox']");
			var startX = event.offsetX;
			var startY = event.offsetY;
			var moveBeforeX = event.pageX;
			var moveBeforeY = event.pageY;
			var selDiv = document.createElement('div');
			selDiv.style.cssText = 
			`position:absolute;width:0px;height:0px;
			font-size:0px;margin:0px;padding:0px;border:1px dashed #0099FF;
			background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);
			opacity:0.6;display:none;`;
			selDiv.id = 'selectDiv';
			document.querySelector('.main-content').appendChild(selDiv);
			selDiv.style.left = startX + "px";
			selDiv.style.top = startY + 'px';
			var _x = null;
			var _y = null;
			var moveAfterX = null;
			var moveAfterY = null;
			event.stopPropagation();
			event.preventDefault();
			var selectedRange = [];
			target.addEventListener('mousemove', mouseMoveFunction, false);
			target.addEventListener('mouseup', (event) => {
				this.isSelect = true;
				if (selDiv){
					document.querySelector('.main-content').removeChild(selDiv);
				}
				target.removeEventListener('mousemove', mouseMoveFunction, false);
				selDiv = null;
				var caseLib = document.querySelectorAll('.case-lib');
				for(var i=0; i<caseLib.length; i++){
					var inputs = Array.from(caseLib[i].getElementsByClassName('check-case'));
					if(inputs.every(function(value){
						if(value.checked===true)
							{return true;} 
						return false;
					})){
						caseLib[i].getElementsByClassName('checkall')[0].checked = true;
					} else {
						caseLib[i].getElementsByClassName('checkall')[0].checked = false;
					}
				}
			}, false);


			function mouseMoveFunction(event){
				if(selDiv.style.display == 'none'){
					selDiv.style.display = "block";
				}
				moveAfterX = event.pageX;
				moveAfterY = event.pageY;
				// 获取鼠标移动后的位置
				_x = startX - moveBeforeX + moveAfterX;
				_y = startY - moveBeforeY + moveAfterY;
				// console.log("_X:" + _x + "-- _Y:" + _y);
				selDiv.style.left = Math.min(_x, startX) + "px";
				selDiv.style.top = Math.min(_y, startY) + "px";
				// console.log("Left:" + selDiv.style.left + "-- Top:" + selDiv.style.top);
				selDiv.style.width = Math.abs(_x - startX) + "px";
				selDiv.style.height  = Math.abs(_y - startY) + "px";

				var _l = selDiv.offsetLeft, _t = selDiv.offsetTop;
				var _w = selDiv.offsetWidth, _h = selDiv.offsetHeight;
				
				for(var i=0; i < fileNodes.length; i++){
					var inputRight = fileNodes[i].offsetLeft + fileNodes[i].offsetWidth;
					var inputBottom = fileNodes[i].offsetTop + fileNodes[i].offsetHeight;
					if( inputRight > _l && inputBottom > _t && fileNodes[i].offsetLeft < _l + _w && fileNodes[i].offsetTop < _t + _h) {
						if(!selectedRange.includes(fileNodes[i])){
							selectedRange.push(fileNodes[i]);
						}
					}
				}
				for(var i=0; i<selectedRange.length; i++){
					var inputRight = selectedRange[i].offsetLeft + selectedRange[i].offsetWidth;
					var inputBottom = selectedRange[i].offsetTop + selectedRange[i].offsetHeight;
					if( inputRight > _l && inputBottom > _t && selectedRange[i].offsetLeft < _l + _w && selectedRange[i].offsetTop < _t + _h) {
						selectedRange[i].checked = true;
					} else {
						selectedRange[i].checked = false;
					}
				}
				event.stopPropagation();
				event.preventDefault();
			};
		},
		setSelectListener: function(){
			document.querySelector('.main-content').addEventListener('mousedown',this.setSelect,false);
			// 防止点击用例框时也进行选取
		},
		// 点击checkbox
		checkChanged: function(){
			// var inputs = Array.from(event.target.parentNode.parentNode.parentNode.querySelectorAll('.check-case'))
			// if(inputs.every((value) => {
			// 	return value.checked === true 
			// })) {
			// 	event.target.parentNode.parentNode.parentNode.parentNode.querySelector('.checkall').checked = true;
			// } else {
			// 	event.target.parentNode.parentNode.parentNode.parentNode.querySelector('.checkall').checked = false;
			// }
		},
		// 全选case-lib中的case
		checkallToggle: function(event){
			// console.log(event.target)
			// var flag = event.target.checked;
			// console.log(flag)
			// var inputs = event.target.parentNode.parentNode.getElementsByClassName('check-case');
			// if(flag) {
			// 	for(var i=0; i<inputs.length; i++) {
			// 		if (!this.selectedCases.includes(+inputs[i].value)) {
			// 			this.selectedCases.push(+inputs[i].value)
			// 		}
			// 	}
			// } else {
			// 	for (var input of inputs) {
			// 		if(this.selectedCases.includes(input.value)) {

			// 		}else {
			// 			continue
			// 		}
			// 	}
			// }
			// console.log(this.selectedCases);
		},
		checkall: function(event){
			// console.log(event.target)
			// var checkboxs = Array.from(document.querySelectorAll('.case-lib .check-case'));
			// var checkalls = Array.from(document.querySelectorAll('.case-lib .checkall'))

			// var flag = event.target.checked
			// for (var checkall of checkalls) {
			// 	checkall.checked = flag;
			// }
			// if(flag) {
			// 	for (var checkbox of checkboxs) {
			// 		if (this.selectedCases.includes(+checkbox.value)) {
			// 			continue
			// 		} else {
			// 			this.selectedCases.push(+checkbox.value)
			// 		}
			// 	}
			// } else {
			// 	for (var i=0,m=this.selectedCases.length; i < m;i++) {
			// 		this.selectedCases.pop()
			// 	}
			// }
			// console.log(this.selectedCases)
		},
		toggleTooltip: function(event){
			this.tooltipFlag = !this.tooltipFlag;
		},
		//打开tooltipWindow，并根据传入的参数显示相应的操作内容
		operationType: function(type){
			this.tooltipType = type;
			this.tooltipFlag = false;
			// 触发器设置
			if(type === 2){
				this.getTriggers();
			}else if(type === 4){
				this.getDataPool();
			} else if (type === 3) {
				this.getExecuteStrategy();
			}
		},
		// 获取执行策略
		getExecuteStrategy: function(){

		},
		// 打开关闭触发器设置的弹出框
		closeTrigger: function(){
			this.triggerShow = false;
			this.editTriggerData.name = '';
			this.editTriggerData.desc = '';
			this.editTriggerData.occasions = [];
			this.editTriggerData.Conditionrelate = null;
			$('#conditionsBody').empty();
			$('.action-item-wrapper').remove();
		},
		openTrigger: function(type){
			var _this = this;
			this.saveTriggerType = type;
			if(type === 1){
				this.triggerInfo.editTriggerType = "新增";
				this.triggerShow = true;
			}else{
				if(this.triggerInfo.selectedTrigger.length == 0){
					return;
				}
				this.triggerInfo.editTriggerType = "编辑";
				// 获取触发器内容
				$.ajax({
					url: address + 'trigerController/trigerquery',
					data: 'trigerId=' + _this.triggerInfo.selectedTrigger[0],
					type: 'post',
					dataType: 'json',
					success: function(data, statusText){
						if(data.success == true){
							({
								id: _this.editTriggerData.triggerId,
								trigerName: _this.editTriggerData.name,
								trigerDesc: _this.editTriggerData.desc,
								occasions: _this.editTriggerData.occasions,
								exeConditionRelate: _this.editTriggerData.Conditionrelate,
								conditions: _this.editTriggerData.conditions,
								actions: _this.editTriggerData.actions
							} = data.obj);
							console.log(_this.editTriggerData);

							var tbody = $('#conditionsBody');
							var conditions = data.obj.conditions;
							var actionWrapper = $('.trigger-action-wrapper');
							var actions = data.obj.actions;

							if(conditions && conditions.length){
								var length = conditions.length;
								for(var i=0;i<length;i++){
									var tr = $(`<tr><td><select class="objectname"><option value="1" selected>用例编号</option>
                                    <option value="2">测试系统名称</option>
                                    <option value="3">功能点名称</option>
                                    </select> </td><td><select class="matchtype"><option value="1">
										等于</option><option value="2">大于</option></select></td><td><input type="text" name="" style="width:100%;height: 100%;border: none;" class="value">
                            			</td><td><button class="btn btn-default">删除</button>
                            			</td></tr>`);
									tbody.append(tr);
								}
							}
							var trs = $('#conditionsBody tr');
							console.log(trs)
							for(var i=0; i<trs.length;i++){
								console.log(trs[i])
								$('.objectName',trs[i]).val(conditions[i].objectName);
								$('.matchType',trs[i]).val(conditions[i].matchType);
								$('.value',trs[i]).val(conditions[i].value);
								$('.btn-default', trs[i]).click(_this.removeTriggerCondition);
							}
							
							if(actions && actions.length){
								var length = actions.length;
								for(var i=0; i<length; i++){
									var div = $(`<div class="action-item-wrapper">
					                    <button class="btn-removeaction"><span class="icon-remove"></span></button>
					                    <span class="id"></span><div class="item-row"> <label>选择操作</label><select class="actionname">
					                            <option value="1">发送邮件</option><option value="2">打开网页</option></select></div><div class="item-row"><label>脚本类型</label>
					                        <select class="actiontype"> <option value="2">groovy</option><option value="1">2</option>
					                        </select></div> <div class="item-row"><label>脚本内容</label><textarea rows="5" class="scriptcontent"></textarea>
					                    </div>
					                </div>`);
									actionWrapper.append(div);
								}
							}
							var divs = $('.action-item-wrapper');
							for(var i=0; i<divs.length;i++){
								$('.id', divs[i]).prop('data-actionid',actions[i].id);
								$('.actionname', divs[i]).val(actions[i].actionname);
								$('.actiontype',divs[i]).val(actions[i].actiontype);
								$('.scriptcontent',divs[i]).val(actions[i].scriptcontent);
								$('.btn-removeaction', divs[i]).click(_this.removeTriggerAction);
							}
						}
					}
				});
				this.triggerShow = true;
			}
		},
		deleteTrigger: function() {
			var _this = this;
			if(this.triggerInfo.selectedTrigger.length > 0){
				var promise = Vac.confirm('#vac-confirm', '.okConfirm', '.cancelConfirm');
				console.log(promise)
				promise.then(() => {
					$.ajax({
						url: address + 'trigerController/delete',
						data: 'id='+ _this.triggerInfo.selectedTrigger[0],
						type: 'post',
						dataType: 'json',
						success: function(data, statusText){
							if(data.success === true) {
								Vac.alert(data.msg);
								_this.getTriggers();
							}else {
								Vac.alert('删除失败' + data.msg);
							}
						}
					});
				}, () => {
					
				});
			}else {
				Vac.alert('请选择要删除的触发器！');
			}
		},
		addTriggerCondition: function(){

			var _this = this;
			var tr = $(`<tr><td><select class="objectname"><option value="1">用例编号</option>
                                    <option value="2">测试系统名称</option>
                                    <option value="3">功能点名称</option></select> </td><td><select class="matchtype"><option value="1">
										等于</option></select></td><td><input type="text" name="" style="width:100%;height: 100%;border: none;" class="value">
                            			</td><td><button class="btn btn-default">删除</button>
                            			</td></tr>`);
			$('.btn-default', tr).click(_this.removeTriggerCondition);
			$('#conditionsBody').append(tr);
			tr = null;
		},
		removeTriggerCondition: function(event){
			// event.target.click(null);
			var deleteTr = event.target.parentNode.parentNode;
			console.log(deleteTr)
			deleteTr.parentNode.removeChild(deleteTr);
			deleteTr = null;
		},
		addTriggerAction: function(){
			var _this =  this;
			var div = $(`
					<div class="action-item-wrapper"><button class="btn-removeaction"><span style="z-index:-1;" class="icon-remove"></span></button>
					<div class="item-row"><label>选择操作</label><select class="actionname">
					<option value="1">执行脚本</option><option value="2">groovy类型</option></select></div><div class="item-row"><label>脚本类型</label>
					<select class="actiontype"> <option value="2">groovy</option><option value="1">2</option>
					</select></div><div class="item-row"><label>脚本内容</label><textarea rows="5" class="scriptcontent" cols=""></textarea>
					</div></div>
				`);
			$('.btn-removeaction span', div).click(_this.removeTriggerAction);
			$('.trigger-action-wrapper').append(div);
			div = null;
		},
		removeTriggerAction: function(event){
			var deleteDiv = event.target.parentNode.parentNode;
			deleteDiv.parentNode.removeChild(deleteDiv);
		},
		saveTrigger: function(){
			var _this = this;
			switch(this.saveTriggerType){
				case 1: save1();
						break;
				case 2: save2();
						break;
				case 3: save3();
						break;
			}
			// 新增保存
			function save1(){
				var data = {
					sceneid: _this.sceneid,
					name: _this.editTriggerData.name,
					desc: _this.editTriggerData.desc,
					occasions: _this.editTriggerData.occasions,
					Conditionrelate: _this.editTriggerData.Conditionrelate
				};
				var obj = getDataInTable(1);
				data.conditions = obj.conditions;
				data.actions = obj.actions;
				// console.log(data);
				$.ajax({
					url: address + 'trigerController/insert',
					data: data,
					type: 'post',
					dataType: 'json',
					success: function(data, statusText){
						if(data.success){
							Vac.alert(data.msg);
							this.triggerShow = false;
							_this.getTriggers();
							_this.triggerShow = false
						} else {
							Vac.alert(data.msg);
						}
					}
				});

			}
			// 简单修改保存
			function save3(){
				
			}

			// 修改保存
			function save2(){
				console.log( _this.triggerInfo.selectedTrigger[0])
				var data = {
					triggerId: _this.triggerInfo.selectedTrigger[0],
					name: _this.editTriggerData.name,
					desc: _this.editTriggerData.desc,
					occasions: '[' + _this.editTriggerData.occasions+']',
					Condition_relate: _this.editTriggerData.Conditionrelate,
					modifyType: 2
				};
				
				var obj = getDataInTable(2);
				data.conditions = obj.conditions;
				data.actions = obj.actions;
				console.log(data);
				$.ajax({
					url: address + 'trigerController/update',
					data: data,
					type: 'post',
					dataType: 'json',
					success: function(data, statusText){
						if(data.success){
							Vac.alert(data.msg);
							this.triggerShow = false;
							_this.getTriggers();
							_this.triggerShow = false
						}else {
							Vac.alert(data.msg);
						}
					}
				});
			}

			// 获取table中的字段
			function getDataInTable(type){
				var conditions = [];
				var actions = [];
				var trs = document.querySelectorAll('#conditionsBody tr');
				for(var i=0,len=trs.length; i<len; i++){
					var obj = {};
					obj.objectName = trs[i].querySelector('.objectname').value;
					obj.matchType = trs[i].querySelector('.matchtype').value;
					obj.value = trs[i].querySelector('.value').value;
					conditions.push(JSON.stringify(obj));
				}
				var divs = document.querySelectorAll('.action-item-wrapper');
				for(var i=0,len=divs.length; i<len; i++){
					var obj = {};
					if(type == 2){
						if((_this.editTriggerData.actions[i].id !== undefined))
						{
							obj.id = divs[i].querySelector('.id').innerHTML;
						}
						obj.trigerid = _this.triggerInfo.selectedTrigger[0];
					}
					obj.actionname = divs[i].querySelector('.actionname').value;
					obj.actiontype = divs[i].querySelector('.actiontype').value;
					obj.scriptcontent = divs[i].querySelector('.scriptcontent').value;
					actions.push(JSON.stringify(obj));
				}
				return {
					conditions: '[' + conditions.toString() + ']',
					actions: '[' + actions + ']'
				};
			}
		},
		saveTriggerState: function() {
			var _this = this;
			var trs = document.querySelectorAll('#triggers tr')
			var dataArray = [];
			for(var i=0;i<trs.length;i++){
				var item = {};
				item.id = trs[i].querySelector('input').value;
				// console.log(item.id)
				item.state = trs[i].querySelector('select').value;
				dataArray.push(JSON.stringify(item))
			}
			$.ajax({
				url: address + 'trigerController/updatestate',
				data: 'states='+ '['+dataArray.toString()+']',
				type: 'post',
				dataType: 'json',
				success: function(data, statusText) {
					if(data.success === true) {
						Vac.alert('保存成功！')
						_this.getTriggers()
					} else {
						Vac.alert('保存失败')
					}
				}
			})
		},
		saveStrategy: function(){
			console.log('he');
			var _this = this;
			_this.exe_strategy.sceneId = _this.sceneid;
			$.ajax({
				url: address + 'sceneController/set',
				data: _this.exe_strategy,
				dataType: 'json',
				type: 'post',
				success: function(data){
					Vac.alert(data.msg);
					_this.getCases();
				}
			});
		},
		hideAlert: function(){
			this.alertShow = false;
		},
		removeCases: function(){
			console.log(this.selectedCases.toString())
			var _this = this;
			var data = {
				sceneid: this.sceneid,
				caseidList: '[' + this.selectedCases.toString() + ']'
			};
			$.ajax({
				url: address + 'testexecutioninstanceController/deletetestcaseinscene',
				data: data,
				type: 'post',
				dataType: 'json',
				success: function(data, statusText){
					if(data.success === true){
						Vac.alert("删除成功！");
						_this.selectedCases = [];
						_this.getCases()
					}else {
						Vac.alert('删除失败！');
					}
				}
			});
		},
		// 执行时间规划
		getExecuteTime: function(){

		},
		saveExecuteTime: function(){
			var data = {
				sceneid: this.sceneid,
				caseIds: '[' + this.selectedCases + ']',
				executeTime: this.executeTime,
				executeDateFlag: this.executeDateFlag,
				combineGroupName: '',
				orderNumber: 1,
				runTotalNumber: 2
			};
			$.ajax({
				url: address + 'testexecutioninstanceController/settextexecutioninstance',
				data: data,
				type: 'post',
				dataType: 'json',
				success: function(data, statusText){
					if(data.success === true){
						Vac.alert('保存成功！');
					}
				}
			});
		},

		openPool: function(type){
			var _this = this;
			if(type == 2){
				if(_this.selectedPool.length == 0){return;}
				_this.editPoolType = 2;
				_this.dataPoolTitle = '设置';
				var data = {
					poolname: '场景数据池',
					poolobjid: '2',
					dataname: _this.selectedPool[0]
				};
				$.ajax({
					url: address + 'dataPoolController/selectByCondition',
					data: data,
					type: 'post',
					dataType: 'json',
					success: function(data, statusText){
						if(data.obj instanceof Array){
							// _this.poolData = data.obj[0];
							({
								poolname: _this.poolData.poolname,
								poolobjid: _this.poolData.poolobjid,
								dataname: _this.poolData.dataname,
								datavalue: _this.poolData.datavalue,
								datadesc: _this.poolData.datadesc
							} = data.obj[0]);
							_this.selectedPoolId = data.obj[0].id;
						}
					}
				});
			}else{
				_this.editPoolType = 1;
				_this.dataPoolTitle = '新增';
			}
			$('#editDataPool').modal('show');
		},
		getDataPool: function(){
			var _this = this;
			var data = {
				poolname: '场景数据池',
				poolobjid: '2',
				dataname: '',
			};
			$.ajax({
				url: address + 'dataPoolController/selectByCondition',
				type: 'post',
				dataType: 'json',
				data: data,
				success: function(data, statusText){
					if(data.obj instanceof Array){
						_this.poolDatas = data.obj;
					}
				}
			});
		},
		saveDataPool: function(){
			var _this = this;
			var data = {};
			({
				poolname: data.poolname,
				poolobjid: data.poolobjid,
				dataname: data.dataname,
				datavalue:data.datavalue,
				datadesc: data.datadesc
			} = _this.poolData);
			if(_this.editPoolType == 2){
				data.id = _this.selectedPoolId;
			}
			var url = _this.editPoolType === 1 ? 'dataPoolController/insert' : 'dataPoolController/update';
			$.ajax({
				url: address + url,
				data: data,
				type: 'post',
				dataType: 'json',
				success: function(data, statusText){
					Vac.alert(data.msg)
				}
			});
		},
		removeDatapool: function(){
			var _this = this;
			if(_this.selectedPool.length > 0){
				var data = {
					poolname: '场景数据池',
					poolobjid: '2',
					dataname: _this.selectedPool[0]
				};
				$.ajax({
					url: address + 'dataPoolController/selectByCondition',
					data: data,
					type: 'post',
					dataType: 'json',
					success: function(data, statusText){
						if(data.obj instanceof Array){
							// _this.poolData = data.obj[0];
							({
								poolname: _this.poolData.poolname,
								poolobjid: _this.poolData.poolobjid,
								dataname: _this.poolData.dataname,
								datavalue: _this.poolData.datavalue,
								datadesc: _this.poolData.datadesc
							} = data.obj[0]);
							_this.selectedPoolId = data.obj[0].id;

							var promise = Vac.confirm('#vac-confirm', '.okConfirm', '.cancelConfirm');
							promise.then(() => {
								$.ajax({
									url: address + 'dataPoolController/delete',
									data: 'id='+ _this.selectedPoolId,
									type: 'post',
									dataType: 'json',
									success: function(data, statusText){
										Vac.alert(data.msg);
										_this.getDataPool();
										_this.selectedPool.shift();
									}
								});
							}, () => {
								
							});
						}
					}
				});

			}else {
				Vac.alert('请选择要删除的数据！');
			}
		}
	}
});