var address = "http://10.108.223.23:8080/ATFCloud/";
var address2 = ' http://10.108.223.23:8080/atfcloud1.0a/';
var address3 = ' http://10.108.223.23:8080/atfcloud2.0a/';
// var address = "/";
// var address = "/";
// var address2 = "/";
function getJson(data) {
    let o = {};
    data.split('&').forEach((item) => {
        let a = item.split('=');
        o[a[0]] = a[1];
    });
    return JSON.stringify(o);
}
function ajax2 (opt) {
    if (opt.url.startsWith(address2) || opt.url.startsWith(address3)) {
        opt.contentType = 'application/json';
        if (typeof opt.data === 'object') {
            opt.data = JSON.stringify(opt.data);
        }
    }
    $.ajax(opt);
};
