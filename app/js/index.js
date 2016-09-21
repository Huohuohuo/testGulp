(function () {
    'use strict';
    var Api = function () {
        this.host = 'https://h5-test.by-health.com/';
        this.apiPrefix = 'officialCarApi/';
        this.api = {
            myCarApplys: this.host + this.apiPrefix + 'public/myCarApplys',
            officeCars: this.host + this.apiPrefix + 'public/officeCars',
            carApply: this.host + this.apiPrefix + 'public/carApply',
            carPooling: this.host + this.apiPrefix + 'public/carPooling',
            driverComment: this.host + this.apiPrefix + 'public/driver',
            officeCarApplys: this.host + this.apiPrefix + 'public/officeCarApplys'
        };
        return this.api;
    };

    var api = new Api();

    var CONFIG = {

        CAR_IMG_ROUTE: 'officialCarImage/',

        CANCEL_OFFICIAL_TRIP_TITLE: '取消公务用车',
        CANCEL_OFFICIAL_TRIP_CONTENT: '请确认已联系了司机或拼车人员，达成一致后再进行取消操作，以免影响行程安排。',
        CANCEL_OFFICIAL_POOLING_TITLE: '取消拼车',
        DOWN_REFRESH_CONTEXT: '正在刷新...',
        UP_REFRESH_CONTEXT: '正在加载...',

        CAR_OWNER_TYPE_CO: 1,//公家车
        CAR_OWNER_TYPE_PER: 2,//私家车

        CAR_APPLY_TYPE_DRIVER: 1,//公司的车配司机
        CAR_APPLY_TYPE_NO_DRIVER: 2,//公司的车不配司机
        CAR_APPLY_TYPE_SELF: 3,//自驾 ,不用审核

        NOTICE_PHONE_WRONG: '请输入11位的手机号码',
        NOTICE_PERSON_NUM_NO: '请选择人数',
        NOTICE_PASSENGERS_NO: '请填写名单',
        NOTICE_PASSENGERS_OVER: '超出长度限制',
        NOTICE_PASSENGERS_LEN: 50,
        NOTICE_REMARK_NO: '请填写说明',
        NOTICE_REMARK_OVER: '超出长度限制',
        NOTICE_REMARK_LEN: 50,

        CAR_APPLY_NOTICE_CAR_ID_NO: '请选择车辆',
        CAR_APPLY_NOTICE_ARRANGE_DRIVER_NO: '请选择是否配司机',
        CAR_APPLY_NOTICE_DEPARTURE_NO: '请填写出发地',
        CAR_APPLY_NOTICE_DEPARTURE_OVER: '超出长度限制',
        CAR_APPLY_NOTICE_DEPARTURE_LEN: 50,
        CAR_APPLY_NOTICE_DESTINATION_NO: '请填写目的地',
        CAR_APPLY_NOTICE_DESTINATION_OVER: '超出长度限制',
        CAR_APPLY_NOTICE_DESTINATION_LEN: 50,
        CAR_APPLY_NOTICE_TIME_WRONG: '开始时间必须小于结束时间',
        CAR_APPLY_NOTICE_TIME_EQUAL: '开始时间与结束时间相同',

        POOLING_OVER_SEAT: '超出剩余座位数',

        PATTERN_OFFICIAL: 1,//公务用车模式
        PATTERN_SELF: 2,//自驾模式

        APPLY_STATUS_KEY_VERIFYING: 1,
        APPLY_STATUS_KEY_PASS: 2,
        APPLY_STATUS_KEY_REFUSED: 3,
        APPLY_STATUS_KEY_DONE: 4,
        APPLY_STATUS_KEY_CANCELLED: 5,
        APPLY_STATUS_TEXT_CANCELLED: '行程取消',

        DRIVER_COMMENT_STATUS_KEY_EARLY: 1,
        DRIVER_COMMENT_STATUS_KEY_ONTIME: 2,
        DRIVER_COMMENT_STATUS_KEY_LATE: 3,
        DRIVER_COMMENT_STATUS_KEY_FAIL: 4,

        DRIVER_COMMENT_STATUS_TEXT_EARLY: '早到',
        DRIVER_COMMENT_STATUS_TEXT_ONTIME: '准时',
        DRIVER_COMMENT_STATUS_TEXT_LATE: '迟到',
        DRIVER_COMMENT_STATUS_TEXT_FAIL: '爽约',

        DRIVER_COMMENT_NOTICE_TIME: '请选择乘客到达时间',
        DRIVER_COMMENT_NOTICE_PERSON: '请选择实际人数',
        DRIVER_COMMENT_NOTICE_REMARK: '请填写其他说明'
    };

    var Validity = function (data) {
        this.data = data.data;
        this.config = data.config;
    };
    Validity.prototype = {
        constructor: Validity,
        getConfig: function () {
            return this.config;
        },
        getData: function () {
            return this.data;
        },
        isValid: function () {

            var config = this.getConfig();
            var data = this.getData();

            var showMsg = function (msg) {
                if (config.isShowWarningMsg) {
                    $(config.warningMsgClassName).removeClass('ct-hidden').text(msg);
                } else if (config.isHideAnyMsg) {

                } else {
                    t.showMessage(msg);
                }
            };

            //非空检测
            if (config.isCheckEmpty) {
                if ($.trim(data) == '') {
                    showMsg(config.emptyNotice);
                    return false;
                }
            }

            //非零检测
            if (config.isCheckZero) {
                if (data == 0) {
                    showMsg(config.zeroNotice);
                    return false;
                }
            }

            //检测字符长度
            if (config.isCheckStringLen) {
                if (data.length > config.MAX_LEN) {
                    showMsg(config.stringLenNotice);
                    return false;
                }
            }

            //检测手机号码长度
            if (config.isCheckPhoneNumLen) {
                if (data.length != 11) {
                    showMsg(config.stringLenNotice);
                    return false;
                }
            }

            //身高,体重有效性检验
            if (config.isCheckRange) {
                switch (typeof data) {
                    case 'number':
                        if (data < config.min_value || data > config.max_value) {
                            showMsg(config.rangeNotice);
                            return false;
                        }
                        break;
                }
            }

            //比较日期大小
            if (config.isCompareDateTime) {
                // c1 比 c2 小
                var c1 = new DateTimeTransformer(data[0]);
                var c2 = new DateTimeTransformer(data[1]);

                //比较 全等
                if (config.isCompareTimeEqual) {
                    if (data[0] === data[1]) {
                        showMsg(config.timeEqualNotice);
                        return false;
                    }
                }

                if (c1.getECMADate().getTime() > c2.getECMADate().getTime()) {
                    showMsg(config.timeCompareNotice);
                    return false;
                }
            }

            $(config.warningMsgClassName).addClass('ct-hidden').text('');
            return true;
        }
    };

    var DateTimeTransformer = function (data) {
        this.data = data;
        this.dateSeparator = '-';
        this.dateTimeSeparator = ' ';
        this.timeSeparator = ':';
        this.CN_MONTH = '月';
        this.CN_DAY = '日';
        this.year = '';
        this.month = '';
        this.day = '';
        this.hour = '';
        this.minute = '';
        this.second = '';
        this.Date = undefined;
        this.init();
    };
    DateTimeTransformer.prototype = {
        constructor: DateTimeTransformer,
        init: function () {
            // console.log('init');
            var _this = this;
            var data = _this.data;

            var plus0 = function (int1) {
                //月,日,时分秒,小于10需要在前面加零
                //int 表示传进来的参数类型
                var str = int1.toString();
                if (int1 < 10) {
                    str = '0' + str;
                }
                return str;
            };

            //从ECMA Date中获取值
            var getValuesFromECMA = function (tempDate) {
                // console.log(tempDate);
                _this.Date = tempDate;
                //console.log(typeof tempDate.getMonth());
                return {
                    year: tempDate.getFullYear().toString(),
                    month: plus0((tempDate.getMonth() + 1)),
                    day: plus0(tempDate.getDate()),
                    hour: plus0(tempDate.getHours()),
                    minute: plus0(tempDate.getMinutes()),
                    second: plus0(tempDate.getSeconds())
                };
            };

            //设置ECMA的date对象值
            var setValuesToECMA = function (tempObj) {

                var tempECMADate = new Date();
                tempECMADate.setFullYear(parseInt(tempObj.year));
                tempECMADate.setMonth(parseInt(tempObj.month) - 1);
                tempECMADate.setDate(parseInt(tempObj.day));
                tempECMADate.setHours(parseInt(tempObj.hour));
                tempECMADate.setMinutes(parseInt(tempObj.minute));
                tempECMADate.setSeconds(parseInt(tempObj.second));

                _this.Date = tempECMADate;
            };

            var setPrototypeValues = function (obj) {
                _this.year = obj.year;
                _this.month = obj.month;
                _this.day = obj.day;
                _this.hour = obj.hour;
                _this.minute = obj.minute;
                _this.second = obj.second;
            };

            switch (typeof data) {
                case 'object':
                    // console.log('data is object');
                    // console.log(data);
                    var tempDate = new Date();

                    if (data.year) {
                        tempDate.setFullYear(parseInt(data.year));
                    }

                    if (data.month) {
                        tempDate.setMonth(parseInt(data.month) - 1);
                    }

                    if (data.day) {
                        tempDate.setDate(parseInt(data.day));
                    }

                    if (data.hour) {
                        tempDate.setHours(parseInt(data.hour));
                    }

                    if (data.minute) {
                        tempDate.setMinutes(parseInt(data.minute));
                    }

                    if (data.second) {
                        tempDate.setSeconds(parseInt(data.second));
                    }

                    // console.log(tempDate);

                    var tempObj = getValuesFromECMA(tempDate);
                    break;
                case 'string':
                    //console.log('data is string');//2016-08-19 10:00:00
                    // console.log(data);
                    //分解 出发时间
                    var tempDate = data.split(_this.dateTimeSeparator)[0];
                    var tempTime = data.split(_this.dateTimeSeparator)[1];

                    var tempObj = {
                        year: tempDate.split(_this.dateSeparator)[0],
                        month: tempDate.split(_this.dateSeparator)[1],
                        day: tempDate.split(_this.dateSeparator)[2],
                        hour: tempTime.split(_this.timeSeparator)[0],
                        minute: tempTime.split(_this.timeSeparator)[1],
                        second: tempTime.split(_this.timeSeparator)[2]
                    };

                    setValuesToECMA(tempObj);
                    //console.log(tempObj);
                    break;
                default:
                    // console.log('data is undefined');
                    var tempDate = new Date(),
                        tempObj = getValuesFromECMA(tempDate);
                // console.log(tempObj);
            }

            setPrototypeValues(tempObj);
        },
        _getYear: function () {
            return this.year;
        },
        _getMonth: function () {
            return this.month;
        },
        _getDay: function () {
            return this.day;
        },
        _getHour: function () {
            return this.hour;
        },
        _getMinute: function () {
            return this.minute;
        },
        _getSecond: function () {
            return this.second;
        },
        getYMD: function () {
            //年月日
            return this._getYear() + this.dateSeparator + this._getMonth() + this.dateSeparator + this._getDay();
        },
        getYMD_HM: function () {
            //年月日+时分
            return this.getYMD() + this.dateTimeSeparator + this.getHM();
        },
        getYMD_HMS: function () {
            //年月日+时分秒
            return this.getYMD() + this.dateTimeSeparator + this.getHMS();
        },
        getHMS: function () {
            //时分秒
            return this.getHM() + this.timeSeparator + this._getSecond();
        },
        getHM: function () {
            //时分
            return this._getHour() + this.timeSeparator + this._getMinute();
        },
        getMD: function (isCN) {
            //月日
            if (isCN) {
                return this._getMonth() + this.CN_MONTH + this._getDay() + this.CN_DAY;
            } else {
                return this._getMonth() + this.dateSeparator + this._getDay();
            }
        },
        getMD_HM: function () {
            return this.getMD() + this.dateTimeSeparator + this.getHM();
        },
        getECMADate: function () {
            return this.Date;
        }
    };

    var vm = avalon.define({
        $id: 'mainController',

        footerComponent: '',

        CONFIG: CONFIG,

        pattern: CONFIG.PATTERN_OFFICIAL,//默认是公务用车模式

        loginInfo: {
            userName: '',
            userId: '',
            userOA: '',
            userCompany: '',
            userDepartment: '',
            userPhoneNumber: ''
        },

        officialDriverList: [],

        largeCarImgSrc: CONFIG.CAR_IMG_ROUTE + 'default.jpg',

        isShowDriverOrderBtn: false,//入口,是否显示 我是司机 按钮
        largeImageIsHidden: true,//是否显示 车图片 预览

        myApplyPageIndex: 1,//页码
        driverOrderPageIndex: 1,//页码

        pageSize: 15,//每页多少条记录

        officialTripListIndex: 1,//首页分页的index
        officialProgrammeIndex: 1,//单独司机的index
        programmeCarId: null,//单独司机的carId

        officialCarIdList: [],//公司车id

        messagePopType: '',//提示框的类别,根据类别做出不同的行为
        messagePopId: '',

        messagePop_title: '',
        messagePop_content: '',

        myApplyArrayList: [],//我的申请 遍历数组
        officialCarsArray: [],//公车信息 遍历数组

        officialCarApplyArray: [],//公车申请列表页面的数组

        tmp_carApplyDateRepeatArr: [],
        carApplyDateRepeatArr: [],
        officialCarProgramObj: {
            carPhoto: 'default.jpg'
        },

        officialCarProgramObjCarApplys: [],

        driverOrder: [],//司机订单 遍历数组

        apply_carEL: '',
        apply_carId: '',
        apply_driverId: '',
        apply_carSeat: '',//这是几座的车
        apply_departurePlace: '',//出发地
        apply_destination: '',//目的地
        apply_passengers: '',//乘客名单
        apply_remark: '',//申请说明
        apply_phoneNumber: '',//申请人手机号码
        apply_personNumber: 0,//乘客数,默认是1
        apply_startTime: {
            year: '',
            month: '',
            day: '',
            hour: '',
            minute: ''
        },
        apply_endTime: {
            year: '',
            month: '',
            day: '',
            hour: '',
            minute: ''
        },

        detailPage_carApplyId: '',//订单详情页的carApplyId

        pooling_personNumber: 0,
        pooling_phoneNumber: '',
        pooling_type: '',
        pooling_applyRemark: '',
        pooling_passengers: '',

        officialTrip_applyPoolingPopIsHidden: true,//拼车申请弹框
        messagePopIsHidden: true,//取消公务用车申请弹框
        driverCommentIsHidden: true,

        isArrangeDriver: '',//是否分配司机 默认分配

        orderDetail_driverName: '',
        orderDetail_driverPhoneNum: '',
        orderDetail_carSeatAmount: 0,
        orderDetail_departurePlace: '',
        orderDetail_destination: '',
        orderDetail_carPhoto: 'default.jpg',
        orderDetail_remainingSeatAmount: '',
        orderDetail_carpoolingArray: [],
        orderDetail_usedSeatAmount: '',
        orderDetail_time: '',
        orderDetail_applyObj: {},
        orderDetail_verifyTime: '',
        orderDetail_createTime: '',
        orderDetail_driverReview: '',
        orderDetail_applyStatusText: '',
        orderDetail_applyStatusKey: 0,
        orderDetail_verifyRemark: '',
        orderDetail_isShowDriverCommentBtn: false,
        orderDetail_isShowOrderCancelBtn: false,
        orderDetail_isShowPoolingBtn: false,

        driverComment_arrivalTime: {
            actualDepartureStatusKey: 0,
            actualDepartureStatusText: ''
        },
        driverComment_personNumber: 0,
        driverComment_endHour: '',
        driverComment_endMinute: '',
        driverComment_driverReview: '',
        driverComment_0Person: false,//是否显示实际人数选择框,因为爽约的话是不需要选择人数了

        init: function () {
            t.p.initP(function () {
                t.init({
                    pageId: 'ctCore_tips_page',
                    isStringifyPostData: true
                });

                vm.getOfficialCarIdList();//首先需要获取有哪些车

                vm.initEvent();
            });
        },

        getKKInfo: function () {

            vm.isShowDriverOrderBtn = false;

            // t.p.getMyInfo(function (data) {
            //     alert('id===' + data.id);
            //     alert('姓名:' + data.name);
            //     alert('OA登录账号:' + data.oaAccount);
            //     // alert('部门:' + data.department);
            //     // alert('手机号码:' + data.mobile);
            //     // alert('电子邮件:' + data.email);
            //
            //     vm.loginInfo.userName = data.name;
            //     vm.loginInfo.userId = data.id;// 对应KK里的userId
            //     vm.loginInfo.userOA = data.oaAccount;// 对应KK里的登录账号
            //     vm.loginInfo.userCompany = '股份公司';
            //     vm.loginInfo.userDepartment = '信息技术部';
            //     vm.loginInfo.userPhoneNumber = data.mobile;
            //     vm.loginInfo.email = data.email;
            //
            //     if (vm.loginInfo.userOA == vm.officialDriverList[0] || vm.loginInfo.userOA == vm.officialDriverList[1]) {
            //         vm.isShowDriverOrderBtn = true;
            //     }
            //
            //     vm.goPage('index_page');//首页
            // });

            vm.loginInfo.userName = '霍伟扬';
            vm.loginInfo.userId = '7873';
            vm.loginInfo.userOA = 'huowy@by-healthdc.com';
            vm.loginInfo.userCompany = '股份公司';
            vm.loginInfo.userDepartment = '信息技术部';
            vm.loginInfo.userPhoneNumber = '15602298828';
            vm.loginInfo.email = '184745138@qq.com';

            if (vm.loginInfo.userOA == vm.officialDriverList[0] || vm.loginInfo.userOA == vm.officialDriverList[1]) {
                vm.isShowDriverOrderBtn = true;
            }


            console.log('userOA===' + vm.loginInfo.userOA);
            vm.goPage('index_page');//首页
        },

        //初始化事件
        initEvent: function () {
            //console.log('initEvent');
            vm.initPersonNumberEvent();
            vm.initCarApplyTap();
            vm.initPullRefresh();


            $('#J_largeImg').on('click', function () {
                vm.hideLargeCarImg();
            });

        },

        //上拉加载初始化
        initPullRefresh: function () {
            mui.init();
            mui('.mui-scroll-wrapper').scroll({
                bounce: true,
                indicators: true //是否显示滚动条
            });

            mui('#pullRefresh1').pullToRefresh({
                up: {
                    callback: function () {
                        setTimeout(function () {
                            vm.getMyApplyInfo('refresh');
                        }, 1000);
                    }
                }
            });

            mui('#pullRefresh2').pullToRefresh({
                up: {
                    callback: function () {
                        setTimeout(function () {
                            vm.getDriverOrder('refresh');
                        }, 1000);
                    }
                }
            });

            mui('#pullRefresh3').pullToRefresh({
                up: {
                    callback: function () {
                        setTimeout(function () {
                            if (vm.officialTripListIndex < 4) {
                                vm.officialTripListIndex++;
                                vm.goOfficialTripListPage();
                            } else {
                                mui('#pullRefresh3').pullToRefresh().endPullUpToRefresh(1);
                            }
                        }, 1000);
                    }
                }
            });

            mui('#pullRefresh4').pullToRefresh({
                up: {
                    callback: function () {
                        setTimeout(function () {
                            if (vm.officialProgrammeIndex < 4) {
                                vm.officialProgrammeIndex++;
                                vm.getDriverProgrammeInfo();
                            } else {
                                mui('#pullRefresh4').pullToRefresh().endPullUpToRefresh(1);
                            }

                        }, 1000);
                    }
                }
            });
        },

        //初始化 点击我的申请 跳转到 订单详情的页面
        initCarApplyTap: function () {
            $('.J-carApplyTap').delegate('.tui-myApply-itemBox', 'tap', function () {
                var _this = $(this),
                    activeFlag = 'myApplyItemBox-active';

                if (_this.hasClass(activeFlag)) {
                    return;
                }
                _this.addClass(activeFlag);

                //避免触发2次
                setTimeout(function () {
                    //console.log('done');
                    _this.removeClass(activeFlag);
                }, 100);

                var carApplyId = _this.attr('carApplyId');

                vm.goOfficialTripOrderPage(carApplyId);
            });
        },

        //初始化 点击人数 事件
        initPersonNumberEvent: function () {

            var selectedClass = 'tui-personNumberSelected';

            //公车申请页
            var $apply_personNumber = $('#apply_personNumber .J-personNumber');
            $apply_personNumber.on('click', function () {
                var _this = $(this);
                $apply_personNumber.removeClass(selectedClass);
                _this.addClass(selectedClass);

                vm.apply_personNumber = parseInt(_this.attr('value'));
            });

            //拼车申请弹窗
            var $pooling_personNumber = $('#pooling_personNumber .J-personNumber');
            $pooling_personNumber.on('click', function () {

                var _this = $(this);
                $pooling_personNumber.removeClass(selectedClass);
                _this.addClass(selectedClass);

                vm.pooling_personNumber = parseInt(_this.attr('value'));
            });

            //司机点评 乘客到达时间
            var $driverComment_arrivalTime = $('#driverComment_arrivalTime .J-personNumber');
            $driverComment_arrivalTime.on('click', function () {
                var _this = $(this);
                $driverComment_arrivalTime.removeClass(selectedClass);
                _this.addClass(selectedClass);

                vm.driverComment_arrivalTime.actualDepartureStatusKey = parseInt(_this.attr('statusKey'));
                vm.driverComment_arrivalTime.actualDepartureStatusText = _this.attr('statusText');

                if (vm.driverComment_arrivalTime.actualDepartureStatusKey == CONFIG.DRIVER_COMMENT_STATUS_KEY_FAIL) {
                    vm.driverComment_0Person = true;
                } else {
                    vm.driverComment_0Person = false;
                }
            });

            //司机点评 乘客实际人数
            var $driverComment_personNumber = $('#driverComment_personNumber .J-personNumber');
            $driverComment_personNumber.on('click', function () {
                var _this = $(this);
                $driverComment_personNumber.removeClass(selectedClass);
                _this.addClass(selectedClass);

                vm.driverComment_personNumber = parseInt(_this.attr('value'));
            });

        },

        //初始化 司机点评的时间 点击一次初始化一次
        initDriverCommentEndTime: function () {
            console.log('initDriverCommentEndTime');
            var tempTime = new DateTimeTransformer({
                    hour: vm.driverComment_endHour,
                    minute: vm.driverComment_endMinute
                }),
                options = {
                    type: 'time',
                    beginDate: new Date(),
                    value: tempTime.getHM()
                },
                picker = new mui.DtPicker(options);

            picker.show(function (rs) {
                /*
                 * rs.value 拼合后的 value
                 * rs.text 拼合后的 text
                 * rs.y 年，可以通过 rs.y.value 和 rs.y.text 获取值和文本
                 * rs.m 月，用法同年
                 * rs.d 日，用法同年
                 * rs.h 时，用法同年
                 * rs.i 分（minutes 的第二个字母），用法同年
                 */
                vm.driverComment_endHour = rs.h.value;
                vm.driverComment_endMinute = rs.i.value;
                // result.innerText = '选择结果: ' + rs.text;
                /*
                 * 返回 false 可以阻止选择框的关闭
                 * return false;
                 */
                /*
                 * 释放组件资源，释放后将不能再操作组件
                 * 通常情况下，不需要释放组件，new DtPicker(options) 后，可以一直使用。
                 * 当前示例，因为内容较多，如不进行资源释放，在某些设备上会较慢。
                 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
                 */
                picker.dispose();
            });
        },

        //初始化 申请用车的开始时间
        initApplyStartTime: function () {
            console.log('initApplyStartTime');
            var tempDateTime = new DateTimeTransformer({
                    year: vm.apply_startTime.year.toString(),
                    month: vm.apply_startTime.month,
                    day: vm.apply_startTime.day,
                    hour: vm.apply_startTime.hour,
                    minute: vm.apply_startTime.minute
                }),
                options = {
                    value: tempDateTime.getYMD_HM(),
                    beginDate: new Date()
                },
                picker = new mui.DtPicker(options);

            console.log(options);

            picker.show(function (rs) {
                vm.apply_startTime.year = rs.y.value;
                vm.apply_startTime.month = rs.m.value;
                vm.apply_startTime.day = rs.d.value;
                vm.apply_startTime.hour = rs.h.value;
                vm.apply_startTime.minute = rs.i.value;
                picker.dispose();
            });
        },

        //初始化 申请用车的结束时间
        initApplyEndTime: function () {
            console.log('initApplyEndTime');
            var tempDateTime = new DateTimeTransformer({
                    year: vm.apply_endTime.year,
                    month: vm.apply_endTime.month,
                    day: vm.apply_endTime.day,
                    hour: vm.apply_endTime.hour,
                    minute: vm.apply_endTime.minute
                }),
                options = {
                    value: tempDateTime.getYMD_HM(),
                    beginDate: new Date()
                },
                picker = new mui.DtPicker(options);

            picker.show(function (rs) {
                vm.apply_endTime.year = rs.y.value;
                vm.apply_endTime.month = rs.m.value;
                vm.apply_endTime.day = rs.d.value;
                vm.apply_endTime.hour = rs.h.value;
                vm.apply_endTime.minute = rs.i.value;
                picker.dispose();
            });
        },

        //页面跳转
        goPage: function (pageId) {
            // console.log('goPage===' + pageId);
            var $body = $('body');
            $body.removeClass('bodyBgColor-white');//重置body的背景色

            var setBodyBgWhite = function () {
                //console.log('setBodyBgWhite');
                $body.addClass('bodyBgColor-white');
            };

            switch (pageId) {
                case 'officialTripList_page':
                    setBodyBgWhite();
                    break;
                case 'officialTripDriverProgramme_page':
                    setBodyBgWhite();
                    break;
                case 'officialApply_page':
                    setBodyBgWhite();
                    break;
                case 'officialTripOrder_page':
                    vm.hideLargeCarImg();
                    break;
            }

            t.go(pageId);
        },

        //跳转到公车的申请列表
        goOfficialTripListPage: function () {
            // console.log(vm.officialCarIdList);
            //按carId查询对应车的列表
            var len = vm.officialCarIdList.length;
            vm.officialCarApplyArray = [];
            for (var i = 0; i < len; i++) {
                vm.getOfficeCarApply(vm.officialCarIdList[i]);
            }
        },

        //跳转到司机的订单页面
        goDriverOrderPage: function () {
            vm.getDriverOrder();
        },

        //获取 司机订单
        getDriverOrder: function (event) {

            var tempData = {};
            if (event == 'refresh') {
                tempData.pageIndex = ++vm.driverOrderPageIndex;
            } else {
                tempData.pageIndex = 1;
            }

            tempData.driverEmployeeId = vm.loginInfo.userOA;
            tempData.pageSize = vm.pageSize;

            var tempObj = {
                url: api.driverComment,
                data: tempData,
                type: 'GET',
                isShowLoader: false
            };

            t.ajax(tempObj, function (data) {
                var isLoadMore = false;
                if (event == 'refresh') {
                    isLoadMore = true;
                }

                vm.fillDriverOrder(data, isLoadMore);
            });
        },

        //填充 司机订单
        fillDriverOrder: function (data, isLoadMore) {
            // console.log(data);

            var list = data.returnObject.list,
                len = list.length;
            for (var i = 0; i < len; i++) {
                var tmpStartTime = new DateTimeTransformer(list[i].bookingDepartureTimestamp),
                    tmpEndTime = new DateTimeTransformer(list[i].bookingFinishTimestamp);
                list[i].showTime = tmpStartTime.getMD_HM() + '-' + tmpEndTime.getHM();
            }

            if (isLoadMore) {
                vm.driverOrder = vm.driverOrder.concat(list);

                var count = list.length;
                //console.log(count);
                setTimeout(function () {
                    mui('#pullRefresh2').pullToRefresh().endPullUpToRefresh(!count);
                }, 1000);
            } else {
                vm.driverOrder = list;
            }

            vm.goPage('driverOrder_page');
        },

        //获取公车详细列表
        getOfficeCarApply: function (carId) {
            var pageSize = 7;
            var dateCount = vm.officialTripListIndex * pageSize;//计算需要获取多少天的数据
            vm.tmp_carApplyDateRepeatArr = [];
            for (var i = 0; i < dateCount; i++) {
                vm.tmp_carApplyDateRepeatArr.push({});
            }

            var tempData = {
                    carId: carId,
                    pageIndex: vm.officialTripListIndex,
                    pageSize: pageSize
                },
                tempObj = {
                    url: api.officeCarApplys,
                    data: tempData,
                    type: 'GET',
                    isShowLoader: false
                };

            t.ajax(tempObj, function (data) {
                if (data.errorCode == '00') {
                    vm.fillOfficialCarApply(data);
                }
            });
        },

        fillOfficialCarApply: function (data) {
            // console.log('一个司机的数据===');
            // console.log(data);

            vm.officialCarApplyArray.push(data.returnObject);
            var dateArray = data.returnObject.carApplys;
            var len1 = dateArray.length;

            //更改时间格式
            for (var j = 0; j < len1; j++) {
                var len2 = dateArray[j].length;
                for (var k = 0; k < len2; k++) {
                    if (dateArray[j][k].bookingDepartureTimestamp) {
                        var tempTimeStamp = new DateTimeTransformer(dateArray[j][k].bookingDepartureTimestamp);
                        dateArray[j][k].bookingDepartureTimestamp = tempTimeStamp.getHM();
                    }
                }
            }

            var prop_carId = 'carId_' + data.returnObject.carId;
            for (var i = 0; i < vm.tmp_carApplyDateRepeatArr.length; i++) {
                var date = new DateTimeTransformer(dateArray[i][0].carApplyDay + ' 00:00:00');
                vm.tmp_carApplyDateRepeatArr[i]['date'] = date._getMonth() + '.' + date._getDay();
                vm.tmp_carApplyDateRepeatArr[i][prop_carId] = dateArray[i];
                vm.tmp_carApplyDateRepeatArr[i]['car' + data.returnObject.carId + '_id'] = data.returnObject.carId;
            }

            // console.log(vm.tmp_carApplyDateRepeatArr);

            //当2个车的信息都准备好之后,再开始遍历
            if (vm.officialCarApplyArray.length == vm.officialCarIdList.length) {
                vm.carApplyDateRepeatArr = vm.tmp_carApplyDateRepeatArr;
                // console.log('vm.carApplyDateRepeatArr===');
                // console.log(vm.carApplyDateRepeatArr);

                //如果数组中的第一辆车的id不是1,就反转一下数组
                if (vm.officialCarApplyArray[0].carId > vm.officialCarApplyArray[1].carId) {
                    vm.officialCarApplyArray.reverse();
                }

                // console.log('vm.officialCarApplyArray===');
                // console.log(vm.officialCarApplyArray);

                mui('#pullRefresh3').pullToRefresh().endPullUpToRefresh();
                vm.goPage('officialTripList_page');
            }
        },

        //首页上拉加载
        initOfficialTripListPageUpLoading: function () {
            console.log('initOfficialTripListPageUpLoading');
            vm.goOfficialTripListPage();
        },

        //跳转到我的申请页
        goMyApplyPage: function () {
            vm.getMyApplyInfo();
        },

        //跳转到公车申请页
        goApplyPage: function () {
            vm.getOfficialCars();
        },

        //获取公车的id
        getOfficialCarIdList: function () {
            var tempData = {
                    ownerType: CONFIG.CAR_OWNER_TYPE_CO
                },
                tempObj = {
                    url: api.officeCars,
                    data: tempData,
                    type: 'GET'
                };

            t.ajax(tempObj, function (data) {
                vm.fillOfficialCarIdList(data);
            });
        },

        //填充公车的id
        fillOfficialCarIdList: function (data) {
            var obj = data.returnObject;
            var len = obj.length;
            vm.officialCarIdList = [];
            for (var i = 0; i < len; i++) {
                vm.officialCarIdList.push(obj[i].carId);
                vm.officialDriverList.push(obj[i].employeeId);
            }

            vm.getKKInfo();
        },

        //提交公车申请
        carApply: function () {

            var startTime = new DateTimeTransformer({
                year: vm.apply_startTime.year,
                month: vm.apply_startTime.month,
                day: vm.apply_startTime.day,
                hour: vm.apply_startTime.hour,
                minute: vm.apply_startTime.minute
            });
            var endTime = new DateTimeTransformer({
                year: vm.apply_endTime.year,
                month: vm.apply_endTime.month,
                day: vm.apply_endTime.day,
                hour: vm.apply_endTime.hour,
                minute: vm.apply_endTime.minute
            });

            //定义需要检验有效性的数组
            var validArr = [
                {
                    data: vm.apply_carId,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.CAR_APPLY_NOTICE_CAR_ID_NO
                    }
                },
                {
                    data: vm.isArrangeDriver,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.CAR_APPLY_NOTICE_ARRANGE_DRIVER_NO
                    }
                },
                {
                    data: vm.apply_departurePlace,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.CAR_APPLY_NOTICE_DEPARTURE_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.CAR_APPLY_NOTICE_DEPARTURE_OVER,
                        MAX_LEN: CONFIG.CAR_APPLY_NOTICE_DEPARTURE_LEN
                    }
                },
                {
                    data: vm.apply_destination,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.CAR_APPLY_NOTICE_DESTINATION_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.CAR_APPLY_NOTICE_DESTINATION_OVER,
                        MAX_LEN: CONFIG.CAR_APPLY_NOTICE_DESTINATION_LEN
                    }
                },
                {
                    data: [startTime.getYMD_HMS(), endTime.getYMD_HMS()],
                    config: {
                        isCompareDateTime: true,
                        isCompareTimeEqual: true,
                        timeCompareNotice: CONFIG.CAR_APPLY_NOTICE_TIME_WRONG,
                        timeEqualNotice: CONFIG.CAR_APPLY_NOTICE_TIME_EQUAL
                    }
                },
                {
                    data: vm.apply_phoneNumber,
                    config: {
                        isCheckPhoneNumLen: true,
                        stringLenNotice: CONFIG.NOTICE_PHONE_WRONG
                    }
                },
                {
                    data: vm.apply_personNumber,
                    config: {
                        isCheckZero: true,
                        zeroNotice: CONFIG.NOTICE_PERSON_NUM_NO
                    }
                },
                {
                    data: vm.apply_passengers,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.NOTICE_PASSENGERS_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.NOTICE_PASSENGERS_OVER,
                        MAX_LEN: CONFIG.NOTICE_PASSENGERS_LEN
                    }
                },
                {
                    data: vm.apply_remark,
                    config: {
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.NOTICE_REMARK_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.NOTICE_REMARK_OVER,
                        MAX_LEN: CONFIG.NOTICE_REMARK_LEN
                    }
                }
            ];

            //逐个放入Validity中检验有效性
            var len = validArr.length;
            for (var i = 0; i < len; i++) {
                var validity = new Validity(validArr[i]);
                if (!validity.isValid()) {
                    return;
                }
            }

            var carApplyType = parseInt(vm.isArrangeDriver);
            var tempData = {
                carApplyType: carApplyType,//需要检验
                carId: vm.apply_carId,//需要验证
                departure: vm.apply_departurePlace,//需要验证
                destination: vm.apply_destination,//需要验证
                bookingDepartureTimestamp: startTime.getYMD_HMS(),//需要验证
                bookingFinishTimestamp: endTime.getYMD_HMS(),//需要验证

                applicantName: vm.loginInfo.userName,
                applicantEmployeeId: vm.loginInfo.userOA,
                applicantCompany: vm.loginInfo.userCompany,
                applicantDepartment: vm.loginInfo.userDepartment,

                applicantPhoneNumber: vm.apply_phoneNumber,//需要验证
                bookingPassengerAmount: vm.apply_personNumber,//需要验证
                passengers: vm.apply_passengers,//需要验证
                applyRemark: vm.apply_remark,//需要验证
                carSeatAmount: vm.apply_carSeat//不需要验证,有carId就一定有carSeatAmount
            };

            switch (carApplyType) {
                case CONFIG.CAR_APPLY_TYPE_DRIVER:
                    tempData.driverEmployeeId = vm.apply_driverId;//不需要验证,有carId就一定有driverEmployeeId
                    tempData.usedSeatAmount = vm.apply_personNumber + 1;
                    break;
                case CONFIG.CAR_APPLY_TYPE_NO_DRIVER:
                    tempData.driverEmployeeId = vm.loginInfo.userOA;
                    tempData.usedSeatAmount = vm.apply_personNumber;
                    break;
            }

            // console.log(tempData);

            var tempObj = {
                url: api.carApply,
                data: tempData,
                type: 'POST'
            };

            t.ajax(tempObj, function (data) {
                if (data.errorCode == '00') {
                    t.showMessage(data.errorMessage, function () {
                        //添加成功后,跳转到我的申请
                        vm.goMyApplyPage();
                    });
                }
            });
        },

        //获取公司车辆信息
        getOfficialCars: function () {
            // console.log('getOfficialCars');
            var tempData = {
                    ownerType: CONFIG.CAR_OWNER_TYPE_CO
                },
                tempObj = {
                    url: api.officeCars,
                    data: tempData,
                    type: 'GET'
                };

            t.ajax(tempObj, function (data) {
                vm.fillOfficialCars(data);
            });

        },

        //填充公司车辆信息
        fillOfficialCars: function (data) {
            // console.log('fillOfficialCars');
            // console.log(data);

            vm.officialCarsArray = data.returnObject;

            vm.apply_phoneNumber = vm.loginInfo.userPhoneNumber;

            //重置页面信息
            vm.apply_carEL = '';
            vm.isArrangeDriver = '';
            vm.apply_departurePlace = '';
            vm.apply_destination = '';
            $('#apply_personNumber .J-personNumber').removeClass('tui-personNumberSelected');
            vm.apply_personNumber = 0;
            vm.apply_passengers = '';
            vm.apply_remark = '';

            //给开始时间和结束时间置为目前的时间
            var tempDate = new DateTimeTransformer();

            vm.apply_startTime.year = tempDate._getYear();
            vm.apply_startTime.month = tempDate._getMonth();
            vm.apply_startTime.day = tempDate._getDay();
            vm.apply_startTime.hour = tempDate._getHour();
            vm.apply_startTime.minute = tempDate._getMinute();

            vm.apply_endTime.year = tempDate._getYear();
            vm.apply_endTime.month = tempDate._getMonth();
            vm.apply_endTime.day = tempDate._getDay();
            vm.apply_endTime.hour = tempDate._getHour();
            vm.apply_endTime.minute = tempDate._getMinute();

            vm.goPage('officialApply_page');
        },

        //获取我的申请信息
        getMyApplyInfo: function (event) {
            console.log('getMyApplyInfo');

            var tempData = {};
            if (event == 'refresh') {
                tempData.pageIndex = ++vm.myApplyPageIndex;
            } else {
                tempData.pageIndex = 1;
            }

            tempData.pageSize = vm.pageSize;
            tempData.applicantEmployeeId = vm.loginInfo.userOA;

            var tempObj = {
                url: api.myCarApplys,
                data: tempData,
                type: 'GET',
                isShowLoader: false
            };

            t.ajax(tempObj, function (data) {
                var isLoadMore = false;
                if (event == 'refresh') {
                    isLoadMore = true;
                }

                vm.fillMyApplyInfo(data, isLoadMore);
            });

        },

        //填充我的申请信息
        fillMyApplyInfo: function (data, isLoadMore) {
            // console.log('fillMyApplyInfo');
            // console.log(data);
            //console.log(isLoadMore);

            var list = data.returnObject.list,
                len = list.length;
            for (var i = 0; i < len; i++) {
                var tmpStartTime = new DateTimeTransformer(list[i].bookingDepartureTimestamp),
                    tmpEndTime = new DateTimeTransformer(list[i].bookingFinishTimestamp);
                list[i].showTime = tmpStartTime.getMD(true) + ' ' + tmpStartTime.getHM() + '-' + tmpEndTime.getHM();
            }

            if (isLoadMore) {
                vm.myApplyArrayList = vm.myApplyArrayList.concat(list);

                var count = list.length;
                // console.log(count);
                setTimeout(function () {
                    mui('#pullRefresh1').pullToRefresh().endPullUpToRefresh(!count);
                }, 1000);
            } else {
                vm.myApplyArrayList = list;
            }

            vm.goPage('myApply_page');
        },

        //跳转到 公务用车 司机日程页
        getDriverProgrammeInfo: function (carId) {
            if (carId) {
                vm.programmeCarId = carId;
            }
            var pageSize = 7;
            var tempData = {
                    carId: vm.programmeCarId,
                    pageIndex: vm.officialProgrammeIndex,
                    pageSize: pageSize
                },
                tempObj = {
                    url: api.officeCarApplys,
                    data: tempData,
                    type: 'GET',
                    isShowLoader: false
                };

            t.ajax(tempObj, function (data) {
                if (data.errorCode == '00') {
                    vm.fillDriverProgrammeInfo(data);
                }
            });
        },

        fillDriverProgrammeInfo: function (data) {

            console.log(data);
            var obj = data.returnObject;


            vm.officialCarProgramObj = {};
            vm.officialCarProgramObj = {
                ownerName: obj.ownerName,
                contactNumber: obj.contactNumber,
                carSeatAmount: obj.carSeatAmount - 1,
                carPhoto: obj.carPhoto
            };

            var tempCarApplys = obj.carApplys;
            console.log(tempCarApplys);

            var len = tempCarApplys.length;
            for (var i = 0; i < len; i++) {

                if (tempCarApplys[i][0].carApplyDay.length > 5) {
                    var tempDate = new DateTimeTransformer(tempCarApplys[i][0].carApplyDay + ' 00:00:00');
                    tempCarApplys[i][0].carApplyDay = tempDate._getMonth() + '.' + tempDate._getDay();
                }
                var len1 = tempCarApplys[i].length;
                for (var j = 0; j < len1; j++) {
                    var bookingDepartureTimestamp = tempCarApplys[i][j].bookingDepartureTimestamp;
                    if (bookingDepartureTimestamp.length > 5) {//如果时间未修改,则更改格式
                        var tempTime = new DateTimeTransformer(bookingDepartureTimestamp);
                        tempCarApplys[i][j].bookingDepartureTimestamp = tempTime.getHM();
                    }
                }
            }

            vm.officialCarProgramObjCarApplys = [];
            vm.officialCarProgramObjCarApplys = tempCarApplys;

            mui('#pullRefresh4').pullToRefresh().endPullUpToRefresh();
            vm.goPage('officialTripDriverProgramme_page');
        },

        //跳转到 公务用车 订单页
        goOfficialTripOrderPage: function (carApplyId) {
            console.log('carApplyId===' + carApplyId);
            // console.log('goOfficialTripOrderPage');
            vm.getOrderDetail(carApplyId);
        },

        //获取订单详情
        getOrderDetail: function (carApplyId) {
            vm.detailPage_carApplyId = carApplyId;
            vm.detailPage_carApplyId = parseInt(vm.detailPage_carApplyId);
            var tempData = {
                    carApplyId: carApplyId
                },
                tempObj = {
                    url: api.carApply,
                    data: tempData,
                    type: 'GET'
                };

            t.ajax(tempObj, function (data) {
                vm.fillOrderDetail(data);
            });
        },

        //填充订单详情
        fillOrderDetail: function (data) {
            console.log(data);

            vm.orderDetail_isShowDriverCommentBtn = false;
            vm.orderDetail_isShowPoolingBtn = false;
            vm.orderDetail_isShowOrderCancelBtn = false;

            var obj = data.returnObject;

            vm.orderDetail_driverName = obj.ownerName;
            vm.orderDetail_driverPhoneNum = obj.contactNumber;
            vm.orderDetail_carSeatAmount = parseInt(obj.carSeatAmount);
            vm.orderDetail_departurePlace = obj.departure;
            vm.orderDetail_destination = obj.destination;
            vm.orderDetail_carPhoto = obj.carPhoto;
            vm.orderDetail_remainingSeatAmount = parseInt(obj.remainingSeatAmount);
            vm.orderDetail_usedSeatAmount = parseInt(obj.usedSeatAmount);
            vm.orderDetail_verifyTime = obj.verifyTime;
            vm.orderDetail_createTime = obj.createTime;
            vm.orderDetail_driverReview = obj.driverReview;
            vm.orderDetail_applyStatusText = obj.applyStatusText;
            vm.orderDetail_applyStatusKey = obj.applyStatusKey;
            vm.orderDetail_verifyRemark = obj.verifyRemark;

            var tempStartTime = new DateTimeTransformer(obj.bookingDepartureTime);//出发时间
            var tempEndTime = new DateTimeTransformer(obj.bookingFinishTime);//结束时间

            vm.orderDetail_time = tempStartTime.getMD(true) + ' ' + tempStartTime.getHM() + '-' + tempEndTime.getHM();//详细时间

            //如果不配司机,那么自己就是司机
            if (obj.driverEmployeeId == vm.loginInfo.userOA) {
                vm.orderDetail_driverName = vm.loginInfo.userName;
                vm.orderDetail_driverPhoneNum = vm.loginInfo.userPhoneNumber;
                var iamDriver = true;
            }

            var applyObj = obj.ocCarApply;

            vm.orderDetail_applyObj = {
                applicantCompany: applyObj.applicantCompany,
                applicantDepartment: applyObj.applicantDepartment,
                applicantName: applyObj.applicantName,
                applicantPhoneNumber: applyObj.applicantPhoneNumber,
                applyRemark: applyObj.applyRemark,
                bookingPassengerAmount: applyObj.bookingPassengerAmount,
                passengers: applyObj.passengers,
                applicantEmployeeId: applyObj.applicantEmployeeId
            };


            //判断目前时间是否能够点评
            // 真 表示 已经过了出发时间 假 表示未过出发时间
            var now = new DateTimeTransformer();
            var v1 = new Validity({
                data: [tempStartTime.getYMD_HM(), now.getYMD_HM()],
                config: {
                    isCompareDateTime: true,
                    isHideAnyMsg: true
                }
            });

            //显示点评按钮的条件  1.本人是司机 2. 当前时间已经过了出发时间 3. 点评字段为空 4. 状态为 审核通过
            if ((vm.loginInfo.userOA == obj.driverEmployeeId || iamDriver) && (obj.driverReview == null ) && v1.isValid() && (  obj.applyStatusKey == CONFIG.APPLY_STATUS_KEY_PASS)) {
                vm.orderDetail_isShowDriverCommentBtn = true;
            }

            //判断是否显示拼车申请按钮  条件: 1 除申请者以外的人  2. 有剩余的座位 3.当前状态为审核通过 4. 本车司机除外
            if ((vm.loginInfo.userOA != vm.orderDetail_applyObj.applicantEmployeeId) && (vm.orderDetail_remainingSeatAmount > 0) && ( obj.applyStatusKey == CONFIG.APPLY_STATUS_KEY_PASS) && (vm.loginInfo.userOA != obj.driverEmployeeId)) {
                vm.orderDetail_isShowPoolingBtn = true;
            }

            //显示 取消拼车按钮  条件: 1. 本人是该订单的拼车人 2. 状态是审核通过
            var len = obj.ocCarpooling.length;
            for (var i = 0; i < len; i++) {
                if ((vm.loginInfo.userOA == obj.ocCarpooling[i].applicantEmployeeId) && (obj.applyStatusKey == CONFIG.APPLY_STATUS_KEY_PASS)) {
                    obj.ocCarpooling[i].isShowPoolingCancelBtn = true;
                    vm.orderDetail_isShowPoolingBtn = false;
                }
            }

            //显示取消申请按钮 条件:1 本人是该订单的申请者 2 状态是 审核中 和 审核通过 3 还没过出发时间
            if ((vm.loginInfo.userOA == obj.ocCarApply.applicantEmployeeId) && v1.isValid() && (obj.applyStatusKey == CONFIG.APPLY_STATUS_KEY_VERIFYING || obj.applyStatusKey == CONFIG.APPLY_STATUS_KEY_PASS)) {
                vm.orderDetail_isShowOrderCancelBtn = true;
            }

            // console.log(vm.orderDetail_carpoolingArray);
            vm.orderDetail_carpoolingArray = obj.ocCarpooling;

            vm.goPage('officialTripOrder_page');
        },
        //显示 拼车申请 弹窗
        showPoolingPopWindow: function () {

            var $personNumber = $('#pooling_personNumber .J-personNumber');
            $personNumber.removeClass('tui-personNumberSelected').eq(0).addClass('tui-personNumberSelected');

            console.log(vm.orderDetail_remainingSeatAmount);

            //重置
            vm.pooling_phoneNumber = '';
            vm.pooling_personNumber = 1;
            vm.pooling_passengers = '';
            vm.pooling_applyRemark = '';

            vm.pooling_phoneNumber = vm.loginInfo.userPhoneNumber;

            vm.officialTrip_applyPoolingPopIsHidden = false;

        },
        //隐藏 拼车申请 弹窗
        hidePoolingPopWindow: function () {
            vm.officialTrip_applyPoolingPopIsHidden = true;
        },

        //显示提示语弹窗
        showMessagePop: function (type, cancelId) {

            vm.messagePopType = type;
            vm.messagePopId = cancelId;//参数
            vm.messagePopId = parseInt(vm.messagePopId);

            switch (type) {
                case 'officialTrip':
                    vm.messagePop_title = CONFIG.CANCEL_OFFICIAL_TRIP_TITLE;
                    vm.messagePop_content = CONFIG.CANCEL_OFFICIAL_TRIP_CONTENT;
                    break;
                case 'officialPooling':
                    vm.messagePop_title = CONFIG.CANCEL_OFFICIAL_POOLING_TITLE;
                    vm.messagePop_content = CONFIG.CANCEL_OFFICIAL_TRIP_CONTENT;
                    break;

            }
            vm.messagePopIsHidden = false;

        },
        //隐藏提示语弹窗
        hideMessagePop: function (isCancelBtn) {

            //isCancelBtn 点击了取消按钮

            vm.messagePopIsHidden = true;
            vm.messagePop_title = '';
            vm.messagePop_content = '';
            if (isCancelBtn === true) {
                return;
            }

            var type = vm.messagePopType;

            switch (type) {
                case 'officialTrip':
                    vm.cancelTrip();
                    break;
                case 'officialPooling':
                    vm.cancelPooling();
                    break;

            }
        },

        //取消用车申请
        cancelTrip: function () {
            var tempData = {
                    carApplyId: vm.detailPage_carApplyId,
                    applicantEmployeeId: vm.loginInfo.userOA,
                    applyStatusKey: CONFIG.APPLY_STATUS_KEY_CANCELLED,
                    applyStatusText: CONFIG.APPLY_STATUS_TEXT_CANCELLED
                },
                tempObj = {
                    url: api.carApply,
                    data: tempData,
                    type: 'PATCH'
                };

            t.ajax(tempObj, function (data) {
                console.log(data);
                if (data.errorCode == '00') {
                    t.showMessage(data.errorMessage);
                    vm.goOfficialTripOrderPage(vm.detailPage_carApplyId);
                    //页面滚动到最上方
                    vm.backToTop();
                }
            });
        },
        //取消拼车
        cancelPooling: function () {
            var tempData = {
                    carPoolingId: vm.messagePopId,
                    applicantEmployeeId: vm.loginInfo.userOA,
                    applyStatusKey: 4,//申请状态key值 1:审核通过, 2:行程完成, 3:行程取消 4. 自行取消
                    applyStatusText: '自行取消'
                },
                tempObj = {
                    url: api.carPooling,
                    data: tempData,
                    type: 'PATCH'
                };

            t.ajax(tempObj, function (data) {
                console.log(data);
                if (data.errorCode == '00') {
                    t.showMessage(data.errorMessage);
                    vm.goOfficialTripOrderPage(vm.detailPage_carApplyId);
                }
            });
        },


        //显示司机点评 弹窗
        showDriverCommentPop: function () {
            var endTime = new DateTimeTransformer();
            endTime.init();
            //console.log(endTime);
            vm.driverComment_endHour = endTime._getHour();
            vm.driverComment_endMinute = endTime._getMinute();

            vm.driverCommentIsHidden = false;
        },
        //隐藏司机点评 弹窗
        hideDriverCommentPop: function () {
            var selectedClass = 'tui-personNumberSelected';
            var $driverComment_personNumber = $('#driverComment_personNumber .J-personNumber');
            $driverComment_personNumber.removeClass(selectedClass);

            var $driverComment_arrivalTime = $('#driverComment_arrivalTime .J-personNumber');
            $driverComment_arrivalTime.removeClass(selectedClass);

            //重置
            $('.J-driverComment-warningMsg').addClass('ct-hidden').text('');//隐藏并重置警告语
            vm.driverComment_driverReview = '';
            vm.driverComment_endHour = '';
            vm.driverComment_endMinute = '';
            vm.driverComment_personNumber = 0;
            vm.driverComment_arrivalTime = {
                actualDepartureStatusKey: 0,
                actualDepartureStatusText: ''
            };
            vm.driverComment_0Person = false;

            vm.driverCommentIsHidden = true;
        },

        //提交司机点评
        submitDriverComment: function () {

            var warningMsgClassName = '.J-driverComment-warningMsg';

            //检测到达时间
            var v1 = new Validity({
                data: vm.driverComment_arrivalTime.actualDepartureStatusKey,
                config: {
                    isCheckZero: true,
                    isShowWarningMsg: true,
                    zeroNotice: CONFIG.DRIVER_COMMENT_NOTICE_TIME,
                    warningMsgClassName: warningMsgClassName
                }
            });
            if (!v1.isValid()) {
                return;
            }

            //如果爽约,则跳过人数检测
            if (vm.driverComment_arrivalTime.actualDepartureStatusKey != CONFIG.DRIVER_COMMENT_STATUS_KEY_FAIL) {
                var v2 = new Validity({
                    data: vm.driverComment_personNumber,
                    config: {
                        isCheckZero: true,
                        isShowWarningMsg: true,
                        zeroNotice: CONFIG.DRIVER_COMMENT_NOTICE_PERSON,
                        warningMsgClassName: warningMsgClassName
                    }
                });
                if (!v2.isValid()) {
                    return;
                }
            }

            //检测其他说明
            var v3 = new Validity({
                data: vm.driverComment_driverReview,
                config: {
                    isCheckEmpty: true,
                    isShowWarningMsg: true,
                    emptyNotice: CONFIG.DRIVER_COMMENT_NOTICE_REMARK,
                    warningMsgClassName: warningMsgClassName
                }
            });
            if (!v3.isValid()) {
                return;
            }

            var tempDate = new DateTimeTransformer({
                hour: vm.driverComment_endHour,
                minute: vm.driverComment_endMinute
            });
            var actualFinishTimestamp = tempDate.getYMD() + ' ' + tempDate.getHMS();

            var tempData = {
                    driverEmployeeId: vm.loginInfo.userOA,
                    carApplyId: vm.detailPage_carApplyId,
                    actualDepartureStatusKey: vm.driverComment_arrivalTime.actualDepartureStatusKey,
                    actualDepartureStatusText: vm.driverComment_arrivalTime.actualDepartureStatusText,
                    actualFinishTimestamp: actualFinishTimestamp,
                    actualPassengerAmount: vm.driverComment_personNumber,
                    driverReview: vm.driverComment_driverReview
                },
                tempObj = {
                    url: api.driverComment,
                    data: tempData,
                    type: 'PATCH'
                };

            t.ajax(tempObj, function (data) {
                console.log(data);
                if (data.errorCode == '00') {
                    vm.hideDriverCommentPop();
                    t.showMessage(data.errorMessage, function () {
                        vm.goOfficialTripOrderPage(vm.detailPage_carApplyId);
                    });
                }
            });
        },

        //拼车申请
        carPooling: function () {
            console.log('carPooling');

            var warningMsgClassName = '.J-pooling-warningMsg';
            var validArr = [
                {
                    data: vm.pooling_phoneNumber,
                    config: {
                        isShowWarningMsg: true,
                        warningMsgClassName: warningMsgClassName,
                        isCheckPhoneNumLen: true,
                        stringLenNotice: CONFIG.NOTICE_PHONE_WRONG
                    }
                },
                {
                    data: vm.pooling_personNumber,
                    config: {
                        isShowWarningMsg: true,
                        warningMsgClassName: warningMsgClassName,
                        isCheckRange: true,
                        min_value: 0,
                        max_value: vm.orderDetail_remainingSeatAmount,
                        rangeNotice: CONFIG.POOLING_OVER_SEAT
                    }
                },
                {
                    data: vm.pooling_passengers,
                    config: {
                        isShowWarningMsg: true,
                        warningMsgClassName: warningMsgClassName,
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.NOTICE_PASSENGERS_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.NOTICE_PASSENGERS_OVER,
                        MAX_LEN: CONFIG.NOTICE_PASSENGERS_LEN
                    }
                },
                {
                    data: vm.pooling_applyRemark,
                    config: {
                        isShowWarningMsg: true,
                        warningMsgClassName: warningMsgClassName,
                        isCheckEmpty: true,
                        emptyNotice: CONFIG.NOTICE_REMARK_NO,
                        isCheckStringLen: true,
                        stringLenNotice: CONFIG.NOTICE_REMARK_OVER,
                        MAX_LEN: CONFIG.NOTICE_REMARK_LEN
                    }
                }
            ];

            //逐个放入Validity中检验有效性
            var len = validArr.length;
            for (var i = 0; i < len; i++) {
                var validity = new Validity(validArr[i]);
                if (!validity.isValid()) {
                    return;
                }
            }


            var tempData = {
                    carApplyId: vm.detailPage_carApplyId,
                    carpoolingType: vm.pattern,
                    applicantName: vm.loginInfo.userName,
                    applicantEmployeeId: vm.loginInfo.userOA,
                    applicantCompany: vm.loginInfo.userCompany,
                    applicantDepartment: vm.loginInfo.userDepartment,
                    applicantPhoneNumber: vm.pooling_phoneNumber,
                    bookingPassengerAmount: vm.pooling_personNumber,
                    passengers: vm.pooling_passengers,
                    applyRemark: vm.pooling_applyRemark
                },
                tempObj = {
                    url: api.carPooling,
                    data: tempData,
                    type: 'POST'
                };

            t.ajax(tempObj, function (data) {
                console.log(data);
                if (data.errorCode == '00') {
                    vm.hidePoolingPopWindow();
                    t.showMessage(data.errorMessage, function () {
                        vm.goOfficialTripOrderPage(vm.detailPage_carApplyId);
                    });

                }
            });

        },

        //返回顶部
        backToTop: function () {
            $('body').animate({
                scrollTop: 0
            }, 500);
            return false;
        },

        //图片预览
        showLargeCarImg: function (imgName) {
            vm.largeCarImgSrc = CONFIG.CAR_IMG_ROUTE + imgName;
            vm.largeImageIsHidden = false;
        },

        hideLargeCarImg: function () {
            vm.largeImageIsHidden = true;
        }

    });

    vm.$watch('apply_carEL', function (apply_carEL) {
        //apply_carEL  carId + carSeatAmount + employeeId   中间隔了一个空格号
        console.log(apply_carEL);
        //如果没有选择车,则置为空
        if (apply_carEL === '') {
            vm.apply_carId = '';
            vm.apply_carSeat = '';
            vm.apply_driverId = '';
            return;
        }

        vm.apply_carId = parseInt(apply_carEL.split(' ')[0]);
        vm.apply_carSeat = parseInt(apply_carEL.split(' ')[1]);
        vm.apply_driverId = apply_carEL.split(' ')[2];
    });

    avalon.scan(document.body);

    vm.init();

})();