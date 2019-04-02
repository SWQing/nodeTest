/*
 两个参数：
 第一个参数：可选，时间或时间戳，默认为当前时间。第二个参数：可选，转换的格式，默认为YYYY-MM-DD hh:mm:ss。
 不补0：YYYY-M-D h:m:s 2018-1-1 0:0:0
 加入星期：YYYY-MM-DD www hh:mm:ss 2018-01-01 星期一 00:00:00
 加入周：YYYY-MM-DD ww hh:mm:ss 2018-01-01 周一 00:00:00
*/
function formatTime(date, fmt) {
    date = date || new Date();
    date = ((date instanceof Date) || (typeof date) ==  'number') ? new Date(date) : new Date();
    fmt = fmt || 'YYYY-MM-DD hh:mm:ss';
    var obj = {
        'Y': date.getFullYear(),
        'M': date.getMonth() + 1,
        'D': date.getDate(),
        'w': date.getDay(),
        'h': date.getHours(),
        'm': date.getMinutes(),
        's': date.getSeconds(),
    };
    var week = ['日', '一', '二', '三', '四', '五', '六'];
    for(var i in obj) {
        fmt = fmt.replace(new RegExp(i + '+', 'g'), function(e) {
            var itemStr = obj[i] + '';
            // 获取星期
            if(i == 'w') return (e.length > 2 ? '星期' : '周') + week[itemStr];
            // 补0
            for(var j = 0, len = itemStr.length; j < e.length - len; j++) itemStr = '0' + itemStr;
            return itemStr;
        });
    }
    return fmt;
}
module.exports = formatTime;